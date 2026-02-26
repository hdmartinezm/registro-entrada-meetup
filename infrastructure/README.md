# Despliegue en AWS

## Prerrequisitos

1. **AWS CLI** instalado y configurado
   ```bash
   aws configure
   ```

2. **AWS SAM CLI** instalado
   ```bash
   brew install aws-sam-cli  # macOS
   ```

3. **Node.js 18+** instalado

## Despliegue Rápido

```bash
cd infrastructure
chmod +x deploy.sh
./deploy.sh
```

## Despliegue Manual

### 1. Instalar dependencias
```bash
cd lambda/scraper
npm install

cd ../badge-generator
npm install
```

### 2. Construir con SAM
```bash
cd infrastructure
sam build
```

### 3. Desplegar
```bash
sam deploy \
  --stack-name event-badge-system \
  --region us-east-1 \
  --capabilities CAPABILITY_IAM \
  --guided
```

### 4. Configurar frontend
Después del despliegue, obtén la URL de API Gateway:
```bash
aws cloudformation describe-stacks \
  --stack-name event-badge-system \
  --query 'Stacks[0].Outputs[?OutputKey==`ApiUrl`].OutputValue' \
  --output text
```

Actualiza `frontend/app.js` con la URL obtenida.

### 5. Subir frontend a S3
```bash
BUCKET=$(aws cloudformation describe-stacks \
  --stack-name event-badge-system \
  --query 'Stacks[0].Outputs[?OutputKey==`FrontendBucketName`].OutputValue' \
  --output text)

aws s3 sync ../frontend/ s3://$BUCKET/
```

## Generar QR Codes

Usa cualquier generador de QR con URLs como:
```
https://tu-frontend-url.s3-website-us-east-1.amazonaws.com?profile=https://builder.aws.com/community/@username
```

## Costos Estimados

- **Lambda**: ~$0.20 por 1000 badges generados
- **S3**: ~$0.023 por GB almacenado
- **DynamoDB**: Gratis hasta 25GB
- **API Gateway**: ~$3.50 por millón de requests

## Limpieza

Para eliminar todos los recursos:
```bash
aws cloudformation delete-stack --stack-name event-badge-system
```

## Troubleshooting

### Error: Puppeteer timeout
Aumenta el timeout en `lambda/scraper/index.js` o el MemorySize en `template.yaml`

### Error: PDF no se genera
Verifica los permisos de S3 en la política del bucket

### CORS errors
Verifica que la API Gateway tenga CORS habilitado correctamente
