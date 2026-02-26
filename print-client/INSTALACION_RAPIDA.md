# 🚀 Instalación Rápida - Cliente de Impresión

## ⚡ Setup en 5 Minutos

### 1. Instalar Node.js (si no lo tienes)

```bash
# Verificar si tienes Node.js
node --version

# Si no tienes Node.js, descarga desde:
# https://nodejs.org/ (versión LTS)
```

### 2. Instalar Dependencias

```bash
cd print-client
npm install
```

### 3. Configurar AWS (Ya está configurado si usaste `aws configure` antes)

```bash
# Verificar que AWS CLI está configurado
aws sts get-caller-identity
```

Si no está configurado:
```bash
aws configure
# Ingresa tu Access Key ID
# Ingresa tu Secret Access Key
# Región: us-east-1
# Output format: json
```

### 4. Iniciar el Cliente

```bash
npm start
```

Deberías ver:
```
🖨️  Cliente de Impresión Automática
=====================================
Cola SQS: https://sqs.us-east-1.amazonaws.com/.../registro-meetup-print-queue
Impresora: Ribetec_RT_420ME
Región: us-east-1
=====================================

✅ Impresora Ribetec_RT_420ME detectada

🔄 Iniciando monitoreo de cola...

Esperando badges para imprimir...
```

## 🧪 Probar el Sistema

### Desde otro dispositivo (celular/tablet):

1. Abre: https://d2l8hbgwgeo97f.cloudfront.net/registration-station.html
2. Ingresa: `hectormtz`
3. Click "Procesar"
4. Espera ~12 segundos

### En tu laptop:

Deberías ver en el cliente:
```
📄 Nuevo badge recibido:
   ID: abc123...
   Nombre: Hector David Martinez Montilla
   Username: @hectormtz

⬇️  Descargando PDF...
✅ PDF descargado
🖨️  Enviando a impresora Ribetec_RT_420ME...
✅ Impreso exitosamente
✅ Mensaje eliminado de la cola
```

¡Y el badge se imprime automáticamente! 🎉

## 🎯 Para el Evento

### Antes del evento:
1. Conectar impresora a la laptop
2. Abrir Terminal
3. Ejecutar: `cd print-client && npm start`
4. Dejar corriendo

### Durante el evento:
- Personal usa celular/tablet para escanear QR
- Badges se imprimen automáticamente en la laptop
- ¡Sin tocar la laptop!

### Detener:
- Presiona `Ctrl+C` en la Terminal

## ❓ Problemas Comunes

### "Impresora no encontrada"
```bash
# Ver impresoras disponibles
lpstat -p

# Si el nombre es diferente, edita .env:
nano .env
# Cambia PRINTER_NAME=TuImpresora
```

### "No se puede conectar a SQS"
```bash
# Verificar credenciales
aws sts get-caller-identity

# Si falla, configurar de nuevo
aws configure
```

### "npm: command not found"
- Instala Node.js desde: https://nodejs.org/

## 📞 Ayuda

Si tienes problemas, revisa:
1. README.md (documentación completa)
2. Logs del cliente en la Terminal
3. Estado de la impresora: `lpstat -p`

¡Listo para usar! 🚀
