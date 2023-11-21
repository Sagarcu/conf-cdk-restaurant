import {App, Stack} from 'aws-cdk-lib';
import {Template} from 'aws-cdk-lib/assertions';
import {ConfCdkRestaurantGlobalStack} from "../../../lib/conf-cdk-restaurant.global-stack";
import {MockStack} from "./mocks/stack";


describe('Testing the global stack', () => {
    let app: App;
    let mockStack: MockStack;

    let stackUnderTest: Stack;
    let template: Template;

    beforeAll(() => {
        app = new App();
        mockStack = new MockStack(app);

        stackUnderTest = new ConfCdkRestaurantGlobalStack(app, 'TestStack', {
            env: {region: 'us-east-1', account: '531843824238'},
        }, 'subdomain');

        template = Template.fromStack(stackUnderTest)
    });

    test('Certificate Created for cloud101.nl', () => {
        template.hasResourceProperties('AWS::CertificateManager::Certificate', {
            DomainName: 'subdomain.cloud101.nl',
        });
    });
});