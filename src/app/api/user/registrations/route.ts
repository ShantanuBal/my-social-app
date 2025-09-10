import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { dynamodb } from '../../../../../lib/dynamodb'
import { config } from '../../../../../lib/config'
import { QueryCommand, GetCommand } from '@aws-sdk/lib-dynamodb'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession()
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Query all registrations for this user (by email)
    const response = await dynamodb.send(new QueryCommand({
      TableName: config.aws.registrationsTable,
      IndexName: 'email-index', // We'll need to add this GSI
      KeyConditionExpression: 'email = :email',
      ExpressionAttributeValues: {
        ':email': session.user.email,
      },
    }))

    // Enrich with event details
    const registrations = await Promise.all(
      (response.Items || []).map(async (registration) => {
        try {
          const eventResponse = await dynamodb.send(new GetCommand({
            TableName: config.aws.eventsTable,
            Key: { id: registration.eventId },
          }))
          
          return {
            ...registration,
            eventTitle: eventResponse.Item?.title,
          }
        } catch (error) {
          return registration
        }
      })
    )

    return NextResponse.json(registrations)
  } catch (error) {
    console.error('Error fetching user registrations:', error)
    return NextResponse.json(
      { error: 'Failed to fetch registrations' },
      { status: 500 }
    )
  }
}