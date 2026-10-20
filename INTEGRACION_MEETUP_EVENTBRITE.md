# Integración con Meetup.com y Eventbrite

## Resumen

El sistema ahora puede importar la lista de asistentes pre-registrados desde **Meetup.com** y **Eventbrite** antes del evento. Esto permite:

- ✅ Tener la lista de quién viene antes del evento
- ✅ Check-in más rápido (ya tienes los datos)
- ✅ Saber cuántos confirmados faltan por llegar
- ✅ No depender solo del QR de AWS Builder Community

---

## Configuración

### Meetup.com

1. Ve a [meetup.com/api/oauth/list](https://www.meetup.com/api/oauth/list/)
2. Crea un nuevo OAuth Client (o usa uno existente)
3. Para uso server-to-server (JWT Flow):
   - Genera una signing key en la configuración del OAuth Client
   - Usa el JWT flow para obtener un access token
4. Para uso interactivo (Server Flow):
   - Configura tu `redirect_uri`
   - Sigue el flujo OAuth 2.0 estándar

**Nota:** Meetup requiere que seas organizador del grupo para acceder a la lista de RSVPs.

### Eventbrite

1. Ve a [eventbrite.com/platform/api-keys](https://www.eventbrite.com/platform/api-keys)
2. Copia tu **Private Token** (se genera automáticamente)
3. Listo — el token tiene acceso a todos tus eventos

**Nota:** Solo puedes acceder a eventos de tu organización.

---

## Uso desde la Estación de Registro

1. **Crea un evento** en la estación de registro
2. Haz clic en **"📋 Importar Lista"** en el banner del evento
3. Selecciona la pestaña (Meetup o Eventbrite)
4. Pega la URL del evento y tu token
5. Haz clic en **"Importar"**
6. Los asistentes aparecerán como "pre-registrados"

---

## Uso desde la API directamente

### Importar desde Meetup

```bash
curl -X POST https://TU-API/prod/import/meetup \
  -H "Content-Type: application/json" \
  -d '{
    "eventUrl": "https://www.meetup.com/aws-user-group-monterrey/events/301234567/",
    "accessToken": "TU_MEETUP_OAUTH_TOKEN",
    "eventId": "ID_DEL_EVENTO_LOCAL"
  }'
```

### Importar desde Eventbrite

```bash
curl -X POST https://TU-API/prod/import/eventbrite \
  -H "Content-Type: application/json" \
  -d '{
    "eventUrl": "https://www.eventbrite.com.mx/e/aws-meetup-mty-tickets-987654321",
    "accessToken": "TU_EVENTBRITE_PRIVATE_TOKEN",
    "eventId": "ID_DEL_EVENTO_LOCAL"
  }'
```

### Ver estado de importación

```bash
curl https://TU-API/prod/import/status/{eventId}
```

### Listar pre-registrados

```bash
curl https://TU-API/prod/import/preregistered/{eventId}
```

### Check-in de pre-registrado

```bash
curl -X POST https://TU-API/prod/import/checkin \
  -H "Content-Type: application/json" \
  -d '{
    "badgeId": "ID_DEL_BADGE",
    "eventId": "ID_DEL_EVENTO"
  }'
```

---

## Flujo Completo del Evento

```
ANTES DEL EVENTO:
1. Crear evento en Meetup.com o Eventbrite
2. Esperar registros/RSVPs
3. Día del evento: Importar lista al sistema

DURANTE EL EVENTO:
4. Asistente llega → escanear QR o buscar por nombre
5. Si está pre-registrado → check-in rápido
6. Si NO está pre-registrado → flujo normal (QR AWS Builder)

DESPUÉS DEL EVENTO:
7. Ver reporte con pre-registrados vs asistentes reales
8. Saber quién confirmó pero no llegó
```

---

## Datos que se importan

### Desde Meetup.com
| Campo | Disponible |
|-------|-----------|
| Nombre completo | ✅ |
| Email | ❌ (Meetup no lo expone) |
| Foto de perfil | ✅ (URL) |
| Fecha de RSVP | ✅ |
| Guests | ✅ |

### Desde Eventbrite
| Campo | Disponible |
|-------|-----------|
| Nombre completo | ✅ |
| Email | ✅ |
| Empresa | ✅ |
| Puesto/Rol | ✅ |
| Tipo de ticket | ✅ |
| Fecha de registro | ✅ |

---

## Despliegue

Después de agregar la Lambda, re-despliega con SAM:

```bash
cd infrastructure
sam build
sam deploy
```

La nueva Lambda `attendee-import` se desplegará automáticamente con los endpoints:
- `POST /import/meetup`
- `POST /import/eventbrite`
- `GET /import/status/{eventId}`
- `GET /import/preregistered/{eventId}`
- `POST /import/checkin`
