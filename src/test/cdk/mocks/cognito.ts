import { UserPool, UserPoolClient } from 'aws-cdk-lib/aws-cognito';
import {Stack} from 'aws-cdk-lib';
class MockUserPool extends UserPool {
    constructor(stack: Stack) {
        super(stack, 'MockUserPool' + Math.random(), {});
    }
}

export const mockCognitoUserPool = (stack: Stack) => new MockUserPool(stack);

class MockUserPoolClient extends UserPoolClient {
    constructor(stack: Stack) {
        super(stack, 'MockUserPoolClient', {
            userPool: new MockUserPool(stack)
        });

        // Override any other methods or properties as needed for your test
    }
}
export const mockUserPoolClient = (stack: Stack) => new MockUserPoolClient(stack);