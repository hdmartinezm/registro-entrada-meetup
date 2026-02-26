# 🚀 Instrucciones de Despliegue - Registro MeetUp

## Prerrequisitos

Antes de desplegar, asegúrate de tener:

### 1. AWS CLI Instalado y Configurado

```bash
# Verificar si está instalado
aws --version

# Si no está instalado, instalar:
# macOS:
brew install awscli

# Configurar con tus credenciales
aws configure
```

Te pedirá:
- **AWS Access Key ID**: Tu access key de AWS
- **AWS Secret Access Key**: Tu secret key de AWS
- **Default region name**: `us-east-1` (recomendado)
- **Default output format**: `json`

### 2. AWS SAM CLI Instalado

```bash
# Verificar si está instalado
sam --version

# Si no está instalado:
# macOS:
brew install aws-sam-cli
```

### 3. Node.js 18+

```bash
# Verificar versión
node --version

# Si no está instalado:
# macOS:
brew install node
```

## 🎯 Despliegue Automático (Recomendado)

### Opción 1: Script Automático

```bash
# 1. Ir al directorio de infraestructura
cd infrastructure

# 2. Dar permisos de ejecución al script
chmod +x deploy.sh

# 3. Ejecutar el despliegue
./deploy.sh
```

El script hará TODO automáticamente:
- ✅ Instalar dependencias de las funciones Lambda
- ✅ Construir el proyecto con SAM
- ✅ Desplegar todos los recursos en AWS
- ✅ Configurar el frontend con las URLs correctas
- ✅ Subir el frontend a S3

**Tiempo estimado: 10-15 minutos**

Al finalizar verás:
```
✅ ¡Despliegue completado!

📋 Información del sistema:
   API URL: https://xxxxx.execute-api.us-east-1.amazonaws.com/prod
   Frontend URL: http://registro-meetup-frontend.s3-website-us-east-1.amazonaws.com

🎫 ESTACIÓN DE REGISTRO (Usar en el evento):
   http://registro-meetup-frontend.s3-website-us-east-1.amazonaws.com/registration-station.html
```

**¡Guarda esa URL de la Estación de Registro!** Es la que usarás en el evento.

## 🔧 Despliegue Manual (Si prefieres paso a paso)

### Paso 1: Instalar Dependencias

```bash
# Scraper
cd lambda/scraper
npm install

# Badge Generator
cd ../badge-generator
npm install

# Print Service
cd ../print-service
npm install

# Stats
cd ../stats
npm install

# Volver a infrastructure
cd ../../infrastructure
```

### Paso 2: Construir con SAM

```bash
sam build
```

### Paso 3: Desplegar

```bash
sam deploy \
  --stack-name registro-meetup \
  --region us-east-1 \
  --capabilities CAPABILITY_IAM \
  --resolve-s3
```

SAM te preguntará algunas cosas, responde:
- **Confirm changes before deploy**: `N` (No)
- **Allow SAM CLI IAM role creation**: `Y` (Yes)
- **Save arguments to configuration file**: `Y` (Yes)

### Paso 4: Obtener URLs

```bash
# API URL
aws cloudformation describe-stacks \
  --stack-name registro-meetup \
  --query 'Stacks[0].Outputs[?OutputKey==`ApiUrl`].OutputValue' \
  --output text

# Frontend URL
aws cloudformation describe-stacks \
  --stack-name registro-meetup \
  --query 'Stacks[0].Outputs[?OutputKey==`RegistrationStationUrl`].OutputValue' \
  --output text
```

### Paso 5: Configurar Frontend

Edita `frontend/app.js` y `frontend/station-app.js`:
```javascript
const API_BASE_URL = 'TU_API_URL_AQUI';
```

### Paso 6: Subir Frontend a S3

```bash
BUCKET=$(aws cloudformation describe-stacks \
  --stack-name registro-meetup \
  --query 'Stacks[0].Outputs[?OutputKey==`FrontendBucketName`].OutputValue' \
  --output text)

aws s3 sync ../frontend/ s3://$BUCKET/
```

## ✅ Verificar que Todo Funciona

### 1. Probar la API

```bash
API_URL="tu-api-url-aqui"

# Test del scraper
curl -X POST $API_URL/scrape \
  -H "Content-Type: application/json" \
  -d '{"profileUrl":"https://builder.aws.com/community/@hectormtz"}'
```

Deberías ver datos del perfil en la respuesta.

### 2. Abrir la Estación de Registro

Abre en tu navegador:
```
http://registro-meetup-frontend.s3-website-us-east-1.amazonaws.com/registration-station.html
```

Deberías ver la interfaz de la estación de registro.

### 3. Probar el Flujo Completo

1. Click en "Usar Cámara" o ingresa manualmente una URL de perfil
2. Verifica que se extraigan los datos
3. Verifica que se genere el badge
4. Descarga el PDF para verificar el diseño

## 🔍 Troubleshooting

### Error: "AWS CLI not configured"
```bash
aws configure
# Ingresa tus credenciales
```

### Error: "SAM CLI not found"
```bash
brew install aws-sam-cli
```

### Error: "Insufficient permissions"
Tu usuario de AWS necesita permisos para:
- CloudFormation
- Lambda
- S3
- DynamoDB
- API Gateway
- IAM (para crear roles)

Contacta a tu administrador de AWS.

### Error: "Stack already exists"
Si ya desplegaste antes y quieres actualizar:
```bash
cd infrastructure
./deploy.sh
```

El script actualizará el stack existente.

### Error al construir Lambda
```bash
# Limpiar y reconstruir
cd infrastructure
rm -rf .aws-sam
sam build --use-container
```

## 🗑️ Eliminar Todo (Cleanup)

Si quieres eliminar todos los recursos:

```bash
# 1. Vaciar buckets S3 primero
aws s3 rm s3://registro-meetup-badges --recursive
aws s3 rm s3://registro-meetup-frontend --recursive

# 2. Eliminar el stack
aws cloudformation delete-stack --stack-name registro-meetup

# 3. Verificar que se eliminó
aws cloudformation describe-stacks --stack-name registro-meetup
```

## 📞 Soporte

Si tienes problemas:

1. **Revisa los logs de CloudWatch**:
```bash
aws logs tail /aws/lambda/registro-meetup-scraper --follow
```

2. **Verifica el estado del stack**:
```bash
aws cloudformation describe-stacks --stack-name registro-meetup
```

3. **Revisa los eventos del stack**:
```bash
aws cloudformation describe-stack-events --stack-name registro-meetup
```

## 🎉 ¡Listo!

Una vez desplegado, tendrás:
- ✅ API funcionando en AWS
- ✅ Frontend desplegado en S3
- ✅ Estación de registro lista para usar
- ✅ Base de datos para registros
- ✅ Sistema de impresión configurado

**Siguiente paso**: Lee `REGISTRATION_STATION_GUIDE.md` para configurar el hardware del evento.
