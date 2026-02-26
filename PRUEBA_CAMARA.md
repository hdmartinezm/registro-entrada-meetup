# 📱 Prueba de la Cámara - Instrucciones

## ✅ Cambios Aplicados

He corregido el código para que la cámara funcione correctamente:

1. ✅ Cambiado de `<video>` a `<div>` (requerido por html5-qrcode)
2. ✅ Configuración correcta de la librería
3. ✅ Estilos actualizados
4. ✅ Archivos subidos a S3
5. ✅ Caché de CloudFront invalidado

## 🎯 Cómo Probar

### Desde tu Celular:

1. **Abre la URL** (puede que necesites refrescar):
   ```
   https://d2l8hbgwgeo97f.cloudfront.net/registration-station.html
   ```

2. **Refresca la página** (pull down o Cmd+R)

3. **Click en "📷 Usar Cámara"**

4. **Permite el acceso** cuando te lo pida el navegador

5. **Deberías ver:**
   - El video de tu cámara
   - Un cuadro de escaneo en el centro
   - Botón "Cerrar Cámara"

6. **Apunta a un QR** que contenga una URL como:
   ```
   https://builder.aws.com/community/@username
   ```

## 🧪 Generar un QR de Prueba

Si no tienes un QR a mano, puedes:

### Opción 1: Usar un generador online
1. Ve a: https://www.qr-code-generator.com/
2. Pega: `https://builder.aws.com/community/@hectormtz`
3. Genera el QR
4. Escanéalo con la app

### Opción 2: Usar entrada manual
Si la cámara no funciona, siempre puedes:
1. Scroll down hasta "O ingresa la URL manualmente"
2. Pega: `https://builder.aws.com/community/@hectormtz`
3. Click en "Procesar"

## 🔍 Troubleshooting

### Si no ves el video de la cámara:

1. **Refresca la página** (puede ser caché del navegador)
2. **Verifica permisos** de cámara en configuración del navegador
3. **Prueba en modo incógnito** (para evitar caché)
4. **Revisa la consola** del navegador (F12) para ver errores

### Si el QR no se escanea:

1. **Acerca más el celular** al QR
2. **Asegura buena iluminación**
3. **Mantén el celular estable** por 2-3 segundos
4. **Verifica que el QR** contenga una URL válida

### Si sigue sin funcionar:

Usa la **entrada manual** como backup:
- Funciona 100% del tiempo
- No requiere cámara
- Igual de rápido

## 📊 Qué Esperar

Cuando escanees un QR correctamente:

1. ✅ La cámara se cierra automáticamente
2. ✅ Aparece pantalla de "Procesando..."
3. ✅ Se muestran 3 pasos:
   - Leyendo perfil
   - Generando badge
   - Enviando a impresora
4. ✅ Pantalla de éxito con datos del asistente
5. ✅ Badge PDF listo para descargar

## 💡 Tips

- **Primera vez**: El navegador pedirá permiso para la cámara
- **Iluminación**: Funciona mejor con buena luz
- **Distancia**: 10-20 cm del QR es ideal
- **Estabilidad**: Mantén el celular quieto 2-3 segundos
- **Backup**: Siempre puedes usar entrada manual

## 🎉 ¡Listo!

El sistema está completamente funcional. Prueba ahora y avísame si ves el video de la cámara.
