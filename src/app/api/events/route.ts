// api/events/route.ts
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
    
    // Filter events with multiple criteria:
    // 1. Must have a date
    // 2. Must be future date (today and later)
    // 3. Must be active (isActive === true or undefined for backwards compatibility)
    const activeAndFutureEvents = allEvents.filter(event => {
      // Check if event has a date
      if (!event.date) return false;
      
      // Check if event is in the future
      if (event.date < todayString) return false;
      
      // Check if event is active (default to true if isActive field doesn't exist for backwards compatibility)
      const isActive = event.isActive !== undefined ? event.isActive : true;
      if (!isActive) return false;
      
      return true;
    });
    
    // Sort events by date (earliest first)
    activeAndFutureEvents.sort((a, b) => {
      if (a.date === b.date) {
        // If same date, sort by time
        return (a.time || '').localeCompare(b.time || '');
      }
      return a.date.localeCompare(b.date);
    });
    
    return NextResponse.json(activeAndFutureEvents);
  } catch (error) {
    console.error('Error fetching events:', error);
    return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 });
  }
}