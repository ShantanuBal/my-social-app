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
      tableName: `anti-seattle-freeze-events-${environment}`,
      partitionKey: { name: 'id', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: environment === 'local' ? cdk.RemovalPolicy.DESTROY : cdk.RemovalPolicy.RETAIN,
    });

    // Registrations table
    const registrationsTable = new dynamodb.Table(this, `RegistrationsTable-${environment}`, {
      tableName: `anti-seattle-freeze-registrations-${environment}`,
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

    // Users table
    const usersTable = new dynamodb.Table(this, `UsersTable-${environment}`, {
      tableName: `anti-seattle-freeze-users-${environment}`,
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
  }
}