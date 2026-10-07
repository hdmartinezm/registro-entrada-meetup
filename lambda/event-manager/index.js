const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');

const dynamodb = new AWS.DynamoDB.DocumentClient();
const ses = new AWS.SES({ region: 'us-east-1' });

const EVENTS_TABLE = process.env.EVENTS_TABLE;
const ATTENDEES_TABLE = process.env.ATTENDEES_TABLE;
const SES_FROM_EMAIL = process.env.SES_FROM_EMAIL;

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
    const pathParams = event.pathParameters || {};

    try {
        // OPTIONS — preflight CORS
        if (method === 'OPTIONS') {
            return response(200, {});
        }

        // POST /events — crear evento
        if (method === 'POST' && path === '/events') {
            return await createEvent(event);
        }

        // GET /events/active — obtener evento activo
        if (method === 'GET' && path === '/events/active') {
            return await getActiveEvent();
        }

        // PUT /events/{eventId}/end — terminar evento
        if (method === 'PUT' && path.endsWith('/end') && pathParams.eventId) {
            return await endEvent(pathParams.eventId);
        }

        // POST /events/{eventId}/send-report — enviar reporte por email
        if (method === 'POST' && path.endsWith('/send-report') && pathParams.eventId) {
            return await sendReport(pathParams.eventId, event);
        }

        // GET /events/{eventId}/report — obtener reporte de asistentes
        if (method === 'GET' && pathParams.eventId) {
            return await getEventReport(pathParams.eventId);
        }

        return response(404, { error: 'Ruta no encontrada' });

    } catch (error) {
        console.error('Error:', error);
        return response(500, { error: 'Error interno', details: error.message });
    }
};

async function createEvent(event) {
    const body = JSON.parse(event.body || '{}');
    const { name, venue, date, eventType } = body;

    if (!name || !venue || !date || !eventType) {
        return response(400, { error: 'name, venue, date y eventType son requeridos' });
    }

    // Verificar que no haya otro evento activo
    const activeResult = await dynamodb.scan({
        TableName: EVENTS_TABLE,
        FilterExpression: '#s = :active',
        ExpressionAttributeNames: { '#s': 'status' },
        ExpressionAttributeValues: { ':active': 'active' }
    }).promise();

    if (activeResult.Items && activeResult.Items.length > 0) {
        return response(409, {
            error: 'Ya existe un evento activo',
            activeEvent: activeResult.Items[0]
        });
    }

    const eventId = uuidv4();
    const now = new Date().toISOString();

    const item = {
        eventId,
        name,
        venue,
        date,
        eventType,
        status: 'active',
        createdAt: now
    };

    await dynamodb.put({
        TableName: EVENTS_TABLE,
        Item: item
    }).promise();

    return response(200, { success: true, event: item });
}

async function getActiveEvent() {
    const result = await dynamodb.scan({
        TableName: EVENTS_TABLE,
        FilterExpression: '#s = :active',
        ExpressionAttributeNames: { '#s': 'status' },
        ExpressionAttributeValues: { ':active': 'active' }
    }).promise();

    if (!result.Items || result.Items.length === 0) {
        return response(200, { event: null });
    }

    return response(200, { event: result.Items[0] });
}

async function endEvent(eventId) {
    const now = new Date().toISOString();

    await dynamodb.update({
        TableName: EVENTS_TABLE,
        Key: { eventId },
        UpdateExpression: 'SET #s = :ended, endedAt = :now',
        ExpressionAttributeNames: { '#s': 'status' },
        ExpressionAttributeValues: {
            ':ended': 'ended',
            ':now': now
        }
    }).promise();

    return response(200, { success: true, endedAt: now });
}

async function getEventReport(eventId) {
    const result = await dynamodb.query({
        TableName: ATTENDEES_TABLE,
        IndexName: 'EventIdIndex',
        KeyConditionExpression: 'eventId = :eventId',
        ExpressionAttributeValues: { ':eventId': eventId }
    }).promise();

    // Obtener info del evento
    const eventResult = await dynamodb.get({
        TableName: EVENTS_TABLE,
        Key: { eventId }
    }).promise();

    return response(200, {
        event: eventResult.Item || null,
        attendees: result.Items || [],
        count: result.Count || 0
    });
}

