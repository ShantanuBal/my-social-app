import { NextRequest, NextResponse } from 'next/server'
import { dynamodb } from '../../../../../lib/dynamodb'
import { config } from '../../../../../lib/config'
import { PutCommand, QueryCommand } from '@aws-sdk/lib-dynamodb'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    const { name, email, password } = await request.json()

    // Validation
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Name, email, and password are required' },
        { status: 400 }
      )
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters' },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await dynamodb.send(new QueryCommand({
      TableName: config.aws.usersTable,
      IndexName: 'email-index',
      KeyConditionExpression: 'email = :email',
      ExpressionAttributeValues: {
        ':email': email
      }
    }))

    if (existingUser.Items && existingUser.Items.length > 0) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create user
    const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    await dynamodb.send(new PutCommand({
      TableName: config.aws.usersTable,
      Item: {
        id: userId,
        email,
        name,
        hashedPassword,
        emailVerified: null,
        image: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
    }))

    return NextResponse.json(
      { message: 'User created successfully', userId },
      { status: 201 }
    )
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Registration failed' },
      { status: 500 }
    )
  }
}