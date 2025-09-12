import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route'; // Import your auth config
import { dynamodb } from '../../../../../lib/dynamodb';
import { PutCommand, QueryCommand, DeleteCommand } from '@aws-sdk/lib-dynamodb';
import { config } from '../../../../../lib/config';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    // console.log('Server session:', JSON.stringify(session, null, 2));

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

    // Check if connection already exists
    const existingConnection = await dynamodb.send(new QueryCommand({
      TableName: config.aws.connectionsTable,
      KeyConditionExpression: 'userId = :userId AND connectedUserId = :connectedUserId',
      ExpressionAttributeValues: {
        ':userId': currentUserId,
        ':connectedUserId': userId
      }
    }));

    if (existingConnection.Items && existingConnection.Items.length > 0) {
      console.error('Already connected to this user');
      return NextResponse.json(
        { error: 'Already connected to this user' },
        { status: 400 }
      );
    }

    // Create bidirectional connection
    const connectionData = {
      createdAt: new Date().toISOString(),
      status: 'connected'
    };

    // Connection from current user to target user
    await dynamodb.send(new PutCommand({
      TableName: config.aws.connectionsTable,
      Item: {
        userId: currentUserId,
        connectedUserId: userId,
        ...connectionData
      }
    }));

    // Connection from target user to current user (bidirectional)
    await dynamodb.send(new PutCommand({
      TableName: config.aws.connectionsTable,
      Item: {
        userId: userId,
        connectedUserId: currentUserId,
        ...connectionData
      }
    }));

    return NextResponse.json({ 
      success: true, 
      message: 'Successfully connected!' 
    });

  } catch (error) {
    console.error('Connection error:', error);
    return NextResponse.json(
      { error: 'Failed to create connection' },
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