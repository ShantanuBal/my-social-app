// app/api/connections/pending/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { dynamodb } from '../../../../../lib/dynamodb';
import { QueryCommand, GetCommand } from '@aws-sdk/lib-dynamodb';
import { config } from '../../../../../lib/config';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const currentUserId = session.user.id;

    // Get all pending connection requests TO the current user (exclude ignored)
    const pendingRequests = await dynamodb.send(new QueryCommand({
      TableName: config.aws.connectionsTable,
      IndexName: 'connected-user-index', // Using your existing GSI name
      KeyConditionExpression: 'connectedUserId = :connectedUserId',
      FilterExpression: '#status = :status',
      ExpressionAttributeNames: {
        '#status': 'status'
      },
      ExpressionAttributeValues: {
        ':connectedUserId': currentUserId,
        ':status': 'pending'
      }
    }));

    if (!pendingRequests.Items || pendingRequests.Items.length === 0) {
      return NextResponse.json({ requests: [] });
    }

    // Get user details for each requester
    const requesterIds = pendingRequests.Items.map(req => req.userId);
    
    const userDetailsPromises = requesterIds.map(async (requesterId) => {
      try {
        const userResult = await dynamodb.send(new GetCommand({
          TableName: config.aws.usersTable,
          Key: {
            id: requesterId
          }
        }));
        
        return userResult.Item || null;
      } catch (err) {
        console.error(`Error fetching user ${requesterId}:`, err);
        return null;
      }
    });

    const userDetails = await Promise.all(userDetailsPromises);

    // Combine request data with user details
    const requestsWithDetails = pendingRequests.Items.map((request, index) => ({
      requestId: `${request.userId}-${request.connectedUserId}`,
      requesterId: request.userId,
      requestedAt: request.createdAt,
      status: request.status,
      user: userDetails[index] ? {
        id: userDetails[index].id,
        name: userDetails[index].name,
        email: userDetails[index].email,
        location: userDetails[index].location,
        bio: userDetails[index].bio,
        memberSince: userDetails[index].memberSince
      } : null
    })).filter(req => req.user !== null);

    // Sort by request date (newest first)
    requestsWithDetails.sort((a, b) => 
      new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime()
    );

    return NextResponse.json({ 
      requests: requestsWithDetails,
      total: requestsWithDetails.length
    });

  } catch (error) {
    console.error('Error fetching pending requests:', error);
    return NextResponse.json(
      { error: 'Failed to fetch pending requests' },
      { status: 500 }
    );
  }
}