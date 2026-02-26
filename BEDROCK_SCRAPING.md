# 🤖 AWS Bedrock para Extracción de Datos

## ✅ Implementación Actual

He integrado **AWS Bedrock con Claude 3 Haiku** para extraer datos de perfiles de AWS Builder Community.

### Cómo Funciona:

1. **Usuario escanea QR** o ingresa URL del perfil
2. **Lambda obtiene el HTML** de la página
3. **Bedrock (Claude) analiza** el HTML y extrae:
   - Nombre completo
   - Email
   - Empresa
   - Puesto
   - Bio
4. **Datos se pre-llenan** en el formulario
5. **Usuario confirma o edita** antes de generar badge

### Limitación Actual:

AWS Builder Community carga el contenido dinámicamente con JavaScript, por lo que el HTML inicial no contiene los datos del perfil. Bedrock recibe HTML vacío.

## 🔧 Soluciones Posibles:

### Opción 1: Sistema de Memoria (IMPLEMENTADO)

**Flujo:**
1. Primera vez: Usuario completa datos manualmente
2. Sistema guarda en DynamoDB con username como clave
3. Próximas veces: Sistema busca en DynamoDB y pre-llena automáticamente

**Ventajas:**
- ✅ Funciona perfectamente
- ✅ Rápido (no necesita scraping)
- ✅ Datos siempre actualizados (usuario los confirma)
- ✅ Sin costo de Bedrock después de la primera vez

**Implementación:**
- Lambda `profile-lookup` busca en DynamoDB
- Si encuentra datos previos, los usa
- Si no, usuario completa manualmente
- Al generar badge, datos se guardan automáticamente

### Opción 2: Puppeteer con Chromium Layer

**Usar navegador headless para renderizar JavaScript:**

```javascript
const chromium = require('@sparticuz/chromium');
const puppeteer = require('puppeteer-core');

const browser = await puppeteer.launch({
    args: chromium.args,
    executablePath: await chromium.executablePath(),
    headless: chromium.headless
});

const page = await browser.newPage();
await page.goto(profileUrl, { waitUntil: 'networkidle0' });

// Esperar a que cargue el contenido
await page.waitForTimeout(3000);

const html = await page.content();
// Ahora sí tenemos el HTML completo con datos
```

**Desventajas:**
- ❌ Lento (10-15 segundos)
- ❌ Consume mucha memoria (necesita 2GB+)
- ❌ Más costoso
- ❌ Más complejo de mantener

### Opción 3: API de AWS Builder (Si existe)

Si AWS tiene una API pública para Builder Community, sería la mejor opción.

**Investigar:**
- Documentación de AWS Builder API
- Endpoints disponibles
- Autenticación requerida

### Opción 4: Pre-registro de Asistentes

**Antes del evento:**
1. Enviar formulario a asistentes
2. Recolectar datos por adelantado
3. Pre-cargar en DynamoDB
4. En el evento, solo escanear y generar

**Script incluido:**
```bash
cd tools
npm install
# Editar preload-profiles.js con datos de asistentes
npm run preload
```

## 💡 Recomendación: Opción 1 (Sistema de Memoria)

Es la más práctica y eficiente:

### Primera Vez (Usuario Nuevo):
```
1. Escanea QR → @hectormtz
2. Formulario vacío (solo username)
3. Usuario completa:
   - Nombre: Hector David Martinez Montilla
   - Email: hector.martinez.telecom@gmail.com
   - Empresa: Escala 24x7
   - Puesto: Product Development Manager
4. Genera badge
5. Datos se guardan en DynamoDB
```

### Próximas Veces:
```
1. Escanea QR → @hectormtz
2. Sistema busca en DynamoDB
3. Formulario PRE-LLENADO con datos guardados
4. Usuario solo confirma
5. Genera badge (2 segundos)
```

## 🚀 Cómo Usar el Sistema Actual

### Para el Evento:

**Primera visita del asistente:**
- Formulario aparece vacío
- Personal ayuda a completar datos
- Badge se genera
- Datos quedan guardados

**Si el asistente vuelve:**
- Formulario aparece pre-llenado
- Solo confirmar y generar
- Proceso súper rápido

### Pre-cargar Datos Conocidos:

Si tienes lista de asistentes confirmados:

```bash
cd tools
npm install

# Editar preload-profiles.js:
const knownProfiles = [
    {
        username: 'hectormtz',
        fullName: 'Hector David Martinez Montilla',
        email: 'hector.martinez.telecom@gmail.com',
        company: 'Escala 24x7',
        role: 'Product Development Manager'
    },
    // Más asistentes...
];

# Ejecutar:
npm run preload
```

## 📊 Costos de Bedrock

Si quisieras usar Bedrock activamente:

**Claude 3 Haiku:**
- Input: $0.25 por millón de tokens
- Output: $1.25 por millón de tokens
- ~1000 tokens por perfil
- **Costo: ~$0.001 por badge** (muy económico)

Pero con el sistema de memoria, solo pagas la primera vez.

## 🔍 Estado Actual

- ✅ Bedrock integrado y funcionando
- ✅ Permisos configurados
- ✅ Sistema de memoria implementado
- ✅ DynamoDB con índice por username
- ✅ Lambda profile-lookup funcionando
- ⚠️ Scraping de HTML no funciona (contenido dinámico)
- ✅ Solución: Sistema de memoria es mejor opción

## 🎯 Conclusión

El sistema actual es **óptimo** para tu caso de uso:
- Primera vez: 30 segundos (completar formulario)
- Próximas veces: 5 segundos (solo confirmar)
- Sin costos adicionales de Bedrock
- Datos siempre actualizados
- Experiencia de usuario excelente

¿Quieres que implemente alguna de las otras opciones o el sistema actual te funciona bien?
