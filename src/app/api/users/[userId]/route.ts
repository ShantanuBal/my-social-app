import { NextRequest, NextResponse } from 'next/server';
import { dynamodb } from '../../../../../lib/dynamodb';
import { GetCommand } from '@aws-sdk/lib-dynamodb';
import { config } from '../../../../../lib/config';

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

    // Return public profile information
    const userProfile = {
      id: result.Item.id,
      name: result.Item.name,
      email: result.Item.email,
      avatar: result.Item.avatar || null,
      location: result.Item.location || 'Seattle, WA',
      memberSince: result.Item.createdAt ? new Date(result.Item.createdAt).getFullYear() : new Date().getFullYear(),
      isConnected: false // TODO: Check actual connection status with current user
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