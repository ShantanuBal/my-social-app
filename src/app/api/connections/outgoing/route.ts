// app/api/connections/outgoing/route.ts
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

    // Get all outgoing requests FROM the current user (pending or ignored)
    const outgoingRequests = await dynamodb.send(new QueryCommand({
      TableName: config.aws.connectionsTable,
      KeyConditionExpression: 'userId = :userId',
      FilterExpression: '#status = :pendingStatus OR #status = :ignoredStatus',
      ExpressionAttributeNames: {
        '#status': 'status'
      },
      ExpressionAttributeValues: {
        ':userId': currentUserId,
        ':pendingStatus': 'pending',
        ':ignoredStatus': 'ignored'
      }
    }));

    if (!outgoingRequests.Items || outgoingRequests.Items.length === 0) {
      return NextResponse.json({ requests: [] });
    }

    // Get user details for each recipient
    const recipientIds = outgoingRequests.Items.map(req => req.connectedUserId);
    
    const userDetailsPromises = recipientIds.map(async (recipientId) => {
      try {
        const userResult = await dynamodb.send(new GetCommand({
          TableName: config.aws.usersTable,
          Key: {
            id: recipientId
          }
        }));
        
        return userResult.Item || null;
      } catch (err) {
        console.error(`Error fetching user ${recipientId}:`, err);
        return null;
      }
    });

    const userDetails = await Promise.all(userDetailsPromises);

    // Combine request data with user details
    const requestsWithDetails = outgoingRequests.Items.map((request, index) => ({
      requestId: `${request.userId}-${request.connectedUserId}`,
      recipientId: request.connectedUserId,
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
    console.error('Error fetching outgoing requests:', error);
    return NextResponse.json(
      { error: 'Failed to fetch outgoing requests' },
      { status: 500 }
    );
  }
}