// app/api/connections/ignored/route.ts
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

    // Get all ignored connection requests TO the current user
    const ignoredRequests = await dynamodb.send(new QueryCommand({
      TableName: config.aws.connectionsTable,
      IndexName: 'connected-user-index',
      KeyConditionExpression: 'connectedUserId = :connectedUserId',
      FilterExpression: '#status = :status',
      ExpressionAttributeNames: {
        '#status': 'status'
      },
      ExpressionAttributeValues: {
        ':connectedUserId': currentUserId,
        ':status': 'ignored'
      }
    }));

    if (!ignoredRequests.Items || ignoredRequests.Items.length === 0) {
      return NextResponse.json({ requests: [] });
    }

    // Get user details for each requester
    const requesterIds = ignoredRequests.Items.map(req => req.userId);
    
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
    const requestsWithDetails = ignoredRequests.Items.map((request, index) => ({
      requestId: `${request.userId}-${request.connectedUserId}`,
      requesterId: request.userId,
      requestedAt: request.createdAt,
      ignoredAt: request.updatedAt,
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

    // Sort by ignored date (newest first)
    requestsWithDetails.sort((a, b) => 
      new Date(b.ignoredAt || b.requestedAt).getTime() - new Date(a.ignoredAt || a.requestedAt).getTime()
    );

    return NextResponse.json({ 
      requests: requestsWithDetails,
      total: requestsWithDetails.length
    });

  } catch (error) {
    console.error('Error fetching ignored requests:', error);
    return NextResponse.json(
      { error: 'Failed to fetch ignored requests' },
      { status: 500 }
    );
  }
}