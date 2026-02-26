const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB.DocumentClient();

const TABLE_NAME = process.env.ATTENDEES_TABLE;

exports.handler = async (event) => {
    try {
        // Obtener total de badges generados
        const result = await dynamodb.scan({
            TableName: TABLE_NAME,
            Select: 'COUNT'
        }).promise();

        // Obtener badges de la última hora
        const oneHourAgo = new Date(Date.now() - 3600000).toISOString();
        
        const recentResult = await dynamodb.scan({
            TableName: TABLE_NAME,
            FilterExpression: '#ts > :oneHourAgo',
            ExpressionAttributeNames: {
                '#ts': 'timestamp'
            },
            ExpressionAttributeValues: {
                ':oneHourAgo': oneHourAgo
            },
            Select: 'COUNT'
        }).promise();

        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({
                total: result.Count || 0,
                lastHour: recentResult.Count || 0
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
                error: 'Error al obtener estadísticas',
                details: error.message
            })
        };
    }
};
