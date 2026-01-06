import crypto from 'crypto';

import { PrismaAdapter } from '@next-auth/prisma-adapter';
import GithubProvider from 'next-auth/providers/github';
import GoogleProvider from 'next-auth/providers/google';

import { prisma } from './prisma';

import type { NextAuthOptions } from 'next-auth';

function resolveEnv(
  label: string,
  keys: string[],
  fallbackValue: string,
) {
  for (const key of keys) {
    const val = process.env[key];
    if (val) {
      return val;
    }
  }
  console.warn(
    `[auth] ${label} is not set. Checked: ${keys.join(
      ', ',
    )}. Using fallback; set the real secret in env for production.`,
  );
  return fallbackValue;
}

const googleClientId =
  process.env.GOOGLE_CLIENT_ID ||
  process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ||
  'missing-google-client-id';

const googleClientSecret =
  process.env.GOOGLE_CLIENT_SECRET ||
  process.env.NEXT_PUBLIC_GOOGLE_CLIENT_SECRET ||
  'missing-google-client-secret';

const githubClientId =
  process.env.GITHUB_CLIENT_ID ||
  process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID ||
  process.env.GITHUB_ID ||
  'missing-github-client-id';

const githubClientSecret =
  process.env.GITHUB_CLIENT_SECRET ||
  process.env.NEXT_PUBLIC_GITHUB_CLIENT_SECRET ||
  process.env.GITHUB_SECRET ||
  'missing-github-client-secret';

const nextAuthSecret =
  process.env.NEXTAUTH_SECRET ||
  process.env.JWT_SECRET ||
  (process.env.NODE_ENV === 'production' ? 'prod-fallback-stable-secret-32-chars' : 'development-secret');

if (process.env.NODE_ENV === 'production' && !process.env.NEXTAUTH_SECRET) {
  console.error('[auth] CRITICAL: NEXTAUTH_SECRET is not set in Netlify environment variables!');
}

if (!process.env.DATABASE_URL) {
  console.error('[auth] CRITICAL: DATABASE_URL is not set. All database-backed auth will fail!');
} else {
  console.log('[auth] DATABASE_URL is present.');
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  secret: nextAuthSecret,
  debug: process.env.NODE_ENV === 'development',
  session: {
    strategy: 'jwt', // Use JWT sessions for faster middleware checks
  },
  providers: [
    GoogleProvider({
      clientId: googleClientId,
      clientSecret: googleClientSecret,
    }),
    GithubProvider({
      clientId: githubClientId,
      clientSecret: githubClientSecret,
    }),
  ],
  callbacks: {
    async redirect({ url, baseUrl }) {
      console.log('[Auth] Redirect callback called with url:', url, 'baseUrl:', baseUrl);
      // Allows relative callback URLs
      if (url.startsWith('/')) return `${baseUrl}${url}`;
      // Allows callback URLs on the same origin
      else if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
    async signIn({ user, profile }) {
      console.log('[Auth] signIn callback starting for:', user.email);
      try {
        // Normalize display name for our Prisma schema
        const displayName =
          (profile as { name?: string })?.name ??
          user.name ??
          user.email ??
          'User';

        if (!user.email) {
          console.error('[Auth] signIn failed: No email provided by provider');
          return false;
        }

        console.log('[Auth] Upserting user into database...');
        // Upsert the user into our Prisma User table to satisfy API FKs
        const updatedUser = await prisma.user.upsert({
          where: { email: user.email! },
          update: {
            displayName,
            image: user.image ?? null,
            emailVerified: new Date(),
          },
          create: {
            email: user.email!,
            displayName,
            image: user.image ?? null,
            emailVerified: new Date(),
            password: null,
            role: 'user',
            betaAccess: false,
            providerBeta: false,
          },
        });
        console.log('[Auth] User upserted successfully:', updatedUser.id);
        return true;
      } catch (error) {
        console.error('[Auth] CRITICAL ERROR in signIn callback:', error);
        // If we're in production, we might want to return true anyway 
        // if we want to allow social login even if DB upsert fails, 
        // but that will break subsequent steps.
        return false;
      }
    },
    async jwt({ token, user, trigger }) {
      console.log('[JWT Callback] Called with trigger:', trigger, 'user:', user ? 'EXISTS' : 'NULL');
      console.log('[JWT Callback] Token email:', token.email);

      // On sign in or update, add custom fields to JWT
      if (user || trigger === 'update') {
        console.log('[JWT Callback] Fetching fresh user data from database...');

        // Fetch fresh user data from database
        const dbUser = await prisma.user.findUnique({
          where: { email: token.email! },
          select: {
            id: true,
            email: true,
            displayName: true,
            image: true,
            role: true,
            betaAccess: true,
            providerBeta: true,
          },
        });

        console.log('[JWT Callback] DB User:', dbUser ? JSON.stringify(dbUser, null, 2) : 'NULL');

        if (dbUser) {
          token.id = dbUser.id;
          token.email = dbUser.email;
          token.name = dbUser.displayName;
          token.picture = dbUser.image ?? undefined;
          token.role = dbUser.role;
          token.betaAccess = dbUser.betaAccess;
          token.providerBeta = dbUser.providerBeta;
          token.isNewUser = trigger === 'signUp';

          console.log('[JWT Callback] SUCCESSFULLY updated token for:', token.email, {
            role: token.role,
            betaAccess: token.betaAccess,
          });
        }
      } else {
        console.log('[JWT Callback] Returning existing token (no fetch)');
        console.log('[JWT Callback] Existing token values:', {
          role: token.role,
          betaAccess: token.betaAccess,
          providerBeta: token.providerBeta,
        });
      }
      return token;
    },
    async session({ session, token }) {
      // Add custom fields from JWT to session
      if (session.user) {
        session.user.id = token.id as string;
        session.user.email = token.email!;
        session.user.name = token.name!;
        session.user.image = token.picture;
        session.user.role = token.role;
        session.user.betaAccess = token.betaAccess;
        session.user.providerBeta = token.providerBeta;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
    error: '/auth/error',
  },
};
