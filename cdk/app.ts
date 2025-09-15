#!/usr/bin/env node
// cdk/app.ts

import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { AntiSeattleFreezeStack } from './stack';

const app = new cdk.App();

// Local development stack
new AntiSeattleFreezeStack(app, 'AntiSeattleFreezeStackLocal', {
  environment: 'local',
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION || 'us-west-2',
  },
  tags: {
    Environment: 'local',
    Project: 'anti-seattle-freeze'
  }
});

// Production stack (for Vercel)
new AntiSeattleFreezeStack(app, 'AntiSeattleFreezeStackProd', {
  environment: 'production',
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION || 'us-west-2',
  },
  tags: {
    Environment: 'production',
    Project: 'anti-seattle-freeze'
  }
});