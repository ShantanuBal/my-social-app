// app/api/events/[eventId]/register/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { dynamodb } from '../../../../../../lib/dynamodb';
import { PutCommand, UpdateCommand, GetCommand } from '@aws-sdk/lib-dynamodb';
import { config } from '../../../../../../lib/config';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

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

    // Get event details for the email
    const eventResponse = await dynamodb.send(new GetCommand({
      TableName: config.aws.eventsTable,
      Key: { id: eventId }
    }));

    const event = eventResponse.Item;
    if (!event) {
      return NextResponse.json(
        { error: 'Event not found' }, 
        { status: 404 }
      );
    }

    // 1. Save registration
    await dynamodb.send(new PutCommand({
      TableName: config.aws.registrationsTable,
      Item: {
        eventId,
        userId: finalUserId,
        userType,
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

    // 3. Send confirmation email
    try {
      const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', { 
          weekday: 'long', 
          year: 'numeric',
          month: 'long', 
          day: 'numeric' 
        });
      };

      await resend.emails.send({
        from: 'Seattle Anti-Freeze <onboarding@resend.dev>', // Replace with your verified domain
        to: [email],
        subject: `Registration Confirmed: ${event.title}`,
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Event Registration Confirmed</title>
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
                .icon {
                  width: 16px;
                  height: 16px;
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
                  <h1>Registration Confirmed!</h1>
                  <p>You're all set for your upcoming event.</p>
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
                  <a href="https://seattle-anti-freeze.vercel.app/events" class="button">View All Events</a>
                </div>

                <div class="footer">
                  <p><strong>Registered as:</strong> ${name}</p>
                  <p><strong>Email:</strong> ${email}</p>
                  <hr style="margin: 20px 0; border: none; border-top: 1px solid #eee;">
                  <p>Questions? Reply to this email or visit our <a href="https://seattle-anti-freeze.vercel.app/contact">contact page</p>
                  <p>Seattle Anti-Freeze - Fighting the Seattle Freeze, one connection at a time.</p>
                </div>
              </div>
            </body>
          </html>
        `,
        // Plain text fallback
        text: `
Registration Confirmed: ${event.title}

Hi ${name},

You're all set for your upcoming event!

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

Questions? Reply to this email or contact us at support@yourdomain.com

Seattle Anti-Freeze - Fighting the Seattle Freeze, one connection at a time.
        `
      });

      console.log('Confirmation email sent successfully to:', email);
    } catch (emailError) {
      console.error('Failed to send confirmation email:', emailError);
      // Don't fail the registration if email fails
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Registration successful! Check your email for confirmation.',
      emailSent: true 
    });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Registration failed' }, 
      { status: 500 }
    );
  }
}