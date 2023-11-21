import {css, html, LitElement} from 'lit';
import {customElement} from 'lit/decorators.js';

@customElement('restaurant-wrapper')
class RestaurantWrapper extends LitElement {
    private loggedIn = false;

    private async loadComponent(componentName: string) {
        switch (componentName) {
            case 'kitchen-app':
                await import('./webcomponents/kitchen-app');
                break;
            case 'waiter-app':
                await import('./webcomponents/waiter-app');
                break;
            case 'login-app':
                await import('./webcomponents/login-app');
                break;
        }
    }

    private handleLogin() {
        this.loggedIn = true;
        this.requestUpdate();
    }

    render() {
        if (!this.loggedIn) {
            this.loadComponent('login-app');
        } else {
            this.loadComponent('kitchen-app');
            this.loadComponent('waiter-app');
        }

        return html`
            <div class="phone">
                <div class="screen">
                    ${this.loggedIn
                            ? html`<waiter-app></waiter-app>`
                            : html`<login-app name="waiter" @login="${this.handleLogin}"></login-app>`
                    }
                </div>
            </div>
            <div class="phone">
                <div class="screen">
                    ${this.loggedIn
                            ? html`<kitchen-app></kitchen-app>`
                            : html`<login-app name="cook" @login="${this.handleLogin}"></login-app>`
                    }
                </div>
            </div>
        `;
    }

    static styles = css`
      :host {
        height: 99vh;
        width: 99vw;
        display: flex;
        align-items: center;
        justify-content: space-evenly;
      }

      counter-app, kitchen-app, waiter-app {
        height: 100%;
      }

      .phone {
        width: 40vw;
        max-width: 500px;
        height: 90vh;
        border-radius: 36px;
        padding: 30px 20px 20px 20px;
        box-shadow: 0 0 30px black;
        margin: 20px;
        background: #222;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        position: relative;
      }

      .screen {
        width: 100%;
        height: 100%;
        background: #fff;
        border-radius: 10px;
        overflow: hidden;
      }
    `;
}