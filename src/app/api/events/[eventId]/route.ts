import { NextRequest, NextResponse } from 'next/server';
import { dynamodb } from '@/lib/dynamodb';
import { GetCommand } from '@aws-sdk/lib-dynamodb';
import { config } from '@/lib/config';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ eventId: string }> }
) {
  const { eventId } = await params;

  try {
    const response = await dynamodb.send(new GetCommand({
      TableName: config.aws.eventsTable,
      Key: { id: eventId },
    }));

    if (!response.Item) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    return NextResponse.json(response.Item);
  } catch (error) {
    console.error('Error fetching event:', error);
    return NextResponse.json({ error: 'Failed to fetch event' }, { status: 500 });
  }
}
