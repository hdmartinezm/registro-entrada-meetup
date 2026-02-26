# ✅ Sistema de Registro MeetUp - LISTO PARA USAR

## 🎉 Estado: COMPLETAMENTE FUNCIONAL

El sistema de extracción automática de datos está funcionando perfectamente.

## 🔗 URLs del Sistema

### Estación de Registro (USAR ESTA):
```
https://d2l8hbgwgeo97f.cloudfront.net/registration-station.html
```

### API Gateway:
```
https://c9h8ur30w6.execute-api.us-east-1.amazonaws.com/prod
```

## ✨ Cómo Funciona

### Flujo Automático:

1. **Usuario llega al evento** con su QR de AWS Builder Community
2. **Personal escanea el QR** (o ingresa URL manualmente)
3. **Sistema extrae automáticamente**:
   - ✅ Nombre completo
   - ✅ Empresa
   - ✅ Puesto
   - ✅ Username
   - ✅ Bio
   - ⚠️ Email (debe ingresarse manualmente - no es público)
4. **Formulario se pre-llena** con todos los datos
5. **Usuario solo confirma** y agrega su email
6. **Badge se genera** automáticamente en PDF
7. **Badge se envía a imprimir** (o se descarga)

## 📊 Datos Extraídos Automáticamente

### Ejemplo: @hectormtz

**Entrada:**
```
https://builder.aws.com/community/@hectormtz
```

**Salida:**
```json
{
  "username": "hectormtz",
  "fullName": "Hector David Martinez Montilla",
  "company": "Escala 24x7",
  "role": "Product Development Manager",
  "email": "",
  "bio": "Apasionado Solutions Architect con amplia experiencia..."
}
```

## 🎯 Características Implementadas

### ✅ Extracción Automática con Puppeteer
- Navegador headless en Lambda
- Renderiza JavaScript de AWS Builder Community
- Extrae datos del HTML renderizado
- Tiempo de respuesta: ~10 segundos

### ✅ Formulario de Confirmación
- Pre-llenado con datos extraídos
- Usuario puede editar cualquier campo
- Campo de email resaltado si está vacío
- Validación antes de generar badge

### ✅ Generación de Badge
- Diseño profesional con branding AWS User Group Monterrey
- Tamaño 4x6 pulgadas (compatible con impresoras de etiquetas)
- QR code del perfil de Builder Community
- Todos los datos del usuario

### ✅ Múltiples Métodos de Entrada
- Escaneo con cámara del celular (HTTPS)
- Entrada manual de URL
- Soporte para lectores de QR físicos (USB)

## 🚀 Cómo Usar en el Evento

### Opción 1: Escaneo con Cámara
1. Abrir la URL en un celular/tablet
2. Dar permiso a la cámara
3. Apuntar al QR del asistente
4. Sistema extrae datos automáticamente
5. Confirmar y generar badge

### Opción 2: Entrada Manual
1. Abrir la URL en cualquier dispositivo
2. Copiar/pegar la URL del perfil
3. Sistema extrae datos automáticamente
4. Confirmar y generar badge

### Opción 3: Lector USB
1. Conectar lector de QR USB
2. Abrir la URL en computadora
3. Escanear QR con el lector
4. Sistema detecta automáticamente
5. Confirmar y generar badge

## 📱 Preparación para Asistentes

### Antes del Evento:

Enviar a los asistentes:
```
¡Hola! Para agilizar tu registro en el evento:

1. Ve a https://builder.aws.com/community
2. Crea tu perfil (si no lo tienes)
3. Genera un QR con tu URL de perfil
4. Trae el QR al evento (impreso o en tu celular)

Tu URL será algo como:
https://builder.aws.com/community/@tuusername

¡Nos vemos en el evento!
```

### Generar QR para Asistentes:

Pueden usar cualquier generador de QR:
- https://www.qr-code-generator.com/
- https://www.qrcode-monkey.com/
- O desde su celular con apps de QR

## 🔧 Tecnología Utilizada

### Backend:
- **AWS Lambda** con Node.js 18
- **Puppeteer + Chromium** para scraping
- **DynamoDB** para registro de asistentes
- **S3** para almacenar badges
- **API Gateway** para endpoints REST
- **SQS** para cola de impresión

### Frontend:
- **HTML5 + JavaScript** vanilla
- **html5-qrcode** para escaneo de cámara
- **CloudFront** para HTTPS

### Generación de Badges:
- **PDFKit** para crear PDFs
- **qrcode** para generar QR codes
- Diseño personalizado con branding AWS

## 💰 Costos Estimados

### Por Badge:
- Lambda (scraper): ~$0.001
- Lambda (badge generator): ~$0.0001
- S3 storage: ~$0.00001
- DynamoDB: ~$0.00001
- **Total: ~$0.0012 por badge**

### Para 100 asistentes:
- **~$0.12 USD**

### Para 1000 asistentes:
- **~$1.20 USD**

¡Extremadamente económico!

## 📈 Estadísticas en Tiempo Real

El sistema muestra:
- Total de badges generados
- Badges en la última hora
- Actualización automática

## 🐛 Solución de Problemas

### Si la cámara no funciona:
- Verificar que estás usando HTTPS (CloudFront)
- Dar permisos de cámara en el navegador
- Usar entrada manual como alternativa

### Si no extrae datos:
- Verificar que la URL es correcta
- Verificar que el perfil es público
- Completar datos manualmente en el formulario

### Si el badge no se genera:
- Verificar que todos los campos están llenos
- Revisar CloudWatch logs en AWS
- Contactar soporte técnico

## 📞 Soporte

### Logs en AWS:
```bash
# Ver logs del scraper
aws logs tail /aws/lambda/registro-meetup-scraper --follow

# Ver logs del generador de badges
aws logs tail /aws/lambda/registro-meetup-badge-generator --follow
```

### Estadísticas:
```bash
# Ver estadísticas
curl https://c9h8ur30w6.execute-api.us-east-1.amazonaws.com/prod/stats
```

## 🎊 ¡Listo para el Evento!

El sistema está completamente funcional y listo para usar en tu próximo meetup de AWS User Group Monterrey.

**Características principales:**
- ✅ Extracción automática de datos
- ✅ Generación rápida de badges
- ✅ Diseño profesional
- ✅ Múltiples métodos de entrada
- ✅ Económico y escalable
- ✅ Estadísticas en tiempo real

¡Que tengas un excelente evento! 🚀
