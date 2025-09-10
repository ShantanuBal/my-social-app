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
    const { name, age, gender, phoneNumber, email } = body;
    const { eventId } = await params;

    // Generate a unique user ID (you could make this more sophisticated)
    const userId = `${email.replace('@', '_at_')}_${Date.now()}`;

    // 1. Save registration
    await dynamodb.send(new PutCommand({
      TableName: config.aws.registrationsTable,
      Item: {
        eventId,
        userId,
        name,
        age: parseInt(age),
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