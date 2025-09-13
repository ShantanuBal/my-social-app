// app/api/connections/connect/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { dynamodb } from '../../../../../lib/dynamodb';
import { PutCommand, QueryCommand, DeleteCommand } from '@aws-sdk/lib-dynamodb';
import { config } from '../../../../../lib/config';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      console.error('No session user id found. Session: ', JSON.stringify(session, null, 2));
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
    
    // Don't allow connecting to yourself
    if (currentUserId === userId) {
      return NextResponse.json(
        { error: 'Cannot connect to yourself' },
        { status: 400 }
      );
    }

    // Check if any connection already exists (pending or connected)
    const existingConnection = await dynamodb.send(new QueryCommand({
      TableName: config.aws.connectionsTable,
      KeyConditionExpression: 'userId = :userId AND connectedUserId = :connectedUserId',
      ExpressionAttributeValues: {
        ':userId': currentUserId,
        ':connectedUserId': userId
      }
    }));

    // Also check reverse direction for existing connections
    const reverseConnection = await dynamodb.send(new QueryCommand({
      TableName: config.aws.connectionsTable,
      KeyConditionExpression: 'userId = :userId AND connectedUserId = :connectedUserId',
      ExpressionAttributeValues: {
        ':userId': userId,
        ':connectedUserId': currentUserId
      }
    }));

    if (existingConnection.Items && existingConnection.Items.length > 0) {
      const connection = existingConnection.Items[0];
      if (connection.status === 'pending') {
        return NextResponse.json(
          { error: 'Connection request already sent' },
          { status: 400 }
        );
      } else if (connection.status === 'connected') {
        return NextResponse.json(
          { error: 'Already connected to this user' },
          { status: 400 }
        );
      }
    }

    if (reverseConnection.Items && reverseConnection.Items.length > 0) {
      const connection = reverseConnection.Items[0];
      if (connection.status === 'pending') {
        return NextResponse.json(
          { error: 'This user has already sent you a connection request' },
          { status: 400 }
        );
      } else if (connection.status === 'connected') {
        return NextResponse.json(
          { error: 'Already connected to this user' },
          { status: 400 }
        );
      }
    }

    // Create one-way pending connection request
    const connectionData = {
      createdAt: new Date().toISOString(),
      status: 'pending'
    };

    // Connection request from current user to target user
    await dynamodb.send(new PutCommand({
      TableName: config.aws.connectionsTable,
      Item: {
        userId: currentUserId,
        connectedUserId: userId,
        ...connectionData
      }
    }));

    return NextResponse.json({ 
      success: true, 
      message: 'Connection request sent!' 
    });

  } catch (error) {
    console.error('Connection error:', error);
    return NextResponse.json(
      { error: 'Failed to send connection request' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { userId } = await request.json();
    const currentUserId = session.user.id || session.user.email;

    // Remove bidirectional connection
    await Promise.all([
      dynamodb.send(new DeleteCommand({
        TableName: config.aws.connectionsTable,
        Key: {
          userId: currentUserId,
          connectedUserId: userId
        }
      })),
      dynamodb.send(new DeleteCommand({
        TableName: config.aws.connectionsTable,
        Key: {
          userId: userId,
          connectedUserId: currentUserId
        }
      }))
    ]);

    return NextResponse.json({ 
      success: true, 
      message: 'Connection removed' 
    });

  } catch (error) {
    console.error('Disconnect error:', error);
    return NextResponse.json(
      { error: 'Failed to remove connection' },
      { status: 500 }
    );
  }
}