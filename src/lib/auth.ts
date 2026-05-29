import { NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { prisma } from './prisma'

const adminEmails = (process.env.ADMIN_EMAILS || '').split(',').map(e => e.trim().toLowerCase())

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as any,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      if (!user.email?.endsWith('@redscout.com')) return false
      return true
    },
    async session({ session, user }) {
      if (session.user && user) {
        session.user.id = user.id
        const email = user.email?.toLowerCase() || ''
        session.user.role = adminEmails.includes(email) ? 'admin' : 'duo'
      }
      return session
    },
  },
  pages: { signIn: '/login', error: '/login' },
}

export function isAdmin(email: string | null | undefined) {
  return adminEmails.includes((email || '').toLowerCase())
}
