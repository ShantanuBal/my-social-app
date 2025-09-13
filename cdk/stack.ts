import * as cdk from 'aws-cdk-lib';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import { Construct } from 'constructs';

interface AntiSeattleFreezeStackProps extends cdk.StackProps {
  environment: 'local' | 'production';
}

export class AntiSeattleFreezeStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: AntiSeattleFreezeStackProps) {
    super(scope, id, props);

    const { environment } = props;

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