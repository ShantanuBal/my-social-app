// app/api/connections/status/[userId]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../auth/[...nextauth]/route';
import { dynamodb } from '../../../../../../lib/dynamodb';
import { QueryCommand } from '@aws-sdk/lib-dynamodb';
import { config } from '../../../../../../lib/config';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { userId: targetUserId } = await params;
    const currentUserId = session.user.id;

    // Check connection from current user to target user
    const myConnectionResponse = await dynamodb.send(new QueryCommand({
      TableName: config.aws.connectionsTable,
      KeyConditionExpression: 'userId = :userId AND connectedUserId = :connectedUserId',
      ExpressionAttributeValues: {
        ':userId': currentUserId,
        ':connectedUserId': targetUserId
      }
    }));

    // Check connection from target user to current user
    const theirConnectionResponse = await dynamodb.send(new QueryCommand({
      TableName: config.aws.connectionsTable,
      KeyConditionExpression: 'userId = :userId AND connectedUserId = :connectedUserId',
      ExpressionAttributeValues: {
        ':userId': targetUserId,
        ':connectedUserId': currentUserId
      }
    }));

    const myConnection = myConnectionResponse.Items?.[0];
    const theirConnection = theirConnectionResponse.Items?.[0];

    // Determine status
    let status = 'none';

    if (myConnection && myConnection.status === 'connected') {
      status = 'connected';
    } else if (myConnection && myConnection.status === 'pending') {
      status = 'pending_sent';
    } else if (theirConnection && theirConnection.status === 'pending') {
      status = 'pending_received';
    }

    return NextResponse.json({ 
      status,
      currentUserId,
      targetUserId
    });

  } catch (error) {
    console.error('Error checking connection status:', error);
    return NextResponse.json(
      { error: 'Failed to check connection status' },
      { status: 500 }
    );
  }
}