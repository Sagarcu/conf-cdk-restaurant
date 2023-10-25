import {OrderService} from '../../website/services/order-service';

describe('OrderService', () => {
    describe('eventsToKitchenOrders', () => {
        it('should filter and transform events to kitchen orders', () => {
            const events: OrderEvent[] = [
                {
                    eventId: '123',
                    eventType: 'CreatedOrder',
                    data: {
                        id: '1',
                        products: [],
                        status: 'open',
                        tableName: 'A1',
                    },
                    timestamp: '2023-10-16T12:00:00Z',
                },
            ];

            const result = OrderService.eventsToKitchenOrders(events);

            expect(result).toEqual([{
                id: '1',
                products: [],
                status: 'preparing',
                orderPlacedTimestamp: '2023-10-16T12:00:00Z',
                tableName: 'A1',
            }]);
        });
    });

    describe('addOrRemoveProduct', () => {
        it('should add product if not already in order and isAdding is true', () => {
            const currentOrder: Order = {
                id: '1',
                products: [],
                status: 'preparing',
            };
            const product: Product = {
                "id": "item1",
                "name": "Ramen",
                "icon": "ramen_dining",
                "price": 5.99,
            };
            const result = OrderService.addOrRemoveProduct(currentOrder, product, true);

            expect(result.products).toEqual([{product, quantity: 1}]);
        });

        it('should increase product quantity if already in order and isAdding is true', () => {
            const product: Product = {
                "id": "item1",
                "name": "Ramen",
                "icon": "ramen_dining",
                "price": 5.99,
            };
            const currentOrder: Order = {
                id: '1',
                products: [{product, quantity: 1}],
                status: 'preparing',
            };
            const result = OrderService.addOrRemoveProduct(currentOrder, product, true);

            expect(result.products).toEqual([{product, quantity: 2}]);
        });

        it('should decrease product quantity if already in order and isAdding is false', () => {
            const product: Product = {
                "id": "item1",
                "name": "Ramen",
                "icon": "ramen_dining",
                "price": 5.99,
            };
            const currentOrder: Order = {
                id: '1',
                products: [{product, quantity: 2}],
                status: 'preparing',
            };
            const result = OrderService.addOrRemoveProduct(currentOrder, product, false);

            expect(result.products).toEqual([{product, quantity: 1}]);
        });

        it('should not modify the order if product not present and isAdding is false', () => {
            const currentOrder: Order = {
                id: '1',
                products: [],
                status: 'preparing',
            };
            const product: Product = {
                "id": "item1",
                "name": "Ramen",
                "icon": "ramen_dining",
                "price": 5.99,
            };
            const result = OrderService.addOrRemoveProduct(currentOrder, product, false);

            expect(result).toEqual(currentOrder);
        });
    });
});
