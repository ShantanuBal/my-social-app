// app/api/user/privacy/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { dynamodb } from '../../../../../lib/dynamodb';
import { UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { config } from '../../../../../lib/config';

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { privacy } = await request.json();

    if (!privacy || !['public', 'private'].includes(privacy)) {
      return NextResponse.json(
        { error: 'Invalid privacy setting. Must be "public" or "private"' },
        { status: 400 }
      );
    }

    const currentUserId = session.user.id;

    // Update the user's profile privacy setting
    await dynamodb.send(new UpdateCommand({
      TableName: config.aws.usersTable,
      Key: {
        id: currentUserId
      },
      UpdateExpression: 'SET profilePrivacy = :privacy, updatedAt = :updatedAt',
      ExpressionAttributeValues: {
        ':privacy': privacy,
        ':updatedAt': new Date().toISOString()
      }
    }));

    return NextResponse.json({ 
      success: true, 
      privacy,
      message: `Profile privacy updated to ${privacy}` 
    });

  } catch (error) {
    console.error('Privacy update error:', error);
    return NextResponse.json(
      { error: 'Failed to update privacy setting' },
      { status: 500 }
    );
  }
}