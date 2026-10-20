# Diagrama de Arquitectura - Sistema de Registro Automático para Meetups

## Arquitectura Completa

```mermaid
graph TB
    subgraph "Frontend - CloudFront + S3"
        A[👤 Usuario<br/>Tablet/Celular/Laptop] --> B[☁️ CloudFront CDN<br/>HTTPS]
        B --> C[📦 S3 Bucket<br/>Static Website]
        C --> D[🌐 registration-station.html<br/>Progressive Web App]
    end

    subgraph "API Layer - API Gateway"
        D --> E[🚪 API Gateway<br/>REST API<br/>/prod]
    end

    subgraph "Lambda Functions - Compute"
        E --> F[🔍 Profile Lookup<br/>Lambda]
        E --> G[🕷️ Scraper Lambda<br/>Puppeteer + Chromium<br/>3GB RAM / 90s]
        E --> H[🎨 Badge Generator<br/>Lambda<br/>PDFKit]
        E --> I[📊 Stats Lambda<br/>Métricas]
        
        F --> G
        G --> H
    end

    subgraph "External Services"
        G --> J[🌍 AWS Builder Community<br/>community.aws/profile]
    end

    subgraph "Storage - S3"
        H --> K[📄 S3 Bucket<br/>Badges PDFs<br/>registro-meetup-badges]
    end

    subgraph "Database - DynamoDB"
        F --> L[(🗄️ DynamoDB<br/>Profiles Table)]
        G --> L
        H --> L
        I --> L
    end

    subgraph "Queue - SQS"
        H --> M[📬 SQS Queue<br/>Print Jobs<br/>registro-meetup-print-queue]
    end

    subgraph "Print Client - Local"
        M --> N[💻 Node.js Client<br/>print-client<br/>Polling SQS]
        N --> O[🖨️ Impresora Térmica<br/>3x2 inches<br/>USB/Network]
    end

    subgraph "Monitoring"
        F -.-> P[📈 CloudWatch Logs]
        G -.-> P
        H -.-> P
        I -.-> P
        N -.-> P
    end

    style A fill:#FF9900,stroke:#232F3E,stroke-width:2px,color:#fff
    style B fill:#FF9900,stroke:#232F3E,stroke-width:2px,color:#fff
    style C fill:#569A31,stroke:#232F3E,stroke-width:2px,color:#fff
    style E fill:#FF4F8B,stroke:#232F3E,stroke-width:2px,color:#fff
    style F fill:#FF9900,stroke:#232F3E,stroke-width:2px,color:#fff
    style G fill:#FF9900,stroke:#232F3E,stroke-width:2px,color:#fff
    style H fill:#FF9900,stroke:#232F3E,stroke-width:2px,color:#fff
    style I fill:#FF9900,stroke:#232F3E,stroke-width:2px,color:#fff
    style K fill:#569A31,stroke:#232F3E,stroke-width:2px,color:#fff
    style L fill:#527FFF,stroke:#232F3E,stroke-width:2px,color:#fff
    style M fill:#FF4F8B,stroke:#232F3E,stroke-width:2px,color:#fff
    style P fill:#759C3E,stroke:#232F3E,stroke-width:2px,color:#fff
```

## Flujo de Datos Detallado

```mermaid
sequenceDiagram
    participant U as 👤 Usuario
    participant CF as ☁️ CloudFront
    participant API as 🚪 API Gateway
    participant PL as 🔍 Profile Lookup
    participant SC as 🕷️ Scraper
    participant BC as 🌍 Builder Community
    participant BG as 🎨 Badge Generator
    participant DB as 🗄️ DynamoDB
    participant S3 as 📄 S3 Badges
    participant SQS as 📬 SQS Queue
    participant PC as 💻 Print Client
    participant PR as 🖨️ Impresora

    U->>CF: 1. Accede a registration-station.html
    CF->>U: 2. Carga PWA
    U->>API: 3. POST /profile-lookup<br/>{username: "hectormtz"}
    API->>PL: 4. Invoke Lambda
    PL->>DB: 5. Buscar en caché
    
    alt Perfil en caché (< 24h)
        DB->>PL: 6a. Retorna datos
        PL->>API: 7a. Datos del perfil
    else Perfil no en caché
        PL->>SC: 6b. Trigger scraper
        SC->>BC: 7b. GET community.aws/hectormtz
        BC->>SC: 8b. HTML + JavaScript
        SC->>SC: 9b. Puppeteer render (7s)
        SC->>DB: 10b. Guardar perfil
        SC->>PL: 11b. Datos extraídos
        PL->>API: 12b. Datos del perfil
    end
    
    API->>U: 8. Muestra datos para confirmar
    U->>API: 9. POST /generate-badge<br/>{profileData, confirmed}
    API->>BG: 10. Invoke Lambda
    BG->>BG: 11. Genera PDF con PDFKit<br/>QR code + diseño (2s)
    BG->>S3: 12. Sube badge.pdf
    BG->>DB: 13. Registra badge generado
    BG->>SQS: 14. Envía mensaje print job
    BG->>API: 15. Retorna URL del badge
    API->>U: 16. Muestra badge + botón descarga
    
    Note over PC,PR: Proceso Asíncrono de Impresión
    PC->>SQS: 17. Poll queue (cada 2s)
    SQS->>PC: 18. Mensaje con badge URL
    PC->>S3: 19. Descarga PDF
    S3->>PC: 20. Badge PDF (3KB)
    PC->>PR: 21. lp -d printer badge.pdf
    PR->>PR: 22. Imprime badge (5s)
    PC->>SQS: 23. Delete message
    PC->>PC: 24. Log: Badge impreso ✅
```

