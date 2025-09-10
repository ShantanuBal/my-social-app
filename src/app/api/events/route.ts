import { NextResponse } from 'next/server';
import { dynamodb } from '@/lib/dynamodb';
import { ScanCommand } from '@aws-sdk/lib-dynamodb';
import { config } from '@/lib/config';

export async function GET() {
  try {
    const command = new ScanCommand({
      TableName: config.aws.eventsTable,
    });
    
    const response = await dynamodb.send(command);
    return NextResponse.json(response.Items || []);
  } catch (error) {
    console.error('Error fetching events:', error);
    return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 });
  }
}