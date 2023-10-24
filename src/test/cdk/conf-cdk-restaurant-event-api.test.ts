import {App, Stack} from 'aws-cdk-lib';
import {Template} from 'aws-cdk-lib/assertions';
import {MockStack} from "./mocks/stack";
import {mockEnv} from "./mocks/env";
import {ConfCdkRestaurantEventApiStack} from "../../../lib/conf-cdk-restaurant-event-api-stack";
import {UserPool, UserPoolClient} from 'aws-cdk-lib/aws-cognito';
import {mockCognitoUserPool, mockUserPoolClient} from './mocks/cognito';

describe('Testing the ConfCdkRestaurantEventApiStack', () => {
    let app: App;
    let mockStack: MockStack;

    let stackUnderTest: Stack;
    let template: Template;

    beforeAll(() => {
        app = new App();
        mockStack = new MockStack(app);

        stackUnderTest = new ConfCdkRestaurantEventApiStack(app, 'TestStack', {
            cognitoUserPool: mockCognitoUserPool(mockStack),
            cognitoUserPoolClient: mockUserPoolClient(mockStack),
            env: mockEnv
        }, 'subdomain');

        template = Template.fromStack(stackUnderTest);
    });

    // Test DynamoDB Table
    test('DynamoDB Table is created', () => {
        template.resourceCountIs('AWS::DynamoDB::Table', 1);
        template.hasResourceProperties('AWS::DynamoDB::Table', {
            TableName: 'subdomainEventDatabase',
            KeySchema: [
                { AttributeName: 'eventId', KeyType: 'HASH' },
                { AttributeName: 'timestamp', KeyType: 'RANGE' }
            ],
            StreamSpecification: {
                StreamViewType: "NEW_IMAGE"
            },
            BillingMode: "PAY_PER_REQUEST"
        });
    });

    // Test Lambda Function
    test('Lambda function is created', () => {
        template.resourceCountIs('AWS::Lambda::Function', 1);
        template.hasResourceProperties('AWS::Lambda::Function', {
            FunctionName: 'subdomainEventLambda',
            Handler: 'index.handler',
            Runtime: 'nodejs18.x',
        });
    });

    // Test API Gateway
    test('Lambda API Gateway is created', () => {
        template.resourceCountIs('AWS::ApiGateway::RestApi', 1);
    });

    // Test ACM Certificate
    test('ACM Certificate is created', () => {
        template.resourceCountIs('AWS::CertificateManager::Certificate', 1);
        template.hasResourceProperties('AWS::CertificateManager::Certificate', {
            DomainName: 'subdomain.cloud101.nl',
        });
    });

});
