// app/api/connections/ignore/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { dynamodb } from '../../../../../lib/dynamodb';
import { QueryCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { config } from '../../../../../lib/config';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { userId } = await request.json();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const currentUserId = session.user.id;

    // Check if there's a pending connection request FROM the other user TO current user
    const pendingRequest = await dynamodb.send(new QueryCommand({
      TableName: config.aws.connectionsTable,
      KeyConditionExpression: 'userId = :userId AND connectedUserId = :connectedUserId',
      ExpressionAttributeValues: {
        ':userId': userId,
        ':connectedUserId': currentUserId
      }
    }));

    if (!pendingRequest.Items || pendingRequest.Items.length === 0) {
      return NextResponse.json(
        { error: 'No pending connection request found' },
        { status: 400 }
      );
    }

    const request_item = pendingRequest.Items[0];
    if (request_item.status !== 'pending') {
      return NextResponse.json(
        { error: 'Connection request is not pending' },
        { status: 400 }
      );
    }

    // Update the pending connection request to "ignored" status (don't delete)
    await dynamodb.send(new UpdateCommand({
      TableName: config.aws.connectionsTable,
      Key: {
        userId: userId,
        connectedUserId: currentUserId
      },
      UpdateExpression: 'SET #status = :status, updatedAt = :updatedAt',
      ExpressionAttributeNames: {
        '#status': 'status'
      },
      ExpressionAttributeValues: {
        ':status': 'ignored',
        ':updatedAt': new Date().toISOString()
      }
    }));

    return NextResponse.json({ 
      success: true, 
      message: 'Connection request ignored' 
    });

  } catch (error) {
    console.error('Ignore connection error:', error);
    return NextResponse.json(
      { error: 'Failed to ignore connection request' },
      { status: 500 }
    );
  }
}