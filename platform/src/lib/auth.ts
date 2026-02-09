import type { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { verifyPassword, createUser, emailExists } from '@/models/user'
import { registerSchema, loginSchema } from '@/lib/validations'

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      id: 'credentials',
      name: 'Email and Password',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
        name: { label: 'Name', type: 'text' },
        isRegistration: { label: 'Is Registration', type: 'hidden' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email and password are required')
        }

        const isRegistration = credentials.isRegistration === 'true'

        if (isRegistration) {
          // Validate registration input with Zod
          const result = registerSchema.safeParse({
            email: credentials.email,
            name: credentials.name,
            password: credentials.password,
          })

          if (!result.success) {
            throw new Error(result.error.issues[0].message)
          }

          const exists = await emailExists(result.data.email)
          if (exists) {
            throw new Error('An account with this email already exists')
          }

          const user = await createUser({
            email: result.data.email,
            password: result.data.password,
            name: result.data.name,
          })

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            image: user.image,
          }
        } else {
          // Validate login input with Zod
          const result = loginSchema.safeParse({
            email: credentials.email,
            password: credentials.password,
          })

          if (!result.success) {
            throw new Error(result.error.issues[0].message)
          }

          const user = await verifyPassword(result.data.email, result.data.password)

          if (!user) {
            throw new Error('Invalid email or password')
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            image: user.image,
          }
        }
      },
    }),
  ],
  pages: {
    signIn: '/login',
    error: '/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.email = user.email
        token.name = user.name
        token.picture = user.image
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.email = token.email as string
        session.user.name = token.name as string
        session.user.image = token.picture as string | undefined
      }
      return session
    },
  },
}

// Type augmentation for NextAuth
declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      email: string
      name: string
      image?: string
    }
  }

  interface User {
    id: string
    email: string
    name: string
    image?: string
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
  }
}
