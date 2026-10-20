#!/usr/bin/env node

const https = require('https');
const fs = require('fs');

// URL del artículo
const articleUrl = 'https://builder.aws.com/content/3AluBlUwYKVavYSXF5J7hQf4T9P/aideas-cloud-doctor-your-aws-infrastructure-health-check';

// Generar QR usando API pública
const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(articleUrl)}`;

console.log('🎨 Generando código QR...\n');
console.log('📄 Artículo: AIdeas Cloud Doctor - AWS Infrastructure Health Check');
console.log('🔗 URL:', articleUrl);
console.log('\n');

// Descargar QR
const file = fs.createWriteStream('qr-apoyo-articulo.png');
https.get(qrApiUrl, (response) => {
    response.pipe(file);
    file.on('finish', () => {
        file.close();
        console.log('✅ Código QR generado: qr-apoyo-articulo.png');
        console.log('\n📋 Ahora voy a crear el diseño completo con contexto...\n');
        
        // Crear HTML con el diseño completo
        createHTMLDesign();
    });
}).on('error', (err) => {
    fs.unlink('qr-apoyo-articulo.png', () => {});
    console.error('❌ Error:', err.message);
});

function createHTMLDesign() {
    const html = `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Apóyanos - AIdeas Cloud Doctor</title>
    <style>
        @page {
            size: A4;
            margin: 0;
        }
        
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Amazon Ember', 'Helvetica Neue', Arial, sans-serif;
            background: linear-gradient(135deg, #232F3E 0%, #FF9900 100%);
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            padding: 20px;
        }
        
        .container {
            background: white;
            border-radius: 20px;
            padding: 60px 40px;
            max-width: 600px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            text-align: center;
        }
        
        .header {
            margin-bottom: 30px;
        }
        
        .emoji {
            font-size: 60px;
            margin-bottom: 20px;
        }
        
        h1 {
            color: #232F3E;
            font-size: 42px;
            font-weight: bold;
            margin-bottom: 10px;
        }
        
        .subtitle {
            color: #FF9900;
            font-size: 24px;
            font-weight: 600;
            margin-bottom: 30px;
        }
        
        .qr-container {
            background: #f8f9fa;
            border-radius: 15px;
            padding: 30px;
            margin: 30px 0;
            border: 3px solid #FF9900;
        }
        
        .qr-code {
            width: 300px;
            height: 300px;
            margin: 0 auto;
            display: block;
        }
        
        .context {
            text-align: left;
            background: #f8f9fa;
            border-radius: 15px;
            padding: 25px;
            margin: 30px 0;
            border-left: 5px solid #FF9900;
        }
        
        .context h2 {
            color: #232F3E;
            font-size: 24px;
            margin-bottom: 15px;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        
        .context p {
            color: #545b64;
            font-size: 16px;
            line-height: 1.6;
            margin-bottom: 12px;
        }
        
        .context ul {
            list-style: none;
            padding-left: 0;
            margin-top: 15px;
        }
        
        .context li {
            color: #545b64;
            font-size: 15px;
            padding: 8px 0;
            padding-left: 30px;
            position: relative;
        }
        
        .context li:before {
            content: "✓";
            position: absolute;
            left: 0;
            color: #FF9900;
            font-weight: bold;
            font-size: 18px;
        }
        
        .cta {
            background: linear-gradient(135deg, #FF9900 0%, #FF6600 100%);
            color: white;
            padding: 20px 40px;
            border-radius: 10px;
            font-size: 20px;
            font-weight: bold;
            margin-top: 30px;
            display: inline-block;
            text-decoration: none;
            box-shadow: 0 5px 15px rgba(255, 153, 0, 0.3);
            transition: transform 0.2s;
        }
        
        .cta:hover {
            transform: translateY(-2px);
            box-shadow: 0 7px 20px rgba(255, 153, 0, 0.4);
        }
        
        .footer {
            margin-top: 30px;
            color: #879596;
            font-size: 14px;
        }
        
        .aws-logo {
            color: #FF9900;
            font-weight: bold;
            font-size: 18px;
        }
        
        @media print {
            body {
                background: white;
            }
            .container {
                box-shadow: none;
                max-width: 100%;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="emoji">🏥☁️</div>
            <h1>¡Apóyanos!</h1>
            <div class="subtitle">Escanea y descubre</div>
        </div>
        
        <div class="qr-container">
            <img src="qr-apoyo-articulo.png" alt="QR Code" class="qr-code">
        </div>
        
        <div class="context">
            <h2>📖 Sobre el Artículo</h2>
            <p><strong>AIdeas Cloud Doctor: Your AWS Infrastructure Health Check</strong></p>
            <p>Descubre cómo mantener tu infraestructura AWS saludable con chequeos automatizados impulsados por IA.</p>
            
            <ul>
                <li>Análisis automático de infraestructura AWS</li>
                <li>Recomendaciones inteligentes con IA</li>
                <li>Detección proactiva de problemas</li>
                <li>Optimización de costos y seguridad</li>
                <li>Implementación práctica paso a paso</li>
            </ul>
        </div>
        
        <a href="${articleUrl}" class="cta" target="_blank">
            👉 Leer Artículo Completo
        </a>
        
        <div class="footer">
            <p class="aws-logo">AWS Builder Community</p>
            <p>Comparte conocimiento, construye comunidad</p>
        </div>
    </div>
</body>
</html>`;

    fs.writeFileSync('qr-apoyo-diseno.html', html);
    console.log('✅ Diseño HTML creado: qr-apoyo-diseno.html');
    console.log('\n📋 Instrucciones:');
    console.log('1. Abre qr-apoyo-diseno.html en tu navegador');
    console.log('2. Imprime como PDF o toma screenshot');
    console.log('3. Usa la imagen en tus materiales\n');
    
    // Crear versión simple para imprimir
    createSimpleVersion();
}

function createSimpleVersion() {
    const simpleHtml = `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>QR Apoyo - Versión Simple</title>
    <style>
        @page {
            size: A4 portrait;
            margin: 2cm;
        }
        
        body {
            font-family: Arial, sans-serif;
            max-width: 800px;
            margin: 0 auto;
            padding: 40px 20px;
        }
        
        .card {
            border: 3px solid #FF9900;
            border-radius: 15px;
            padding: 40px;
            text-align: center;
            background: white;
        }
        
        h1 {
            color: #232F3E;
            font-size: 48px;
            margin-bottom: 10px;
        }
        
        .subtitle {
            color: #FF9900;
            font-size: 28px;
            font-weight: bold;
            margin-bottom: 30px;
        }
        
        .qr-code {
            width: 350px;
            height: 350px;
            margin: 30px auto;
            display: block;
            border: 2px solid #eee;
            padding: 10px;
            background: white;
        }
        
        .description {
            text-align: left;
            background: #f8f9fa;
            padding: 25px;
            border-radius: 10px;
            margin: 30px 0;
        }
        
        .description h2 {
            color: #232F3E;
            font-size: 22px;
            margin-bottom: 15px;
        }
        
        .description p {
            color: #545b64;
            font-size: 16px;
            line-height: 1.6;
            margin-bottom: 10px;
        }
        
        .url {
            background: #232F3E;
            color: white;
            padding: 15px;
            border-radius: 8px;
            font-family: monospace;
            font-size: 12px;
            word-break: break-all;
            margin-top: 20px;
        }
        
        .footer {
            margin-top: 30px;
            color: #879596;
            font-size: 14px;
            text-align: center;
        }
    </style>
</head>
<body>
    <div class="card">
        <h1>🏥 ¡Apóyanos!</h1>
        <div class="subtitle">Escanea el código QR</div>
        
        <img src="qr-apoyo-articulo.png" alt="QR Code" class="qr-code">
        
        <div class="description">
            <h2>📖 AIdeas Cloud Doctor</h2>
            <p><strong>Your AWS Infrastructure Health Check</strong></p>
            <p>Aprende cómo implementar chequeos automáticos de salud para tu infraestructura AWS usando IA.</p>
            <p>✓ Análisis automático<br>
               ✓ Recomendaciones con IA<br>
               ✓ Detección proactiva<br>
               ✓ Optimización de costos</p>
        </div>
        
        <div class="url">
            ${articleUrl}
        </div>
        
        <div class="footer">
            <p><strong>AWS Builder Community</strong></p>
            <p>Comparte conocimiento • Construye comunidad</p>
        </div>
    </div>
</body>
</html>`;

    fs.writeFileSync('qr-apoyo-simple.html', simpleHtml);
    console.log('✅ Versión simple creada: qr-apoyo-simple.html');
    console.log('\n🎉 ¡Todo listo!\n');
}