## Componentes por Servicio AWS

```mermaid
graph LR
    subgraph "Compute"
        L1[Lambda: profile-lookup<br/>Node.js 18<br/>512MB / 30s]
        L2[Lambda: scraper<br/>Node.js 18<br/>3GB / 90s<br/>Puppeteer]
        L3[Lambda: badge-generator<br/>Node.js 18<br/>1GB / 60s<br/>PDFKit]
        L4[Lambda: stats<br/>Node.js 18<br/>256MB / 10s]
    end

    subgraph "Storage"
        S1[S3: Frontend<br/>Static Website<br/>CloudFront Origin]
        S2[S3: Badges<br/>PDF Storage<br/>Public Read]
    end

    subgraph "Database"
        D1[DynamoDB: profiles<br/>On-Demand<br/>TTL: 24h]
    end

    subgraph "API"
        A1[API Gateway<br/>REST API<br/>CORS Enabled]
    end

    subgraph "Queue"
        Q1[SQS: print-queue<br/>Standard Queue<br/>Visibility: 120s]
    end

    subgraph "CDN"
        C1[CloudFront<br/>HTTPS Only<br/>Global Edge]
    end

    subgraph "Monitoring"
        M1[CloudWatch Logs<br/>Lambda Logs]
        M2[CloudWatch Metrics<br/>API + Lambda]
    end

    A1 --> L1
    A1 --> L2
    A1 --> L3
    A1 --> L4
    
    L1 --> D1
    L2 --> D1
    L3 --> D1
    L4 --> D1
    
    L3 --> S2
    L3 --> Q1
    
    C1 --> S1
    
    L1 -.-> M1
    L2 -.-> M1
    L3 -.-> M1
    L4 -.-> M1
    
    A1 -.-> M2

    style L1 fill:#FF9900,stroke:#232F3E,stroke-width:2px,color:#fff
    style L2 fill:#FF9900,stroke:#232F3E,stroke-width:2px,color:#fff
    style L3 fill:#FF9900,stroke:#232F3E,stroke-width:2px,color:#fff
    style L4 fill:#FF9900,stroke:#232F3E,stroke-width:2px,color:#fff
    style S1 fill:#569A31,stroke:#232F3E,stroke-width:2px,color:#fff
    style S2 fill:#569A31,stroke:#232F3E,stroke-width:2px,color:#fff
    style D1 fill:#527FFF,stroke:#232F3E,stroke-width:2px,color:#fff
    style A1 fill:#FF4F8B,stroke:#232F3E,stroke-width:2px,color:#fff
    style Q1 fill:#FF4F8B,stroke:#232F3E,stroke-width:2px,color:#fff
    style C1 fill:#FF9900,stroke:#232F3E,stroke-width:2px,color:#fff
    style M1 fill:#759C3E,stroke:#232F3E,stroke-width:2px,color:#fff
    style M2 fill:#759C3E,stroke:#232F3E,stroke-width:2px,color:#fff
```

## Flujo de Impresión Detallado

```mermaid
stateDiagram-v2
    [*] --> Esperando: Print Client iniciado
    
    Esperando --> Polling: Cada 2 segundos
    Polling --> MensajeRecibido: Badge en cola
    Polling --> Esperando: Cola vacía
    
    MensajeRecibido --> Descargando: Obtener PDF de S3
    Descargando --> Verificando: PDF descargado
    Verificando --> ColaVacia: Verificar trabajos pendientes
    
    ColaVacia --> Imprimiendo: Cola vacía
    ColaVacia --> Esperando: Hay trabajos pendientes
    
    Imprimiendo --> EsperandoCompletar: Enviar a CUPS
    EsperandoCompletar --> Completado: Job completado
    EsperandoCompletar --> Error: Timeout o error
    
    Completado --> CortesPapel: Enviar comando ESC/POS
    CortesPapel --> EsperandoExpulsion: Esperar 2s
    EsperandoExpulsion --> Limpieza: Badge impreso ✅
    
    Limpieza --> EliminarMensaje: Borrar de SQS
    EliminarMensaje --> EliminarArchivo: Borrar PDF temporal
    EliminarArchivo --> Esperando: Listo para siguiente
    
    Error --> Reintento: Mensaje vuelve a cola
    Reintento --> Esperando: Después de VisibilityTimeout
    
    note right of Imprimiendo
        lp -d Ribetec_RT_420ME badge.pdf
        Espera completación en CUPS
    end note
    
    note right of CortesPapel
        Comandos ESC/POS:
        0x1B 0x64 0x03 (Avanzar 3 líneas)
        0x1D 0x56 0x00 (Corte completo)
    end note
```

