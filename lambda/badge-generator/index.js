const AWS = require('aws-sdk');
const PDFDocument = require('pdfkit');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const path = require('path');

const s3 = new AWS.S3();
const dynamodb = new AWS.DynamoDB.DocumentClient();
const sqs = new AWS.SQS();

const BUCKET_NAME = process.env.BADGE_BUCKET;
const TABLE_NAME = process.env.ATTENDEES_TABLE;
const EVENTS_TABLE = process.env.EVENTS_TABLE;
const PRINT_QUEUE_URL = process.env.PRINT_QUEUE_URL;

// Temas de badges según tipo de evento
const BADGE_THEMES = {
    'aws-ug': {
        headerText: 'AWS User Group Monterrey',
        showLogo: true,
        logoPath: path.join(__dirname, 'assets', 'logo-aws-ug.png')
    },
    'the-guild-it': {
        headerText: 'The Guild IT MTY',
        showLogo: true,
        logoPath: path.join(__dirname, 'assets', 'logo-theguildit.png')
    }
};

exports.handler = async (event) => {
    try {
        const body = JSON.parse(event.body);
        const { username, fullName, company, role, email, bio, eventId } = body;

        if (!fullName) {
            return {
                statusCode: 400,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                body: JSON.stringify({ error: 'fullName es requerido' })
            };
        }

        // Generar ID único para el badge
        const badgeId = uuidv4();
        const timestamp = new Date().toISOString();

        // Verificar si el usuario ya está pre-registrado (importado de Meetup/Eventbrite)
        let existingPreregistered = null;
        if (eventId) {
            existingPreregistered = await findPreregistered(eventId, fullName, email);
        }

        // Obtener el tipo de evento para usar el tema correcto
        let eventType = 'aws-ug'; // default
        if (eventId && EVENTS_TABLE) {
            try {
                const eventResult = await dynamodb.get({
                    TableName: EVENTS_TABLE,
                    Key: { eventId }
                }).promise();
                if (eventResult.Item && eventResult.Item.eventType) {
                    eventType = eventResult.Item.eventType;
                }
            } catch (err) {
                console.error('Error obteniendo evento:', err);
            }
        }

        // Crear PDF del badge con el tema correspondiente
        const pdfBuffer = await generateBadgePDF({
            fullName,
            company,
            role,
            username,
            badgeId,
            eventType
        });

        // Subir PDF a S3
        const s3Key = `badges/${badgeId}.pdf`;
        await s3.putObject({
            Bucket: BUCKET_NAME,
            Key: s3Key,
            Body: pdfBuffer,
            ContentType: 'application/pdf'
        }).promise();

        // Guardar registro en DynamoDB (o actualizar pre-registrado)
        if (existingPreregistered) {
            // Actualizar el registro pre-existente con los datos del badge
            const updateParams = {
                TableName: TABLE_NAME,
                Key: { badgeId: existingPreregistered.badgeId },
                UpdateExpression: 'SET #ts = :ts, badgeUrl = :url, preregisteredStatus = :status, checkedInAt = :ts',
                ExpressionAttributeNames: { '#ts': 'timestamp' },
                ExpressionAttributeValues: {
                    ':ts': timestamp,
                    ':url': `https://${BUCKET_NAME}.s3.amazonaws.com/${s3Key}`,
                    ':status': 'checked_in'
                }
            };
            // Solo actualizar campos si tienen valor (DynamoDB no permite strings vacíos en índices)
            if (username && username.trim() !== '') {
                updateParams.UpdateExpression += ', username = :user';
                updateParams.ExpressionAttributeValues[':user'] = username;
            }
            if (fullName && fullName.trim() !== '') {
                updateParams.UpdateExpression += ', fullName = :fn';
                updateParams.ExpressionAttributeValues[':fn'] = fullName;
            }
            if (company && company.trim() !== '') {
                updateParams.UpdateExpression += ', company = :co';
                updateParams.ExpressionAttributeValues[':co'] = company;
            }
            if (role && role.trim() !== '') {
                updateParams.UpdateExpression += ', #r = :ro';
                updateParams.ExpressionAttributeNames['#r'] = 'role';
                updateParams.ExpressionAttributeValues[':ro'] = role;
            }
            await dynamodb.update(updateParams).promise();
            // Use the existing badgeId for the response
            var finalBadgeId = existingPreregistered.badgeId;
        } else {
            const item = {
                badgeId,
                fullName,
                timestamp,
                badgeUrl: `https://${BUCKET_NAME}.s3.amazonaws.com/${s3Key}`
            };

            // Solo agregar campos indexados si no están vacíos (DynamoDB no permite strings vacíos en índices)
            if (username && username.trim() !== '') {
                item.username = username;
            }
            if (company && company.trim() !== '') {
                item.company = company;
            }
            if (role && role.trim() !== '') {
                item.role = role;
            }
            if (email && email.trim() !== '') {
                item.email = email;
            }
            
            // Solo agregar bio si existe
            if (bio) {
                item.bio = bio;
            }

            // Solo agregar eventId si viene y no está vacío
            if (eventId && eventId.trim() !== '') {
                item.eventId = eventId;
            }
            
            await dynamodb.put({
                TableName: TABLE_NAME,
                Item: item
            }).promise();
            var finalBadgeId = badgeId;
        }

        const badgeUrl = `https://${BUCKET_NAME}.s3.amazonaws.com/${s3Key}`;

        // Enviar a cola de impresión SQS
        if (PRINT_QUEUE_URL) {
            try {
                await sqs.sendMessage({
                    QueueUrl: PRINT_QUEUE_URL,
                    MessageBody: JSON.stringify({
                        badgeId: finalBadgeId,
                        badgeUrl,
                        fullName,
                        username,
                        timestamp
                    })
                }).promise();
                console.log('Badge enviado a cola de impresión');
            } catch (sqsError) {
                console.error('Error al enviar a cola SQS:', sqsError);
            }
        }

        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({
                success: true,
                badgeId: finalBadgeId,
                badgeUrl,
                preregistered: !!existingPreregistered
            })
        };

    } catch (error) {
        console.error('Error:', error);

        return {
            statusCode: 500,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({
                error: 'Error al generar el badge',
                details: error.message
            })
        };
    }
};

