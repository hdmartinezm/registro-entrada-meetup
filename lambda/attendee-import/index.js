const AWS = require('aws-sdk');
const fetch = require('node-fetch');
const { v4: uuidv4 } = require('uuid');

const dynamodb = new AWS.DynamoDB.DocumentClient();
const ssm = new AWS.SSM();

const ATTENDEES_TABLE = process.env.ATTENDEES_TABLE;
const EVENTS_TABLE = process.env.EVENTS_TABLE;

const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,PUT,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key'
};

function response(statusCode, body) {
    return { statusCode, headers, body: JSON.stringify(body) };
}

exports.handler = async (event) => {
    const method = event.httpMethod;
    const path = event.path;

    try {
        if (method === 'OPTIONS') {
            return response(200, {});
        }

        // POST /import/meetup — importar asistentes desde Meetup.com
        if (method === 'POST' && path === '/import/meetup') {
            return await importFromMeetup(event);
        }

        // POST /import/meetup-manual — importar asistentes desde JSON manual de Meetup
        if (method === 'POST' && path === '/import/meetup-manual') {
            return await importFromMeetupManual(event);
        }

        // POST /import/eventbrite — importar asistentes desde Eventbrite
        if (method === 'POST' && path === '/import/eventbrite') {
            return await importFromEventbrite(event);
        }

        // GET /import/status/{eventId} — ver estado de importación
        if (method === 'GET' && path.includes('/import/status/')) {
            const eventId = event.pathParameters?.eventId;
            return await getImportStatus(eventId);
        }

        // GET /import/preregistered/{eventId} — listar pre-registrados
        if (method === 'GET' && path.includes('/import/preregistered/')) {
            const eventId = event.pathParameters?.eventId;
            return await getPreregistered(eventId);
        }

        // POST /import/checkin — check-in rápido de pre-registrado
        if (method === 'POST' && path === '/import/checkin') {
            return await checkinPreregistered(event);
        }

        // POST /import/csv — importar asistentes desde CSV (The Guild IT)
        if (method === 'POST' && path === '/import/csv') {
            return await importFromCSV(event);
        }

        return response(404, { error: 'Ruta no encontrada' });

    } catch (error) {
        console.error('Error:', error);
        return response(500, { error: 'Error interno', details: error.message });
    }
};

// ─── MEETUP.COM ───────────────────────────────────────────────────────────────

async function importFromMeetupManual(event) {
    const body = JSON.parse(event.body || '{}');
    const { eventId, attendees, source, eventTitle } = body;

    if (!eventId) {
        return response(400, { error: 'eventId es requerido' });
    }

    if (!attendees || !Array.isArray(attendees) || attendees.length === 0) {
        return response(400, { error: 'attendees (array) es requerido' });
    }

    try {
        const imported = await savePreregistered(attendees, eventId, source || 'meetup');

        return response(200, {
            success: true,
            source: source || 'meetup',
            totalFound: attendees.length,
            imported: imported.length,
            skipped: attendees.length - imported.length,
            attendees: imported.map(a => ({
                fullName: a.fullName,
                email: a.email || '',
                status: a.preregisteredStatus
            }))
        });
    } catch (error) {
        console.error('Error importando manual de Meetup:', error);
        return response(500, {
            error: 'Error al importar',
            details: error.message
        });
    }
}

async function importFromMeetup(event) {
    const body = JSON.parse(event.body || '{}');
    const { eventUrl, accessToken, eventId } = body;

    if (!eventUrl && !body.meetupEventId) {
        return response(400, { error: 'eventUrl o meetupEventId es requerido' });
    }

    if (!accessToken) {
        return response(400, { error: 'accessToken de Meetup es requerido' });
    }

    if (!eventId) {
        return response(400, { error: 'eventId (evento local) es requerido' });
    }

    // Extraer el eventId de Meetup desde la URL
    const meetupEventId = body.meetupEventId || extractMeetupEventId(eventUrl);
    const groupUrlname = body.groupUrlname || extractMeetupGroup(eventUrl);

    if (!meetupEventId || !groupUrlname) {
        return response(400, {
            error: 'No se pudo extraer el ID del evento. Formato esperado: https://www.meetup.com/GRUPO/events/ID/',
            hint: 'También puedes enviar meetupEventId y groupUrlname directamente'
        });
    }

    try {
        // Meetup usa GraphQL API
        const attendees = await fetchMeetupAttendees(groupUrlname, meetupEventId, accessToken);

        // Guardar en DynamoDB como pre-registrados
        const imported = await savePreregistered(attendees, eventId, 'meetup');

        return response(200, {
            success: true,
            source: 'meetup',
            totalFound: attendees.length,
            imported: imported.length,
            skipped: attendees.length - imported.length,
            attendees: imported.map(a => ({
                fullName: a.fullName,
                email: a.email,
                status: a.preregisteredStatus
            }))
        });

    } catch (error) {
        console.error('Error importando de Meetup:', error);
        return response(500, {
            error: 'Error al importar desde Meetup',
            details: error.message
        });
    }
}

