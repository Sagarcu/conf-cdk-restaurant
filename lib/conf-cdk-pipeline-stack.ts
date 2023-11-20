import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { CodePipeline, CodePipelineSource, ShellStep } from 'aws-cdk-lib/pipelines';
import {ConfCdkRestaurantFrontendStack} from "./conf-cdk-restaurant-frontend-stack";
import {ConfCdkRestaurantGlobalStack} from "./conf-cdk-restaurant.global-stack";
import {ConfCdkRestaurantEventApiStack} from "./conf-cdk-restaurant-event-api-stack";
import {GitHubHandle, GitHubRepo, subdomain} from '../settings';
import {ConfCdkRestaurantAuthenticationStack} from './conf-cdk-restaurant-authentication-stack';

export class ConfCdkPipeline extends cdk.Stack {

    constructor(scope: Construct, id: string, props: cdk.StackProps) {
        super(scope, subdomain + id, props);

        const pipeline = new CodePipeline(this, subdomain + '-ConfCdkPipeline', {
            pipelineName: subdomain + '-ConfCdkPipeline',
            synth: new ShellStep('Synth', {
                input: CodePipelineSource.gitHub(`${GitHubHandle}/${GitHubRepo}`, 'main'),
                // Build before testing because the test checks if the built files can be deployed too
                commands: ['npm ci', 'npm run build', 'npm run test', 'npx cdk synth']
            })
        });

        pipeline.addStage(new ConfCdkPipelineStage(this, subdomain + '-deployConfCdkStacks', props));
    }
}

export class ConfCdkPipelineStage extends cdk.Stage {

    constructor(scope: Construct, id: string, props: cdk.StageProps) {
        super(scope, id, props);

        const confCdkRestaurantGlobalStack = new ConfCdkRestaurantGlobalStack(this, subdomain + '-confCdkRestaurantGlobalStack', {
            ...props,
            env: {
                ...props.env,
                region: 'us-east-1'
            },
        }, subdomain);

        const confCdkRestaurantAuthenticationStack = new ConfCdkRestaurantAuthenticationStack(this, subdomain + '-confCdkRestaurantAuthenticationStack', props, subdomain);

        const confCdkRestaurantEventApiStack = new ConfCdkRestaurantEventApiStack(this, subdomain + '-confCdkRestaurantEventApiStack', {
            ...props,
            cognitoUserPool: confCdkRestaurantAuthenticationStack.cognitoUserPool,
            cognitoUserPoolClient: confCdkRestaurantAuthenticationStack.cognitoUserPoolClient,
        }, subdomain);

        const confCdkRestaurantFrontendStack = new ConfCdkRestaurantFrontendStack(this, subdomain + '-confCdkRestaurantFrontendStack', {
            ...props,
            eventApi: confCdkRestaurantEventApiStack.eventLambdaApi,
            confCdkRestaurantDistributionCertificate: confCdkRestaurantGlobalStack.confCdkRestaurantDistributionCertificate,
            crossRegionReferences: true,
        }, subdomain);
    }
}