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
    const allEvents = response.Items || [];
    
    // Get today's date in Pacific Time (Seattle timezone)
    const today = new Date();
    const pacificTime = new Date(today.toLocaleString("en-US", {timeZone: "America/Los_Angeles"}));
    const todayString = pacificTime.toISOString().split('T')[0]; // Format: YYYY-MM-DD
    
    // Filter events to only include future dates (today and later)
    const futureEvents = allEvents.filter(event => {
      if (!event.date) return false;
      return event.date >= todayString;
    });
    
    // Sort events by date (earliest first)
    futureEvents.sort((a, b) => {
      if (a.date === b.date) {
        // If same date, sort by time
        return (a.time || '').localeCompare(b.time || '');
      }
      return a.date.localeCompare(b.date);
    });
    
    return NextResponse.json(futureEvents);
  } catch (error) {
    console.error('Error fetching events:', error);
    return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 });
  }
}