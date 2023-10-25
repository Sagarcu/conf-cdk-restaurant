import {RemovalPolicy, Stack, StackProps} from 'aws-cdk-lib';
import {Construct} from 'constructs';
import {CognitoUserPoolsAuthorizer, Cors, LambdaRestApi} from "aws-cdk-lib/aws-apigateway";
import {Code, Function, Runtime} from "aws-cdk-lib/aws-lambda";
import {AttributeType, BillingMode, StreamViewType, Table} from "aws-cdk-lib/aws-dynamodb";
import {Certificate, CertificateValidation} from "aws-cdk-lib/aws-certificatemanager";
import {HostedZone} from "aws-cdk-lib/aws-route53";
import {UserPool, UserPoolClient} from 'aws-cdk-lib/aws-cognito';

interface IConfCdkRestaurantEventApiStackProps extends StackProps {
    cognitoUserPool: UserPool;
    cognitoUserPoolClient: UserPoolClient;
}

export class ConfCdkRestaurantEventApiStack extends Stack {
    private eventDatabase: Table;
    private eventLambda: Function;
    private settingsLambda: Function;
    public eventLambdaApi: LambdaRestApi;
    public settingsLambdaApi: LambdaRestApi;
    private apiCertificate: Certificate;
    private cognitoAuthorizer: CognitoUserPoolsAuthorizer;

    constructor(scope: Construct, id: string, props: IConfCdkRestaurantEventApiStackProps, subdomain: string) {
        super(scope, id, props);

        this.cognitoAuthorizer = new CognitoUserPoolsAuthorizer(this, 'dartsBackendCommandsCognitoUserPoolAuthorizer', {
            cognitoUserPools: [props.cognitoUserPool],
            authorizerName: 'dartsBackendCommandsCognitoUserPoolAuthorizer',
        });

        this.eventDatabase = new Table(this, subdomain + 'EventDatabase', {
            tableName: subdomain + 'EventDatabase',
            partitionKey: {
                name: 'eventId',
                type: AttributeType.STRING,
            },
            sortKey: {
                name: 'timestamp',
                type: AttributeType.STRING,
            },
            billingMode: BillingMode.PAY_PER_REQUEST,
            deletionProtection: false,
            stream: StreamViewType.NEW_IMAGE,
        });

        this.eventLambda = new Function(this, subdomain + 'EventLambda', {
            functionName: subdomain + 'EventLambda',
            description: `Receives events from the API Gateway and stores in DynamodB. Deployed at ${new Date().toISOString()}`,
            code: Code.fromAsset(`src/lambda/eventLambda`),
            runtime: Runtime.NODEJS_18_X,
            handler: 'index.handler',
            environment: {
                EVENT_SOURCE_TABLE_NAME: this.eventDatabase.tableName,
                COGNITO_USER_POOL_ID: props.cognitoUserPool.userPoolId,
            },
        });

        this.eventDatabase.grantReadWriteData(this.eventLambda);

        const hostedZone = HostedZone.fromLookup(this, 'dartsFrontendHostedZone', {
            domainName: 'cloud101.nl',
        });

        this.apiCertificate = new Certificate(this, subdomain + 'EventCertificate', {
            domainName: subdomain + '.cloud101.nl',
            certificateName: subdomain + 'EventCertificate',
            validation: CertificateValidation.fromDns(hostedZone),
        });

        this.eventLambdaApi = new LambdaRestApi(this, subdomain + 'EventLambdaApi', {
            handler: this.eventLambda,
            proxy: true,
            domainName: {
                domainName: subdomain + '.cloud101.nl',
                certificate: this.apiCertificate,
            },
            defaultCorsPreflightOptions: {
                allowOrigins: Cors.ALL_ORIGINS,
                allowMethods: Cors.ALL_METHODS,
                allowHeaders: ['*'],
                allowCredentials: true,
            },
            defaultMethodOptions: {
                authorizer: this.cognitoAuthorizer,
                authorizationType: this.cognitoAuthorizer.authorizationType,
            },
        });

        this.settingsLambda = new Function(this, subdomain + 'SettingsLambda', {
            functionName: subdomain + 'SettingsLambda',
            description: `Returns the frontend settings, for now just the UserPoolClientId. Deployed at ${new Date().toISOString()}`,
            runtime: Runtime.NODEJS_18_X,
            handler: 'index.handler',
            code: Code.fromAsset(`src/lambda/settingsLambda`),
            environment: {
                COGNITO_USER_POOL_ID: props.cognitoUserPoolClient.userPoolClientId,
            },
        });

        this.settingsLambdaApi = new LambdaRestApi(this, subdomain + 'SettingsApi', {
            handler: this.settingsLambda,
            proxy: true,
            defaultCorsPreflightOptions: {
                allowOrigins: Cors.ALL_ORIGINS,
                allowMethods: Cors.ALL_METHODS,
                allowHeaders: ['*'],
                allowCredentials: true,
            },
        });

        this.cognitoAuthorizer.applyRemovalPolicy(RemovalPolicy.DESTROY);
        this.eventDatabase.applyRemovalPolicy(RemovalPolicy.DESTROY);
        this.eventLambda.applyRemovalPolicy(RemovalPolicy.DESTROY);
        this.settingsLambda.applyRemovalPolicy(RemovalPolicy.DESTROY);
        this.settingsLambdaApi.applyRemovalPolicy(RemovalPolicy.DESTROY);
        this.eventLambdaApi.applyRemovalPolicy(RemovalPolicy.DESTROY);
        this.apiCertificate.applyRemovalPolicy(RemovalPolicy.DESTROY);
    }
}
