#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import {ConfCdkPipeline} from "../lib/conf-cdk-pipeline-stack";

const app = new cdk.App();

new ConfCdkPipeline(
    app,
    'Pipeline',
    {env: {region: 'eu-west-1', account: '531843824238'}},
);