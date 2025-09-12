import { NextRequest, NextResponse } from 'next/server';
import { dynamodb } from '../../../../../lib/dynamodb';
import { ScanCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';
import { config } from '../../../../../lib/config';
import { getServerSession } from 'next-auth';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    
    if (!query || query.length < 2) {
      return NextResponse.json({ users: [] });
    }

    // Get current session
    const session = await getServerSession();
    const currentUserEmail = session?.user?.email;
    const currentUserId = session?.user?.id || session?.user?.email;

    // Search for users by name (case-insensitive)
    const scanCommand = new ScanCommand({
      TableName: config.aws.usersTable,
      FilterExpression: 'contains(#name, :queryLower) OR contains(#name, :queryCapital)',
      ExpressionAttributeNames: {
        '#name': 'name'
      },
      ExpressionAttributeValues: {
        ':queryLower': query.toLowerCase(),
        ':queryCapital': query.charAt(0).toUpperCase() + query.slice(1).toLowerCase()
      },
      ProjectionExpression: 'id, #name, email, avatar, createdAt'
    });

    const result = await dynamodb.send(scanCommand);
    
    // Filter out current user
    const filteredUsers = (result.Items || [])
      .filter(user => user.email !== currentUserEmail)
      .slice(0, 10);

    // Check connection status for each user if logged in
    let usersWithConnectionStatus = filteredUsers;
    
    if (currentUserId) {
      usersWithConnectionStatus = await Promise.all(
        filteredUsers.map(async (user) => {
          try {
            // Check if connected
            const connectionCheck = await dynamodb.send(new QueryCommand({
              TableName: config.aws.connectionsTable,
              KeyConditionExpression: 'userId = :userId AND connectedUserId = :connectedUserId',
              ExpressionAttributeValues: {
                ':userId': currentUserId,
                ':connectedUserId': user.id
              }
            }));

            const isConnected = connectionCheck.Items && connectionCheck.Items.length > 0;

            return {
              id: user.id,
              name: user.name,
              email: user.email,
              avatar: user.avatar || null,
              isConnected
            };
          } catch (error) {
            // If connection check fails, default to not connected
            return {
              id: user.id,
              name: user.name,
              email: user.email,
              avatar: user.avatar || null,
              isConnected: false
            };
          }
        })
      );
    } else {
      // Not logged in, set all as not connected
      usersWithConnectionStatus = filteredUsers.map(user => ({
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatar || null,
        isConnected: false
      }));
    }

    return NextResponse.json({ users: usersWithConnectionStatus });

  } catch (error) {
    console.error('User search error:', error);
    return NextResponse.json(
      { error: 'Search failed' },
      { status: 500 }
    );
  }
}