# Guía de la Estación de Registro

## 🎯 Concepto

Estación física en el evento donde el personal escanea el QR del asistente y genera su badge automáticamente.

## 🖥️ Setup de Hardware

### Opción 1: Tablet/iPad (Recomendado)
- **Dispositivo**: iPad o tablet Android
- **Lector**: Cámara integrada del dispositivo
- **Impresora**: Impresora de badges WiFi (Zebra, Brother, Dymo)
- **Soporte**: Soporte de tablet para mostrador

### Opción 2: Laptop + Lector USB
- **Dispositivo**: Laptop/PC
- **Lector**: Lector de QR USB (actúa como teclado)
- **Impresora**: Impresora de badges USB o WiFi
- **Monitor**: Monitor externo (opcional)

### Opción 3: Celular + Impresora Bluetooth
- **Dispositivo**: Smartphone
- **Lector**: Cámara del celular
- **Impresora**: Impresora portátil Bluetooth

## 📱 Configuración del Software

### 1. Abrir la Estación de Registro

Después del despliegue, obtendrás una URL como:
```
http://event-badge-system-frontend.s3-website-us-east-1.amazonaws.com/registration-station.html
```

### 2. Configurar en Modo Kiosko

**En iPad/Tablet:**
- Safari: Agregar a pantalla de inicio
- Activar "Acceso Guiado" (Settings > Accessibility > Guided Access)
- Esto bloquea el dispositivo en la app

**En Chrome (Android/Desktop):**
- Abrir en modo kiosko: `chrome --kiosk URL`
- O usar extensión "Kiosk Mode"

### 3. Mantener Pantalla Activa
- Configurar "Never Sleep" en ajustes del dispositivo
- O usar app como "Stay Alive" (Android) / "Caffeine" (Mac)

## 🔧 Integración con Impresora

### Opción A: Impresión Manual (Más Simple)
El badge se descarga automáticamente y el personal lo imprime manualmente.

**No requiere configuración adicional.**

### Opción B: Impresión Automática con PrintNode

1. **Crear cuenta en PrintNode**: https://www.printnode.com/
2. **Instalar PrintNode Client** en la computadora conectada a la impresora
3. **Obtener API Key** del dashboard
4. **Configurar variables de entorno** en Lambda:

```bash
aws lambda update-function-configuration \
  --function-name event-badge-system-print-service \
  --environment Variables="{
    PRINTNODE_API_KEY=tu-api-key,
    PRINTER_ID=12345
  }"
```

### Opción C: Impresora Local con Webhook

Si tienes una impresora en red local:

1. **Crear servidor local** que reciba webhooks
2. **Exponer con ngrok** o similar:
```bash
ngrok http 3000
```

3. **Configurar webhook** en Lambda:
```bash
aws lambda update-function-configuration \
  --function-name event-badge-system-print-service \
  --environment Variables="{
    LOCAL_PRINTER_WEBHOOK=https://tu-ngrok-url.ngrok.io/print
  }"
```

### Opción D: Cola SQS + Worker Local

1. **Worker local** lee de la cola SQS
2. **Descarga PDFs** y los envía a impresora local
3. **Código de ejemplo**:

```javascript
// worker.js
const AWS = require('aws-sdk');
const { exec } = require('child_process');

const sqs = new AWS.SQS();
const QUEUE_URL = 'tu-queue-url';

async function pollQueue() {
  const messages = await sqs.receiveMessage({
    QueueUrl: QUEUE_URL,
    MaxNumberOfMessages: 1,
    WaitTimeSeconds: 20
  }).promise();

  if (messages.Messages) {
    for (const message of messages.Messages) {
      const { badgeUrl } = JSON.parse(message.Body);
      
      // Imprimir con comando del sistema
      exec(`lpr -P nombre-impresora ${badgeUrl}`, (error) => {
        if (!error) {
          // Eliminar mensaje de la cola
          sqs.deleteMessage({
            QueueUrl: QUEUE_URL,
            ReceiptHandle: message.ReceiptHandle
          }).promise();
        }
      });
    }
  }
  
  // Continuar polling
  pollQueue();
}

pollQueue();
```

