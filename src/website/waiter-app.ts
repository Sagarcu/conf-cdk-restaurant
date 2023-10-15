import {LitElement, html, css} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {subdomain} from "../../settings";

@customElement('waiter-app')
class WaiterApp extends LitElement {
    @property({type: Array})
    tables: Table[] = [
        {
            name: 'T1',
            currentOrder: {id: '0', products: [], status: 'open'},
            previousOrders: []
        },
        {
            name: 'T2',
            currentOrder: {id: '0', products: [], status: 'open'},
            previousOrders: []
        },
        {
            name: 'T3',
            currentOrder: {id: '0', products: [], status: 'open'},
            previousOrders: []
        },
    ];
    @property({type: Array})
    products: Product[] = [
        {
            "id": "item1",
            "name": "Ramen",
            "icon": "ramen_dining",
            "price": 5.99
        },
        {
            "id": "item2",
            "name": "Tapas",
            "icon": "tapas",
            "price": 29.99
        },
        {
            "id": "item3",
            "name": "Poke Bowl Salmon",
            "icon": "rice_bowl",
            "price": 7.99
        },
        {
            "id": "item4",
            "name": "Poke Bowl Tofu",
            "icon": "rice_bowl",
            "price": 7.99
        }
    ];
    @property({type: String})
    selectedTableName: string;

    connectedCallback() {
        super.connectedCallback()

        this.getPastEvents();
    }

    getCurrentTable(): Table {
        return this.tables.find(t => t.name === this.selectedTableName);
    }

    getNextOrderId(table: Table) {
        return (table.previousOrders.length + 1).toString();
    }

    async getPastEvents() {
        const events = await fetch(`https://${subdomain}.cloud101.nl/api/restaurant`).then(response => response.json());

        events.filter((event: any) => event.eventType === 'CreatedOrder').map((orderCreatedEvent: OrderEvent) => {
            const order = {
                id: orderCreatedEvent.data.id,
                products: orderCreatedEvent.data.products,
                status: orderCreatedEvent.data.status,
                orderPlacedTimestamp: orderCreatedEvent.timestamp
            };
            this.tables.find(table => table.name === orderCreatedEvent.data.tableName).previousOrders.push(order);
        });

        this.tables.forEach(table => table.currentOrder.id = this.getNextOrderId(table));
    }

