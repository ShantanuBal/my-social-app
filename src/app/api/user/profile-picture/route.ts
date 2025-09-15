// app/api/user/profile-picture/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { dynamodb } from '../../../../../lib/dynamodb';
import { s3 } from '../../../../../lib/s3';
import { UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { config } from '../../../../../lib/config';
import sharp from 'sharp';
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

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Please upload JPEG, PNG, or WebP images.' },
        { status: 400 }
      );
    }

    // Validate file size (5MB limit)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File too large. Please upload images smaller than 5MB.' },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

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