# Configurar Driver para Ribetec RT-420ME en macOS

## Problema
La impresora térmica Ribetec RT-420ME puede no expulsar todos los badges físicamente aunque CUPS reporte los trabajos como completados. Esto ocurre porque el driver genérico de macOS no envía los comandos de corte de papel correctamente.

## Solución 1: Comandos ESC/POS (Ya implementado)
El código actual envía comandos ESC/POS para cortar el papel después de cada impresión. Esto debería resolver el problema en la mayoría de los casos.

## Solución 2: Configurar Driver Zebra ZPL (Si Solución 1 no funciona)

### Paso 1: Eliminar la impresora actual
```bash
lpadmin -x Ribetec_RT_420ME
```

### Paso 2: Agregar impresora con driver Zebra
1. Abre **Preferencias del Sistema** > **Impresoras y Escáneres**
2. Haz clic en el botón **+** para agregar impresora
3. Selecciona tu impresora Ribetec RT-420ME
4. En el campo **Usar**, selecciona **Seleccionar Software...**
5. Busca y selecciona **Zebra ZPL Label Printer**
6. Haz clic en **Agregar**

### Paso 3: Configurar opciones de impresión
```bash
# Configurar tamaño de papel personalizado (3x2 pulgadas = 216x144 puntos)
lpadmin -p Ribetec_RT_420ME -o media=Custom.216x144pt

# Habilitar corte automático
lpadmin -p Ribetec_RT_420ME -o CutMedia=1

# Configurar modo de impresión térmica directa
lpadmin -p Ribetec_RT_420ME -o PrintMode=Direct
```

## Solución 3: Configurar como RAW (Alternativa)

### Paso 1: Eliminar la impresora actual
```bash
lpadmin -x Ribetec_RT_420ME
```

### Paso 2: Agregar como impresora RAW
```bash
# Obtener URI de la impresora
lpinfo -v | grep Ribetec

# Agregar impresora en modo RAW (reemplaza <URI> con el URI de tu impresora)
lpadmin -p Ribetec_RT_420ME -v <URI> -m raw -E
```

### Paso 3: Configurar como predeterminada
```bash
lpadmin -d Ribetec_RT_420ME
```

## Verificar Configuración

### Ver configuración actual
```bash
lpoptions -p Ribetec_RT_420ME -l
```

### Ver estado de la impresora
```bash
lpstat -p Ribetec_RT_420ME
```

### Ver trabajos completados
```bash
lpstat -W completed -o | tail -20
```

### Prueba de impresión
```bash
echo "Prueba de impresión" | lp -d Ribetec_RT_420ME
```

## Notas Importantes

1. **Driver Zebra**: La mayoría de impresoras térmicas son compatibles con el protocolo ZPL de Zebra
2. **Modo RAW**: Permite enviar comandos ESC/POS directamente sin procesamiento
3. **Comandos ESC/POS**: El código actual ya envía comandos de corte automáticamente
4. **Buffer de impresora**: Si la impresora tiene buffer limitado, procesar un badge a la vez (ya implementado)

## Comandos ESC/POS Útiles

```javascript
// Corte completo
Buffer.from([0x1D, 0x56, 0x00])

// Corte parcial
Buffer.from([0x1B, 0x69])

// Avanzar papel 3 líneas
Buffer.from([0x1B, 0x64, 0x03])

// Expulsar papel
Buffer.from([0x0C])
```

## Recursos

- [Especificación ESC/POS](https://reference.epson-biz.com/modules/ref_escpos/index.php)
- [Zebra ZPL Programming Guide](https://www.zebra.com/us/en/support-downloads/knowledge-articles/zpl-programming-guide.html)
- [CUPS Documentation](https://www.cups.org/doc/overview.html)