async function fetchMeetupAttendees(groupUrlname, eventId, accessToken) {
    // Meetup GraphQL API para obtener RSVPs
    const query = `
        query ($eventId: ID!) {
            event(id: $eventId) {
                title
                dateTime
                venue {
                    name
                }
                tickets(input: { first: 500 }) {
                    count
                    edges {
                        node {
                            user {
                                id
                                name
                                memberPhoto {
                                    baseUrl
                                }
                            }
                            guestsCount
                            createdAt
                            updatedAt
                            status
                        }
                    }
                }
            }
        }
    `;

    const graphqlResponse = await fetch('https://api.meetup.com/gql', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({
            query,
            variables: { eventId }
        })
    });

    if (!graphqlResponse.ok) {
        const errorText = await graphqlResponse.text();
        throw new Error(`Meetup API error (${graphqlResponse.status}): ${errorText}`);
    }

    const data = await graphqlResponse.json();

    if (data.errors) {
        throw new Error(`Meetup GraphQL error: ${JSON.stringify(data.errors)}`);
    }

    const tickets = data.data?.event?.tickets?.edges || [];

    return tickets
        .filter(edge => edge.node.status === 'ATTENDING' || edge.node.status === 'YES')
        .map(edge => ({
            fullName: edge.node.user?.name || 'Sin nombre',
            email: '', // Meetup no expone emails en la API pública
            meetupUserId: edge.node.user?.id || '',
            photoUrl: edge.node.user?.memberPhoto?.baseUrl || '',
            rsvpDate: edge.node.createdAt,
            guests: edge.node.guestsCount || 0,
            source: 'meetup'
        }));
}

// ─── CSV (THE GUILD IT) ───────────────────────────────────────────────────────

async function importFromCSV(event) {
    const body = JSON.parse(event.body || '{}');
    const { eventId, attendees } = body;

    if (!eventId) {
        return response(400, { error: 'eventId es requerido' });
    }

    if (!attendees || !Array.isArray(attendees) || attendees.length === 0) {
        return response(400, { error: 'attendees (array) es requerido' });
    }

    try {
        const result = await saveOrUpdateFromCSV(attendees, eventId);

        return response(200, {
            success: true,
            source: 'csv',
            totalFound: attendees.length,
            imported: result.imported,
            updated: result.updated,
            skipped: result.skipped
        });

    } catch (error) {
        console.error('Error importando CSV:', error);
        return response(500, {
            error: 'Error al importar desde CSV',
            details: error.message
        });
    }
}

