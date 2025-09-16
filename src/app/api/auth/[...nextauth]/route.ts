import NextAuth, { AuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import FacebookProvider from 'next-auth/providers/facebook'
import CredentialsProvider from 'next-auth/providers/credentials'
import { QueryCommand, PutCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb'
import { dynamodb } from '../../../../../lib/dynamodb'
import { config } from '../../../../../lib/config'
import bcrypt from 'bcryptjs'
import { v4 as uuidv4 } from 'uuid'

// console.log('NEXTAUTH_SECRET:', process.env.NEXTAUTH_SECRET ? 'EXISTS' : 'MISSING')
// console.log('NEXTAUTH_URL:', process.env.NEXTAUTH_URL)

export const authOptions: AuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.picture,
          firstName: profile.given_name,
          lastName: profile.family_name,
          provider: 'google',
          providerId: profile.sub,
        }
      },
    }),
    FacebookProvider({
      clientId: process.env.FACEBOOK_CLIENT_ID!,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET!,
      profile(profile) {
        return {
          id: profile.id,
          name: profile.name,
          email: profile.email,
          image: profile.picture?.data?.url,
          firstName: profile.first_name,
          lastName: profile.last_name,
          provider: 'facebook',
          providerId: profile.id,
        }
      },
    }),
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        try {
          // Look up user by email using GSI
          const response = await dynamodb.send(new QueryCommand({
            TableName: config.aws.usersTable,
            IndexName: 'email-index',
            KeyConditionExpression: 'email = :email',
            ExpressionAttributeValues: {
              ':email': credentials.email
            }
          }))

          const user = response.Items?.[0]
          if (!user || !user.hashedPassword) {
            return null
          }

          // Check password
          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.hashedPassword
          )

          if (!isPasswordValid) {
            return null
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim(),
            image: user.avatar, // Use avatar field for NextAuth image
            firstName: user.firstName,
            lastName: user.lastName,
            provider: 'credentials',
          }
        } catch (error) {
          console.error('Auth error:', error)
          return null
        }
      }
    })
  ],
  session: {
    strategy: 'jwt' as const,
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      // Handle social login user creation/updates
      if (account?.provider === 'google' || account?.provider === 'facebook') {
        try {
          // Check if user exists by email
          const existingUserResponse = await dynamodb.send(new QueryCommand({
            TableName: config.aws.usersTable,
            IndexName: 'email-index',
            KeyConditionExpression: 'email = :email',
            ExpressionAttributeValues: {
              ':email': user.email!
            }
          }))

          const existingUser = existingUserResponse.Items?.[0]

          if (!existingUser) {
            // Create new user record
            const newUserId = uuidv4()
            const userData = {
              id: newUserId,
              email: user.email!,
              firstName: user.firstName || '',
              lastName: user.lastName || '',
              name: user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim(),
              avatar: user.image || '', // Social login profile picture as avatar
              avatarThumbnail: user.image || '', // Use same image for thumbnail initially
              authProvider: account.provider,
              authProviderId: account.providerAccountId,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              // Don't set hashedPassword for social logins
              emailVerified: true, // Social logins are pre-verified
            }

            await dynamodb.send(new PutCommand({
              TableName: config.aws.usersTable,
              Item: userData
            }))

            // Update user object with the new ID for the session
            user.id = newUserId
          } else {
            // Update existing user with social login info if needed
            const updates: any = {
              updatedAt: new Date().toISOString(),
            }

            // Update profile picture if we got a better one from social login
            if (user.image && !existingUser.avatar) {
              updates.avatar = user.image
              updates.avatarThumbnail = user.image // Use same image for thumbnail initially
            }

            // Link social account if not already linked
            if (!existingUser.authProvider || existingUser.authProvider !== account.provider) {
              updates.authProvider = account.provider
              updates.authProviderId = account.providerAccountId
            }

            if (Object.keys(updates).length > 1) { // More than just updatedAt
              await dynamodb.send(new UpdateCommand({
                TableName: config.aws.usersTable,
                Key: { id: existingUser.id },
                UpdateExpression: `SET ${Object.keys(updates).map(key => `#${key} = :${key}`).join(', ')}`,
                ExpressionAttributeNames: Object.keys(updates).reduce((acc, key) => {
                  acc[`#${key}`] = key
                  return acc
                }, {} as Record<string, string>),
                ExpressionAttributeValues: Object.keys(updates).reduce((acc, key) => {
                  acc[`:${key}`] = updates[key]
                  return acc
                }, {} as Record<string, any>)
              }))
            }

            // Use existing user ID
            user.id = existingUser.id
            user.firstName = existingUser.firstName
            user.lastName = existingUser.lastName
          }
        } catch (error) {
          console.error('Error handling social login:', error)
          return false
        }
      }
      return true
    },
    async jwt({ token, user, account }) {
      // console.log('JWT callback - user:', user);
      // console.log('JWT callback - token before:', token);

      if (user) {
        token.id = user.id
        token.firstName = user.firstName
        token.lastName = user.lastName
        token.provider = user.provider || account?.provider
      }
      // console.log('JWT callback - token after:', token);
      return token
    },
    async session({ session, token }) {
      // console.log('Session callback - token:', token);
      // console.log('Session callback - session before:', session);

      if (token && session.user) {
        session.user.id = token.id as string
        session.user.firstName = token.firstName as string
        session.user.lastName = token.lastName as string
        session.user.provider = token.provider as string
      }
      // console.log('Session callback - session after:', session);
      return session
    },
  },
}

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };