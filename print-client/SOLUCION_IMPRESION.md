# 🔧 Solución al Problema de Impresión

## Problema Identificado

**Síntoma:** CUPS reporta trabajos como completados, pero la impresora física solo expulsa algunos badges (aleatorio: a veces el 1ro, a veces el 2do o 3ro).

**Causa raíz:** La impresora térmica Ribetec RT-420ME no está recibiendo comandos de corte/expulsión de papel. El driver genérico de macOS envía los datos pero no le dice a la impresora que expulse el papel.

**Por qué no es un problema de delays:** Si fuera un problema de timing, fallaría consistentemente (siempre el primero o siempre después de X segundos). El comportamiento aleatorio indica que la impresora está recibiendo los trabajos pero no los está expulsando físicamente.

## Soluciones Implementadas

### 1. Comandos ESC/POS para Corte de Papel ✅

**Archivo:** `print-client/index.js`

**Cambios:**
- Nueva función `sendPaperCutCommand()` que envía comandos ESC/POS directamente a la impresora
- Comandos enviados después de cada impresión:
  - `ESC d 3` (0x1B 0x64 0x03): Avanzar 3 líneas
  - `GS V 0` (0x1D 0x56 0x00): Corte completo de papel
- Reducción de tiempos de espera (de 5s a 2s entre badges)

**Flujo actualizado:**
1. Verificar que no hay trabajos pendientes
2. Enviar PDF a CUPS
3. Esperar a que CUPS complete el trabajo
4. Esperar 2 segundos para finalización de impresión
5. **NUEVO:** Enviar comando ESC/POS de corte de papel
6. Esperar 2 segundos para expulsión física
7. Continuar con siguiente badge

### 2. Procesamiento Secuencial ✅

**Ya implementado:**
- Flag `isProcessing` para procesar solo UN mensaje a la vez
- `MaxNumberOfMessages: 1` en SQS
- Verificación de cola vacía antes de enviar nuevo trabajo
- Espera de completación de cada trabajo antes de continuar

### 3. Script de Prueba de Comandos

**Archivo:** `print-client/test-paper-cut.js`

**Uso:**
```bash
# 1. Primero imprime un badge de prueba
echo "Prueba" | lp -d Ribetec_RT_420ME

# 2. Ejecuta el script de prueba
node print-client/test-paper-cut.js

# 3. Observa cuál comando hace que la impresora expulse el papel
```

El script prueba 4 comandos diferentes:
1. Avanzar 3 líneas + Corte completo
2. Corte parcial
3. Avanzar 5 líneas + Expulsar
4. Solo expulsar

### 4. Documentación de Configuración de Driver

**Archivo:** `print-client/CONFIGURAR_DRIVER.md`

Instrucciones completas para:
- Configurar driver Zebra ZPL (compatible con la mayoría de térmicas)
- Configurar impresora en modo RAW
- Comandos ESC/POS útiles
- Troubleshooting avanzado

## Cómo Probar

### Paso 1: Reiniciar el cliente
```bash
cd print-client
npm start
```

### Paso 2: Generar 3-5 badges desde la app web
- Usa diferentes perfiles
- Observa la consola del cliente
- Verifica que TODOS los badges se impriman físicamente

### Paso 3: Verificar logs
```bash
# Ver trabajos completados
lpstat -W completed -o | tail -20

# Todos los trabajos deben tener el mismo tamaño (~3KB)
# Y todos deben haberse impreso físicamente
```

## Si el Problema Persiste

### Opción A: Probar comandos diferentes
```bash
node print-client/test-paper-cut.js
```
Anota cuál comando funciona mejor y actualiza `sendPaperCutCommand()` en `index.js`.

### Opción B: Configurar driver Zebra ZPL
```bash
# Seguir instrucciones en CONFIGURAR_DRIVER.md
# Sección: "Solución 2: Configurar Driver Zebra ZPL"
```

### Opción C: Modo RAW
```bash
# Seguir instrucciones en CONFIGURAR_DRIVER.md
# Sección: "Solución 3: Configurar como RAW"
```

## Comandos ESC/POS de Referencia

```javascript
// Corte completo
Buffer.from([0x1D, 0x56, 0x00])

// Corte parcial  
Buffer.from([0x1B, 0x69])

// Avanzar N líneas (N = 3)
Buffer.from([0x1B, 0x64, 0x03])

// Expulsar papel (form feed)
Buffer.from([0x0C])

// Inicializar impresora
Buffer.from([0x1B, 0x40])

// Avanzar y cortar (combinado)
Buffer.from([
    0x1B, 0x64, 0x03,  // Avanzar 3 líneas
    0x1D, 0x56, 0x00   // Corte completo
])
```

## Notas Técnicas

1. **ESC/POS:** Protocolo estándar para impresoras térmicas (Epson, Star, etc.)
2. **ZPL:** Protocolo de Zebra, compatible con muchas térmicas
3. **CUPS RAW:** Permite enviar comandos directos sin procesamiento
4. **Buffer de impresora:** Limitado, por eso procesamos un badge a la vez
5. **Driver genérico:** macOS usa driver genérico que no conoce comandos de corte

## Resultado Esperado

Después de implementar estas soluciones:
- ✅ Todos los badges se imprimen físicamente
- ✅ La impresora expulsa el papel automáticamente
- ✅ No hay badges "perdidos" en el buffer
- ✅ Procesamiento confiable y predecible
- ✅ Tiempo total: ~12 segundos por badge (extracción + generación + impresión)

## Contacto

Si después de probar todas las soluciones el problema persiste:
1. Verificar modelo exacto de la impresora
2. Buscar driver oficial de Ribetec
3. Contactar soporte de Ribetec para comandos específicos
4. Considerar usar impresora con mejor soporte de drivers para macOS
