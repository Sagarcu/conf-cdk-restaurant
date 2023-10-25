import {RestaurantEventHandler} from '../../lambda/eventLambda/index'; // Update with the path to your file
import {APIGatewayEvent} from 'aws-lambda';
import {baseAPIGatewayEventMock} from './mocks/APIGatewayEvent'

describe('RestaurantEventHandler', () => {
    let mockDbOps: any;

    beforeEach(() => {
        mockDbOps = {
            putItem: jest.fn(),
            scanItems: jest.fn(),
        };
    });

    it('should handle POST request', async () => {
        const event: APIGatewayEvent = {
            ...baseAPIGatewayEventMock,
            httpMethod: 'POST',
            body: JSON.stringify({event: {eventType: 'test', eventId: '1234', timestamp: "2023-10-11T14:24:20.373Z"}}),
            headers: {},
            path: '/api/restaurant',
        };

        const handler = new RestaurantEventHandler(mockDbOps);
        const response = await handler.handler(event);

        expect(response.statusCode).toBe(200);
        expect(mockDbOps.putItem).toHaveBeenCalledWith({eventType: 'test', eventId: '1234', timestamp: "2023-10-11T14:24:20.373Z"});
    });

    it('should handle GET request', async () => {
        const event: APIGatewayEvent = {
            ...baseAPIGatewayEventMock,
            httpMethod: 'GET',
            headers: {},
            path: '/api/restaurant',
        };
        mockDbOps.scanItems.mockResolvedValueOnce([]);

        const handler = new RestaurantEventHandler(mockDbOps);
        const response = await handler.handler(event);

        expect(response.statusCode).toBe(200);
        expect(mockDbOps.scanItems).toHaveBeenCalled();
    });

    it('should return error for unsupported HTTP method', async () => {
        const event: APIGatewayEvent = {
            ...baseAPIGatewayEventMock,
            httpMethod: 'DELETE',
            headers: {},
            path: '/api/restaurant',
        };

        const handler = new RestaurantEventHandler(mockDbOps);
        const response = await handler.handler(event);

        expect(response.statusCode).toBe(404);
    });

    it('should return error for POST without body', async () => {
        const event: APIGatewayEvent = {
            ...baseAPIGatewayEventMock,
            httpMethod: 'POST',
            headers: {},
            path: '/api/restaurant',
        };

        const handler = new RestaurantEventHandler(mockDbOps);
        const response = await handler.handler(event);

        expect(response.statusCode).toBe(400);
    });
});
