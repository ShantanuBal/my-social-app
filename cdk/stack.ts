// cdk/stack.ts

import * as cdk from 'aws-cdk-lib';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';

interface AntiSeattleFreezeStackProps extends cdk.StackProps {
  environment: 'local' | 'production';
}

export class AntiSeattleFreezeStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: AntiSeattleFreezeStackProps) {
    super(scope, id, props);

    const { environment } = props;

    // S3 Bucket for profile pictures
    const profilePicturesBucket = new s3.Bucket(this, `ProfilePicturesBucket-${environment}`, {
      bucketName: `seattle-anti-freeze-profile-pictures-${environment}`,
      publicReadAccess: false, // Disabled public access
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL, // Block all public access
      cors: [
        {
          allowedMethods: [
            s3.HttpMethods.GET,
            s3.HttpMethods.PUT,
            s3.HttpMethods.POST,
            s3.HttpMethods.DELETE,
          ],
          allowedOrigins: ['*'], // In production, you might want to restrict this to your domain
          allowedHeaders: ['*'],
          exposedHeaders: ['ETag'],
        },
      ],
      lifecycleRules: [
        {
          id: 'DeleteIncompleteMultipartUploads',
          abortIncompleteMultipartUploadAfter: cdk.Duration.days(1),
        },
        {
          id: 'DeleteOldProfilePictures',
          prefix: 'profile-pictures/',
          noncurrentVersionExpiration: cdk.Duration.days(30),
        },
      ],
      versioned: false, // Profile pictures don't need versioning
      removalPolicy: environment === 'local' ? cdk.RemovalPolicy.DESTROY : cdk.RemovalPolicy.RETAIN,
      autoDeleteObjects: environment === 'local', // Only auto-delete in local environment
    });

    // S3 Bucket for website static files (team images, logos, banners, etc.)
    const staticFilesBucket = new s3.Bucket(this, `StaticFilesBucket-${environment}`, {
      bucketName: `seattle-anti-freeze-static-files-${environment}`,
      publicReadAccess: false, // Keep private, serve via signed URLs
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      cors: [
        {
          allowedMethods: [
            s3.HttpMethods.GET,
            s3.HttpMethods.PUT,
            s3.HttpMethods.POST,
          ],
          allowedOrigins: ['*'], // In production, you might want to restrict this to your domain
          allowedHeaders: ['*'],
          exposedHeaders: ['ETag'],
        },
      ],
      lifecycleRules: [
        {
          id: 'DeleteIncompleteMultipartUploads',
          abortIncompleteMultipartUploadAfter: cdk.Duration.days(1),
        },
      ],
      versioned: false,
      removalPolicy: environment === 'local' ? cdk.RemovalPolicy.DESTROY : cdk.RemovalPolicy.RETAIN,
      autoDeleteObjects: environment === 'local',
    });

    // Events table
    const eventsTable = new dynamodb.Table(this, `EventsTable-${environment}`, {
      tableName: `events-${environment}`,
      partitionKey: { name: 'id', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: environment === 'local' ? cdk.RemovalPolicy.DESTROY : cdk.RemovalPolicy.RETAIN,
    });

    // Registrations table
    const registrationsTable = new dynamodb.Table(this, `RegistrationsTable-${environment}`, {
      tableName: `registrations-${environment}`,
      partitionKey: { name: 'eventId', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'userId', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: environment === 'local' ? cdk.RemovalPolicy.DESTROY : cdk.RemovalPolicy.RETAIN,
    });

    registrationsTable.addGlobalSecondaryIndex({
        indexName: 'email-index',
        partitionKey: {
        name: 'email',
        type: dynamodb.AttributeType.STRING
        },
        sortKey: {
        name: 'registeredAt',
        type: dynamodb.AttributeType.STRING
        }
      });

    registrationsTable.addGlobalSecondaryIndex({
      indexName: 'userId-index',
      partitionKey: {
        name: 'userId',
        type: dynamodb.AttributeType.STRING
      },
      sortKey: {
        name: 'registeredAt',
        type: dynamodb.AttributeType.STRING
      }
    });

    // Users table
    const usersTable = new dynamodb.Table(this, `UsersTable-${environment}`, {
      tableName: `users-${environment}`,
      partitionKey: { name: 'id', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: environment === 'local' ? cdk.RemovalPolicy.DESTROY : cdk.RemovalPolicy.RETAIN,
    });

    usersTable.addGlobalSecondaryIndex({
        indexName: 'email-index',
        partitionKey: {
          name: 'email',
          type: dynamodb.AttributeType.STRING
        }
      });
    
    usersTable.addGlobalSecondaryIndex({
      indexName: 'name-index',
      partitionKey: {
        name: 'name',
        type: dynamodb.AttributeType.STRING
      }
    });

    // Connections table
    const connectionsTable = new dynamodb.Table(this, `ConnectionsTable-${environment}`, {
      tableName: `connections-${environment}`,
      partitionKey: { name: 'userId', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'connectedUserId', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: environment === 'local' ? cdk.RemovalPolicy.DESTROY : cdk.RemovalPolicy.RETAIN,
    });

    // GSI to query connections in reverse (who is connected to a specific user)
    connectionsTable.addGlobalSecondaryIndex({
      indexName: 'connected-user-index',
      partitionKey: {
        name: 'connectedUserId',
        type: dynamodb.AttributeType.STRING
      },
      sortKey: {
        name: 'userId',
        type: dynamodb.AttributeType.STRING
      }
    });

    // Outputs
    new cdk.CfnOutput(this, `ProfilePicturesBucketName-${environment}`, {
      value: profilePicturesBucket.bucketName,
      description: 'S3 bucket for profile pictures',
    });

    new cdk.CfnOutput(this, `ProfilePicturesBucketUrl-${environment}`, {
      value: `https://${profilePicturesBucket.bucketName}.s3.${this.region}.amazonaws.com`,
      description: 'S3 bucket URL for profile pictures',
    });

    new cdk.CfnOutput(this, `StaticFilesBucketName-${environment}`, {
      value: staticFilesBucket.bucketName,
      description: 'S3 bucket for website static files',
    });

    new cdk.CfnOutput(this, `StaticFilesBucketUrl-${environment}`, {
      value: `https://${staticFilesBucket.bucketName}.s3.${this.region}.amazonaws.com`,
      description: 'S3 bucket URL for website static files',
    });

    new cdk.CfnOutput(this, `EventsTableName-${environment}`, {
      value: eventsTable.tableName,
    });

    new cdk.CfnOutput(this, `RegistrationsTableName-${environment}`, {
      value: registrationsTable.tableName,
    });

    new cdk.CfnOutput(this, `UsersTableName-${environment}`, {
      value: usersTable.tableName,
    });

    new cdk.CfnOutput(this, `ConnectionsTableName-${environment}`, {
      value: connectionsTable.tableName,
    });
  }
}