async function sendReport(eventId, event) {
    const body = JSON.parse(event.body || '{}');
    const { email } = body;

    if (!email) {
        return response(400, { error: 'email es requerido' });
    }

    // Obtener asistentes
    const attendeesResult = await dynamodb.query({
        TableName: ATTENDEES_TABLE,
        IndexName: 'EventIdIndex',
        KeyConditionExpression: 'eventId = :eventId',
        ExpressionAttributeValues: { ':eventId': eventId }
    }).promise();

    // Obtener info del evento
    const eventResult = await dynamodb.get({
        TableName: EVENTS_TABLE,
        Key: { eventId }
    }).promise();

    const eventData = eventResult.Item || { name: 'Evento', venue: '', date: '' };
    const attendees = attendeesResult.Items || [];

    // HTML body
    const tableRows = attendees.map(a => `
        <tr>
            <td style="padding:8px;border:1px solid #ddd;">${a.fullName || ''}</td>
            <td style="padding:8px;border:1px solid #ddd;">${a.company || ''}</td>
            <td style="padding:8px;border:1px solid #ddd;">${a.role || ''}</td>
            <td style="padding:8px;border:1px solid #ddd;">${a.email || ''}</td>
            <td style="padding:8px;border:1px solid #ddd;">${a.username ? '@' + a.username : ''}</td>
            <td style="padding:8px;border:1px solid #ddd;">${a.timestamp ? new Date(a.timestamp).toLocaleString('es-MX') : ''}</td>
        </tr>`).join('');

    const htmlBody = `
    <html><body style="font-family:Arial,sans-serif;max-width:900px;margin:0 auto;padding:20px;">
        <h1 style="color:#232f3e;">Reporte de Asistentes</h1>
        <h2>${eventData.name}</h2>
        <p><strong>Venue:</strong> ${eventData.venue} &nbsp;|&nbsp; <strong>Fecha:</strong> ${eventData.date}</p>
        <p><strong>Total de asistentes:</strong> ${attendees.length}</p>
        <p style="color:#555;">El reporte completo se adjunta en formato CSV.</p>
        <table style="width:100%;border-collapse:collapse;margin-top:20px;">
            <thead>
                <tr style="background:#232f3e;color:#fff;">
                    <th style="padding:8px;text-align:left;">Nombre</th>
                    <th style="padding:8px;text-align:left;">Empresa</th>
                    <th style="padding:8px;text-align:left;">Rol</th>
                    <th style="padding:8px;text-align:left;">Email</th>
                    <th style="padding:8px;text-align:left;">Username</th>
                    <th style="padding:8px;text-align:left;">Hora</th>
                </tr>
            </thead>
            <tbody>${tableRows}</tbody>
        </table>
        <p style="margin-top:30px;color:#666;font-size:12px;">Generado por Sistema de Registro MeetUp &mdash; AWS User Group Monterrey</p>
    </body></html>`;

    // Generar CSV
    const csvHeaders = ['Nombre', 'Empresa', 'Rol', 'Email', 'Username', 'Hora'];
    const csvRows = attendees.map(a => [
        a.fullName || '',
        a.company || '',
        a.role || '',
        a.email || '',
        a.username ? '@' + a.username : '',
        a.timestamp ? new Date(a.timestamp).toLocaleString('es-MX') : ''
    ]);
    const csvContent = [csvHeaders, ...csvRows]
        .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
        .join('\r\n');

    const csvFilename = [eventData.name, eventData.venue, eventData.date]
        .filter(Boolean)
        .map(p => p.replace(/\s+/g, '-'))
        .join('-');

    // Construir email MIME con adjunto
    const boundary = `boundary_${Date.now()}`;
    const subject = `Reporte de Asistentes — ${eventData.name} (${attendees.length} registrados)`;
    const csvBase64 = Buffer.from('\uFEFF' + csvContent, 'utf-8').toString('base64');

    const rawEmail = [
        `From: ${SES_FROM_EMAIL}`,
        `To: ${email}`,
        `Subject: =?UTF-8?B?${Buffer.from(subject).toString('base64')}?=`,
        'MIME-Version: 1.0',
        `Content-Type: multipart/mixed; boundary="${boundary}"`,
        '',
        `--${boundary}`,
        'Content-Type: text/html; charset=UTF-8',
        'Content-Transfer-Encoding: quoted-printable',
        '',
        htmlBody,
        '',
        `--${boundary}`,
        `Content-Type: text/csv; charset=UTF-8; name="asistentes-${csvFilename}.csv"`,
        'Content-Transfer-Encoding: base64',
        `Content-Disposition: attachment; filename="asistentes-${csvFilename}.csv"`,
        '',
        csvBase64,
        '',
        `--${boundary}--`
    ].join('\r\n');

    await ses.sendRawEmail({
        RawMessage: { Data: Buffer.from(rawEmail) }
    }).promise();

    return response(200, { success: true, sent: true, count: attendees.length });
}
