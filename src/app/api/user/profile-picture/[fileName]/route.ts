// app/api/user/profile-picture/[fileName]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { s3 } from '../../../../../../lib/s3';
import { config } from '../../../../../../lib/config';
import { authOptions } from '../../../auth/[...nextauth]/route';

const BUCKET_NAME = config.aws.profilePicturesBucket;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ fileName: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { fileName } = await params;
    
    // Decode the URL parameter
    const decodedUrl = decodeURIComponent(fileName);
    
    // Extract S3 key from the full URL
    let s3Key: string;
    
    if (decodedUrl.startsWith('http')) {
      // If it's a full URL, extract the key part
      const url = new URL(decodedUrl);
      const pathname = url.pathname;
      // Remove leading slash and extract key
      s3Key = pathname.startsWith('/') ? pathname.slice(1) : pathname;
    } else {
      // If it's already just the key, use it directly
      s3Key = decodedUrl;
    }
    
    console.log('Extracted S3 Key:', s3Key);
    
    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: s3Key,
    });

    // Generate signed URL that expires in 1 hour
    const signedUrl = await getSignedUrl(s3, command, { expiresIn: 3600 });

    return NextResponse.json({ signedUrl });

  } catch (error) {
    console.error('Error generating signed URL:', error);
    return NextResponse.json(
      { error: 'Failed to generate signed URL' },
      { status: 500 }
    );
  }
}