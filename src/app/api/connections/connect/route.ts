// app/api/connections/connect/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { dynamodb } from '../../../../../lib/dynamodb';
import { PutCommand, QueryCommand, DeleteCommand, GetCommand } from '@aws-sdk/lib-dynamodb';
import { config } from '../../../../../lib/config';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      console.error('No session user id found. Session: ', JSON.stringify(session, null, 2));
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { userId } = await request.json();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const currentUserId = session.user.id;
    
    // Don't allow connecting to yourself
    if (currentUserId === userId) {
      return NextResponse.json(
        { error: 'Cannot connect to yourself' },
        { status: 400 }
      );
    }

    // Check if any connection already exists (pending or connected)
    const existingConnection = await dynamodb.send(new QueryCommand({
      TableName: config.aws.connectionsTable,
      KeyConditionExpression: 'userId = :userId AND connectedUserId = :connectedUserId',
      ExpressionAttributeValues: {
        ':userId': currentUserId,
        ':connectedUserId': userId
      }
    }));

    // Also check reverse direction for existing connections
    const reverseConnection = await dynamodb.send(new QueryCommand({
      TableName: config.aws.connectionsTable,
      KeyConditionExpression: 'userId = :userId AND connectedUserId = :connectedUserId',
      ExpressionAttributeValues: {
        ':userId': userId,
        ':connectedUserId': currentUserId
      }
    }));

    if (existingConnection.Items && existingConnection.Items.length > 0) {
      const connection = existingConnection.Items[0];
      if (connection.status === 'pending') {
        return NextResponse.json(
          { error: 'Connection request already sent' },
          { status: 400 }
        );
      } else if (connection.status === 'connected') {
        return NextResponse.json(
          { error: 'Already connected to this user' },
          { status: 400 }
        );
      }
    }

    if (reverseConnection.Items && reverseConnection.Items.length > 0) {
      const connection = reverseConnection.Items[0];
      if (connection.status === 'pending') {
        return NextResponse.json(
          { error: 'This user has already sent you a connection request' },
          { status: 400 }
        );
      } else if (connection.status === 'connected') {
        return NextResponse.json(
          { error: 'Already connected to this user' },
          { status: 400 }
        );
      }
    }

    // Get user details for both sender and recipient
    const [senderResponse, recipientResponse] = await Promise.all([
      dynamodb.send(new GetCommand({
        TableName: config.aws.usersTable,
        Key: { id: currentUserId }
      })),
      dynamodb.send(new GetCommand({
        TableName: config.aws.usersTable,
        Key: { id: userId }
      }))
    ]);

    const sender = senderResponse.Item;
    const recipient = recipientResponse.Item;

    if (!sender || !recipient) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Create one-way pending connection request
    const connectionData = {
      createdAt: new Date().toISOString(),
      status: 'pending'
    };

    // Connection request from current user to target user
    await dynamodb.send(new PutCommand({
      TableName: config.aws.connectionsTable,
      Item: {
        userId: currentUserId,
        connectedUserId: userId,
        ...connectionData
      }
    }));

    // Send email notification to the recipient
    try {
      await resend.emails.send({
        from: 'Seattle Anti-Freeze <onboarding@resend.dev>',
        to: [recipient.email],
        subject: `${sender.name} wants to connect with you on Seattle Anti-Freeze`,
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>New Connection Request</title>
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
                .connection-card {
                  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                  color: white;
                  padding: 25px;
                  border-radius: 8px;
                  margin: 20px 0;
                  text-align: center;
                }
                .profile-icon {
                  width: 80px;
                  height: 80px;
                  background: rgba(255, 255, 255, 0.2);
                  border-radius: 50%;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  font-size: 36px;
                  margin: 0 auto 20px;
                }
                .sender-name {
                  font-size: 22px;
                  font-weight: bold;
                  margin-bottom: 10px;
                }
                .sender-email {
                  opacity: 0.9;
                  margin-bottom: 20px;
                }
                .button {
                  display: inline-block;
                  background: white;
                  color: #667eea;
                  padding: 12px 24px;
                  text-decoration: none;
                  border-radius: 6px;
                  margin: 10px;
                  font-weight: 500;
                  transition: all 0.3s ease;
                }
                .button:hover {
                  background: #f0f0f0;
                }
                .button.secondary {
                  background: transparent;
                  color: white;
                  border: 2px solid white;
                }
                .footer {
                  text-align: center;
                  margin-top: 30px;
                  padding-top: 20px;
                  border-top: 1px solid #eee;
                  color: #666;
                  font-size: 14px;
                }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <div class="logo">Seattle Anti-Freeze</div>
                  <h1>New Connection Request!</h1>
                  <p>Someone wants to connect with you</p>
                </div>

                <div class="connection-card">
                  <div class="profile-icon">
                    👋
                  </div>
                  <div class="sender-name">${sender.name}</div>
                  <div class="sender-email">${sender.email}</div>
                  <p>wants to connect with you on Seattle Anti-Freeze!</p>
                  
                  <div style="margin-top: 25px;">
                    <a href="https://seattle-anti-freeze.com/profile" class="button">
                      View Request
                    </a>
                    <a href="https://seattle-anti-freeze.com/profile/${sender.id}" class="button secondary">
                      View Profile
                    </a>
                  </div>
                </div>

                <h3>Why Connect?</h3>
                <ul>
                  <li>Stay in touch with people from events</li>
                  <li>Get notified about events your connections are attending</li>
                  <li>Build your Seattle social network</li>
                  <li>Find people with similar interests</li>
                </ul>

                <p style="color: #666; font-size: 14px; margin-top: 30px;">
                  You can accept or ignore this request from your profile page. 
                  Connection requests help you build meaningful relationships within the Seattle Anti-Freeze community.
                </p>

                <div class="footer">
                  <p>Questions? Reply to this email or visit our <a href="https://seattle-anti-freeze.com/contact">contact page</a></p>
                  <p>Seattle Anti-Freeze - Fighting the Seattle Freeze, one connection at a time.</p>
                </div>
              </div>
            </body>
          </html>
        `,
        text: `
New Connection Request - Seattle Anti-Freeze

Hi ${recipient.name},

${sender.name} (${sender.email}) wants to connect with you on Seattle Anti-Freeze!

Why Connect?
- Stay in touch with people from events
- Get notified about events your connections are attending  
- Build your Seattle social network
- Find people with similar interests

To accept or ignore this request, visit your profile page:
https://seattle-anti-freeze.com/profile

You can also view ${sender.name}'s profile:
https://seattle-anti-freeze.com/profile/${sender.id}

Connection requests help you build meaningful relationships within the Seattle Anti-Freeze community.

Questions? Reply to this email or contact us.

Seattle Anti-Freeze - Fighting the Seattle Freeze, one connection at a time.
        `
      });

      console.log('Connection request email sent successfully to:', recipient.email);
    } catch (emailError) {
      console.error('Failed to send connection request email:', emailError);
      // Don't fail the connection request if email fails
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Connection request sent!' 
    });

  } catch (error) {
    console.error('Connection error:', error);
    return NextResponse.json(
      { error: 'Failed to send connection request' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { userId } = await request.json();
    const currentUserId = session.user.id || session.user.email;

    // Remove bidirectional connection
    await Promise.all([
      dynamodb.send(new DeleteCommand({
        TableName: config.aws.connectionsTable,
        Key: {
          userId: currentUserId,
          connectedUserId: userId
        }
      })),
      dynamodb.send(new DeleteCommand({
        TableName: config.aws.connectionsTable,
        Key: {
          userId: userId,
          connectedUserId: currentUserId
        }
      }))
    ]);

    return NextResponse.json({ 
      success: true, 
      message: 'Connection removed' 
    });

  } catch (error) {
    console.error('Disconnect error:', error);
    return NextResponse.json(
      { error: 'Failed to remove connection' },
      { status: 500 }
    );
  }
}