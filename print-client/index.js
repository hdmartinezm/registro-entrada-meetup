#!/usr/bin/env node

const AWS = require('aws-sdk');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const https = require('https');

require('dotenv').config();

// Configuración
const QUEUE_URL = process.env.PRINT_QUEUE_URL;
const PRINTER_NAME = process.env.PRINTER_NAME || 'Ribetec_RT_420ME';
const POLL_INTERVAL = process.env.POLL_INTERVAL || 2000; // 2 segundos
const AWS_REGION = process.env.AWS_REGION || 'us-east-1';

// Configurar AWS
AWS.config.update({ region: AWS_REGION });
const sqs = new AWS.SQS();

console.log('🖨️  Cliente de Impresión Automática');
console.log('=====================================');
console.log(`Cola SQS: ${QUEUE_URL}`);
console.log(`Impresora: ${PRINTER_NAME}`);
console.log(`Región: ${AWS_REGION}`);
console.log('=====================================\n');

// Directorio temporal para PDFs
const TEMP_DIR = path.join(__dirname, 'temp');
if (!fs.existsSync(TEMP_DIR)) {
    fs.mkdirSync(TEMP_DIR);
}

// Contador de badges
let badgesProcessed = 0;
let badgesPrinted = 0;
let badgesFailed = 0;

// Función para descargar PDF
function downloadPDF(url, filepath) {
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(filepath);
        https.get(url, (response) => {
            response.pipe(file);
            file.on('finish', () => {
                file.close();
                resolve();
            });
        }).on('error', (err) => {
            fs.unlink(filepath, () => {});
            reject(err);
        });
    });
}


// Función para imprimir PDF
function printPDF(filepath) {
    try {
        console.log(`   Archivo: ${filepath}`);
        console.log(`   Tamaño: ${fs.statSync(filepath).size} bytes`);
        
        // Verificar que no hay trabajos pendientes antes de enviar
        try {
            const pendingJobs = execSync(`lpstat -o ${PRINTER_NAME}`, { encoding: 'utf8' });
            if (pendingJobs.trim()) {
                console.log(`   ⚠️  Hay trabajos pendientes en la cola:`);
                console.log(`   ${pendingJobs.trim()}`);
                console.log(`   ⏳ Esperando a que se completen...`);
                
                // Esperar hasta que la cola esté vacía
                let waitAttempts = 0;
                while (waitAttempts < 30) {
                    execSync('sleep 2');
                    waitAttempts++;
                    
                    try {
                        const stillPending = execSync(`lpstat -o ${PRINTER_NAME}`, { encoding: 'utf8' });
                        if (!stillPending.trim()) {
                            console.log(`   ✅ Cola vacía después de ${waitAttempts * 2} segundos`);
                            break;
                        }
                    } catch (e) {
                        // Cola vacía
                        console.log(`   ✅ Cola vacía`);
                        break;
                    }
                }
            }
        } catch (e) {
            // No hay trabajos pendientes, continuar
            console.log(`   ✅ Cola vacía, listo para imprimir`);
        }
        
        const command = `lp -d ${PRINTER_NAME} "${filepath}"`;
        console.log(`   Comando: ${command}`);
        
        const output = execSync(command, { encoding: 'utf8' });
        const jobId = output.match(/\d+/)?.[0];
        console.log(`   Salida: ${output.trim()}`);
        console.log(`   Job ID: ${PRINTER_NAME}-${jobId}`);
        
        // Esperar a que el trabajo se complete
        console.log(`   ⏳ Esperando a que el trabajo se complete...`);
        let attempts = 0;
        let jobCompleted = false;
        
        while (attempts < 30 && !jobCompleted) {
            execSync('sleep 1');
            attempts++;
            
            try {
                execSync(`lpstat -o ${PRINTER_NAME}-${jobId}`, { encoding: 'utf8', stdio: 'pipe' });
                // Si no lanza error, el trabajo aún está en cola
                if (attempts % 5 === 0) {
                    console.log(`   📊 Esperando... (${attempts} segundos)`);
                }
            } catch (e) {
                // El trabajo ya no está en cola (completado)
                jobCompleted = true;
                console.log(`   ✅ Trabajo completado en ${attempts} segundos`);
            }
        }
        
        if (!jobCompleted) {
            console.log(`   ⚠️  Timeout esperando completar trabajo (${attempts} segundos)`);
        }
        
        // Esperar 2 segundos para que la impresora expulse el papel físicamente
        console.log(`   ⏳ Esperando expulsión física del papel...`);
        execSync('sleep 2');

        console.log(`✅ Impreso exitosamente`);
        return true;
    } catch (error) {
        console.error(`❌ Error al imprimir: ${error.message}`);
        if (error.stderr) {
            console.error(`   stderr: ${error.stderr}`);
        }
        if (error.stdout) {
            console.error(`   stdout: ${error.stdout}`);
        }
        return false;
    }
}

