#!/bin/bash

# Script para actualizar el frontend y limpiar caché de CloudFront

echo "📤 Subiendo archivos actualizados a S3..."
aws s3 sync frontend/ s3://registro-meetup-frontend/ --exclude "*.md"

echo "🔄 Invalidando caché de CloudFront..."
INVALIDATION_ID=$(aws cloudfront create-invalidation \
  --distribution-id E1PHYLYUEPTUB4 \
  --paths "/*" \
  --query 'Invalidation.Id' \
  --output text)

echo "✅ Invalidación creada: $INVALIDATION_ID"
echo "⏳ Los cambios estarán disponibles en 1-2 minutos"
echo ""
echo "🔗 URL de la estación:"
echo "   https://d2l8hbgwgeo97f.cloudfront.net/registration-station.html"
