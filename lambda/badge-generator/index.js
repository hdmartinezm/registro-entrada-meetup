const AWS = require('aws-sdk');
const PDFDocument = require('pdfkit');
const { v4: uuidv4 } = require('uuid');
const QRCode = require('qrcode');

const s3 = new AWS.S3();
const dynamodb = new AWS.DynamoDB.DocumentClient();
const sqs = new AWS.SQS();

const BUCKET_NAME = process.env.BADGE_BUCKET;
const TABLE_NAME = process.env.ATTENDEES_TABLE;
const PRINT_QUEUE_URL = process.env.PRINT_QUEUE_URL;

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

        // Crear PDF del badge
        const pdfBuffer = await generateBadgePDF({
            fullName,
            company,
            role,
            username,
            badgeId,
            email,
            profileUrl: username ? `https://builder.aws.com/community/@${username}` : null
        });

        // Subir PDF a S3
        const s3Key = `badges/${badgeId}.pdf`;
        await s3.putObject({
            Bucket: BUCKET_NAME,
            Key: s3Key,
            Body: pdfBuffer,
            ContentType: 'application/pdf'
        }).promise();

        // Guardar registro en DynamoDB
        const item = {
            badgeId,
            username,
            fullName,
            company,
            role,
            timestamp,
            badgeUrl: `https://${BUCKET_NAME}.s3.amazonaws.com/${s3Key}`
        };
        
        // Solo agregar email si no está vacío (DynamoDB no permite strings vacíos en índices)
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

        const badgeUrl = `https://${BUCKET_NAME}.s3.amazonaws.com/${s3Key}`;

        // Enviar a cola de impresión SQS
        if (PRINT_QUEUE_URL) {
            try {
                await sqs.sendMessage({
                    QueueUrl: PRINT_QUEUE_URL,
                    MessageBody: JSON.stringify({
                        badgeId,
                        badgeUrl,
                        fullName,
                        username,
                        timestamp
                    })
                }).promise();
                console.log('Badge enviado a cola de impresión');
            } catch (sqsError) {
                console.error('Error al enviar a cola SQS:', sqsError);
                // No fallar si SQS falla, el badge ya está generado
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
                badgeId,
                badgeUrl
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

async function generateBadgePDF({ fullName, company, role, username, badgeId, email, profileUrl }) {
    // Generar QR code más pequeño para el badge compacto
    let qrBuffer = null;
    if (profileUrl) {
        try {
            qrBuffer = await QRCode.toBuffer(profileUrl, {
                width: 80,
                margin: 0,
                color: {
                    dark: '#000000',
                    light: '#FFFFFF'
                }
            });
        } catch (error) {
            console.error('Error generando QR:', error);
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

        // Header compacto - AWS User Group Monterrey
        doc.rect(0, 0, 216, 28)
           .fill('#000000');

        doc.fontSize(11)
           .fillColor('#FFFFFF')
           .font('Helvetica-Bold')
           .text('AWS User Group Monterrey', 0, 9, { align: 'center', width: 216 });

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

        // Columna derecha - QR Code
        if (qrBuffer) {
            const qrSize = 70;
            const qrX = rightColumnX + 5;
            const qrY = contentStartY + 5;

            doc.image(qrBuffer, qrX, qrY, {
                width: qrSize,
                height: qrSize
            });

            // Texto pequeño debajo del QR
            doc.fontSize(6)
               .fillColor('#000000')
               .font('Helvetica')
               .text('Perfil Builder', rightColumnX, qrY + qrSize + 3, {
                   align: 'center',
                   width: 80
               });
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
