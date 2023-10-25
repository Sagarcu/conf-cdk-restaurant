export class OrderService {
    public static eventsToKitchenOrders(events: OrderEvent[]) {
        const orders = events.filter((event: any) => event.eventType === 'CreatedOrder').map((orderCreatedEvent: OrderEvent) => {
            const order = {
                id: orderCreatedEvent.data.id,
                products: orderCreatedEvent.data.products,
                status: orderCreatedEvent.data.status === 'open' ? 'preparing' : orderCreatedEvent.data.status,
                orderPlacedTimestamp: orderCreatedEvent.timestamp,
                tableName: orderCreatedEvent.data.tableName,
            };
            return order;
        });

        return orders;
    }

    public static addOrRemoveProduct(currentOrder: Order, product: Product, isAdding: boolean): Order {
        const orderAlreadyContainsProduct = !!currentOrder.products.find(item => item.product.id === product.id);

        if (orderAlreadyContainsProduct) {
            return {
                ...currentOrder,
                products: currentOrder.products.map(item => item.product.id === product.id ? {...item, quantity: item.quantity + (isAdding ? 1 : -1)} : item),
            }
        } else if (isAdding) {
            return {
                ...currentOrder,
                products: [...currentOrder.products, {product, quantity: 1}],
            }
        }
        return {...currentOrder};
    }
}