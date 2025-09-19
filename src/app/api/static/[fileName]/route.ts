// app/api/static/[fileName]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { s3 } from '../../../../../lib/s3';
import { config } from '../../../../../lib/config';

const BUCKET_NAME = config.aws.staticFilesBucket;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ fileName: string }> }
) {
  try {
    const { fileName } = await params;
    
    // Decode the URL parameter
    const decodedFileName = decodeURIComponent(fileName);
    
    // For static files, we can use the filename/path directly as the S3 key
    // You can organize them in folders like: team/john-doe.jpg, events/banner.jpg, logos/main-logo.png
    let s3Key: string;
    
    if (decodedFileName.startsWith('http')) {
      // If it's a full URL, extract the key part
      const url = new URL(decodedFileName);
      const pathname = url.pathname;
      s3Key = pathname.startsWith('/') ? pathname.slice(1) : pathname;
    } else {
      // If it's just a filename, use it directly (you can add a prefix if needed)
      s3Key = decodedFileName;
    }
    
    console.log('Static file S3 Key:', s3Key);
    
    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: s3Key,
    });

    // Generate signed URL that expires in 24 hours (longer for static files)
    const signedUrl = await getSignedUrl(s3, command, { expiresIn: 86400 });

    return NextResponse.json({ signedUrl });

  } catch (error) {
    console.error('Error generating signed URL for static file:', error);
    return NextResponse.json(
      { error: 'Failed to generate signed URL for static file' },
      { status: 500 }
    );
  }
}