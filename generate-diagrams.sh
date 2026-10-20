#!/bin/bash

# Script para generar imágenes PNG de los diagramas Mermaid

echo "🎨 Generador de Diagramas PNG"
echo "=============================="
echo ""

# Crear directorio para diagramas
mkdir -p diagrams

# Verificar si mermaid-cli está instalado
if ! command -v mmdc &> /dev/null; then
    echo "⚠️  mermaid-cli no está instalado"
    echo ""
    echo "Instalando mermaid-cli..."
    npm install -g @mermaid-js/mermaid-cli
    
    if [ $? -ne 0 ]; then
        echo ""
        echo "❌ Error al instalar mermaid-cli"
        echo ""
        echo "Por favor instala manualmente:"
        echo "  npm install -g @mermaid-js/mermaid-cli"
        echo ""
        echo "O usa la alternativa online:"
        echo "  1. Abre https://mermaid.live/"
        echo "  2. Copia el código Mermaid de ARQUITECTURA_DIAGRAMA.md"
        echo "  3. Exporta como PNG"
        echo "  4. Guarda en la carpeta diagrams/"
        exit 1
    fi
fi

echo "✅ mermaid-cli instalado"
echo ""

# Extraer diagramas del archivo markdown y convertirlos
echo "📊 Generando diagramas..."
echo ""

# Función para extraer y convertir un diagrama
extract_and_convert() {
    local start_marker="$1"
    local end_marker="$2"
    local output_file="$3"
    local title="$4"
    
    echo "  → $title..."
    
    # Extraer el diagrama
    sed -n "/$start_marker/,/$end_marker/p" ARQUITECTURA_DIAGRAMA.md | \
        sed '1d;$d' > /tmp/temp_diagram.mmd
    
    # Convertir a PNG
    mmdc -i /tmp/temp_diagram.mmd -o "diagrams/$output_file" -b transparent -w 1920 -H 1080
    
    if [ $? -eq 0 ]; then
        echo "     ✅ diagrams/$output_file"
    else
        echo "     ❌ Error generando $output_file"
    fi
}

# Generar cada diagrama
extract_and_convert "## Arquitectura Completa" "## Flujo de Datos Detallado" \
    "arquitectura-completa.png" "Arquitectura Completa"

extract_and_convert "## Flujo de Datos Detallado" "## Componentes por Servicio AWS" \
    "flujo-datos.png" "Flujo de Datos"

extract_and_convert "## Componentes por Servicio AWS" "## Flujo de Impresión Detallado" \
    "componentes-aws.png" "Componentes AWS"

extract_and_convert "## Flujo de Impresión Detallado" "## Infraestructura como Código" \
    "flujo-impresion.png" "Flujo de Impresión"

extract_and_convert "## Infraestructura como Código" "## Costos por Componente" \
    "infraestructura-sam.png" "Infraestructura SAM"

extract_and_convert "## Costos por Componente" "## Métricas de Performance" \
    "costos-distribucion.png" "Distribución de Costos"

extract_and_convert "## Métricas de Performance" "---" \
    "metricas-performance.png" "Métricas de Performance"

# Limpiar archivo temporal
rm -f /tmp/temp_diagram.mmd

echo ""
echo "✨ ¡Diagramas generados exitosamente!"
echo ""
echo "📁 Archivos creados en diagrams/:"
ls -lh diagrams/*.png 2>/dev/null || echo "  (ninguno - revisa los errores arriba)"
echo ""
echo "💡 Tip: Si hubo errores, usa https://mermaid.live/ para generar manualmente"
