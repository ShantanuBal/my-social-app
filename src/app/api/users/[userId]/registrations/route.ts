// app/api/users/[userId]/registrations/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { dynamodb } from '../../../../../../lib/dynamodb';
import { QueryCommand } from '@aws-sdk/lib-dynamodb';
import { config } from '../../../../../../lib/config';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // First, check if user exists by getting their profile
    try {
      const userCheck = await dynamodb.send(new QueryCommand({
        TableName: config.aws.usersTable,
        KeyConditionExpression: 'id = :userId',
        ExpressionAttributeValues: {
          ':userId': userId
        }
      }));

      if (!userCheck.Items || userCheck.Items.length === 0) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        );
      }

      const user = userCheck.Items[0];
      
      // Check if profile is private - if so, return empty array
      if (user.profilePrivacy === 'private') {
        return NextResponse.json([]);
      }
    } catch (err) {
      console.error('Error checking user:', err);
      return NextResponse.json(
        { error: 'Failed to verify user' },
        { status: 500 }
      );
    }

    // Get user's event registrations
    // Assuming your registrations table has userId as a field
    const registrations = await dynamodb.send(new QueryCommand({
      TableName: config.aws.registrationsTable,
      IndexName: 'userId-index', // You'll need this GSI if you don't have it
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: {
        ':userId': userId
      },
      ScanIndexForward: false // Get newest registrations first
    }));

    if (!registrations.Items || registrations.Items.length === 0) {
      return NextResponse.json([]);
    }

    // Get event details for each registration
    const eventIds = [...new Set(registrations.Items.map(reg => reg.eventId))];
    
    const eventDetailsPromises = eventIds.map(async (eventId) => {
      try {
        const eventResult = await dynamodb.send(new QueryCommand({
          TableName: config.aws.eventsTable,
          KeyConditionExpression: 'id = :eventId',
          ExpressionAttributeValues: {
            ':eventId': eventId
          }
        }));
        
        return eventResult.Items?.[0] || null;
      } catch (err) {
        console.error(`Error fetching event ${eventId}:`, err);
        return null;
      }
    });

    const eventDetails = await Promise.all(eventDetailsPromises);
    const eventMap = new Map();
    eventDetails.forEach(event => {
      if (event) {
        eventMap.set(event.id, event);
      }
    });

    // Combine registration data with event details
    const registrationsWithEvents = registrations.Items.map(registration => {
      const event = eventMap.get(registration.eventId);
      return {
        eventId: registration.eventId,
        eventTitle: event?.title || 'Unknown Event',
        registeredAt: registration.createdAt || registration.registeredAt,
        userType: registration.userType || 'registered'
      };
    }).filter(reg => reg.eventTitle !== 'Unknown Event'); // Filter out events that couldn't be found

    // Sort by registration date (newest first)
    registrationsWithEvents.sort((a, b) => 
      new Date(b.registeredAt).getTime() - new Date(a.registeredAt).getTime()
    );

    return NextResponse.json(registrationsWithEvents);

  } catch (error) {
    console.error('Error fetching user registrations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user registrations' },
      { status: 500 }
    );
  }
}