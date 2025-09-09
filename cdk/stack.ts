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
    
    // Environment-specific table name
    const tableName = `anti-seattle-freeze-events-${environment}`;

    // DynamoDB table for events
    const eventsTable = new dynamodb.Table(this, `EventsTable-${environment}`, {
      tableName: tableName,
      partitionKey: { 
        name: 'id', 
        type: dynamodb.AttributeType.STRING 
      },
      sortKey: {
        name: 'date',
        type: dynamodb.AttributeType.STRING
      },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: environment === 'local' ? cdk.RemovalPolicy.DESTROY : cdk.RemovalPolicy.RETAIN,
      
      // Global Secondary Index for querying by category
      globalSecondaryIndexes: [{
        indexName: 'category-date-index',
        partitionKey: {
          name: 'category',
          type: dynamodb.AttributeType.STRING
        },
        sortKey: {
          name: 'date',
          type: dynamodb.AttributeType.STRING
        }
      }]
    });

    // Environment-specific outputs
    new cdk.CfnOutput(this, `EventsTableName-${environment}`, {
      value: eventsTable.tableName,
      description: `DynamoDB Events Table Name for ${environment}`,
    });

    new cdk.CfnOutput(this, `EventsTableArn-${environment}`, {
      value: eventsTable.tableArn,
      description: `DynamoDB Events Table ARN for ${environment}`,
    });
  }
}