# 🎨 Guía para Generar Imágenes de los Diagramas

## Resumen

Los diagramas están en formato Mermaid (`.mmd`) y necesitan ser convertidos a PNG para usarlos en el artículo.

## ✅ Método Recomendado: Mermaid Live Editor (Sin instalación)

### Paso 1: Abrir Mermaid Live
1. Ve a https://mermaid.live/
2. Verás un editor con dos paneles

### Paso 2: Copiar el Código
1. Abre `ARQUITECTURA_DIAGRAMA.md`
2. Copia el código entre los bloques ` ```mermaid ` y ` ``` `
3. Pega en el panel izquierdo de Mermaid Live

### Paso 3: Exportar como PNG
1. El diagrama se renderiza automáticamente en el panel derecho
2. Click en el botón "Actions" (arriba a la derecha)
3. Selecciona "PNG"
4. Descarga la imagen

### Paso 4: Guardar
1. Guarda la imagen en la carpeta `diagrams/`
2. Usa estos nombres:
   - `arquitectura-completa.png`
   - `flujo-datos.png`
   - `componentes-aws.png`
   - `flujo-impresion.png`
   - `infraestructura-sam.png`
   - `costos-distribucion.png`
   - `metricas-performance.png`

### Repetir para Cada Diagrama
Hay 7 diagramas en total en `ARQUITECTURA_DIAGRAMA.md`

---

## 🔧 Método Alternativo: Línea de Comandos (Requiere instalación)

### Paso 1: Instalar mermaid-cli

```bash
npm install -g @mermaid-js/mermaid-cli
```

Si tienes problemas en macOS:
```bash
sudo npm install -g @mermaid-js/mermaid-cli --unsafe-perm=true
```

### Paso 2: Ejecutar el Script

```bash
./generate-diagrams.sh
```

Este script:
- Extrae cada diagrama de `ARQUITECTURA_DIAGRAMA.md`
- Los convierte a PNG automáticamente
- Los guarda en `diagrams/`

### Paso 3: Verificar

```bash
ls -lh diagrams/*.png
```

Deberías ver 7 archivos PNG.

---

## 📊 Diagramas a Generar

### 1. Arquitectura Completa
**Archivo**: `arquitectura-completa.png`
**Descripción**: Vista general del sistema con todos los componentes
**Tamaño recomendado**: 1920x1080px

### 2. Flujo de Datos Detallado
**Archivo**: `flujo-datos.png`
**Descripción**: Diagrama de secuencia paso a paso
**Tamaño recomendado**: 1920x1200px

### 3. Componentes por Servicio AWS
**Archivo**: `componentes-aws.png`
**Descripción**: Desglose de cada servicio AWS
**Tamaño recomendado**: 1920x1080px

### 4. Flujo de Impresión Detallado
**Archivo**: `flujo-impresion.png`
**Descripción**: Máquina de estados del proceso de impresión
**Tamaño recomendado**: 1200x1400px

### 5. Infraestructura como Código (SAM)
**Archivo**: `infraestructura-sam.png`
**Descripción**: Estructura del template SAM
**Tamaño recomendado**: 1200x1000px

### 6. Costos por Componente
**Archivo**: `costos-distribucion.png`
**Descripción**: Gráfico de pastel con distribución de costos
**Tamaño recomendado**: 800x600px

### 7. Métricas de Performance
**Archivo**: `metricas-performance.png`
**Descripción**: Gantt chart con tiempos de procesamiento
**Tamaño recomendado**: 1200x600px

---

## 🎨 Configuración de Exportación

### Para Mermaid Live Editor
- **Formato**: PNG
- **Fondo**: Transparente (recomendado) o Blanco
- **Calidad**: Alta

### Para mermaid-cli
```bash
mmdc -i input.mmd -o output.png -b transparent -w 1920 -H 1080
```

Opciones:
- `-b transparent`: Fondo transparente
- `-w 1920`: Ancho en píxeles
- `-H 1080`: Alto en píxeles
- `-s 2`: Escala (para mayor resolución)

---

## ✅ Checklist

Después de generar las imágenes, verifica:

- [ ] 7 archivos PNG en `diagrams/`
- [ ] Nombres correctos (sin espacios, minúsculas)
- [ ] Imágenes se ven claras y legibles
- [ ] Fondo transparente o blanco
- [ ] Tamaño adecuado (no muy pequeñas)
- [ ] Colores AWS visibles (naranja, verde, azul)

---

## 🐛 Problemas Comunes

### "El diagrama no se renderiza en Mermaid Live"
- Verifica que copiaste el código completo
- Asegúrate de no incluir las líneas ` ```mermaid ` y ` ``` `
- Revisa que no haya caracteres especiales mal copiados

### "mermaid-cli no se instala"
- Verifica que tienes Node.js instalado: `node --version`
- Intenta con `sudo` en macOS/Linux
- Usa la opción online (Mermaid Live) como alternativa

### "Las imágenes se ven borrosas"
- Aumenta el ancho: `-w 2400` o más
- Usa escala: `-s 2`
- Exporta como SVG en lugar de PNG: `-o archivo.svg`

### "Los colores no se ven"
- Los estilos están definidos al final de cada diagrama
- Verifica que se copió el código completo
- En Mermaid Live, los colores deberían aparecer automáticamente

---

## 📝 Después de Generar

1. **Verifica las imágenes**: Abre cada PNG y revisa que se vea bien
2. **Actualiza el artículo**: Ya está actualizado con las referencias
3. **Commit al repositorio**:
   ```bash
   git add diagrams/*.png
   git add ARTICULO_COMUNIDADES.md
   git commit -m "Add architecture diagrams"
   ```

---

## 💡 Tips

- **Para presentaciones**: Usa fondo blanco y alta resolución
- **Para web**: Fondo transparente y tamaño moderado
- **Para impresión**: Exporta como SVG (vectorial)
- **Para redes sociales**: 1200x630px con fondo blanco

---

## 🆘 ¿Necesitas Ayuda?

Si tienes problemas generando las imágenes:

1. **Opción más fácil**: Usa Mermaid Live (https://mermaid.live/)
2. **Pide ayuda**: Comparte el error específico
3. **Alternativa**: Usa capturas de pantalla del navegador renderizando el Markdown

---

**¡Listo! Una vez generadas las imágenes, el artículo estará completo y listo para publicar.** 🎉
