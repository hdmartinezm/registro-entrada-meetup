# 🎯 Cómo Usar el Sistema de Registro MeetUp

## ✅ Sistema Desplegado y Funcionando

**URL de la Estación de Registro (HTTPS - Usar esta):**
```
https://d2l8hbgwgeo97f.cloudfront.net/registration-station.html
```

**Funciona en:**
- ✅ Celulares (iOS y Android)
- ✅ Tablets
- ✅ Computadoras
- ✅ Cualquier navegador moderno

## 📱 Uso en el Evento

### Opción 1: Entrada Manual (Recomendada por ahora)

1. **Abre la estación de registro** en tu navegador
2. **Pide al asistente** su username de AWS Builder
3. **Ingresa la URL** en el campo manual:
   ```
   https://builder.aws.com/community/@username
   ```
4. **Click en "Procesar"**
5. El sistema:
   - Extrae el username
   - Genera datos básicos
   - Crea el badge PDF
   - Lo envía a impresora (o descarga manual)

### Opción 2: Lector de QR Físico (USB)

Si tienes un lector de QR USB:

1. **Conecta el lector** a la computadora
2. **Abre la estación** de registro
3. **Escanea el QR** del asistente
4. El lector escribirá la URL automáticamente
5. Sistema procesa automáticamente

### Opción 3: Cámara Web

**¡AHORA FUNCIONA!** Con HTTPS habilitado, puedes usar la cámara:

1. **Abre la estación** en tu celular o tablet
2. **Click en "📷 Usar Cámara"**
3. **Permite el acceso** a la cámara cuando te lo pida
4. **Apunta al QR** del asistente
5. Sistema escanea y procesa automáticamente

**Nota:** La primera vez que uses la cámara, el navegador pedirá permiso.

## 🎨 Personalizar Datos del Badge

Actualmente el sistema extrae solo el username. Para agregar más datos:

### Opción A: Editar manualmente después de escanear

Modifica `frontend/registration-station.html` para agregar campos editables.

### Opción B: Integrar con API real

Si AWS Builder tiene una API pública, actualiza `lambda/scraper/index.js` para llamarla.

### Opción C: Base de datos pre-cargada

1. Crea una tabla DynamoDB con datos de asistentes
2. Modifica el scraper para buscar por username
3. Retorna datos completos

## 🖨️ Configurar Impresión Automática

### Opción 1: PrintNode (Cloud)

1. Crea cuenta en https://www.printnode.com/
2. Instala PrintNode Client en la PC con impresora
3. Obtén API Key y Printer ID
4. Configura Lambda:

```bash
aws lambda update-function-configuration \
  --function-name registro-meetup-print-service \
  --environment Variables="{
    PRINTNODE_API_KEY=tu-api-key,
    PRINTER_ID=12345
  }"
```

5. Actualiza `frontend/station-app.js` para llamar al endpoint `/print`

### Opción 2: Descarga Manual

El sistema actual descarga el PDF automáticamente. El personal solo necesita:
1. Abrir el PDF descargado
2. Imprimir (Cmd+P)

## 🧪 Probar el Sistema

### Test 1: Entrada Manual

```
URL: https://builder.aws.com/community/@hectormtz
```

Debería generar un badge con:
- Username: hectormtz
- Nombre: Hectormtz
- Email: hectormtz@example.com

### Test 2: API Directa

```bash
# Test scraper
curl -X POST https://c9h8ur30w6.execute-api.us-east-1.amazonaws.com/prod/scrape \
  -H "Content-Type: application/json" \
  -d '{"profileUrl":"https://builder.aws.com/community/@hectormtz"}'

# Test badge generator
curl -X POST https://c9h8ur30w6.execute-api.us-east-1.amazonaws.com/prod/generate-badge \
  -H "Content-Type: application/json" \
  -d '{
    "username":"hectormtz",
    "fullName":"Hector Martinez",
    "company":"AWS",
    "role":"Builder",
    "email":"hector@example.com"
  }'
```

## 📊 Ver Estadísticas

Las estadísticas se muestran en la parte inferior de la estación:
- Total de badges generados
- Badges en la última hora

También puedes consultar directamente:
```bash
curl https://c9h8ur30w6.execute-api.us-east-1.amazonaws.com/prod/stats
```

## 🔧 Solución de Problemas

### "No se pudo obtener los datos del perfil"
- Verifica que la URL sea correcta
- Formato: `https://builder.aws.com/community/@username`

### "No se pudo generar el badge"
- Revisa los logs de CloudWatch
- Verifica que todos los campos requeridos estén presentes

### La cámara no funciona
- Asegúrate de estar usando la URL HTTPS (CloudFront)
- Permite el acceso a la cámara cuando te lo pida el navegador
- Si sigue sin funcionar, usa entrada manual

### El badge no se descarga
- Verifica permisos del bucket S3
- Revisa la consola del navegador para errores

## 📱 Configuración Recomendada para el Evento

### Hardware:
- **Laptop o Tablet** con pantalla grande
- **Lector QR USB** (opcional): Inateck BCST-70 o similar
- **Impresora de badges**: Zebra, Brother, o Dymo
- **WiFi estable**

### Software:
- **Navegador**: Chrome o Safari en modo pantalla completa
- **URL abierta**: La estación de registro
- **Backup**: Formularios en papel por si falla

### Personal:
- 1-2 personas en la estación
- Capacitadas en el uso del sistema
- Con acceso a soporte técnico

## 💰 Costos Actuales

El sistema está corriendo y cobrará por uso:
- **Lambda**: $0.20 por millón de invocaciones
- **S3**: $0.023 por GB almacenado
- **DynamoDB**: Gratis hasta 25GB
- **API Gateway**: $3.50 por millón de requests

**Estimado para 100 asistentes: ~$0.03 USD**

## 🎉 ¡Listo para Usar!

El sistema está completamente funcional. Solo necesitas:
1. Abrir la URL en el evento
2. Ingresar URLs de perfiles manualmente
3. Descargar e imprimir badges

¿Preguntas? Revisa los logs en CloudWatch o contacta soporte.