// Guardar o actualizar registros de CSV (permite re-importar y actualizar datos)
async function saveOrUpdateFromCSV(attendees, eventId) {
    const now = new Date().toISOString();
    let imported = 0;
    let updated = 0;
    let skipped = 0;

    for (const attendee of attendees) {
        if (!attendee.fullName || !attendee.fullName.trim()) {
            skipped++;
            continue;
        }

        // Buscar por email primero (más confiable)
        let existingItem = null;
        if (attendee.email && attendee.email.trim()) {
            const emailResult = await dynamodb.query({
                TableName: ATTENDEES_TABLE,
                IndexName: 'EmailIndex',
                KeyConditionExpression: 'email = :email',
                FilterExpression: 'eventId = :eventId',
                ExpressionAttributeValues: {
                    ':email': attendee.email.trim(),
                    ':eventId': eventId
                }
            }).promise();

            if (emailResult.Items && emailResult.Items.length > 0) {
                existingItem = emailResult.Items[0];
            }
        }

        // Si no encontró por email, buscar por nombre
        if (!existingItem) {
            const nameResult = await dynamodb.query({
                TableName: ATTENDEES_TABLE,
                IndexName: 'EventIdIndex',
                KeyConditionExpression: 'eventId = :eventId',
                FilterExpression: 'fullName = :name AND preregistered = :pre',
                ExpressionAttributeValues: {
                    ':eventId': eventId,
                    ':name': attendee.fullName.trim(),
                    ':pre': true
                }
            }).promise();

            if (nameResult.Items && nameResult.Items.length > 0) {
                existingItem = nameResult.Items[0];
            }
        }

        if (existingItem) {
            // Actualizar registro existente (merge)
            const updateParams = {
                TableName: ATTENDEES_TABLE,
                Key: { badgeId: existingItem.badgeId },
                UpdateExpression: 'SET updatedAt = :now',
                ExpressionAttributeValues: { ':now': now }
            };

            // Solo actualizar campos si tienen valor en el CSV
            if (attendee.company && attendee.company.trim()) {
                updateParams.UpdateExpression += ', company = :company';
                updateParams.ExpressionAttributeValues[':company'] = attendee.company.trim();
            }
            if (attendee.role && attendee.role.trim()) {
                updateParams.UpdateExpression += ', #role = :role';
                updateParams.ExpressionAttributeNames = { '#role': 'role' };
                updateParams.ExpressionAttributeValues[':role'] = attendee.role.trim();
            }
            // Actualizar nombre si cambió
            if (attendee.fullName.trim() !== existingItem.fullName) {
                updateParams.UpdateExpression += ', fullName = :name';
                updateParams.ExpressionAttributeValues[':name'] = attendee.fullName.trim();
            }

            await dynamodb.update(updateParams).promise();
            updated++;
        } else {
            // Crear nuevo registro
            const item = {
                badgeId: uuidv4(),
                eventId,
                fullName: attendee.fullName.trim(),
                company: (attendee.company || '').trim(),
                role: (attendee.role || '').trim(),
                source: 'csv',
                preregistered: true,
                preregisteredStatus: 'pending',
                importedAt: now
            };

            // Solo agregar email si tiene valor
            if (attendee.email && attendee.email.trim()) {
                item.email = attendee.email.trim();
            }

            await dynamodb.put({
                TableName: ATTENDEES_TABLE,
                Item: item
            }).promise();
            imported++;
        }
    }

    return { imported, updated, skipped };
}

// ─── EVENTBRITE ───────────────────────────────────────────────────────────────

async function importFromEventbrite(event) {
    const body = JSON.parse(event.body || '{}');
    const { eventUrl, accessToken, eventId } = body;

    if (!eventUrl && !body.eventbriteEventId) {
        return response(400, { error: 'eventUrl o eventbriteEventId es requerido' });
    }

    if (!accessToken) {
        return response(400, {
            error: 'accessToken de Eventbrite es requerido',
            hint: 'Obtén tu token en: https://www.eventbrite.com/platform/api-keys'
        });
    }

    if (!eventId) {
        return response(400, { error: 'eventId (evento local) es requerido' });
    }

    // Extraer eventId de Eventbrite desde la URL
    const eventbriteEventId = body.eventbriteEventId || extractEventbriteId(eventUrl);

    if (!eventbriteEventId) {
        return response(400, {
            error: 'No se pudo extraer el ID del evento de Eventbrite',
            hint: 'Formato esperado: https://www.eventbrite.com/e/nombre-del-evento-tickets-123456789 o envía eventbriteEventId directamente'
        });
    }

    try {
        const attendees = await fetchEventbriteAttendees(eventbriteEventId, accessToken);

        // Guardar en DynamoDB como pre-registrados
        const imported = await savePreregistered(attendees, eventId, 'eventbrite');

        return response(200, {
            success: true,
            source: 'eventbrite',
            totalFound: attendees.length,
            imported: imported.length,
            skipped: attendees.length - imported.length,
            attendees: imported.map(a => ({
                fullName: a.fullName,
                email: a.email,
                status: a.preregisteredStatus
            }))
        });

    } catch (error) {
        console.error('Error importando de Eventbrite:', error);
        return response(500, {
            error: 'Error al importar desde Eventbrite',
            details: error.message
        });
    }
}

