# 🎫 Badge Mejorado - AWS User Group Monterrey

## ✅ Cambios Implementados

### Diseño del Badge:

**Header:**
- ✅ "AWS User Group" en blanco
- ✅ "Monterrey" en naranja AWS (#FF9900)
- ✅ Fondo oscuro AWS (#232F3E)

**Datos Incluidos:**
1. ✅ Nombre Completo (grande y prominente)
2. ✅ Empresa/Escuela
3. ✅ Puesto
4. ✅ Correo Electrónico
5. ✅ Username AWS Builder (@username)
6. ✅ QR Code del perfil Builder Center

**Tamaño:**
- 4x6 pulgadas (288x432 puntos)
- Ideal para impresoras de etiquetas estándar

## 📱 Flujo Actualizado

1. **Usuario escanea QR** o ingresa URL manualmente
2. **Sistema extrae datos** del perfil
3. **Formulario de confirmación** aparece con datos pre-llenados
4. **Usuario edita** si es necesario (empresa, puesto, email)
5. **Click en "Generar Badge"**
6. **Badge PDF se genera** con todos los datos y QR
7. **Descarga automática** para imprimir

## 🖨️ Configuración para Impresoras de Etiquetas

### Impresoras Compatibles:

**Zebra (Recomendada):**
- ZD410
- ZD420
- ZD620

**Brother:**
- QL-820NWB
- QL-1110NWB

**Dymo:**
- LabelWriter 550
- LabelWriter 5XL

### Configuración de Impresión:

**Tamaño del papel:**
- 4x6 pulgadas (10.16 x 15.24 cm)
- 101.6 x 152.4 mm

**Orientación:**
- Vertical (Portrait)

**Márgenes:**
- 0mm (sin márgenes)

**Calidad:**
- Alta resolución (300 DPI o superior)

### Configuración en macOS:

```
1. Abrir el PDF
2. Archivo → Imprimir
3. Tamaño del papel: 4x6"
4. Escala: 100%
5. Orientación: Vertical
6. Márgenes: Ninguno
7. Imprimir
```

### Configuración en Windows:

```
1. Abrir el PDF
2. Archivo → Imprimir
3. Propiedades de impresora
4. Tamaño: 4x6 inches
5. Orientación: Portrait
6. Ajustar a página: No
7. Imprimir
```

## 🔧 Impresión Automática

### Opción 1: PrintNode (Cloud)

1. **Crear cuenta**: https://www.printnode.com/
2. **Instalar cliente** en PC con impresora
3. **Obtener API Key** del dashboard
4. **Configurar Lambda**:

```bash
aws lambda update-function-configuration \
  --function-name registro-meetup-print-service \
  --environment Variables="{
    PRINTNODE_API_KEY=tu-api-key,
    PRINTER_ID=12345
  }"
```

5. **Actualizar frontend** para llamar `/print` endpoint

### Opción 2: Impresión Local con Worker

Crear un worker local que:
1. Lee de la cola SQS
2. Descarga el PDF
3. Envía a impresora local

```javascript
// worker.js
const AWS = require('aws-sdk');
const { exec } = require('child_process');
const https = require('https');
const fs = require('fs');

const sqs = new AWS.SQS();
const QUEUE_URL = 'https://sqs.us-east-1.amazonaws.com/970512219824/registro-meetup-print-queue';

async function pollQueue() {
  const messages = await sqs.receiveMessage({
    QueueUrl: QUEUE_URL,
    MaxNumberOfMessages: 1,
    WaitTimeSeconds: 20
  }).promise();

  if (messages.Messages) {
    for (const message of messages.Messages) {
      const { badgeUrl } = JSON.parse(message.Body);
      
      // Descargar PDF
      const pdfPath = `/tmp/badge-${Date.now()}.pdf`;
      await downloadFile(badgeUrl, pdfPath);
      
      // Imprimir
      exec(`lpr -P "Zebra-ZD420" "${pdfPath}"`, (error) => {
        if (!error) {
          // Eliminar mensaje de la cola
          sqs.deleteMessage({
            QueueUrl: QUEUE_URL,
            ReceiptHandle: message.ReceiptHandle
          }).promise();
          
          // Eliminar archivo temporal
          fs.unlinkSync(pdfPath);
        }
      });
    }
  }
  
  // Continuar polling
  setTimeout(pollQueue, 1000);
}

function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, (response) => {
      response.pipe(file);
      file.on('finish', () => {
        file.close(resolve);
      });
    }).on('error', (err) => {
      fs.unlink(dest);
      reject(err);
    });
  });
}

pollQueue();
```

### Opción 3: Impresión Manual (Actual)

El sistema actual descarga el PDF automáticamente.
El personal solo necesita:
1. Abrir el PDF descargado
2. Cmd+P (Mac) o Ctrl+P (Windows)
3. Seleccionar impresora de etiquetas
4. Imprimir

## 🎨 Personalización del Diseño

Para cambiar el diseño del badge, edita `lambda/badge-generator/index.js`:

### Cambiar Colores:

```javascript
const awsOrange = '#FF9900';  // Naranja AWS
const awsDark = '#232F3E';    // Azul oscuro AWS
const awsGray = '#666666';    // Gris para texto secundario
```

### Cambiar Tamaño:

```javascript
const doc = new PDFDocument({
    size: [288, 432], // 4x6 pulgadas
    // Para 3x4 pulgadas: [216, 288]
    // Para 2x3 pulgadas: [144, 216]
    margins: { top: 20, bottom: 20, left: 20, right: 20 }
});
```

### Agregar Logo:

```javascript
// Después del header
doc.image('path/to/logo.png', x, y, { width: 100 });
```

### Cambiar Fuentes:

```javascript
doc.font('Helvetica-Bold')  // Negrita
doc.font('Helvetica')       // Normal
doc.font('Helvetica-Oblique') // Itálica
```

## 📊 Datos del Badge

El badge incluye todos estos campos:

```javascript
{
  username: "hectormtz",
  fullName: "Hector Martinez",
  company: "AWS User Group Monterrey",
  role: "Community Builder",
  email: "hector@awsusergroup.mx",
  profileUrl: "https://builder.aws.com/community/@hectormtz"
}
```

## 🧪 Probar el Badge

### Test desde la API:

```bash
curl -X POST https://c9h8ur30w6.execute-api.us-east-1.amazonaws.com/prod/generate-badge \
  -H "Content-Type: application/json" \
  -d '{
    "username":"hectormtz",
    "fullName":"Hector Martinez",
    "company":"AWS User Group Monterrey",
    "role":"Community Builder",
    "email":"hector@awsusergroup.mx"
  }'
```

### Test desde la Estación:

1. Abre: https://d2l8hbgwgeo97f.cloudfront.net/registration-station.html
2. Ingresa: `https://builder.aws.com/community/@hectormtz`
3. Edita los datos en el formulario
4. Genera el badge
5. Descarga y verifica el PDF

## 💡 Tips para el Evento

1. **Prueba la impresora** antes del evento con varios badges
2. **Ten papel extra** de etiquetas 4x6"
3. **Configura la impresora** como predeterminada
4. **Prueba la calidad** del QR code escaneándolo
5. **Ten backup manual** por si falla la impresora
6. **Capacita al personal** en el flujo completo

## ✅ Checklist Pre-Evento

- [ ] Impresora de etiquetas configurada
- [ ] Papel de etiquetas 4x6" suficiente
- [ ] Sistema probado end-to-end
- [ ] QR codes se escanean correctamente
- [ ] Badges se imprimen con buena calidad
- [ ] Personal capacitado
- [ ] Backup manual preparado

## 🎉 ¡Listo!

El sistema está completamente funcional con:
- ✅ Diseño profesional con branding AWS User Group Monterrey
- ✅ Todos los datos requeridos
- ✅ QR code del perfil Builder Center
- ✅ Tamaño optimizado para impresoras de etiquetas
- ✅ Formulario de confirmación editable
- ✅ Descarga automática del PDF

¡Todo listo para tu evento!
