# 🖨️ Cliente de Impresión Automática

Cliente local para macOS que escucha la cola de AWS SQS e imprime badges automáticamente en tu impresora térmica.

## 🚀 Instalación

### 1. Instalar Dependencias

```bash
cd print-client
npm install
```

### 2. Configurar Credenciales de AWS

```bash
# Opción A: Usar AWS CLI (recomendado)
aws configure

# Opción B: Variables de entorno
export AWS_ACCESS_KEY_ID=tu_access_key
export AWS_SECRET_ACCESS_KEY=tu_secret_key
```

### 3. Configurar Variables de Entorno

```bash
# Copiar archivo de ejemplo
cp .env.example .env

# Editar .env con tus valores
nano .env
```

Configurar:
- `PRINT_QUEUE_URL`: URL de la cola SQS
- `PRINTER_NAME`: Nombre de tu impresora (default: Ribetec_RT_420ME)
- `AWS_REGION`: Región de AWS (default: us-east-1)

## 🎯 Uso

### Iniciar el Cliente

```bash
npm start
```

Verás algo como:
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
(Presiona Ctrl+C para detener)
```

### Cuando se Genera un Badge

El cliente automáticamente:
1. ✅ Detecta nuevo badge en la cola
2. ⬇️ Descarga el PDF
3. 🖨️ Imprime en tu impresora
4. ✅ Elimina el mensaje de la cola
5. 🗑️ Limpia archivos temporales

Ejemplo de salida:
```
📄 Nuevo badge recibido:
   ID: abc123...
   Nombre: Hector David Martinez Montilla
   Username: @hectormtz
   URL: https://...

⬇️  Descargando PDF...
✅ PDF descargado
🖨️  Enviando a impresora Ribetec_RT_420ME...
✅ Impreso exitosamente
✅ Mensaje eliminado de la cola
```

### Detener el Cliente

Presiona `Ctrl+C` para detener el cliente de forma segura.

## 🔧 Solución de Problemas

### Error: Impresora no encontrada

```bash
# Ver impresoras disponibles
lpstat -p

# Actualizar PRINTER_NAME en .env con el nombre correcto
```

### Error: No se puede conectar a SQS

```bash
# Verificar credenciales de AWS
aws sts get-caller-identity

# Verificar que tienes permisos para SQS
aws sqs get-queue-attributes --queue-url <tu-queue-url>
```

### Error: No descarga el PDF

- Verificar que la URL del badge sea accesible
- Verificar conexión a internet
- Revisar permisos de S3

### Badge no imprime

```bash
# Verificar estado de la impresora
lpstat -p Ribetec_RT_420ME

# Activar impresora si está inactiva
cupsenable Ribetec_RT_420ME

# Probar impresión manual
lp -d Ribetec_RT_420ME test.pdf
```

### Algunos badges no se imprimen físicamente

Si CUPS reporta trabajos completados pero la impresora no expulsa todos los badges:

**Causa:** La impresora térmica no está recibiendo comandos de corte de papel correctamente.

**Solución implementada:** El código ahora envía comandos ESC/POS para cortar el papel después de cada impresión.

**Si el problema persiste:**
1. Ver guía completa: `CONFIGURAR_DRIVER.md`
2. Configurar driver Zebra ZPL (compatible con la mayoría de térmicas)
3. Configurar impresora en modo RAW para comandos directos

```bash
# Ver trabajos completados
lpstat -W completed -o | tail -20

# Si ves trabajos completados pero no imprimieron físicamente,
# sigue las instrucciones en CONFIGURAR_DRIVER.md
```

## 🎯 Flujo Completo

### En el Evento:

1. **Laptop:** Ejecutar `npm start` en print-client
2. **Celular/Tablet:** Abrir app web y escanear QR
3. **Sistema:** 
   - Extrae datos (7 seg)
   - Genera badge (2 seg)
   - Envía a cola SQS
4. **Laptop:** 
   - Detecta badge en cola
   - Descarga PDF
   - Imprime automáticamente
5. **Personal:** Entrega badge al asistente

**Tiempo total: ~12 segundos**

## 📊 Ventajas

- ✅ **Múltiples dispositivos:** Celulares/tablets pueden generar badges
- ✅ **Una impresora:** Centralizada en la laptop
- ✅ **Automático:** Sin intervención manual
- ✅ **Confiable:** No depende del navegador
- ✅ **Escalable:** Múltiples estaciones de escaneo

## 🔒 Seguridad

- Usa credenciales de AWS IAM
- Solo necesita permisos de lectura en SQS
- No expone la impresora a internet
- Archivos temporales se eliminan automáticamente

## 💡 Tips

1. **Mantener laptop conectada:** Para que no se suspenda
2. **Verificar papel:** Antes de iniciar el evento
3. **Probar antes:** Generar 2-3 badges de prueba
4. **Tener backup:** Botón "Descargar PDF" en la app web

## 🚀 Ejecución en Background

Para ejecutar como servicio en background:

```bash
# Opción 1: Con nohup
nohup npm start > print-client.log 2>&1 &

# Opción 2: Con screen
screen -S print-client
npm start
# Presiona Ctrl+A, luego D para detach

# Ver logs
tail -f print-client.log
```

## 📞 Soporte

Si tienes problemas:
1. Verificar logs del cliente
2. Verificar estado de la impresora: `lpstat -p`
3. Verificar cola SQS en AWS Console
4. Revisar permisos de AWS IAM
