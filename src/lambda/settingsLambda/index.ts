import {APIGatewayEvent} from 'aws-lambda';

export class RestaurantEventHandler {
    async handler(request: APIGatewayEvent) {
        const headers = {
            "Access-Control-Allow-Origin": "*", // Or specify the desired origin
            "Access-Control-Allow-Methods": "GET", // Or any other methods you want to allow
            "Access-Control-Allow-Headers": "Content-Type, Authorization", // Specify desired headers
            'Content-Type': 'application/json'
        };

        try {
            if (request.path === '/api/settings' && request.httpMethod === "GET") {
                return {
                    statusCode: 200,
                    body: JSON.stringify({ cognitoUserPoolId: process.env.COGNITO_USER_POOL_ID }),
                    headers
                };
            }
        } catch (err: any) {
            return {
                statusCode: 400,
                body: JSON.stringify(err),
                headers
            };
        }

        return {
            statusCode: 404,
            body: JSON.stringify({ message: 'Path not found.' }),
            headers
        };
    }
}

export const handler = (request: APIGatewayEvent) => {
    const eventHandler = new RestaurantEventHandler();
    return eventHandler.handler(request);
};