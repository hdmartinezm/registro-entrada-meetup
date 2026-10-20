# Diagramas del Sistema

Este directorio contiene los diagramas de arquitectura del sistema de registro automático.

## Archivos

### Diagramas Mermaid (.mmd)
- `arquitectura-completa.mmd` - Vista general del sistema
- Otros diagramas...

### Imágenes PNG (.png)
- `arquitectura-completa.png` - Imagen renderizada
- Otros diagramas...

## Generar Imágenes PNG

### Opción 1: Usar el script automático
```bash
./generate-diagrams.sh
```

### Opción 2: Instalar mermaid-cli manualmente
```bash
# Instalar mermaid-cli
npm install -g @mermaid-js/mermaid-cli

# Generar una imagen
mmdc -i diagrams/arquitectura-completa.mmd -o diagrams/arquitectura-completa.png -b transparent -w 1920

# Generar todas
for file in diagrams/*.mmd; do
    mmdc -i "$file" -o "${file%.mmd}.png" -b transparent -w 1920
done
```

### Opción 3: Usar Mermaid Live Editor (Online)
1. Abre https://mermaid.live/
2. Copia el contenido del archivo `.mmd`
3. Pega en el editor
4. Click en "Actions" → "PNG"
5. Descarga y guarda en `diagrams/`

## Opciones de Exportación

### Tamaños Recomendados
- **Presentaciones**: `-w 1920 -H 1080` (Full HD)
- **Documentos**: `-w 1200 -H 800`
- **Web**: `-w 800 -H 600`
- **Redes Sociales**: `-w 1200 -H 630` (Open Graph)

### Formatos
- **PNG**: `-o archivo.png` (recomendado para web)
- **SVG**: `-o archivo.svg` (recomendado para impresión)
- **PDF**: `-o archivo.pdf` (recomendado para documentos)

### Fondo
- **Transparente**: `-b transparent` (recomendado)
- **Blanco**: `-b white`
- **Personalizado**: `-b '#f0f0f0'`

## Ejemplos de Uso

```bash
# PNG transparente Full HD
mmdc -i arquitectura-completa.mmd -o arquitectura-completa.png -b transparent -w 1920 -H 1080

# SVG para impresión
mmdc -i arquitectura-completa.mmd -o arquitectura-completa.svg

# PNG para redes sociales
mmdc -i arquitectura-completa.mmd -o arquitectura-social.png -b white -w 1200 -H 630
```

## Troubleshooting

### Error: "mmdc: command not found"
```bash
npm install -g @mermaid-js/mermaid-cli
```

### Error: "Puppeteer not found"
```bash
npm install -g puppeteer
```

### Error en macOS con permisos
```bash
sudo npm install -g @mermaid-js/mermaid-cli --unsafe-perm=true
```

## Recursos

- [Mermaid Documentation](https://mermaid.js.org/)
- [Mermaid Live Editor](https://mermaid.live/)
- [Mermaid CLI](https://github.com/mermaid-js/mermaid-cli)