## 🎮 Uso en el Evento

### Flujo Normal:

1. **Asistente llega** al mostrador de registro
2. **Personal dice**: "Por favor muéstrame el QR de tu perfil AWS Builder"
3. **Personal escanea** el QR con el lector o cámara
4. **Sistema procesa** (5-10 segundos):
   - Extrae datos del perfil
   - Genera badge PDF
   - Envía a impresora
5. **Badge se imprime** automáticamente
6. **Personal entrega** el badge al asistente
7. **Sistema resetea** automáticamente para el siguiente

### Si el QR no funciona:

1. Click en "Entrada Manual"
2. Personal pregunta: "¿Cuál es tu username de AWS Builder?"
3. Ingresa manualmente: `https://builder.aws.com/community/@username`
4. Continúa el proceso normal

## 📊 Monitoreo en Tiempo Real

La estación muestra estadísticas en vivo:
- **Total de badges generados** en el día
- **Badges en la última hora** (para medir flujo)

## 🔍 Troubleshooting

### La cámara no funciona
- Verificar permisos del navegador
- Usar entrada manual como backup
- Usar lector USB físico

### El QR no se lee
- Asegurarse que el QR contenga la URL del perfil
- Aumentar brillo de la pantalla del celular del asistente
- Usar entrada manual

### La impresora no imprime
- Verificar conexión WiFi/USB
- Revisar cola de impresión
- Usar botón "Descargar PDF" como backup

### Sistema lento
- Verificar conexión a internet
- Revisar logs de CloudWatch
- Aumentar memoria de Lambda si es necesario

## 💡 Tips para el Evento

1. **Tener backup**: Impresora de respaldo y formularios en papel
2. **Personal capacitado**: Entrenar al equipo antes del evento
3. **Pruebas previas**: Probar todo el flujo 1 día antes
4. **WiFi dedicado**: Usar red WiFi dedicada para las estaciones
5. **Múltiples estaciones**: Para eventos grandes, tener 2-3 estaciones
6. **Papel extra**: Tener papel de badges de sobra
7. **Soporte técnico**: Tener a alguien técnico disponible

## 🎨 Personalización

### Cambiar colores/branding
Edita `frontend/station-styles.css`:
```css
/* Cambiar color principal */
.btn-camera {
    background: #TU-COLOR;
}
```

### Agregar logo del evento
Edita `frontend/registration-station.html`:
```html
<header>
    <img src="logo-evento.png" alt="Logo">
    <h1>🎫 Estación de Registro</h1>
</header>
```

### Cambiar diseño del badge
Edita `lambda/badge-generator/index.js` función `generateBadgePDF()`

## 📱 Lectores de QR Recomendados

### Lectores USB (Actúan como teclado):
- **Inateck BCST-70**: ~$50, muy confiable
- **Tera Wireless**: ~$40, sin cables
- **Honeywell Voyager**: ~$150, profesional

### Apps de Cámara:
- Cámara nativa del dispositivo (iOS/Android)
- Librería html5-qrcode (ya incluida en el código)

## 🔐 Seguridad

- **Modo kiosko**: Bloquea el dispositivo en la app
- **Sin acceso a datos**: El personal solo escanea, no ve datos sensibles
- **HTTPS**: Usar CloudFront para HTTPS (recomendado)
- **Rate limiting**: Configurar en API Gateway para prevenir abuso

## ✅ Checklist Pre-Evento

- [ ] Estación de registro desplegada y probada
- [ ] Dispositivos cargados y configurados
- [ ] Impresoras conectadas y con papel
- [ ] WiFi funcionando y estable
- [ ] Personal capacitado en el uso
- [ ] Backup manual preparado
- [ ] Soporte técnico disponible
- [ ] Prueba completa del flujo realizada

¡Listo para registrar asistentes! 🎉
