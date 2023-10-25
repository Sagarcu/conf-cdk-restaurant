import {CfnOutput, RemovalPolicy, Stack, StackProps} from 'aws-cdk-lib';
import {Construct} from 'constructs';
import {UserPool, UserPoolClient, UserPoolEmail} from 'aws-cdk-lib/aws-cognito';
import {Subnet} from 'aws-cdk-lib/aws-ec2';
import {CfnSubscriptionDefinition} from 'aws-cdk-lib/aws-greengrass';

export class ConfCdkRestaurantAuthenticationStack extends Stack {
    public cognitoUserPool: UserPool;
    public cognitoUserPoolClient: UserPoolClient;

    constructor(scope: Construct, id: string, props: StackProps, subdomain: String) {
        super(scope, id, props);

        this.cognitoUserPool = new UserPool(this, subdomain + 'cognitoUserPool', {
            userPoolName: subdomain + 'UserPool',
            selfSignUpEnabled: true,
            signInAliases: {
                username: true
            },
            autoVerify: {
                email: true
            },
            deletionProtection: false,
            signInCaseSensitive: false,
            email: UserPoolEmail.withCognito()
        });

        // The cognitoPoolClient is an internal api that we can access via API Gateway to use the CognitoPool
        this.cognitoUserPoolClient = new UserPoolClient(this, subdomain + 'cognitoUserPoolClient', {
            userPoolClientName: subdomain + 'UserPoolClient',
            userPool: this.cognitoUserPool,
            authFlows: {
                adminUserPassword: true,
                userPassword: true,
                custom: false,
                userSrp: false
            },
        });

        // Destroy everything on stack removal (cognito pool requires extra protection settings, see construct)
        this.cognitoUserPool.applyRemovalPolicy(RemovalPolicy.DESTROY);
        this.cognitoUserPoolClient.applyRemovalPolicy(RemovalPolicy.DESTROY);
    }
}