# 📱 Código QR de Apoyo - AIdeas Cloud Doctor

## ✅ Archivos Generados

1. **qr-apoyo-articulo.png** (953 bytes)
   - Código QR simple
   - 400x400 píxeles
   - Listo para usar

2. **qr-apoyo-diseno.html** (5.4 KB)
   - Diseño completo con contexto
   - Estilo moderno y atractivo
   - Colores AWS oficiales
   - Incluye descripción del artículo

3. **qr-apoyo-simple.html** (3.1 KB)
   - Versión simple para imprimir
   - Formato A4
   - Ideal para flyers o posters

## 🎯 Sobre el Artículo

**Título:** AIdeas Cloud Doctor: Your AWS Infrastructure Health Check

**URL:** https://builder.aws.com/content/3AluBlUwYKVavYSXF5J7hQf4T9P/aideas-cloud-doctor-your-aws-infrastructure-health-check

**Descripción:**
Artículo sobre cómo implementar chequeos automáticos de salud para infraestructura AWS usando IA.

**Temas clave:**
- ✓ Análisis automático de infraestructura AWS
- ✓ Recomendaciones inteligentes con IA
- ✓ Detección proactiva de problemas
- ✓ Optimización de costos y seguridad
- ✓ Implementación práctica paso a paso

## 📋 Cómo Usar

### Opción 1: Usar el QR Simple
```bash
# El archivo qr-apoyo-articulo.png está listo para usar
# Puedes insertarlo en cualquier documento, presentación, o sitio web
```

### Opción 2: Diseño Completo (Recomendado)
1. Abre `qr-apoyo-diseno.html` en tu navegador
2. Se verá un diseño profesional con:
   - Título "¡Apóyanos!"
   - Código QR grande
   - Contexto del artículo
   - Botón de llamada a la acción
3. Para guardar como imagen:
   - **Opción A:** Toma screenshot (Cmd+Shift+4 en Mac)
   - **Opción B:** Imprime como PDF (Cmd+P → Guardar como PDF)
   - **Opción C:** Usa herramienta de captura de pantalla

### Opción 3: Versión Simple para Imprimir
1. Abre `qr-apoyo-simple.html` en tu navegador
2. Imprime directamente (Cmd+P)
3. O guarda como PDF para compartir

## 🎨 Casos de Uso

### Para Eventos
- Imprime y coloca en stands
- Proyecta en pantallas
- Incluye en material de bienvenida

### Para Redes Sociales
- Comparte el diseño completo en Instagram/LinkedIn
- Usa como story con call-to-action
- Agrega a posts promocionales

### Para Presentaciones
- Inserta en slides de PowerPoint/Keynote
- Usa como slide final "Más información"
- Incluye en handouts

### Para Email/Newsletter
- Inserta la imagen del diseño
- Agrega en firma de email
- Incluye en campañas de marketing

## 🖼️ Personalización

Si quieres personalizar los diseños:

### Cambiar Colores
Edita los archivos HTML y modifica:
```css
/* Color principal AWS */
#FF9900 → Tu color

/* Color secundario */
#232F3E → Tu color
```

### Cambiar Texto
Busca y reemplaza el texto en los archivos HTML:
- Título: "¡Apóyanos!"
- Descripción del artículo
- Call-to-action

### Cambiar Tamaño del QR
Modifica en el HTML:
```css
.qr-code {
    width: 300px;  /* Cambia este valor */
    height: 300px; /* Y este */
}
```

## 🔄 Regenerar QR

Si necesitas regenerar el QR con diferente tamaño o estilo:

```bash
# Ejecutar el script nuevamente
node generar-qr-apoyo.js

# O usar API directamente
# Tamaño 600x600
https://api.qrserver.com/v1/create-qr-code/?size=600x600&data=URL

# Con color personalizado
https://api.qrserver.com/v1/create-qr-code/?size=400x400&color=FF9900&data=URL
```

## 📱 Probar el QR

1. Abre la cámara de tu celular
2. Apunta al código QR en la pantalla
3. Debería aparecer un link al artículo
4. Toca para abrir en el navegador

## 💡 Tips

### Para Mejor Escaneo
- Usa tamaño mínimo de 200x200 píxeles
- Mantén buen contraste (negro sobre blanco)
- Deja margen blanco alrededor del QR
- Prueba desde diferentes distancias

### Para Impresión
- Usa alta resolución (600x600 o más)
- Imprime en papel de buena calidad
- Evita superficies brillantes que reflejen
- Prueba el QR después de imprimir

### Para Digital
- Optimiza el tamaño de archivo
- Usa PNG para mejor calidad
- Asegúrate que sea clickeable en web
- Agrega texto alternativo (alt text)

## 📊 Tracking (Opcional)

Si quieres trackear cuántas personas escanean el QR:

1. Usa un acortador de URL con analytics:
   - bit.ly
   - tinyurl.com
   - rebrandly.com

2. Crea un link corto del artículo

3. Regenera el QR con el link corto:
```bash
# Edita generar-qr-apoyo.js
# Cambia articleUrl por tu link corto
const articleUrl = 'https://bit.ly/tu-link-corto';

# Ejecuta nuevamente
node generar-qr-apoyo.js
```

## 🎉 Ejemplos de Uso

### En Presentación
```
Slide final:
┌─────────────────────────┐
│   ¿Quieres saber más?   │
│                         │
│      [QR CODE]          │
│                         │
│  Escanea para leer el   │
│  artículo completo      │
└─────────────────────────┘
```

### En Email
```
Hola,

Te comparto un artículo interesante sobre...

[Imagen del diseño completo con QR]

¡Escanea el código para leerlo!

Saludos,
```

### En Redes Sociales
```
📱 ¿Quieres mejorar la salud de tu infraestructura AWS?

🏥 Descubre AIdeas Cloud Doctor

👉 Escanea el QR en la imagen

#AWS #CloudComputing #DevOps

[Imagen del diseño]
```

## 🆘 Troubleshooting

### El QR no escanea
- Verifica que la imagen no esté borrosa
- Aumenta el tamaño del QR
- Asegúrate de tener buena iluminación
- Limpia la cámara del celular

### El diseño no se ve bien
- Actualiza tu navegador
- Prueba en otro navegador (Chrome, Firefox, Safari)
- Verifica que la imagen del QR esté en la misma carpeta

### Quiero cambiar la URL
- Edita `generar-qr-apoyo.js`
- Cambia la variable `articleUrl`
- Ejecuta: `node generar-qr-apoyo.js`

## 📞 Soporte

Si necesitas ayuda o quieres personalizar más:
- Revisa los archivos HTML (son editables)
- Usa herramientas online de QR (qr-code-generator.com)
- Consulta la documentación de la API: https://goqr.me/api/

---

**¡Listo para compartir!** 🚀

Usa estos materiales para promover el artículo y apoyar a la comunidad AWS.
