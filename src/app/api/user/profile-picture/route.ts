// app/api/user/profile-picture/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { dynamodb } from '../../../../../lib/dynamodb';
import { s3 } from '../../../../../lib/s3';
import { UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { config } from '../../../../../lib/config';
import sharp from 'sharp';
import convert from 'heic-convert';
import { authOptions } from '../../auth/[...nextauth]/route';

const BUCKET_NAME = config.aws.profilePicturesBucket;

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file type (including HEIC)
    const allowedTypes = [
      'image/jpeg', 
      'image/jpg', 
      'image/png', 
      'image/webp',
      'image/heic',
      'image/heif'
    ];
    
    if (!allowedTypes.includes(file.type) && !file.name.toLowerCase().endsWith('.heic')) {
      return NextResponse.json(
        { error: 'Invalid file type. Please upload JPEG, PNG, WebP, or HEIC images.' },
        { status: 400 }
      );
    }

    // Validate file size (10MB limit - increased for HEIC files which can be larger)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File too large. Please upload images smaller than 10MB.' },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    let buffer: Buffer = Buffer.from(arrayBuffer);

    // Convert HEIC to JPEG if needed
    if (file.type === 'image/heic' || file.type === 'image/heif' || file.name.toLowerCase().endsWith('.heic')) {
      console.log('Converting HEIC to JPEG...');
      try {
        // Convert HEIC to JPEG using heic-convert
        const jpegArrayBuffer = await convert({
          buffer: Buffer.from(arrayBuffer),
          format: 'JPEG',
          quality: 0.9
        });
        
        // Convert ArrayBuffer to Buffer
        buffer = Buffer.from(jpegArrayBuffer);
        console.log('HEIC conversion successful! Original size:', arrayBuffer.byteLength, 'Converted size:', buffer.length);
      } catch (heicError) {
        console.error('HEIC conversion failed:', heicError);
        return NextResponse.json(
          { error: 'Failed to process HEIC image. Please try converting to JPEG first.' },
          { status: 400 }
        );
      }
    }

    // Process image with Sharp - create two versions
    const [processedImage, thumbnailImage] = await Promise.all([
      // Full size version (400x400)
      sharp(buffer)
        .resize(400, 400, {
          fit: 'cover',
          position: 'center'
        })
        .jpeg({
          quality: 85,
          progressive: true
        })
        .toBuffer(),
      
      // Thumbnail version (64x64)
      sharp(buffer)
        .resize(64, 64, {
          fit: 'cover',
          position: 'center'
        })
        .jpeg({
          quality: 80,
          progressive: true
        })
        .toBuffer()
    ]);

    // Generate unique filenames
    const timestamp = Date.now();
    const fullSizeFileName = `profile-pictures/${session.user.id}/${timestamp}.jpg`;
    const thumbnailFileName = `profile-pictures/${session.user.id}/${timestamp}_thumb.jpg`;

    // Upload both versions to S3
    await Promise.all([
      s3.send(new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: fullSizeFileName,
        Body: processedImage,
        ContentType: 'image/jpeg',
        CacheControl: 'max-age=31536000', // 1 year cache
        Metadata: {
          userId: session.user.id,
          originalName: file.name,
          uploadedAt: new Date().toISOString(),
          imageType: 'full'
        }
      })),
      
      s3.send(new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: thumbnailFileName,
        Body: thumbnailImage,
        ContentType: 'image/jpeg',
        CacheControl: 'max-age=31536000', // 1 year cache
        Metadata: {
          userId: session.user.id,
          originalName: file.name,
          uploadedAt: new Date().toISOString(),
          imageType: 'thumbnail'
        }
      }))
    ]);

    // Generate S3 URLs
    const fullSizeUrl = `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION || 'us-west-2'}.amazonaws.com/${fullSizeFileName}`;
    const thumbnailUrl = `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION || 'us-west-2'}.amazonaws.com/${thumbnailFileName}`;

    // Update user profile with both avatar URLs
    await dynamodb.send(new UpdateCommand({
      TableName: config.aws.usersTable,
      Key: { id: session.user.id },
      UpdateExpression: 'SET avatar = :avatar, avatarThumbnail = :avatarThumbnail, updatedAt = :updatedAt',
      ExpressionAttributeValues: {
        ':avatar': fullSizeUrl,
        ':avatarThumbnail': thumbnailUrl,
        ':updatedAt': new Date().toISOString()
      }
    }));

    return NextResponse.json({
      success: true,
      message: 'Profile picture updated successfully',
      imageUrl: fullSizeUrl,
      thumbnailUrl: thumbnailUrl
    });

  } catch (error) {
    console.error('Profile picture upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload profile picture' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Remove both avatar fields from user profile
    await dynamodb.send(new UpdateCommand({
      TableName: config.aws.usersTable,
      Key: { id: session.user.id },
      UpdateExpression: 'REMOVE avatar, avatarThumbnail SET updatedAt = :updatedAt',
      ExpressionAttributeValues: {
        ':updatedAt': new Date().toISOString()
      }
    }));

    return NextResponse.json({
      success: true,
      message: 'Profile picture removed successfully'
    });

  } catch (error) {
    console.error('Profile picture removal error:', error);
    return NextResponse.json(
      { error: 'Failed to remove profile picture' },
      { status: 500 }
    );
  }
}