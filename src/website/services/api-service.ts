import {subdomain} from '../../../settings';
import {cognitoService} from './cognito-service';

class ApiService {

    private restaurantApi = `https://${subdomain}.cloud101.nl/api`;


    public async getEvents(): Promise<OrderEvent[]> {
        return fetch(`${this.restaurantApi}/restaurant`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${await cognitoService.getIdToken()}`,
            },
        }).then(response => response.json());
    }

    public async postOrderEvent(tableOrder: TableOrder): Promise<Response> {
        const event: OrderEvent = {
            eventType: 'CreatedOrder',
            eventId: `${Date.now()}`, // generate a unique id for the event
            timestamp: new Date().toISOString(),
            data: tableOrder,
        };

        return fetch(`${this.restaurantApi}/restaurant`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${await cognitoService.getIdToken()}`,
            },
            body: JSON.stringify({event}),
        });
    }
}

export const apiService = new ApiService();