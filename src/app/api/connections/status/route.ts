import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { dynamodb } from '../../../../../lib/dynamodb';
import { QueryCommand } from '@aws-sdk/lib-dynamodb';
import { config } from '../../../../../lib/config';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const currentUserId = session.user.id || session.user.email;

    // Check if connection exists
    const connection = await dynamodb.send(new QueryCommand({
      TableName: config.aws.connectionsTable,
      KeyConditionExpression: 'userId = :userId AND connectedUserId = :connectedUserId',
      ExpressionAttributeValues: {
        ':userId': currentUserId,
        ':connectedUserId': userId
      }
    }));

    const isConnected = connection.Items && connection.Items.length > 0;

    return NextResponse.json({ isConnected });

  } catch (error) {
    console.error('Check connection status error:', error);
    return NextResponse.json(
      { error: 'Failed to check connection status' },
      { status: 500 }
    );
  }
}