import NextAuth from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import FacebookProvider from 'next-auth/providers/facebook'
import CredentialsProvider from 'next-auth/providers/credentials'
import { QueryCommand } from '@aws-sdk/lib-dynamodb'
import { dynamodb } from '../../../../../lib/dynamodb'
import { config } from '../../../../../lib/config'
import bcrypt from 'bcryptjs'

// console.log('NEXTAUTH_SECRET:', process.env.NEXTAUTH_SECRET ? 'EXISTS' : 'MISSING')
// console.log('NEXTAUTH_URL:', process.env.NEXTAUTH_URL)

const handler = NextAuth({
  // Remove the adapter for now - use JWT sessions instead
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    FacebookProvider({
      clientId: process.env.FACEBOOK_CLIENT_ID!,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET!,
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
            name: user.name,
            image: user.image,
          }
        } catch (error) {
          console.error('Auth error:', error)
          return null
        }
      }
    })
  ],
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/auth/signin',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string
      }
      return session
    },
  },
})

export { handler as GET, handler as POST }