// Función para procesar mensaje
async function processMessage(message) {
    badgesProcessed++;
    
    try {
        const body = JSON.parse(message.Body);
        const { badgeId, badgeUrl, fullName, username } = body;
        
        console.log(`\n📄 Nuevo badge recibido (#${badgesProcessed}):`);
        console.log(`   ID: ${badgeId}`);
        console.log(`   Nombre: ${fullName}`);
        console.log(`   Username: @${username}`);
        console.log(`   URL: ${badgeUrl}`);
        
        // Descargar PDF
        const filename = `badge-${badgeId}.pdf`;
        const filepath = path.join(TEMP_DIR, filename);
        
        console.log(`⬇️  Descargando PDF...`);
        await downloadPDF(badgeUrl, filepath);
        console.log(`✅ PDF descargado: ${filepath}`);
        
        // Verificar que el archivo existe
        if (!fs.existsSync(filepath)) {
            throw new Error('PDF no se descargó correctamente');
        }
        
        // Imprimir
        console.log(`🖨️  Enviando a impresora ${PRINTER_NAME}...`);
        const printed = printPDF(filepath);
        
        if (printed) {
            badgesPrinted++;
            
            // Esperar 2 segundos antes de continuar (dar tiempo a la impresora física)
            console.log(`   ⏳ Esperando 2 segundos antes del siguiente badge...`);
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Eliminar mensaje de la cola solo si imprimió exitosamente
            await sqs.deleteMessage({
                QueueUrl: QUEUE_URL,
                ReceiptHandle: message.ReceiptHandle
            }).promise();
            console.log(`✅ Mensaje eliminado de la cola`);
            console.log(`📊 Estadísticas: ${badgesPrinted} impresos / ${badgesFailed} fallidos / ${badgesProcessed} total`);
            
            // Limpiar archivo temporal después de 5 segundos
            setTimeout(() => {
                try {
                    if (fs.existsSync(filepath)) {
                        fs.unlinkSync(filepath);
                        console.log(`🗑️  Archivo temporal eliminado`);
                    }
                } catch (err) {
                    console.error(`⚠️  No se pudo eliminar archivo temporal: ${err.message}`);
                }
            }, 5000);
            
            return true;
        } else {
            badgesFailed++;
            // Si no imprimió, el mensaje volverá a la cola después del VisibilityTimeout
            console.log(`⚠️  No se imprimió, el mensaje volverá a la cola`);
            console.log(`📊 Estadísticas: ${badgesPrinted} impresos / ${badgesFailed} fallidos / ${badgesProcessed} total`);
            return false;
        }
    } catch (error) {
        badgesFailed++;
        console.error(`❌ Error procesando mensaje: ${error.message}`);
        console.error(`   Stack: ${error.stack}`);
        console.log(`📊 Estadísticas: ${badgesPrinted} impresos / ${badgesFailed} fallidos / ${badgesProcessed} total`);
        // El mensaje volverá a la cola para reintentarlo
        return false;
    }
}

// Función principal de polling
let isProcessing = false; // Flag para evitar procesar múltiples mensajes simultáneamente

async function pollQueue() {
    // Si ya estamos procesando un mensaje, esperar
    if (isProcessing) {
        setTimeout(pollQueue, POLL_INTERVAL);
        return;
    }
    
    try {
        const params = {
            QueueUrl: QUEUE_URL,
            MaxNumberOfMessages: 1, // Solo 1 mensaje a la vez
            WaitTimeSeconds: 20, // Long polling
            VisibilityTimeout: 120 // 2 minutos para procesar
        };
        
        const data = await sqs.receiveMessage(params).promise();
        
        if (data.Messages && data.Messages.length > 0) {
            isProcessing = true; // Marcar como procesando
            
            for (const message of data.Messages) {
                await processMessage(message);
            }
            
            isProcessing = false; // Liberar para el siguiente
        }
    } catch (error) {
        console.error(`❌ Error al consultar cola: ${error.message}`);
        isProcessing = false; // Liberar en caso de error
    }
    
    // Continuar polling
    setTimeout(pollQueue, POLL_INTERVAL);
}

// Verificar configuración
if (!QUEUE_URL) {
    console.error('❌ Error: PRINT_QUEUE_URL no está configurado en .env');
    process.exit(1);
}

// Verificar que la impresora existe
try {
    execSync(`lpstat -p ${PRINTER_NAME}`, { stdio: 'ignore' });
    console.log(`✅ Impresora ${PRINTER_NAME} detectada\n`);
} catch (error) {
    console.error(`❌ Error: Impresora ${PRINTER_NAME} no encontrada`);
    console.error(`   Ejecuta: lpstat -p para ver impresoras disponibles\n`);
    process.exit(1);
}

// Iniciar polling
console.log('🔄 Iniciando monitoreo de cola...\n');
console.log('Esperando badges para imprimir...');
console.log('(Presiona Ctrl+C para detener)\n');

pollQueue();

// Manejo de señales para salida limpia
process.on('SIGINT', () => {
    console.log('\n\n👋 Deteniendo cliente de impresión...');
    process.exit(0);
});
