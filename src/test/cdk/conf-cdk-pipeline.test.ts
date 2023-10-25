import {App} from "aws-cdk-lib";
import {Template} from "aws-cdk-lib/assertions";
import {ConfCdkPipeline} from "../../../lib/conf-cdk-pipeline-stack";
import {MockStack} from "./mocks/stack";


describe('Testing the pipeline stack', () => {
    let app: App;
    let mockStack: MockStack;

    let stackUnderTest: ConfCdkPipeline;
    let template: Template;

    beforeAll(() => {
        app = new App();
        mockStack = new MockStack(app);

        stackUnderTest = new ConfCdkPipeline(app, 'TestStack', {
            env: {region: 'eu-west-1', account: '531843824238'},
        });

        template = Template.fromStack(stackUnderTest)
    });
    test('Pipeline is created', () => {
        template.hasResourceProperties('AWS::CodePipeline::Pipeline', {});

        expect(stackUnderTest.subdomain).not.toContain('changeit');
        // These two subdomains are used by the host, please prevent duplicates by using your own GitHub handle.
        expect(stackUnderTest.subdomain).not.toBe('vroegop');
        // expect(stackUnderTest.subdomain).not.toBe('restaurant');
    });
});
