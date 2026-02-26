# Sistema de Registro MeetUp

Sistema serverless para generar badges automáticamente desde perfiles de AWS Builder Community.

## 🎯 Flujo del Evento

1. **Asistente llega** al mostrador de registro con su celular
2. **Muestra el QR** de su perfil AWS Builder Community
3. **Personal escanea** el QR con lector físico o cámara
4. **Sistema extrae datos** automáticamente (nombre, empresa, rol, etc.)
5. **Badge se genera** en PDF (5-10 segundos)
6. **Badge se imprime** automáticamente
7. **Asistente recibe** su badge listo para usar

## ✨ Características

- ✅ **Registro asistido**: Personal escanea el QR del asistente
- ✅ **Extracción automática**: Datos del perfil público AWS Builder
- ✅ **Generación instantánea**: Badges en PDF en 5-10 segundos
- ✅ **Impresión automática**: Integración con impresoras físicas
- ✅ **100% serverless**: Corre completamente en AWS
- ✅ **Bajo costo**: ~$0.13 por 500 asistentes
- ✅ **Escalable**: Maneja múltiples estaciones simultáneamente
- ✅ **Estadísticas en vivo**: Monitoreo de badges generados

## 🖥️ Componentes

### Estación de Registro
Interfaz web optimizada para tablets/laptops en el evento:
- Escaneo de QR con cámara o lector físico
- Procesamiento automático
- Envío a impresora
- Estadísticas en tiempo real

### Backend Serverless
- Lambda para scraping de perfiles
- Lambda para generación de badges PDF
- Lambda para servicio de impresión
- DynamoDB para registro de asistentes
- SQS para cola de impresión

## Arquitectura AWS
- **Frontend**: S3 + CloudFront
- **API**: API Gateway + Lambda (Node.js)
- **Scraping**: Lambda con Puppeteer Layer
- **Generación PDF**: Lambda con PDFKit
- **Storage**: S3 para badges generados
- **Database**: DynamoDB para registro de asistentes

## Estructura del Proyecto
```
├── frontend/
│   ├── registration-station.html  # Estación de registro (PRINCIPAL)
│   ├── station-app.js            # Lógica de la estación
│   ├── station-styles.css        # Estilos de la estación
│   ├── index.html                # Formulario auto-servicio (opcional)
│   ├── app.js                    # Lógica del formulario
│   └── styles.css                # Estilos del formulario
├── lambda/
│   ├── scraper/                  # Extrae datos del perfil AWS Builder
│   ├── badge-generator/          # Genera PDF del badge
│   ├── print-service/            # Envía a impresora
│   └── stats/                    # Estadísticas en tiempo real
├── infrastructure/
│   ├── template.yaml             # Definición de recursos AWS (SAM)
│   └── deploy.sh                 # Script de despliegue automático
└── REGISTRATION_STATION_GUIDE.md # Guía completa de setup
```

## 🚀 Inicio Rápido

### Despliegue (10 minutos)

```bash
# 1. Clonar repositorio
git clone <tu-repo>
cd event-badge-system

# 2. Desplegar en AWS
cd infrastructure
chmod +x deploy.sh
./deploy.sh

# 3. Obtener URL de la Estación de Registro
# El script te mostrará la URL al finalizar
```

### Setup en el Evento

1. **Abrir la Estación de Registro** en tablet/laptop
2. **Configurar en modo kiosko** (pantalla completa)
3. **Conectar impresora** (WiFi, USB, o Bluetooth)
4. **Listo para escanear** QRs de asistentes

## 📖 Documentación

- **[REGISTRATION_STATION_GUIDE.md](REGISTRATION_STATION_GUIDE.md)** - Guía completa de la estación de registro
- **[SETUP_GUIDE.md](SETUP_GUIDE.md)** - Configuración del evento
- **[DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)** - Guía técnica de despliegue

## 🖨️ Opciones de Impresión

### Opción 1: Manual (Más Simple)
Badge se descarga y el personal lo imprime manualmente.

### Opción 2: PrintNode (Automática)
Integración con servicio PrintNode para impresión automática en la nube.

### Opción 3: Cola SQS + Worker Local
Worker local lee de SQS y envía a impresora local.

Ver [REGISTRATION_STATION_GUIDE.md](REGISTRATION_STATION_GUIDE.md) para detalles.

## 🎨 Personalización

- **Diseño del badge**: Edita `lambda/badge-generator/index.js`
- **Colores de la estación**: Edita `frontend/station-styles.css`
- **Logo del evento**: Agrega imagen en `frontend/registration-station.html`

## 💰 Costos Estimados

Para un evento de 500 personas:
- Lambda: ~$0.10
- S3: ~$0.01
- DynamoDB: Gratis (free tier)
- API Gateway: ~$0.02
- **Total: ~$0.13** 🎉

## 🔧 Requisitos

- AWS CLI configurado
- AWS SAM CLI instalado
- Node.js 18+
- Cuenta de AWS

## 📱 Hardware Recomendado

- **Tablet/iPad** con soporte de mostrador
- **Lector de QR USB** (opcional, puede usar cámara)
- **Impresora de badges** (Zebra, Brother, Dymo)
- **WiFi estable** en el evento

## Despliegue
Ver `infrastructure/README.md` para instrucciones de despliegue.