async function generateBadgePDF({ fullName, company, role, username, badgeId, eventType }) {
    // Obtener tema según tipo de evento
    const theme = BADGE_THEMES[eventType] || BADGE_THEMES['aws-ug'];

    // Cargar logo si el tema lo requiere
    let logoBuffer = null;
    if (theme.showLogo && theme.logoPath) {
        try {
            logoBuffer = fs.readFileSync(theme.logoPath);
        } catch (error) {
            console.error('Error cargando logo:', error);
        }
    }

    return new Promise((resolve, reject) => {
        const doc = new PDFDocument({
            size: [216, 144], // 3x2 pulgadas en puntos (72 DPI) - para impresora térmica
            margins: { top: 0, bottom: 0, left: 0, right: 0 }
        });

        const chunks = [];
        doc.on('data', chunk => chunks.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(chunks)));
        doc.on('error', reject);

        // Header compacto con tema
        doc.rect(0, 0, 216, 28)
           .fill('#000000');

        // Si hay logo, centrarlo junto con el texto
        if (logoBuffer) {
            try {
                const logoHeight = 18;
                const logoWidth = 18; // Aproximado, cuadrado
                const fontSize = 13;
                const gap = 6; // Espacio entre logo y texto

                // Calcular ancho del texto
                doc.fontSize(fontSize).font('Helvetica-Bold');
                const textWidth = doc.widthOfString(theme.headerText);

                // Calcular posición centrada para logo + gap + texto
                const totalWidth = logoWidth + gap + textWidth;
                const startX = (216 - totalWidth) / 2;

                // Dibujar logo centrado
                doc.image(logoBuffer, startX, 5, { height: logoHeight });

                // Texto del header después del logo, centrado verticalmente
                doc.fontSize(fontSize)
                   .fillColor('#FFFFFF')
                   .font('Helvetica-Bold')
                   .text(theme.headerText, startX + logoWidth + gap, 8, { lineBreak: false });
            } catch (err) {
                console.error('Error insertando logo:', err);
                // Fallback: solo texto centrado
                doc.fontSize(13)
                   .fillColor('#FFFFFF')
                   .font('Helvetica-Bold')
                   .text(theme.headerText, 0, 8, { align: 'center', width: 216 });
            }
        } else {
            // Sin logo: texto centrado más grande
            doc.fontSize(13)
               .fillColor('#FFFFFF')
               .font('Helvetica-Bold')
               .text(theme.headerText, 0, 8, { align: 'center', width: 216 });
        }

        // Línea separadora delgada
        doc.rect(0, 28, 216, 1)
           .fill('#000000');

        // Contenido principal - dos columnas
        const leftColumnX = 10;
        const leftColumnWidth = 120;
        const rightColumnX = 136;
        const contentStartY = 38;

        // Columna izquierda - Información del asistente
        let currentY = contentStartY;

        // Nombre (más prominente)
        doc.fontSize(13)
           .fillColor('#000000')
           .font('Helvetica-Bold')
           .text(fullName || 'N/A', leftColumnX, currentY, {
               width: leftColumnWidth,
               lineGap: 1
           });

        currentY += doc.heightOfString(fullName || 'N/A', { width: leftColumnWidth }) + 4;

        // Empresa
        if (company) {
            doc.fontSize(9)
               .fillColor('#000000')
               .font('Helvetica')
               .text(company, leftColumnX, currentY, {
                   width: leftColumnWidth,
                   lineGap: 0
               });
            currentY += doc.heightOfString(company, { width: leftColumnWidth }) + 3;
        }

        // Puesto
        if (role) {
            doc.fontSize(8)
               .fillColor('#000000')
               .font('Helvetica-Oblique')
               .text(role, leftColumnX, currentY, {
                   width: leftColumnWidth,
                   lineGap: 0
               });
            currentY += doc.heightOfString(role, { width: leftColumnWidth }) + 6;
        }

        // Username
        if (username) {
            doc.fontSize(9)
               .fillColor('#000000')
               .font('Helvetica-Bold')
               .text(`@${username}`, leftColumnX, currentY, {
                   width: leftColumnWidth
               });
        }

        // Columna derecha - Logo del evento (si aplica)
        if (logoBuffer && theme.showLogo) {
            const logoSize = 90;
            const logoX = rightColumnX - 5;
            const logoY = contentStartY;

            try {
                doc.image(logoBuffer, logoX, logoY, {
                    fit: [logoSize, logoSize],
                    align: 'center',
                    valign: 'center'
                });
            } catch (err) {
                console.error('Error insertando logo en badge:', err);
            }
        }

        // Footer - Badge ID (muy pequeño)
        doc.fontSize(5)
           .fillColor('#000000')
           .font('Helvetica')
           .text(`ID: ${badgeId.substring(0, 8)}`, 0, 137, {
               align: 'center',
               width: 216
           });

        doc.end();
    });
}

