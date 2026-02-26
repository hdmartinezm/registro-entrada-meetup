# Guía de Despliegue - Sistema de Badges para Eventos

## 🎯 Resumen del Sistema

Sistema serverless que permite a los asistentes de eventos generar badges automáticamente escaneando un QR que contiene su perfil de AWS Builder Community.

## 📋 Flujo Completo

1. **Antes del evento**: Generas QR codes con URLs personalizadas para cada asistente
2. **En el evento**: Asistente escanea QR → Sistema extrae datos del perfil → Formulario pre-llenado → Genera badge PDF
3. **Impresión**: Badge se descarga/imprime automáticamente

## 🚀 Pasos de Despliegue

### 1. Preparación (5 minutos)

```bash
# Clonar/crear el proyecto
git clone <tu-repo>
cd event-badge-system

# Verificar prerrequisitos
aws --version
sam --version
node --version
```

### 2. Despliegue Automático (10-15 minutos)

```bash
cd infrastructure
chmod +x deploy.sh
./deploy.sh
```

El script hará:
- ✅ Instalar dependencias de Lambda
- ✅ Construir funciones con SAM
- ✅ Desplegar infraestructura en AWS
- ✅ Configurar frontend con URL de API
- ✅ Subir frontend a S3

### 3. Obtener URLs

Al finalizar el despliegue verás:
```
✅ ¡Despliegue completado!

📋 Información del sistema:
   API URL: https://xxxxx.execute-api.us-east-1.amazonaws.com/prod
   Frontend URL: http://xxxxx.s3-website-us-east-1.amazonaws.com

🎫 URL de ejemplo para QR:
   http://xxxxx.s3-website-us-east-1.amazonaws.com?profile=https://builder.aws.com/community/@hectormtz
```

### 4. Generar QR Codes

Usa cualquier generador de QR (ej: qr-code-generator.com) con URLs como:

```
http://tu-frontend-url?profile=https://builder.aws.com/community/@username
```

**Tip**: Crea un CSV con todos los asistentes y genera QRs en batch.

## 🎨 Personalización del Badge

Edita `lambda/badge-generator/index.js` función `generateBadgePDF()` para:
- Cambiar colores (actualmente usa colores AWS: #232F3E, #FF9900)
- Agregar logo del evento
- Modificar tamaño (actualmente 4x6 pulgadas)
- Agregar campos adicionales

## 🖨️ Configuración de Impresión

### Opción 1: Impresión Manual
Usuario descarga PDF y lo imprime en impresora de badges

### Opción 2: Impresión Automática (Avanzado)
Integrar con servicio de impresión:
- AWS IoT para impresoras conectadas
- API de servicio de impresión (PrintNode, etc.)
- Agregar Lambda adicional para enviar a cola de impresión

## 📊 Monitoreo

### CloudWatch Logs
```bash
# Ver logs del scraper
aws logs tail /aws/lambda/event-badge-system-scraper --follow

# Ver logs del generador
aws logs tail /aws/lambda/event-badge-system-badge-generator --follow
```

### DynamoDB
Ver registros de asistentes:
```bash
aws dynamodb scan --table-name event-badge-system-attendees
```

## 💰 Costos Estimados

Para un evento de 500 personas:
- Lambda: ~$0.10
- S3: ~$0.01
- DynamoDB: Gratis (dentro de free tier)
- API Gateway: ~$0.02
- **Total: ~$0.13** 🎉

## 🔒 Seguridad

### Recomendaciones:
1. **Rate Limiting**: Agregar throttling en API Gateway
2. **Validación**: Validar URLs de perfiles en Lambda
3. **HTTPS**: Usar CloudFront para HTTPS en frontend
4. **Autenticación**: Agregar API Key si es evento privado

### Agregar CloudFront (Opcional)
```bash
# Crear distribución CloudFront apuntando al bucket S3
# Esto te dará HTTPS y mejor performance
```

## 🧪 Testing

### Test local del scraper
```bash
cd lambda/scraper
npm install
node -e "
const handler = require('./index').handler;
handler({
  body: JSON.stringify({
    profileUrl: 'https://builder.aws.com/community/@hectormtz'
  })
}).then(console.log);
"
```

### Test de la API desplegada
```bash
API_URL="tu-api-url"

# Test scraper
curl -X POST $API_URL/scrape \
  -H "Content-Type: application/json" \
  -d '{"profileUrl":"https://builder.aws.com/community/@hectormtz"}'

# Test badge generator
curl -X POST $API_URL/generate-badge \
  -H "Content-Type: application/json" \
  -d '{
    "username":"hectormtz",
    "fullName":"Hector Martinez",
    "email":"test@example.com",
    "company":"AWS",
    "role":"Builder"
  }'
```

## 🔄 Actualizaciones

Para actualizar el sistema:
```bash
cd infrastructure
./deploy.sh
```

SAM solo actualizará los recursos modificados.

## 🗑️ Limpieza

Para eliminar todo:
```bash
aws cloudformation delete-stack --stack-name event-badge-system

# Vaciar buckets primero si tienen contenido
aws s3 rm s3://event-badge-system-badges --recursive
aws s3 rm s3://event-badge-system-frontend --recursive
```

## 📞 Soporte

Si encuentras problemas:
1. Revisa CloudWatch Logs
2. Verifica permisos IAM
3. Confirma que Puppeteer tiene suficiente memoria (2048MB)
4. Verifica CORS en API Gateway

## 🎉 ¡Listo!

Tu sistema de badges está funcionando. Los asistentes pueden escanear sus QR y generar badges al instante.
