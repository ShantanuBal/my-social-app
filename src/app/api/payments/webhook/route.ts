// app/api/payments/webhook/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '../../../../../lib/stripe';
import { dynamodb } from '../../../../../lib/dynamodb';
import { PutCommand, UpdateCommand, GetCommand } from '@aws-sdk/lib-dynamodb';
import { config } from '../../../../../lib/config';
import { Resend } from 'resend';
import Stripe from 'stripe';

const resend = new Resend(process.env.RESEND_API_KEY);

interface EventData {
  title: string;
  date: string;
  time: string;
  location: string;
  attendees: number;
  maxAttendees: number;
}

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'No signature found' }, { status: 400 });
  }

  let event;

  try {
    // Verify webhook signature
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  // Handle the event
  try {
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentSuccess(event.data.object);
        break;
      
      case 'payment_intent.payment_failed':
        await handlePaymentFailure(event.data.object);
        break;
      
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

async function handlePaymentSuccess(paymentIntent: Stripe.PaymentIntent) {
  console.log('Processing successful payment:', paymentIntent.id);

  const { eventId, userId, userEmail, eventTitle } = paymentIntent.metadata || {};

  if (!eventId || !userId) {
    console.error('Missing required metadata in payment intent');
    return;
  }

  try {
    // Get event details
    const eventResponse = await dynamodb.send(new GetCommand({
      TableName: config.aws.eventsTable,
      Key: { id: eventId }
    }));

    const event = eventResponse.Item;
    if (!event) {
      console.error('Event not found:', eventId);
      return;
    }

    // Get user details (if logged in user)
    let userName = 'Guest User';
    let userEmail = paymentIntent.metadata.userEmail;

    if (userId && !userId.includes('_at_')) {
      // This is a registered user, get their details
      const userResponse = await dynamodb.send(new GetCommand({
        TableName: config.aws.usersTable,
        Key: { id: userId }
      }));

      if (userResponse.Item) {
        userName = userResponse.Item.name || userName;
        userEmail = userResponse.Item.email || userEmail;
      }
    }

    // Check if registration already exists (prevent duplicates)
    const existingRegistration = await dynamodb.send(new GetCommand({
      TableName: config.aws.registrationsTable,
      Key: { 
        eventId: eventId,
        userId: userId
      }
    }));

    if (existingRegistration.Item) {
      console.log('Registration already exists, skipping creation');
      return;
    }

    // Create registration record
    await dynamodb.send(new PutCommand({
      TableName: config.aws.registrationsTable,
      Item: {
        eventId,
        userId,
        userType: userId.includes('_at_') ? 'guest' : 'registered',
        name: userName,
        age: 0, // Default for payment registrations
        gender: '', // Default for payment registrations
        phoneNumber: '', // Default for payment registrations
        email: userEmail,
        registeredAt: new Date().toISOString(),
        paymentIntentId: paymentIntent.id,
        amountPaid: paymentIntent.amount,
        currency: paymentIntent.currency,
      },
    }));

    // Increment event attendee count
    await dynamodb.send(new UpdateCommand({
      TableName: config.aws.eventsTable,
      Key: { id: eventId },
      UpdateExpression: 'ADD attendees :inc',
      ExpressionAttributeValues: {
        ':inc': 1,
      },
    }));

    // Send confirmation email
    await sendPaymentConfirmationEmail({
      email: userEmail,
      name: userName,
      event: event as EventData,
      amountPaid: paymentIntent.amount,
      currency: paymentIntent.currency
    });

    console.log('Payment registration completed successfully');

  } catch (error) {
    console.error('Error creating registration from payment:', error);
    throw error;
  }
}

async function handlePaymentFailure(paymentIntent: Stripe.PaymentIntent) {
  console.log('Payment failed:', paymentIntent.id);
  
  // You could log this, send notification emails, etc.
  // For now, we'll just log it
  console.log('Payment failure metadata:', paymentIntent.metadata);
}

async function sendPaymentConfirmationEmail({
  email,
  name,
  event,
  amountPaid,
  currency
}: {
  email: string;
  name: string;
  event: EventData;
  amountPaid: number;
  currency: string;
}) {
  try {
    const formatDate = (dateString: string) => {
      return new Date(dateString).toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric',
        month: 'long', 
        day: 'numeric' 
      });
    };

    const formatAmount = (amountInCents: number, currency: string) => {
      return `$${(amountInCents / 100).toFixed(2)} ${currency.toUpperCase()}`;
    };

    await resend.emails.send({
      from: 'Seattle Anti-Freeze <onboarding@resend.dev>',
      to: [email],
      subject: `Payment Confirmed: ${event.title}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Payment & Registration Confirmed</title>
            <style>
              body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
                background-color: #f9f9f9;
              }
              .container {
                background: white;
                padding: 40px;
                border-radius: 8px;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
              }
              .header {
                text-align: center;
                margin-bottom: 30px;
              }
              .logo {
                font-size: 24px;
                font-weight: bold;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                background-clip: text;
                margin-bottom: 10px;
              }
              .payment-confirmation {
                background: linear-gradient(135deg, #10b981 0%, #059669 100%);
                color: white;
                padding: 20px;
                border-radius: 8px;
                margin: 20px 0;
                text-align: center;
              }
              .event-card {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 25px;
                border-radius: 8px;
                margin: 20px 0;
              }
              .event-title {
                font-size: 20px;
                font-weight: bold;
                margin-bottom: 15px;
              }
              .event-details {
                display: grid;
                gap: 8px;
              }
              .detail-row {
                display: flex;
                align-items: center;
                gap: 8px;
              }
              .footer {
                text-align: center;
                margin-top: 30px;
                padding-top: 20px;
                border-top: 1px solid #eee;
                color: #666;
                font-size: 14px;
              }
              .button {
                display: inline-block;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 12px 24px;
                text-decoration: none;
                border-radius: 6px;
                margin: 20px 0;
                font-weight: 500;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <div class="logo">Seattle Anti-Freeze</div>
                <h1>Payment & Registration Confirmed!</h1>
              </div>

              <div class="payment-confirmation">
                <h2 style="margin: 0 0 10px 0;">✓ Payment Successful</h2>
                <p style="margin: 0; font-size: 18px; font-weight: bold;">
                  ${formatAmount(amountPaid, currency)}
                </p>
              </div>

              <div class="event-card">
                <div class="event-title">${event.title}</div>
                <div class="event-details">
                  <div class="detail-row">
                    <span>📅</span>
                    <span><strong>Date:</strong> ${formatDate(event.date)}</span>
                  </div>
                  <div class="detail-row">
                    <span>🕐</span>
                    <span><strong>Time:</strong> ${event.time}</span>
                  </div>
                  <div class="detail-row">
                    <span>📍</span>
                    <span><strong>Location:</strong> ${event.location}</span>
                  </div>
                  <div class="detail-row">
                    <span>👥</span>
                    <span><strong>Attendees:</strong> ${event.attendees + 1}/${event.maxAttendees}</span>
                  </div>
                </div>
              </div>

              <h3>What's Next?</h3>
              <ul>
                <li>Mark your calendar for ${formatDate(event.date)} at ${event.time}</li>
                <li>Save the location: ${event.location}</li>
                <li>Look out for any event updates via email</li>
                <li>Bring your enthusiasm to connect with fellow Seattleites!</li>
              </ul>

              <div style="text-align: center;">
                <a href="https://seattle-anti-freeze.com/events" class="button">View All Events</a>
              </div>

              <div class="footer">
                <p><strong>Registered as:</strong> ${name}</p>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Payment Amount:</strong> ${formatAmount(amountPaid, currency)}</p>
                <hr style="margin: 20px 0; border: none; border-top: 1px solid #eee;">
                <p>Questions? Reply to this email or visit our contact page</p>
                <p>Seattle Anti-Freeze - Fighting the Seattle Freeze, one connection at a time.</p>
              </div>
            </div>
          </body>
        </html>
      `,
      text: `
Payment & Registration Confirmed: ${event.title}

Hi ${name},

Your payment of ${formatAmount(amountPaid, currency)} has been processed successfully!

Event Details:
- Title: ${event.title}
- Date: ${formatDate(event.date)}
- Time: ${event.time}
- Location: ${event.location}
- Attendees: ${event.attendees + 1}/${event.maxAttendees}

What's Next?
- Mark your calendar for ${formatDate(event.date)} at ${event.time}
- Save the location: ${event.location}
- Look out for any event updates via email
- Bring your enthusiasm to connect with fellow Seattleites!

Registered as: ${name}
Email: ${email}
Payment Amount: ${formatAmount(amountPaid, currency)}

Questions? Reply to this email or contact us.

Seattle Anti-Freeze - Fighting the Seattle Freeze, one connection at a time.
      `
    });

    console.log('Payment confirmation email sent successfully to:', email);
  } catch (emailError) {
    console.error('Failed to send payment confirmation email:', emailError);
    // Don't throw error - registration should still complete
  }
}