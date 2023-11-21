import {CognitoIdentityProviderClient, ConfirmSignUpCommand, InitiateAuthCommand, SignUpCommand} from "@aws-sdk/client-cognito-identity-provider";
import {subdomain} from '../../../settings';

export class CognitoService {
    private restaurantApi = `https://${subdomain}.cloud101.nl/api`;
    private cognitoUserPoolClientId: string;
    private client: CognitoIdentityProviderClient;

    constructor() {
        this.loadAwsSettings();
        this.client = new CognitoIdentityProviderClient({region: 'eu-west-1'}); // replace 'YOUR_AWS_REGION' with your AWS region, for instance: 'us-west-1'
    }

    public async login(email: string, password: string) {
        const command = new InitiateAuthCommand({
            AuthFlow: 'USER_PASSWORD_AUTH',
            ClientId: this.cognitoUserPoolClientId,
            AuthParameters: {
                USERNAME: email,
                PASSWORD: password,
            },
        });

        try {
            const response = await this.client.send(command);
            localStorage.setItem('idToken', response.AuthenticationResult.IdToken);
            return response.AuthenticationResult;
        } catch (error) {
            throw error;
        }
    }

    public async register(email: string, password: string) {
        const command = new SignUpCommand({
            ClientId: this.cognitoUserPoolClientId,
            Username: email,
            Password: password,
            UserAttributes: [
                {
                    Name: 'email',
                    Value: email,
                },
            ],
        });

        try {
            const response = await this.client.send(command);
            return response;
        } catch (error) {
            throw error;
        }
    }

    public async verify(email: string, code: string) {
        const command = new ConfirmSignUpCommand({
            ClientId: this.cognitoUserPoolClientId,
            Username: email,
            ConfirmationCode: code,
        });

        try {
            const response = await this.client.send(command);
            return response;
        } catch (error) {
            throw error;
        }
    }

    public async getIdToken() {
        const idToken = localStorage.getItem('idToken');
        if (!idToken) {
            throw new Error('No idToken found in local storage');
        }
        return idToken;
    }

    private async loadAwsSettings() {
        this.cognitoUserPoolClientId = await this.getCognitoUserPoolId();
    }

    private async getCognitoUserPoolId() {
        const response = await fetch(`${this.restaurantApi}/settings`);
        const settings = await response.json();
        return settings.cognitoUserPoolId;
    }
}

export const cognitoService = new CognitoService();