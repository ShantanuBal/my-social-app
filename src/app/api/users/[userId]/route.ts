import { NextRequest, NextResponse } from 'next/server';
import { dynamodb } from '../../../../../lib/dynamodb';
import { GetCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';
import { config } from '../../../../../lib/config';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;

    // Get user profile from DynamoDB
    const command = new GetCommand({
      TableName: config.aws.usersTable,
      Key: { id: userId }
    });

    const result = await dynamodb.send(command);
    
    if (!result.Item) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Get current session to check connection status
    const session = await getServerSession(authOptions);
    const currentUserId = session?.user.id;
    
    let isConnected: boolean = false;
    
    // Check connection status if user is logged in
    if (currentUserId && currentUserId !== userId) {
      try {
        const connectionCheck = await dynamodb.send(new QueryCommand({
          TableName: config.aws.connectionsTable,
          KeyConditionExpression: 'userId = :userId AND connectedUserId = :connectedUserId',
          ExpressionAttributeValues: {
            ':userId': currentUserId,
            ':connectedUserId': userId
          }
        }));
        
        isConnected = !!(connectionCheck.Items && connectionCheck.Items.length > 0);
      } catch (error) {
        console.error('Error checking connection status:', error);
        // isConnected remains false if check fails
      }
    }

    console.log("User profile data: ", result.Item)

    // Return public profile information
    const userProfile = {
      id: result.Item.id,
      name: result.Item.name,
      email: result.Item.email,
      avatar: result.Item.avatar || null,
      location: result.Item.location,
      memberSince: new Date(result.Item.createdAt).getFullYear(),
      profilePrivacy: result.Item.profilePrivacy || 'public', // Default to public if not set
      isConnected
    };

    return NextResponse.json(userProfile);

  } catch (error) {
    console.error('Get user profile error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user profile' },
      { status: 500 }
    );
  }
}