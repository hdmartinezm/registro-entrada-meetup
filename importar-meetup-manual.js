#!/usr/bin/env node
/**
 * Script para importar asistentes de Meetup manualmente
 * Uso: node importar-meetup-manual.js
 * 
 * Instrucciones:
 * 1. Obtén el JSON del GraphQL Playground de Meetup
 * 2. Pega el resultado en la variable meetupData abajo
 * 3. Configura el eventId de tu evento activo
 * 4. Ejecuta: node importar-meetup-manual.js
 */

const API_BASE_URL = 'https://c9h8ur30w6.execute-api.us-east-1.amazonaws.com/prod';

// ─── CONFIGURACIÓN ────────────────────────────────────────────────────────────

// EventId de tu evento activo en el sistema (el que creaste en la estación de registro)
// Puedes obtenerlo con: curl https://c9h8ur30w6.execute-api.us-east-1.amazonaws.com/prod/events/active
const EVENT_ID = process.argv[2] || '';

// Datos del GraphQL Playground de Meetup
const meetupData = {"data": {"event": {"title": "🚀 Beyond Vibe Coding + Celebración de los 1000 miembros 🎉","dateTime": "2026-05-27T18:00:00-06:00","rsvps": {"edges": [{"node": {"member": {"name": "Hector Martinez ","memberPhoto": {"baseUrl": "https://secure-content.meetupstatic.com/images/classic-member/"}}}},{"node": {"member": {"name": "David Victoria","memberPhoto": {"baseUrl": "https://secure-content.meetupstatic.com/images/classic-member/"}}}},{"node": {"member": {"name": "Sebastian Marines","memberPhoto": {"baseUrl": "https://secure-content.meetupstatic.com/images/classic-member/"}}}},{"node": {"member": {"name": "Eduardo Chavez","memberPhoto": null}}},{"node": {"member": {"name": "Silvestre ","memberPhoto": null}}},{"node": {"member": {"name": "Sergio Acevedo Salas","memberPhoto": null}}},{"node": {"member": {"name": "Hector Flores","memberPhoto": {"baseUrl": "https://secure-content.meetupstatic.com/images/classic-member/"}}}},{"node": {"member": {"name": "enrique.calderon7","memberPhoto": null}}},{"node": {"member": {"name": "Efrain Mancias","memberPhoto": {"baseUrl": "https://secure-content.meetupstatic.com/images/classic-member/"}}}},{"node": {"member": {"name": "Mario Benavides","memberPhoto": {"baseUrl": "https://secure-content.meetupstatic.com/images/classic-member/"}}}},{"node": {"member": {"name": "eduardo garcia","memberPhoto": null}}},{"node": {"member": {"name": "herreracowa","memberPhoto": null}}},{"node": {"member": {"name": "Ramón Palomares ","memberPhoto": null}}},{"node": {"member": {"name": "Fernando Ramirez","memberPhoto": {"baseUrl": "https://secure-content.meetupstatic.com/images/classic-member/"}}}},{"node": {"member": {"name": "marysabelcastillog","memberPhoto": null}}},{"node": {"member": {"name": "Juan B. Martínez Ramos","memberPhoto": null}}},{"node": {"member": {"name": "Carlosdan","memberPhoto": null}}},{"node": {"member": {"name": "Luis Lepe","memberPhoto": null}}},{"node": {"member": {"name": "Mildred","memberPhoto": null}}},{"node": {"member": {"name": "Sebastian Alduncin Pisanty","memberPhoto": null}}},{"node": {"member": {"name": "Andree G","memberPhoto": {"baseUrl": "https://secure-content.meetupstatic.com/images/classic-member/"}}}},{"node": {"member": {"name": "Gustavo Barrientos","memberPhoto": null}}},{"node": {"member": {"name": "Guillermo Gil","memberPhoto": null}}},{"node": {"member": {"name": "Martin Morales Estrada","memberPhoto": null}}},{"node": {"member": {"name": "valdemar.ibarra","memberPhoto": null}}},{"node": {"member": {"name": "dantelopez305","memberPhoto": null}}},{"node": {"member": {"name": "Samuel","memberPhoto": null}}},{"node": {"member": {"name": "Magaly Gonzalez","memberPhoto": {"baseUrl": "https://secure-content.meetupstatic.com/images/classic-member/"}}}},{"node": {"member": {"name": "Héctor Iracheta","memberPhoto": null}}},{"node": {"member": {"name": "Luis Eduardo","memberPhoto": null}}},{"node": {"member": {"name": "Karla maricruz Rodriguez Villa","memberPhoto": null}}},{"node": {"member": {"name": "Sergio Acevedo","memberPhoto": null}}},{"node": {"member": {"name": "Cesar Dominguez","memberPhoto": {"baseUrl": "https://secure-content.meetupstatic.com/images/classic-member/"}}}},{"node": {"member": {"name": "Ruben Nogueira","memberPhoto": null}}},{"node": {"member": {"name": "Jose Medrano","memberPhoto": null}}},{"node": {"member": {"name": "ederOrt","memberPhoto": null}}},{"node": {"member": {"name": "Sergi-orch Vazquez Malvaez","memberPhoto": {"baseUrl": "https://secure-content.meetupstatic.com/images/classic-member/"}}}},{"node": {"member": {"name": "luisricardovalverde74","memberPhoto": null}}},{"node": {"member": {"name": "Israel Calderon de la Cruz (ical","memberPhoto": {"baseUrl": "https://secure-content.meetupstatic.com/images/classic-member/"}}}},{"node": {"member": {"name": "Alvaro Hernandez","memberPhoto": {"baseUrl": "https://secure-content.meetupstatic.com/images/classic-member/"}}}},{"node": {"member": {"name": "Alejandra Trejo","memberPhoto": null}}},{"node": {"member": {"name": "Pamela Viana","memberPhoto": null}}},{"node": {"member": {"name": "Lucía Rodríguez","memberPhoto": null}}},{"node": {"member": {"name": "paola.balam","memberPhoto": null}}},{"node": {"member": {"name": "leonardodavidalanis","memberPhoto": null}}}]}}}};

