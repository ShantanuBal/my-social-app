import { NextRequest, NextResponse } from 'next/server';
import { dynamodb } from '../../../../../../lib/dynamodb';
import { PutCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { config } from '../../../../../../lib/config';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ eventId: string }> }
) {
  try {
    const body = await request.json();
    const { name, age, gender, phoneNumber, email, userId } = body;
    const { eventId } = await params;

    // Determine user type and final userId
    const isRegisteredUser = !!userId;
    const finalUserId = userId || `${email.replace('@', '_at_')}_${Date.now()}`;
    const userType = isRegisteredUser ? 'registered' : 'guest';

    // 1. Save registration
    await dynamodb.send(new PutCommand({
      TableName: config.aws.registrationsTable,
      Item: {
        eventId,
        userId: finalUserId,
        userType, // Add userType field
        name,
        age: parseInt(age) || 0,
        gender,
        phoneNumber,
        email,
        registeredAt: new Date().toISOString(),
      },
    }));

    // 2. Increment event attendee count
    await dynamodb.send(new UpdateCommand({
      TableName: config.aws.eventsTable,
      Key: { id: eventId },
      UpdateExpression: 'ADD attendees :inc',
      ExpressionAttributeValues: {
        ':inc': 1,
      },
    }));

    return NextResponse.json({ success: true, message: 'Registration successful!' });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Registration failed' }, 
      { status: 500 }
    );
  }
}