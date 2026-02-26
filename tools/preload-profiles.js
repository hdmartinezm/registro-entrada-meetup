const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');

const dynamodb = new AWS.DynamoDB.DocumentClient({ region: 'us-east-1' });
const TABLE_NAME = 'registro-meetup-attendees';

// Perfiles conocidos para pre-cargar
const knownProfiles = [
    {
        username: 'hectormtz',
        fullName: 'Hector David Martinez Montilla',
        email: 'hector.martinez.telecom@gmail.com',
        company: 'Escala 24x7',
        role: 'Product Development Manager'
    },
    // Agregar más perfiles aquí
];

async function preloadProfiles() {
    console.log('🔄 Pre-cargando perfiles conocidos...\n');

    for (const profile of knownProfiles) {
        try {
            const item = {
                badgeId: `preload-${uuidv4()}`,
                username: profile.username,
                fullName: profile.fullName,
                email: profile.email,
                company: profile.company,
                role: profile.role,
                bio: `AWS Builder Community Member - @${profile.username}`,
                timestamp: new Date().toISOString(),
                isPreloaded: true
            };

            await dynamodb.put({
                TableName: TABLE_NAME,
                Item: item
            }).promise();

            console.log(`✅ ${profile.fullName} (@${profile.username})`);
        } catch (error) {
            console.error(`❌ Error con ${profile.username}:`, error.message);
        }
    }

    console.log('\n🎉 Pre-carga completada!');
}

preloadProfiles().catch(console.error);
