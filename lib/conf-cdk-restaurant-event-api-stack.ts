import {RemovalPolicy, Stack, StackProps} from 'aws-cdk-lib';
import {Construct} from 'constructs';
import {CognitoUserPoolsAuthorizer, Cors, EndpointType, LambdaRestApi} from "aws-cdk-lib/aws-apigateway";
import {Code, Function, Runtime} from "aws-cdk-lib/aws-lambda";
import {AttributeType, BillingMode, StreamViewType, Table} from "aws-cdk-lib/aws-dynamodb";
import {Certificate, CertificateValidation} from "aws-cdk-lib/aws-certificatemanager";
import {HostedZone} from "aws-cdk-lib/aws-route53";
import {UserPool, UserPoolClient} from 'aws-cdk-lib/aws-cognito';
import {subdomain} from '../settings';

interface IConfCdkRestaurantEventApiStackProps extends StackProps {
    cognitoUserPool: UserPool;
    cognitoUserPoolClient: UserPoolClient;
}

export class ConfCdkRestaurantEventApiStack extends Stack {
    private eventDatabase: Table;
    private eventLambda: Function;
    public eventLambdaApi: LambdaRestApi;
    private apiCertificate: Certificate;
    private cognitoAuthorizer: CognitoUserPoolsAuthorizer;
    constructor(scope: Construct, id: string, props: IConfCdkRestaurantEventApiStackProps) {
        super(scope, id, props);

        this.cognitoAuthorizer = new CognitoUserPoolsAuthorizer(this, 'dartsBackendCommandsCognitoUserPoolAuthorizer', {
            cognitoUserPools: [ props.cognitoUserPool ],
            authorizerName: 'dartsBackendCommandsCognitoUserPoolAuthorizer'
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
            }
        });

        this.eventDatabase.grantReadWriteData(this.eventLambda);

        const hostedZone = HostedZone.fromLookup(this, 'dartsFrontendHostedZone', {
            domainName: 'cloud101.nl'
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
                endpointType: EndpointType.REGIONAL,
                certificate: this.apiCertificate
            },
            defaultCorsPreflightOptions: {
                allowOrigins: Cors.ALL_ORIGINS, // Add other allowed origins if needed
                allowMethods: Cors.ALL_METHODS, // Add other allowed methods if needed
                allowHeaders: [ '*' ], // Add other allowed headers if needed
                allowCredentials: true
            },
            defaultMethodOptions: {
                authorizer: this.cognitoAuthorizer,
                authorizationType: this.cognitoAuthorizer.authorizationType
            }
        });

        this.cognitoAuthorizer.applyRemovalPolicy(RemovalPolicy.DESTROY);
        this.eventDatabase.applyRemovalPolicy(RemovalPolicy.DESTROY);
        this.eventLambda.applyRemovalPolicy(RemovalPolicy.DESTROY);
        this.apiCertificate.applyRemovalPolicy(RemovalPolicy.DESTROY);
        this.eventLambdaApi.applyRemovalPolicy(RemovalPolicy.DESTROY);
    }
}
