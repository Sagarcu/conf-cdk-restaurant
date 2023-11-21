// Import LitElement and html
import {css, html, LitElement} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {cognitoService} from '../services/cognito-service';

@customElement('login-app')
class LoginApp extends LitElement {
    @property({type: Boolean})
    private showVerificationCodeInput: boolean = false;

    @property({type: String})
    private name: string = '';

    @property({type: String})
    private username: string = 'randy.vroegop@luminis.eu';

    @property({type: String})
    private password: string = 'Debian@r00t!';

    @property({type: String})
    private verificationCode: string = '';

    async connectedCallback() {
        super.connectedCallback();
    }

    async login() {
        await cognitoService.login(this.username, this.password);
        this.dispatchEvent(new CustomEvent('login'));
    }

    async register() {
        cognitoService.register(this.username, this.password);
    }

    async verify() {
        cognitoService.verify(this.username, this.verificationCode);
    }

    showVerify() {
        this.showVerificationCodeInput = true;
    }

    cancelVerify() {
        this.showVerificationCodeInput = false;
    }

    render() {
        return html`
        <h1>Welcome${this.name ? `, ${this.name}` : ''}</h1>
        <div>
            <label for="username">Username:</label>
            <input 
                id="username" 
                type="text" 
                .value="${this.username}" 
                @input="${(e: InputEvent) => this.username = (e.target as HTMLInputElement).value}">
        </div>
        ${this.showVerificationCodeInput
            ? html`
                    <div>
                        <label for="verificationCode">Verification Code:</label>
                        <input 
                            id="verificationCode" 
                            type="text" 
                            .value="${this.verificationCode}"
                            @input="${(e: InputEvent) => this.verificationCode = (e.target as HTMLInputElement).value}">
                    </div>

                    <div class="buttons">
                        <button @click="${this.cancelVerify}">Cancel</button>
                        <button @click="${this.verify}">Verify</button>
                    </div>
                `
            : html`
                    <div>
                        <label for="password">Password:</label>
                        <input 
                            id="password" 
                            type="password" 
                            .value="${this.password}"
                            @input="${(e: InputEvent) => this.password = (e.target as HTMLInputElement).value}">
                    </div>
                    
                    <div class="buttons">
                        <button @click="${this.login}">Login</button>
                        <button @click="${this.register}">Register</button>
                        <button @click="${this.showVerify}">I have a verification code</button>
                    </div>
                `}
    `;
    }


    static styles = css`
      :host {
        display: flex;
        flex-direction: column;
        height: 100%;
        padding: 20px;
        background-color: #2c3e50;
        color: white;
        border-radius: 10px;
        margin: 0 auto;
        font-family: Arial;
        font-size: 20px;
      }

      div {
        width: 100%;
        padding: 10px 0;
      }

      .buttons {
        margin-top: 30px;
      }

      label, input, button {
        width: 100%;
        padding: 10px;
        box-sizing: border-box;
        border: none;
        border-radius: 5px;
        font-size: 20px;
      }

      input, button {
        background-color: #34495e;
        color: white;
      }

      button {
        cursor: pointer;
        margin: 10px 0;
        border: 2px solid #457;
      }

      button:hover {
        background-color: #457;
        border: 2px solid transparent;
      }

      button:disabled {
        background-color: #404d62;
      }
    `;
}