async function fetchEventbriteAttendees(eventbriteEventId, accessToken) {
    let allAttendees = [];
    let page = 1;
    let hasMore = true;

    while (hasMore) {
        const url = `https://www.eventbriteapi.com/v3/events/${eventbriteEventId}/attendees/?page=${page}&status=attending`;

        const apiResponse = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });

        if (!apiResponse.ok) {
            const errorText = await apiResponse.text();
            throw new Error(`Eventbrite API error (${apiResponse.status}): ${errorText}`);
        }

        const data = await apiResponse.json();
        const attendees = data.attendees || [];

        for (const attendee of attendees) {
            allAttendees.push({
                fullName: attendee.profile?.name || `${attendee.profile?.first_name || ''} ${attendee.profile?.last_name || ''}`.trim(),
                email: attendee.profile?.email || '',
                company: attendee.profile?.company || '',
                jobTitle: attendee.profile?.job_title || '',
                eventbriteOrderId: attendee.order_id || '',
                eventbriteAttendeeId: attendee.id || '',
                ticketType: attendee.ticket_class_name || '',
                registeredAt: attendee.created || '',
                source: 'eventbrite'
            });
        }

        hasMore = data.pagination?.has_more_items || false;
        page++;

        // Safety: máximo 20 páginas (1000 asistentes)
        if (page > 20) break;
    }

    return allAttendees;
}

// ─── FUNCIONES COMPARTIDAS ────────────────────────────────────────────────────

async function savePreregistered(attendees, eventId, source) {
    const imported = [];
    const now = new Date().toISOString();

    for (const attendee of attendees) {
        // Verificar si ya existe (por email o nombre + evento)
        const exists = await checkIfExists(attendee, eventId);
        if (exists) continue;

        const item = {
            badgeId: uuidv4(),
            eventId,
            fullName: attendee.fullName,
            company: attendee.company || '',
            role: attendee.jobTitle || '',
            source,
            preregistered: true,
            preregisteredStatus: 'pending', // pending | checked_in
            importedAt: now
        };

        // Solo agregar campos opcionales si tienen valor (DynamoDB no acepta strings vacíos en índices)
        if (attendee.email) item.email = attendee.email;
        if (attendee.meetupUserId) item.meetupUserId = attendee.meetupUserId;
        if (attendee.eventbriteAttendeeId) item.eventbriteAttendeeId = attendee.eventbriteAttendeeId;
        if (attendee.eventbriteOrderId) item.eventbriteOrderId = attendee.eventbriteOrderId;
        if (attendee.ticketType) item.ticketType = attendee.ticketType;

        await dynamodb.put({
            TableName: ATTENDEES_TABLE,
            Item: item
        }).promise();

        imported.push(item);
    }

    return imported;
}

async function checkIfExists(attendee, eventId) {
    // 1. Buscar por email en el mismo evento (usando EmailIndex global)
    if (attendee.email) {
        const emailResult = await dynamodb.query({
            TableName: ATTENDEES_TABLE,
            IndexName: 'EmailIndex',
            KeyConditionExpression: 'email = :email',
            FilterExpression: 'eventId = :eventId',
            ExpressionAttributeValues: {
                ':email': attendee.email,
                ':eventId': eventId
            }
        }).promise();

        if (emailResult.Items && emailResult.Items.length > 0) return true;
    }

    // 2. Buscar por eventbriteAttendeeId (evita duplicados de la misma fuente)
    if (attendee.eventbriteAttendeeId) {
        const result = await dynamodb.query({
            TableName: ATTENDEES_TABLE,
            IndexName: 'EventIdIndex',
            KeyConditionExpression: 'eventId = :eventId',
            FilterExpression: 'eventbriteAttendeeId = :ebId',
            ExpressionAttributeValues: {
                ':eventId': eventId,
                ':ebId': attendee.eventbriteAttendeeId
            }
        }).promise();

        if (result.Items && result.Items.length > 0) return true;
    }

    // 3. Buscar por nombre completo en el mismo evento
    const result = await dynamodb.query({
        TableName: ATTENDEES_TABLE,
        IndexName: 'EventIdIndex',
        KeyConditionExpression: 'eventId = :eventId',
        FilterExpression: 'fullName = :name',
        ExpressionAttributeValues: {
            ':eventId': eventId,
            ':name': attendee.fullName
        }
    }).promise();

    return result.Items && result.Items.length > 0;
}

