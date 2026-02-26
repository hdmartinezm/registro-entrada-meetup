const AWS = require('aws-sdk');
const https = require('https');

const sqs = new AWS.SQS();
const PRINT_QUEUE_URL = process.env.PRINT_QUEUE_URL;

exports.handler = async (event) => {
    try {
        const body = JSON.parse(event.body);
        const { badgeUrl, attendeeInfo } = body;

        if (!badgeUrl) {
            return {
                statusCode: 400,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                body: JSON.stringify({ error: 'badgeUrl es requerido' })
            };
        }

        // Opción 1: Enviar a cola SQS para procesamiento
        if (PRINT_QUEUE_URL) {
            await sqs.sendMessage({
                QueueUrl: PRINT_QUEUE_URL,
                MessageBody: JSON.stringify({
                    badgeUrl,
                    attendeeInfo,
                    timestamp: new Date().toISOString()
                })
            }).promise();
        }

        // Opción 2: Integración con servicio de impresión (PrintNode, etc.)
        // await sendToPrintNode(badgeUrl);

        // Opción 3: Webhook a sistema local de impresión
        // await sendToLocalPrinter(badgeUrl);

        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({
                success: true,
                message: 'Badge enviado a cola de impresión',
                queuePosition: 1 // Calcular posición real si es necesario
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
                error: 'Error al enviar a impresora',
                details: error.message
            })
        };
    }
};

// Ejemplo de integración con PrintNode
async function sendToPrintNode(badgeUrl) {
    const PRINTNODE_API_KEY = process.env.PRINTNODE_API_KEY;
    const PRINTER_ID = process.env.PRINTER_ID;

    if (!PRINTNODE_API_KEY || !PRINTER_ID) {
        console.log('PrintNode no configurado, saltando...');
        return;
    }

    const printJob = {
        printerId: PRINTER_ID,
        title: 'Event Badge',
        contentType: 'pdf_uri',
        content: badgeUrl,
        source: 'AWS Event Registration'
    };

    return new Promise((resolve, reject) => {
        const data = JSON.stringify(printJob);
        
        const options = {
            hostname: 'api.printnode.com',
            path: '/printjobs',
            method: 'POST',
            headers: {
                'Authorization': `Basic ${Buffer.from(PRINTNODE_API_KEY + ':').toString('base64')}`,
                'Content-Type': 'application/json',
                'Content-Length': data.length
            }
        };

        const req = https.request(options, (res) => {
            let body = '';
            res.on('data', (chunk) => body += chunk);
            res.on('end', () => {
                if (res.statusCode === 201) {
                    resolve(JSON.parse(body));
                } else {
                    reject(new Error(`PrintNode error: ${body}`));
                }
            });
        });

        req.on('error', reject);
        req.write(data);
        req.end();
    });
}

// Ejemplo de webhook a sistema local
async function sendToLocalPrinter(badgeUrl) {
    const WEBHOOK_URL = process.env.LOCAL_PRINTER_WEBHOOK;

    if (!WEBHOOK_URL) {
        console.log('Webhook local no configurado, saltando...');
        return;
    }

    return new Promise((resolve, reject) => {
        const data = JSON.stringify({ badgeUrl });
        const url = new URL(WEBHOOK_URL);
        
        const options = {
            hostname: url.hostname,
            port: url.port,
            path: url.pathname,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': data.length
            }
        };

        const req = https.request(options, (res) => {
            let body = '';
            res.on('data', (chunk) => body += chunk);
            res.on('end', () => {
                if (res.statusCode === 200) {
                    resolve(JSON.parse(body));
                } else {
                    reject(new Error(`Webhook error: ${body}`));
                }
            });
        });

        req.on('error', reject);
        req.write(data);
        req.end();
    });
}
