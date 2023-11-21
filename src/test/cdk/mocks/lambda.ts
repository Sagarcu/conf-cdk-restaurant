import * as lambda from 'aws-cdk-lib/aws-lambda'
import {Construct} from "constructs";

export const mockLambda = (scope: Construct, id: string = 'MockFunction') => new lambda.Function(scope, id, {
    runtime: lambda.Runtime.NODEJS_18_X,
    handler: 'handler.handler',
    code: lambda.Code.fromInline('exports.handler = function(event, ctx, cb) { return cb(null, "hi"); }'),
});