// ─── EJECUCIÓN ────────────────────────────────────────────────────────────────

async function main() {
    if (!EVENT_ID) {
        // Intentar obtener el evento activo
        console.log('🔍 Buscando evento activo...');
        try {
            const res = await fetch(`${API_BASE_URL}/events/active`);
            const data = await res.json();
            if (data.event) {
                console.log(`✅ Evento activo: "${data.event.name}" (${data.event.eventId})`);
                await importAttendees(data.event.eventId);
            } else {
                console.error('❌ No hay evento activo. Crea uno primero o pasa el eventId como argumento:');
                console.error('   node importar-meetup-manual.js <eventId>');
                process.exit(1);
            }
        } catch (error) {
            console.error('❌ Error al buscar evento activo:', error.message);
            console.error('   Pasa el eventId como argumento: node importar-meetup-manual.js <eventId>');
            process.exit(1);
        }
    } else {
        await importAttendees(EVENT_ID);
    }
}

async function importAttendees(eventId) {
    const edges = meetupData.data.event.rsvps.edges;
    const eventTitle = meetupData.data.event.title;

    console.log(`\n📋 Evento Meetup: ${eventTitle}`);
    console.log(`📅 Fecha: ${meetupData.data.event.dateTime}`);
    console.log(`👥 RSVPs: ${edges.length}`);
    console.log(`🎯 Importando al eventId: ${eventId}\n`);

    // Convertir a formato que acepta nuestra API
    const attendees = edges.map(edge => ({
        fullName: edge.node.member.name.trim(),
        email: '',
        company: '',
        jobTitle: '',
        source: 'meetup'
    }));

    // Llamar a nuestra API de importación con los datos ya procesados
    const payload = {
        eventId,
        attendees,
        source: 'meetup',
        eventTitle
    };

    try {
        const res = await fetch(`${API_BASE_URL}/import/meetup-manual`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const result = await res.json();

        if (res.ok) {
            console.log(`✅ Importación exitosa:`);
            console.log(`   Encontrados: ${result.totalFound}`);
            console.log(`   Importados: ${result.imported}`);
            console.log(`   Duplicados omitidos: ${result.skipped}`);
            if (result.attendees && result.attendees.length > 0) {
                console.log(`\n   Nuevos importados:`);
                result.attendees.forEach(a => console.log(`   - ${a.fullName}`));
            }
        } else {
            console.error(`❌ Error: ${result.error}`);
            if (result.details) console.error(`   Detalles: ${result.details}`);
        }
    } catch (error) {
        console.error('❌ Error de conexión:', error.message);
    }
}

main();
