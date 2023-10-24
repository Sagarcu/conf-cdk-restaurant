// Import LitElement and html
import {LitElement, html, css} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {ApiService} from '../services/api-service';

@customElement('login-app')
class LoginApp extends LitElement {
    @property({ type: Boolean })
    private showVerificationCodeInput: boolean = false;

    @property({ type: String })
    private cognitoUserPoolId: string;

    async connectedCallback() {
        super.connectedCallback();
        this.cognitoUserPoolId = await ApiService.getCognitoUserPoolId();
        console.log(this.cognitoUserPoolId);
    }

    login() {
        console.log('Login method called');
    }

    register() {
        console.log('Register method called');
    }

    verify() {
        console.log('Verify method called');
    }

    showVerify() {
        this.showVerificationCodeInput = true;
    }

    cancelVerify() {
        this.showVerificationCodeInput = false;
    }

    render() {
        return html`
            <div>
                <label for="email">Email:</label>
                <input id="email" type="email">
            </div>
            ${this.showVerificationCodeInput
                    ? html`
                        <div>
                            <label for="verificationCode">Verification Code:</label>
                            <input id="verificationCode" type="text">
                        </div>

                        <div class="buttons">
                            <button @click="${this.cancelVerify}">Cancel</button>
                            <button @click="${this.verify}">Verify</button>
                        </div>
                    `
                    : html`
                        <div>
                            <label for="password">Password:</label>
                            <input id="password" type="password">
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
    `;
}
