import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { dynamodb } from '../../../../../lib/dynamodb';
import { ScanCommand } from '@aws-sdk/lib-dynamodb';
import { config } from '../../../../../lib/config';

const ADMIN_EMAIL = 'shantanu.r.bal@gmail.com';

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email || session.user.email !== ADMIN_EMAIL) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const response = await dynamodb.send(new ScanCommand({
    TableName: config.aws.eventsTable,
  }));

  const events = (response.Items || []).sort((a, b) => a.date.localeCompare(b.date));

  return NextResponse.json(events);
}
