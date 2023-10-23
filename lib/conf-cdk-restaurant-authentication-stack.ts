import { RemovalPolicy, Stack, StackProps } from 'aws-cdk-lib';
import {Construct} from 'constructs';
import { UserPool, UserPoolClient } from 'aws-cdk-lib/aws-cognito';

export class ConfCdkRestaurantAuthenticationStack extends Stack {

    public cognitoUserPool: UserPool;
    public cognitoUserPoolClient: UserPoolClient;
    constructor(scope: Construct, id: string, props: StackProps, subdomain: string) {
        super(scope, id, props);

        // Make sure the ID of the services is prepended by your subdomain to prevent conflicts

        this.cognitoUserPool.applyRemovalPolicy(RemovalPolicy.DESTROY);
        this.cognitoUserPoolClient.applyRemovalPolicy(RemovalPolicy.DESTROY);
    }
}
