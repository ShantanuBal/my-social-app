import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../auth/[...nextauth]/route';
import { dynamodb } from '../../../../../../../lib/dynamodb';
import { QueryCommand } from '@aws-sdk/lib-dynamodb';
import { config } from '../../../../../../../lib/config';

const ADMIN_EMAIL = 'shantanu.r.bal@gmail.com';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ eventId: string }> }
) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email || session.user.email !== ADMIN_EMAIL) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const { eventId } = await params;

  const response = await dynamodb.send(new QueryCommand({
    TableName: config.aws.registrationsTable,
    KeyConditionExpression: 'eventId = :eventId',
    ExpressionAttributeValues: { ':eventId': eventId },
  }));

  const registrations = (response.Items || []).sort(
    (a, b) => new Date(a.registeredAt).getTime() - new Date(b.registeredAt).getTime()
  );

  return NextResponse.json(registrations);
}