    sendOrderToAPI(order: OrderEventOrder) {
        const event: OrderEvent = {
            eventType: 'CreatedOrder',
            eventId: `${Date.now()}`, // generate a unique id for the event
            timestamp: new Date().toISOString(),
            data: order
        };

        fetch(`https://${subdomain}.cloud101.nl/api/restaurant`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({event})
        })
            .then(response => response.ok ? console.log('Successfully send to the API') : console.error(`Failed to send order with id ${order.id} to API:`, response))
            .catch(error => console.error(`Failed to send order with id ${order.id} to API:`, error));
    }

    selectTable(name: string) {
        this.selectedTableName = name;
    }

    updateOrder(product: Product, isAdding = true) {
        const currentOrder = this.getCurrentTable().currentOrder;
        let orderItem = currentOrder.products.find(item => item.product.id === product.id);

        if (orderItem) {
            orderItem.quantity += isAdding ? 1 : -1;
            // Remove the item from the order if quantity is 0 or less
            if (orderItem.quantity <= 0) {
                currentOrder.products = currentOrder.products.filter(item => item.product.id !== product.id);
            }
        } else if (isAdding) {
            // If the item is not found and isAdding is true, add a new item with quantity 1
            currentOrder.products.push({product, quantity: 1});
        }

        // Re-render lit-html
        this.requestUpdate();
    }

    confirmOrder() {
        const currentOrder = {...this.getCurrentTable().currentOrder};
        const nextOrderId = this.getNextOrderId(this.getCurrentTable());
        this.getCurrentTable().currentOrder = {id: nextOrderId, products: [], status: 'open'};
        this.getCurrentTable().previousOrders.push({
            ...currentOrder,
            status: 'pending'
        });

        const orderData = {
            ...currentOrder,
            tableName: this.selectedTableName
        }

        this.sendOrderToAPI(orderData);

        // Re-render lit-html
        this.requestUpdate();
    }

    renderTables() {
        return html`
            <div class="tables">
                ${Object.values(this.tables || {}).map(table => html`
                    <button class="table-button" @click="${() => this.selectTable(table.name)}">
                        <span class="material-symbols-outlined">table_restaurant</span>
                        ${table.name}
                    </button>`)}
            </div>`;
    }

    renderProducts() {
        return html`
            <div class="products">
                ${this.products.map(product => html`
                    <button class="product-button" @click="${() => this.updateOrder(product)}">
                        ${product.name}
                        <span class="material-symbols-outlined">${product.icon}</span>
                    </button>`)}
            </div>`;
    }

    renderOrder() {
        return !this.getCurrentTable()?.currentOrder?.products?.length
            ? html`<p>No products ordered for ${this.selectedTableName}</p>`
            : this.getCurrentTable()?.currentOrder?.products?.map(orderItem => html`
                <p>
                        <span class="material-symbols-outlined delete"
                              @click="${() => this.updateOrder(orderItem.product, false)}">delete</span>
                    ${orderItem.product.name || 'Unknown product'}
                    <span style="float:right">${orderItem.quantity} x</span>
                </p>`);
    }

    render() {
        return html`
            <h1 class="title">
                Waiter application <span class="material-symbols-outlined">liquor</span>
            </h1>
            <section id="table-selection">
                ${this.renderTables()}
            </section>
            <section id="product-selection">
                <h2>
                    ${this.selectedTableName ? `Add product for table ${this.selectedTableName}` : 'Select a table'}</h2>
                ${this.selectedTableName ? this.renderProducts() : ''}
            </section>
            <section id="table-order">
                <h2>
                    ${this.selectedTableName ? `Order ${this.getCurrentTable().currentOrder.id} for table ${this.selectedTableName}` : 'Select a table'}
                </h2>
                <div class="order">
                    ${this.selectedTableName ? this.renderOrder() : ''}
                    ${!!this.getCurrentTable()?.currentOrder?.products?.length
                        ? html`
                            <button @click="${() => this.confirmOrder()}">Confirm order</button>`
                        : ''}
                </div>
                ${this.getCurrentTable()
                    ? this.getCurrentTable()?.previousOrders.length === 0 || this.getCurrentTable()?.previousOrders.length > 1
                        ? html`
                            <footer>${this.getCurrentTable()?.previousOrders.length} previous orders</footer>`
                        : html`
                            <footer>1 previous order</footer>`
                    : ''}
            </section>`;
    }

    static styles = [css`
        :host {
            border: 1px solid black;
            display: flex;
            justify-content: space-around;
            align-items: center;
            flex-direction: column;
            background-color: #1c2e40;
            padding-bottom: 3px;
            font-family: Arial;
        }

        @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200');

        .material-symbols-outlined {
            font-family: 'Material Symbols Outlined';
            font-size: 25px;
            vertical-align: bottom;
            font-weight: normal;
        }

        .title {
            text-align: center;
            color: white;
            font-size: 20px;
            margin: 0;
        }

        h2 {
            color: white;
        }

        section {
            height: 31%;
            width: 96%;
            padding: 0 5px;
            background-color: #2c3e50;
            overflow-y: auto;
            overflow-x: hidden;
        }

        section p {
            font-size: 20px;
            color: white;
        }

        section button {
            font-size: 20px;
            border: 2px solid #457;
            border-radius: 5px;
            padding: 8px;
            margin: 4px;
            background-color: #34495e;
            color: white;
        }

        section button:hover {
            background-color: #457;
            border: 2px solid transparent;
        }

        div.tables, div.products {
            display: flex;
            justify-content: space-around;
            flex-wrap: wrap;
        }

        .table-button {
            display: flex;
            align-items: center;
            justify-content: center;
            position: relative;
            margin: 8px;
            border: 2px solid #457;
            background-color: #34495e;
            color: white;
            border-radius: 50%;
            cursor: pointer;
            text-transform: uppercase;
            width: 20%;
            aspect-ratio: 1 / 1;
        }

        .table-button:hover {
            background-color: #457;
            border: 2px solid #333;
        }

        .product-button {
            display: flex;
            align-items: center;
            justify-content: space-between;
            position: relative;
            padding: 4px;
            margin-bottom: 15px;
            background-color: #34495e;
            color: white;
            border: 2px solid #457;
            border-radius: 5px;
            cursor: pointer;
            text-transform: uppercase;
            width: 90%;
            font-size: 20px;
        }

        .product-button:hover {
            background-color: #457;
            border: 2px solid #333;
        }

        .material-symbols-outlined.delete:hover {
            cursor: pointer;
            color: red;
        }

        section#table-order {
            display: flex;
            justify-content: space-between;
            flex-direction: column;
        }

        section#table-order h2 {
            margin: 0;
        }
    `];
}
