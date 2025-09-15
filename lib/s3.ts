// lib/s3.ts
import { S3Client } from '@aws-sdk/client-s3';

const client = new S3Client({
  region: process.env.AWS_REGION || 'us-west-2',
  // Let AWS SDK find credentials automatically
});

export const s3 = client;