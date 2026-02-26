#!/bin/bash

# Script de despliegue para el sistema de badges

set -e

STACK_NAME="registro-meetup"
REGION="us-east-1"

echo "🚀 Desplegando Sistema de Registro MeetUp..."

# Obtener directorio raíz del proyecto
PROJECT_ROOT="$(cd "$(dirname "$0")/.." && pwd)"

# Instalar dependencias de las funciones Lambda
echo "📦 Instalando dependencias..."
(cd "$PROJECT_ROOT/lambda/scraper" && npm install)
(cd "$PROJECT_ROOT/lambda/badge-generator" && npm install)
(cd "$PROJECT_ROOT/lambda/print-service" && npm install)
(cd "$PROJECT_ROOT/lambda/stats" && npm install)

# Construir y desplegar con SAM
echo "🏗️  Construyendo aplicación..."
cd "$PROJECT_ROOT/infrastructure"
sam build

echo "📤 Desplegando a AWS..."
sam deploy \
  --stack-name $STACK_NAME \
  --region $REGION \
  --capabilities CAPABILITY_IAM \
  --resolve-s3 \
  --no-confirm-changeset \
  --no-fail-on-empty-changeset

# Obtener outputs
echo "✅ Obteniendo información del despliegue..."
API_URL=$(aws cloudformation describe-stacks \
  --stack-name $STACK_NAME \
  --region $REGION \
  --query 'Stacks[0].Outputs[?OutputKey==`ApiUrl`].OutputValue' \
  --output text)

FRONTEND_BUCKET=$(aws cloudformation describe-stacks \
  --stack-name $STACK_NAME \
  --region $REGION \
  --query 'Stacks[0].Outputs[?OutputKey==`FrontendBucketName`].OutputValue' \
  --output text)

FRONTEND_URL=$(aws cloudformation describe-stacks \
  --stack-name $STACK_NAME \
  --region $REGION \
  --query 'Stacks[0].Outputs[?OutputKey==`FrontendUrl`].OutputValue' \
  --output text)

STATION_URL=$(aws cloudformation describe-stacks \
  --stack-name $STACK_NAME \
  --region $REGION \
  --query 'Stacks[0].Outputs[?OutputKey==`RegistrationStationUrl`].OutputValue' \
  --output text)

# Actualizar URL de API en el frontend
echo "🔧 Configurando frontend..."
sed -i.bak "s|YOUR_API_GATEWAY_URL|$API_URL|g" "$PROJECT_ROOT/frontend/app.js"
sed -i.bak "s|YOUR_API_GATEWAY_URL|$API_URL|g" "$PROJECT_ROOT/frontend/station-app.js"
rm "$PROJECT_ROOT/frontend/app.js.bak" 2>/dev/null || true
rm "$PROJECT_ROOT/frontend/station-app.js.bak" 2>/dev/null || true

# Subir frontend a S3
echo "📤 Subiendo frontend a S3..."
aws s3 sync "$PROJECT_ROOT/frontend/" s3://$FRONTEND_BUCKET/ \
  --exclude "*.md" \
  --region $REGION

echo ""
echo "✅ ¡Despliegue completado!"
echo ""
echo "📋 Información del sistema:"
echo "   API URL: $API_URL"
echo "   Frontend URL: $FRONTEND_URL"
echo ""
echo "🎫 ESTACIÓN DE REGISTRO (Usar en el evento):"
echo "   $STATION_URL"
echo ""
echo "💡 Instrucciones:"
echo "   1. Abre la Estación de Registro en una tablet/computadora"
echo "   2. Escanea el QR del asistente con la cámara o lector físico"
echo "   3. El badge se genera automáticamente"
echo "   4. Se envía a impresora (configurar integración)"
echo ""
