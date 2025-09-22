// app/api/payments/create-payment-intent/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { stripe } from '../../../../../lib/stripe';
import { dynamodb } from '../../../../../lib/dynamodb';
import { GetCommand } from '@aws-sdk/lib-dynamodb';
import { config } from '../../../../../lib/config';
import { authOptions } from '../../auth/[...nextauth]/route';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const { eventId, guestEmail, guestName } = await request.json();

    if (!eventId) {
      return NextResponse.json({ error: 'Event ID is required' }, { status: 400 });
    }

    // For guest users, we need email and name
    if (!session?.user?.id && (!guestEmail || !guestName)) {
      return NextResponse.json({ 
        error: 'Guest email and name are required for guest checkout' 
      }, { status: 400 });
    }

    // Get event details from database
    const eventResponse = await dynamodb.send(new GetCommand({
      TableName: config.aws.eventsTable,
      Key: { id: eventId }
    }));

    const event = eventResponse.Item;

    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    if (!event.isPaid || event.price === 0) {
      return NextResponse.json({ error: 'This is a free event' }, { status: 400 });
    }

    // Check if event is full
    if (event.attendees >= event.maxAttendees) {
      return NextResponse.json({ error: 'Event is full' }, { status: 400 });
    }

    // Determine user info for payment intent metadata
    let userId: string;
    let userEmail: string;
    let userName: string;

    if (session?.user?.id) {
      // Logged in user
      userId = session.user.id;
      userEmail = session.user.email || '';
      userName = session.user.name || '';
    } else {
      // Guest user - create a unique guest ID
      userId = `guest_${guestEmail.replace('@', '_at_')}`;
      userEmail = guestEmail;
      userName = guestName;
    }

    // Create Stripe Payment Intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: event.price, // Price in cents
      currency: event.currency || 'usd',
      metadata: {
        eventId: eventId,
        userId: userId,
        eventTitle: event.title,
        userEmail: userEmail,
        userName: userName,
        userType: session?.user?.id ? 'registered' : 'guest',
      },
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      eventTitle: event.title,
      amount: event.price,
      currency: event.currency || 'usd',
    });

  } catch (error) {
    console.error('Error creating payment intent:', error);
    return NextResponse.json(
      { error: 'Failed to create payment intent' },
      { status: 500 }
    );
  }
}