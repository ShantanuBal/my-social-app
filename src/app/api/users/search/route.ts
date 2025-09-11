import { NextRequest, NextResponse } from 'next/server';
import { dynamodb } from '../../../../../lib/dynamodb';
import { ScanCommand } from '@aws-sdk/lib-dynamodb';
import { config } from '../../../../../lib/config';
import { getServerSession } from 'next-auth';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    
    if (!query || query.length < 2) {
      return NextResponse.json({ users: [] });
    }

    // Get current session to exclude current user from results
    const session = await getServerSession();
    const currentUserEmail = session?.user?.email;

    // Search for users by name (case-insensitive)
    const scanCommand = new ScanCommand({
      TableName: config.aws.usersTable, // You'll need to add this to your config
      FilterExpression: 'contains(#name, :query)',
      ExpressionAttributeNames: {
        '#name': 'name'
      },
      ExpressionAttributeValues: {
        ':query': query.toLowerCase()
      },
      ProjectionExpression: 'id, #name, email, avatar, createdAt' // Only return needed fields
    });

    const result = await dynamodb.send(scanCommand);
    
    // Filter out current user and format results
    const users = (result.Items || [])
      .filter(user => user.email !== currentUserEmail)
      .map(user => ({
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatar || null,
        isConnected: false // TODO: Check actual connection status
      }))
      .slice(0, 10); // Limit to 10 results

    return NextResponse.json({ users });

  } catch (error) {
    console.error('User search error:', error);
    return NextResponse.json(
      { error: 'Search failed' },
      { status: 500 }
    );
  }
}