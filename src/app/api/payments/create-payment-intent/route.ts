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
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { eventId } = await request.json();

    if (!eventId) {
      return NextResponse.json({ error: 'Event ID is required' }, { status: 400 });
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

    // Create Stripe Payment Intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: event.price, // Price in cents
      currency: event.currency || 'usd',
      metadata: {
        eventId: eventId,
        userId: session.user.id,
        eventTitle: event.title,
        userEmail: session.user.email || '',
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