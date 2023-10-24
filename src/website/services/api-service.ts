import {subdomain} from '../../../settings';

export class ApiService {
    static getEvents(): Promise<OrderEvent[]> {
        return fetch(`https://${subdomain}.cloud101.nl/api/restaurant`).then(response => response.json());
    }

    static postOrderEvent(tableOrder: TableOrder): Promise<Response> {
        const event: OrderEvent = {
            eventType: 'CreatedOrder',
            eventId: `${Date.now()}`, // generate a unique id for the event
            timestamp: new Date().toISOString(),
            data: tableOrder,
        };

        return fetch(`https://${subdomain}.cloud101.nl/api/restaurant`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({event}),
        });
    }

    static async getCognitoUserPoolId() {
        const response = await fetch(`https://${subdomain}.cloud101.nl/api/settings`);
        const settings = await response.json();
        return settings.cognitoUserPoolId;
    }
}