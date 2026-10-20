# Requisitos del Sistema: Quantum-Inspired Event Intelligence Platform (PoC) — Enfoque Kiro

## 1. Visión del Producto
Transformar el registro pasivo de eventos en un ecosistema de telemetría en tiempo real. La plataforma capturará y analizará la interacción humana y, mediante un agente de IA *quantum-inspired*, actuará de forma autónoma para optimizar el *engagement* en tiempo real. Kiro es la Progressive Web App (PWA) que materializa esta experiencia en el dispositivo del usuario y del speaker, actuando como un contenedor inteligente de especificaciones servidor (Spec-Driven UI).

## 2. Requisitos Funcionales

### 2.1. Experiencia Kiro (Asistente y Speaker)
- **Acceso sin fricción:** Entrada vía “Magic Link” escaneando un QR estático en el gafete. La PWA se instala automáticamente y autentica mediante Badge ID, sin descargas externas.
- **Navegación contextual:** Kiro muestra la sesión en curso y el estado global del evento, recibiendo el estado desde el servidor.
- **Offline first:** La aplicación debe funcionar con conectividad limitada, almacenando localmente la telemetría y sincronizando cuando se recupere la conexión (ver 3.3).

### 2.2. Interfaz Spec-Driven (Core de Kiro)
Kiro no define vistas estáticas; renderiza componentes a partir de directivas JSON (`specs`) enviadas por el servidor. Todo cambio de pantalla o contenido se produce mediante la llegada de una nueva especificación.

- **Renderizador dinámico:** Un motor interno en Kiro interpreta una estructura JSON estándar y genera la interfaz nativa (React/Vue/similar) utilizando un catálogo de componentes registrados (ej. `ActionCard`, `PollWidget`, `AgendaTimeline`, `Heatmap`).
- **Actualización en tiempo real:** El WebSocket (o push notification) entrega nuevas `specs` que reemplazan o enriquecen la pantalla actual sin recargar la aplicación.
- **Versiones de componentes:** El sistema de spec incluye un identificador de versión para cada componente, permitiendo evoluciones controladas sin romper la PWA instalada.

### 2.3. Interacción en Vivo y Telemetría
- **Q&A con votación:** Sistema de preguntas con upvotes al estilo Reddit/Slido.
- **Micro‑feedback instantáneo:** Botones de reacción rápida (🔥, 🤯, 🥱) que generan eventos ligeros de telemetría.
- **Captura continua:** Cada acción del usuario en Kiro (navegación, clic, tiempo en pantalla) genera un evento JSON mínimo (`eventId`, `userId`, `timestamp`, `eventType`, `context`) que se encola localmente y se envía al backend.

### 2.4. Pantalla de Sugerencias para el Speaker
Es el punto de entrada de la inteligencia autónoma. Kiro renderiza una interfaz variable que muestra:
- Tarjetas de acción (`ActionCard`) con sugerencias como “Lanzar encuesta rápida”, “Ritmo muy bajo, ¿pausa?”, “Pregunta de la audiencia en tendencia”.
- Cada tarjeta especifica el tipo de intervención, riesgo estimado y justificación contextual.
- El speaker puede ejecutar la acción con un solo toque, generando un evento de telemetría de `ACTION_EXECUTED`.

### 2.5. Inteligencia y Toma de Decisiones (Backend)
- **Agente Quantum-Inspired:**
  1. **Superposición:** Ante un estímulo de telemetría, genera un array de acciones posibles (intervenciones) junto con múltiples escenarios de estado.
  2. **Evaluación:** Para cada acción, estima el impacto esperado (medido como mejora de engagement) y el riesgo de disrupción.
  3. **Colapso:** Selecciona la opción con mejor relación valor/riesgo y emite una `spec` UI dirigida al speaker.
- **Segmentación y predicción:** Clasificación heurística de usuarios (frío, tibio, caliente) y modelos predictivos de abandono o desconexión.

### 2.6. Gestión del Organizador
- **Dashboard en vivo:** WebSocket que recibe métricas agregadas y renderiza heatmaps de engagement, gráficos de participación, riesgo de abandono.
- **Misiones dinámicas:** Capacidad de crear y empujar especificaciones de misión al usuario (pantalla de “Misiones” populada por spec).
- **Time Travel Debugger:** Navegación histórica del estado del evento usando datos de Timestream/DynamoDB.

## 3. Requisitos No Funcionales (Técnicos para Kiro)

### 3.1. Protocolo Spec-Driven
- Todas las pantallas de Kiro deben ser gobernadas exclusivamente por especificaciones JSON.
- La estructura mínima de una spec:
  ```json
  {
    "screen": "speaker_suggestions",
    "components": [
      {
        "type": "ActionCard",
        "id": "c1",
        "props": { "title": "Lanzar encuesta", "risk": 0.1 }
      }
    ],
    "ttl": 120
  }