# Guía de Configuración - Sistema de Badges

## 🎯 Cómo Funciona

### Flujo del Usuario:

1. **Antes del evento**: Usuario genera su propio QR desde su perfil de AWS Builder Community
2. **En el evento**: 
   - Usuario escanea su QR con su celular
   - Se abre el formulario automáticamente con sus datos
   - Confirma y genera el badge
   - Badge se descarga/imprime inmediatamente

### No necesitas generar QRs

Los usuarios ya tienen su propio QR en su perfil de AWS Builder. Solo necesitan escanearlo.

## 🚀 Configuración del Evento

### 1. Desplegar el Sistema

```bash
cd infrastructure
chmod +x deploy.sh
./deploy.sh
```

Obtendrás una URL como:
```
http://event-badge-system-frontend.s3-website-us-east-1.amazonaws.com
```

### 2. Comunicar a los Asistentes

Envía un email/mensaje a los asistentes:

---

**Asunto: Genera tu Badge para el Evento AWS**

Hola,

Para agilizar tu registro en el evento, por favor:

1. Ve a tu perfil de AWS Builder Community: https://builder.aws.com/community/@tu-username
2. Genera el QR de tu perfil (botón "Share" o similar)
3. Al llegar al evento, escanea tu QR
4. Se abrirá automáticamente el formulario de registro
5. Confirma tus datos y genera tu badge

**Alternativa**: Si no tienes el QR, puedes ingresar manualmente en:
http://tu-url-del-evento.com

¡Nos vemos en el evento!

---

### 3. En el Evento

**Opción A: Usuario escanea su propio QR**
- Usuario abre cámara de su celular
- Escanea el QR de su perfil AWS Builder
- El QR contiene: `https://builder.aws.com/community/@username`
- Redirige a tu sistema agregando el parámetro: `?profile=...`

**Opción B: Estación de registro**
- Coloca una tablet/computadora con tu URL abierta
- Usuario ingresa manualmente su URL de perfil
- Sistema genera el badge

### 4. Impresión

**Setup recomendado:**
- Impresora de badges conectada (ej: Zebra, Brother)
- Usuario descarga PDF y lo imprime en el momento
- O envía a cola de impresión automática

## 🔧 Configuración Avanzada

### Redirección Automática

Para que el QR del perfil AWS Builder redirija a tu sistema, necesitas que los usuarios generen un QR personalizado:

**Opción 1: QR Personalizado (Recomendado)**
Pide a los usuarios que generen un QR con esta URL:
```
http://tu-url-evento.com?profile=https://builder.aws.com/community/@su-username
```

**Opción 2: Entrada Manual**
Los usuarios ingresan su URL de perfil manualmente en tu sistema.

### Integración con Impresora Automática

Modifica `lambda/badge-generator/index.js` para enviar a impresora:

```javascript
// Después de generar el PDF
const printJob = await sendToPrinter(pdfBuffer);
```

### Agregar Logo del Evento

Edita `lambda/badge-generator/index.js`:

```javascript
// En la función generateBadgePDF
doc.image('path/to/logo.png', x, y, { width: 100 });
```

## 📱 Generación de QR Personalizado

Si quieres que los usuarios tengan un QR que apunte directamente a tu sistema:

### Script para generar QRs individuales:

```bash
cd tools
npm install

# Edita generate-qr-codes.js con la lista de usernames
npm run generate
```

Esto genera QRs que ya apuntan a tu sistema con el perfil incluido.

### Envío de QRs

Puedes enviar estos QRs por email a cada asistente antes del evento.

## 🎨 Personalización

### Cambiar diseño del badge

Edita `lambda/badge-generator/index.js`:
- Colores
- Fuentes
- Tamaño (actualmente 4x6 pulgadas)
- Campos adicionales

### Cambiar campos del formulario

Edita `frontend/index.html` para agregar/quitar campos.

## 💡 Tips

1. **Prueba antes del evento**: Haz pruebas con varios perfiles
2. **Backup manual**: Ten un formulario de respaldo por si falla el scraping
3. **Impresoras**: Ten impresoras de respaldo
4. **WiFi**: Asegura buena conexión WiFi en el evento
5. **Soporte**: Ten personal que ayude con el proceso

## 🔍 Troubleshooting

### El QR no funciona
- Verifica que el QR contenga la URL correcta
- Prueba escaneando con diferentes apps de QR

### No se extraen los datos
- Verifica que el perfil sea público
- Revisa los logs de CloudWatch

### Badge no se genera
- Verifica permisos de S3
- Revisa logs de la Lambda de generación

## 📊 Monitoreo en Vivo

Durante el evento, monitorea:

```bash
# Ver registros en tiempo real
aws logs tail /aws/lambda/event-badge-system-scraper --follow

# Ver cuántos badges se han generado
aws dynamodb scan --table-name event-badge-system-attendees --select COUNT
```

## ✅ Checklist Pre-Evento

- [ ] Sistema desplegado y probado
- [ ] URL comunicada a asistentes
- [ ] Impresoras configuradas y con papel
- [ ] WiFi funcionando
- [ ] Personal capacitado
- [ ] Formulario de respaldo listo
- [ ] Monitoreo configurado
- [ ] Badges de prueba generados

¡Listo para el evento! 🎉