// Buscar si el usuario ya está pre-registrado (importado de Meetup/Eventbrite)
async function findPreregistered(eventId, fullName, email) {
    // Buscar por email primero (más confiable)
    if (email && email.trim() !== '') {
        const emailResult = await dynamodb.query({
            TableName: TABLE_NAME,
            IndexName: 'EmailIndex',
            KeyConditionExpression: 'email = :email',
            FilterExpression: 'eventId = :eventId AND preregistered = :pre',
            ExpressionAttributeValues: {
                ':email': email,
                ':eventId': eventId,
                ':pre': true
            }
        }).promise();

        if (emailResult.Items && emailResult.Items.length > 0) {
            return emailResult.Items[0];
        }
    }

    // Buscar por nombre completo en el evento
    if (fullName) {
        const nameResult = await dynamodb.query({
            TableName: TABLE_NAME,
            IndexName: 'EventIdIndex',
            KeyConditionExpression: 'eventId = :eventId',
            FilterExpression: 'fullName = :name AND preregistered = :pre',
            ExpressionAttributeValues: {
                ':eventId': eventId,
                ':name': fullName,
                ':pre': true
            }
        }).promise();

        if (nameResult.Items && nameResult.Items.length > 0) {
            return nameResult.Items[0];
        }
    }

    return null;
}
