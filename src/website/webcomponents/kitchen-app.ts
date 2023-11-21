import {css, html, LitElement} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {OrderService} from '../services/order-service';
import {apiService} from '../services/api-service';

@customElement('kitchen-app')
class KitchenApp extends LitElement {
    @property({type: Array})
    orders: TableOrder[] = [];
    @property({type: Boolean})
    isRefreshing: boolean = false;

    connectedCallback() {
        super.connectedCallback();
        this.getEvents();
    }

    async getEvents() {
        this.isRefreshing = true;
        const events = await apiService.getEvents();

        this.isRefreshing = false;
        this.orders = OrderService.eventsToKitchenOrders(events);
    }

    getStatusIcon(status: string) {
        switch (status) {
            case 'preparing':
                return html`<span class="material-symbols-outlined gray">skillet</span>`;
            case 'ready':
                return html`<span class="material-symbols-outlined darkgreen">done</span>`;
            case 'served':
                return html`
                    <div class="countdown-container">
                        <svg class="countdown">
                            <circle cx="50%" cy="50%" r="15" /> <!-- updated radius -->
                        </svg>
                        <span class="material-symbols-outlined green">done</span>
                    </div>
                    `;
            case 'cancelled':
                return html`<span class="material-symbols-outlined orange">cancel</span>`;
            default:
                return html`<span class="material-symbols-outlined orange">help</span>`;
        }
    }

    setOrderReady(order: TableOrder) {
        this.orders = this.orders.map(o => o === order ? {...o, status: 'ready'} : o);
    }

    setOrderServed(order: TableOrder) {
        const newStatusOrder = {...order, status: 'served'};
        this.orders = this.orders.map(o => o === order ? newStatusOrder : o);

        setTimeout(() => this.orders = this.orders.filter(o => o !== newStatusOrder), 1000);
    }

    render() {
        return html`
            <h1 class="title">
                Kitchen application
                <span class="material-symbols-outlined">skillet</span>
                <span class="material-symbols-outlined ${this.isRefreshing ? 'refreshing' : 'refresh'}" @click="${this.getEvents}">refresh</span>
            </h1>
            ${this.orders?.map((order) => html`
                <section class="table-selection">
                    <p class="gray">
                        ${this.getStatusIcon(order.status)}
                        ${order.tableName + '-' + order.id}
                    </p>
                    <ul>
                        ${order.products?.map(item => html`
                            <li>${item.product.name} <span style="float:right;">${item.quantity} x</span></li>
                        `)}
                    </ul>
                    ${order.status === 'preparing'
                        ? html`<button @click="${() => this.setOrderReady(order)}"><span class="material-symbols-outlined 20">check</span></button>`
                        : order.status !== 'served'
                            ? html`<button @click="${() => this.setOrderServed(order)}">Served</button>`
                            : html`<button disabled>Served</button>`
                    }
                </section>
            `)}
        `;
    }

    static styles = css`
      @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200');

      :host {
        font-family: Arial;
        display: block;
        max-height: 100%;
        overflow: auto;
        background-color: #1c2e40;
        color: white;
      }

      .material-symbols-outlined {
        font-family: 'Material Symbols Outlined';
        font-size: 34px;
        vertical-align: bottom;
        font-weight: normal;
      }

      .title {
        text-align: center;
        font-size: 24px;
        margin: 0;
      }

      section {
        min-height: 200px;
        padding: 0 5px;
        background-color: #2c3e50;
        border-top: 1px solid gray;
        border-bottom: 1px solid gray;
        font-size: 24px;
      }

      section button {
        border: 2px solid #457;
        border-radius: 5px;
        padding: 8px;
        margin: 4px;
        background-color: #34495e;
        color: white;
      }

      section button .material-symbols-outlined {
        font-size: 20px;
      }

      section button:hover {
        background-color: #457;
        border: 2px solid transparent;
      }

      ul {
        padding: 0;
      }

      li {
        border-bottom: 1px dotted #aaa;
        list-style: none;
      }

      .white {
        color: white;
      }

      .darkgreen {
        color: limegreen;
      }

      .green {
        color: lightgreen;
      }

      .orange {
        color: gold;
      }

      .gray {
        color: gray;
      }

      @keyframes countdown {
        from {
          stroke-dashoffset: 0;
        }
        to {
          stroke-dashoffset: 106.8; /* new circumference of the circle */
        }
      }

      .countdown-container {
        display: inline-block;
        position: relative;
        width: 34px;
        height: 34px;
      }

      .countdown {
        position: absolute;
        top: 0;
        left: 0;
        width: 34px;
        height: 34px;
      }

      .countdown circle {
        fill: none;
        stroke: limegreen;
        stroke-width: 3;
        stroke-dasharray: 106.8; /* new circumference of the circle */
        stroke-dashoffset: 0;
        animation: countdown 1s linear forwards;
      }

      .countdown-container span {
        z-index: 2;
        color: limegreen;
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
      }

      .refresh {
        float: right;
        cursor: pointer;
      }

      .refreshing {
        float: right;
        color: gray;
        cursor: none;
        animation: spin 2s linear infinite;
        // If we don't set margin right, the spin will glitch-trigger a scrollbar 
        margin-right: 10px;
      }

      @keyframes spin {
        from {
          transform: rotate(0deg);
        }
        to {
          transform: rotate(360deg);
        }
      }
    `;
}