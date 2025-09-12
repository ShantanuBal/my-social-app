// app/api/connections/[userId]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { dynamodb } from '../../../../../lib/dynamodb';
import { QueryCommand, GetCommand } from '@aws-sdk/lib-dynamodb';
import { config } from '../../../../../lib/config';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Get all connections for this user
    const connections = await dynamodb.send(new QueryCommand({
      TableName: config.aws.connectionsTable,
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: {
        ':userId': userId
      }
    }));

    if (!connections.Items || connections.Items.length === 0) {
      return NextResponse.json({ connections: [] });
    }

    // Get user details for all connected users
    const connectedUserIds = connections.Items.map(conn => conn.connectedUserId);
    
    // Fetch user details for each connected user
    const userDetailsPromises = connectedUserIds.map(async (connectedUserId) => {
      try {
        // Get the user directly by id (the partition key)
        const userResult = await dynamodb.send(new GetCommand({
          TableName: config.aws.usersTable,
          Key: {
            id: connectedUserId
          }
        }));
        
        return userResult.Item || null;
      } catch (err) {
        console.error(`Error fetching user ${connectedUserId}:`, err);
        return null;
      }
    });

    const userDetails = await Promise.all(userDetailsPromises);

    // Combine connection data with user details
    const connectionsWithDetails = connections.Items.map((connection, index) => ({
      userId: connection.connectedUserId,
      connectedAt: connection.createdAt,
      status: connection.status,
      user: userDetails[index] ? {
        id: userDetails[index].id,
        name: userDetails[index].name,
        email: userDetails[index].email,
        location: userDetails[index].location,
        bio: userDetails[index].bio,
        memberSince: userDetails[index].memberSince
      } : null
    })).filter(conn => conn.user !== null); // Filter out any failed lookups

    // Sort by connection date (newest first)
    connectionsWithDetails.sort((a, b) => 
      new Date(b.connectedAt).getTime() - new Date(a.connectedAt).getTime()
    );

    return NextResponse.json({ 
      connections: connectionsWithDetails,
      total: connectionsWithDetails.length
    });

  } catch (error) {
    console.error('Error fetching connections:', error);
    return NextResponse.json(
      { error: 'Failed to fetch connections' },
      { status: 500 }
    );
  }
}