const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB.DocumentClient();

const TABLE_NAME = process.env.ATTENDEES_TABLE;

exports.handler = async (event) => {
    try {
        const body = JSON.parse(event.body);
        const { username } = body;
        
        if (!username) {
            return {
                statusCode: 400,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                body: JSON.stringify({ error: 'username es requerido' })
            };
        }

        // Buscar en DynamoDB si ya existe un registro previo
        const result = await dynamodb.query({
            TableName: TABLE_NAME,
            IndexName: 'UsernameIndex',
            KeyConditionExpression: 'username = :username',
            ExpressionAttributeValues: {
                ':username': username
            },
            Limit: 1,
            ScanIndexForward: false // Más reciente primero
        }).promise();

        if (result.Items && result.Items.length > 0) {
            const profile = result.Items[0];
            return {
                statusCode: 200,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                body: JSON.stringify({
                    found: true,
                    username: profile.username,
                    fullName: profile.fullName,
                    email: profile.email,
                    company: profile.company,
                    role: profile.role
                })
            };
        }

        // No se encontró, retornar datos vacíos
        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({
                found: false,
                username: username,
                fullName: '',
                email: '',
                company: '',
                role: ''
            })
        };

    } catch (error) {
        console.error('Error:', error);

        return {
            statusCode: 500,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({ 
                error: 'Error al buscar perfil',
                details: error.message 
            })
        };
    }
};