## Infraestructura como Código (SAM)

```mermaid
graph TB
    subgraph "template.yaml - AWS SAM"
        T[📄 SAM Template]
        
        T --> R1[Resources]
        
        R1 --> API[AWS::Serverless::Api<br/>registro-meetup-api]
        R1 --> L1[AWS::Serverless::Function<br/>ProfileLookupFunction]
        R1 --> L2[AWS::Serverless::Function<br/>ScraperFunction]
        R1 --> L3[AWS::Serverless::Function<br/>BadgeGeneratorFunction]
        R1 --> L4[AWS::Serverless::Function<br/>StatsFunction]
        R1 --> DB[AWS::DynamoDB::Table<br/>ProfilesTable]
        R1 --> S3B[AWS::S3::Bucket<br/>BadgesBucket]
        R1 --> SQS[AWS::SQS::Queue<br/>PrintQueue]
        
        T --> O[Outputs]
        O --> O1[ApiUrl]
        O --> O2[BadgesBucketName]
        O --> O3[PrintQueueUrl]
    end

    subgraph "Deployment"
        D[deploy.sh] --> SAM[sam build]
        SAM --> SAMD[sam deploy]
        SAMD --> CF[CloudFormation Stack]
        CF --> AWS[☁️ AWS Resources]
    end

    style T fill:#FF9900,stroke:#232F3E,stroke-width:2px,color:#fff
    style API fill:#FF4F8B,stroke:#232F3E,stroke-width:2px,color:#fff
    style L1 fill:#FF9900,stroke:#232F3E,stroke-width:2px,color:#fff
    style L2 fill:#FF9900,stroke:#232F3E,stroke-width:2px,color:#fff
    style L3 fill:#FF9900,stroke:#232F3E,stroke-width:2px,color:#fff
    style L4 fill:#FF9900,stroke:#232F3E,stroke-width:2px,color:#fff
    style DB fill:#527FFF,stroke:#232F3E,stroke-width:2px,color:#fff
    style S3B fill:#569A31,stroke:#232F3E,stroke-width:2px,color:#fff
    style SQS fill:#FF4F8B,stroke:#232F3E,stroke-width:2px,color:#fff
```

## Costos por Componente (100 asistentes/evento)

```mermaid
pie title Distribución de Costos AWS por Evento
    "Lambda (Compute)" : 50
    "DynamoDB (Database)" : 25
    "API Gateway" : 10
    "CloudFront (CDN)" : 10
    "S3 (Storage)" : 4
    "SQS (Queue)" : 1
```

## Métricas de Performance

```mermaid
gantt
    title Tiempo de Procesamiento por Badge
    dateFormat  s
    axisFormat %Ss

    section Extracción
    Scraper Lambda (Builder Community)    :a1, 0, 7s
    
    section Generación
    Badge Generator (PDF + QR)            :a2, after a1, 2s
    
    section Impresión
    Download PDF                          :a3, after a2, 1s
    Print Job (CUPS)                      :a4, after a3, 2s
    
    section Total
    Tiempo Total                          :milestone, after a4, 0s
```

---

## Cómo Usar estos Diagramas

### En GitHub/GitLab
Los diagramas Mermaid se renderizan automáticamente en archivos `.md`

### Convertir a Imagen
```bash
# Opción 1: Usar mermaid-cli
npm install -g @mermaid-js/mermaid-cli
mmdc -i ARQUITECTURA_DIAGRAMA.md -o arquitectura.png

# Opción 2: Usar editor online
# https://mermaid.live/
```

### En Presentaciones
1. Copiar código Mermaid
2. Pegar en https://mermaid.live/
3. Exportar como PNG/SVG
4. Insertar en PowerPoint/Keynote

### En Documentación
Incluir directamente en Markdown - se renderiza automáticamente en:
- GitHub
- GitLab
- Notion
- Confluence (con plugin)
- VS Code (con extensión)

---

## Leyenda de Colores

- 🟠 **Naranja (#FF9900)**: Servicios de Compute (Lambda, CloudFront)
- 🟢 **Verde (#569A31)**: Servicios de Storage (S3)
- 🔵 **Azul (#527FFF)**: Servicios de Database (DynamoDB)
- 🔴 **Rosa (#FF4F8B)**: Servicios de API/Queue (API Gateway, SQS)
- 🟤 **Verde Oliva (#759C3E)**: Servicios de Monitoring (CloudWatch)

---

## Arquitectura de Referencia AWS

Este diseño sigue las mejores prácticas de AWS Well-Architected Framework:

✅ **Operational Excellence**: CloudWatch Logs, métricas, automatización
✅ **Security**: IAM roles, HTTPS, CORS, validación
✅ **Reliability**: Serverless auto-scaling, SQS para resiliencia
✅ **Performance Efficiency**: Lambda optimizado, CloudFront CDN
✅ **Cost Optimization**: On-demand pricing, ~$1 por evento
✅ **Sustainability**: Serverless = sin servidores idle

---

**Creado para AWS User Group Monterrey**
*Sistema de Registro Automático con AWS Builder Community*