async function getImportStatus(eventId) {
    if (!eventId) {
        return response(400, { error: 'eventId es requerido' });
    }

    const result = await dynamodb.query({
        TableName: ATTENDEES_TABLE,
        IndexName: 'EventIdIndex',
        KeyConditionExpression: 'eventId = :eventId',
        FilterExpression: 'preregistered = :pre',
        ExpressionAttributeValues: {
            ':eventId': eventId,
            ':pre': true
        }
    }).promise();

    const items = result.Items || [];
    const checkedIn = items.filter(i => i.preregisteredStatus === 'checked_in');
    const pending = items.filter(i => i.preregisteredStatus === 'pending');

    return response(200, {
        eventId,
        total: items.length,
        checkedIn: checkedIn.length,
        pending: pending.length,
        sources: {
            meetup: items.filter(i => i.source === 'meetup').length,
            eventbrite: items.filter(i => i.source === 'eventbrite').length
        }
    });
}

async function getPreregistered(eventId) {
    if (!eventId) {
        return response(400, { error: 'eventId es requerido' });
    }

    const result = await dynamodb.query({
        TableName: ATTENDEES_TABLE,
        IndexName: 'EventIdIndex',
        KeyConditionExpression: 'eventId = :eventId',
        FilterExpression: 'preregistered = :pre',
        ExpressionAttributeValues: {
            ':eventId': eventId,
            ':pre': true
        }
    }).promise();

    return response(200, {
        eventId,
        attendees: (result.Items || []).map(item => ({
            badgeId: item.badgeId,
            fullName: item.fullName,
            email: item.email,
            company: item.company,
            role: item.role,
            source: item.source,
            status: item.preregisteredStatus,
            ticketType: item.ticketType || '',
            importedAt: item.importedAt
        }))
    });
}

async function checkinPreregistered(event) {
    const body = JSON.parse(event.body || '{}');
    const { badgeId, fullName, eventId } = body;

    if (!badgeId && !fullName) {
        return response(400, { error: 'badgeId o fullName es requerido' });
    }

    let item = null;

    if (badgeId) {
        // Buscar por badgeId directamente
        const result = await dynamodb.get({
            TableName: ATTENDEES_TABLE,
            Key: { badgeId }
        }).promise();
        item = result.Item;
    } else if (fullName && eventId) {
        // Buscar por nombre en el evento
        const result = await dynamodb.query({
            TableName: ATTENDEES_TABLE,
            IndexName: 'EventIdIndex',
            KeyConditionExpression: 'eventId = :eventId',
            FilterExpression: 'fullName = :name AND preregistered = :pre',
            ExpressionAttributeValues: {
                ':eventId': eventId,
                ':name': fullName,
                ':pre': true
            }
        }).promise();
        item = result.Items?.[0];
    }

    if (!item) {
        return response(404, { error: 'Asistente pre-registrado no encontrado' });
    }

    if (item.preregisteredStatus === 'checked_in') {
        return response(409, {
            error: 'Este asistente ya hizo check-in',
            attendee: {
                fullName: item.fullName,
                checkedInAt: item.checkedInAt
            }
        });
    }

    // Actualizar estado a checked_in
    const now = new Date().toISOString();
    await dynamodb.update({
        TableName: ATTENDEES_TABLE,
        Key: { badgeId: item.badgeId },
        UpdateExpression: 'SET preregisteredStatus = :status, checkedInAt = :now, #ts = :now',
        ExpressionAttributeNames: { '#ts': 'timestamp' },
        ExpressionAttributeValues: {
            ':status': 'checked_in',
            ':now': now
        }
    }).promise();

    return response(200, {
        success: true,
        attendee: {
            badgeId: item.badgeId,
            fullName: item.fullName,
            email: item.email,
            company: item.company,
            role: item.role,
            source: item.source,
            checkedInAt: now
        }
    });
}

// ─── UTILIDADES ───────────────────────────────────────────────────────────────

function extractMeetupEventId(url) {
    // https://www.meetup.com/grupo/events/123456789/
    const match = url.match(/meetup\.com\/[^/]+\/events\/(\d+)/);
    return match ? match[1] : null;
}

function extractMeetupGroup(url) {
    // https://www.meetup.com/grupo/events/123456789/
    const match = url.match(/meetup\.com\/([^/]+)\/events/);
    return match ? match[1] : null;
}

function extractEventbriteId(url) {
    // https://www.eventbrite.com/e/nombre-del-evento-tickets-123456789
    // https://www.eventbrite.com.mx/e/nombre-del-evento-tickets-123456789
    const match = url.match(/(\d{10,})/);
    return match ? match[1] : null;
}
