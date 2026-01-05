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

const googleClientId = resolveEnv(
  'GOOGLE_CLIENT_ID',
  [
    'GOOGLE_CLIENT_ID',
    'NEXT_PUBLIC_GOOGLE_CLIENT_ID',
    'NEXT_PUBLIC_GOOGLE_OAUTH_CLIENT_ID',
  ],
  'missing-google-client-id',
);

const googleClientSecret = resolveEnv(
  'GOOGLE_CLIENT_SECRET',
  [
    'GOOGLE_CLIENT_SECRET',
    'GOOGLE_OAUTH_CLIENT_SECRET',
    'NEXT_PUBLIC_GOOGLE_CLIENT_SECRET',
  ],
  'missing-google-client-secret',
);

const githubClientId = resolveEnv(
  'GITHUB_CLIENT_ID',
  ['GITHUB_ID', 'GITHUB_CLIENT_ID', 'NEXT_PUBLIC_GITHUB_CLIENT_ID'],
  'missing-github-client-id',
);

const githubClientSecret = resolveEnv(
  'GITHUB_CLIENT_SECRET',
  ['GITHUB_SECRET', 'GITHUB_CLIENT_SECRET', 'NEXT_PUBLIC_GITHUB_CLIENT_SECRET'],
  'missing-github-client-secret',
);

const nextAuthSecret = resolveEnv(
  'NEXTAUTH_SECRET',
  ['NEXTAUTH_SECRET', 'JWT_SECRET'],
  crypto.randomBytes(32).toString('hex'),
);

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  secret: nextAuthSecret,
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
      console.log('[Redirect Callback] url:', url, 'baseUrl:', baseUrl);

      // Starts with slash = relative callback URL (like /invite/abc123)
      if (url.startsWith('/')) {
        const redirectUrl = `${baseUrl}${url}`;
        console.log('[Redirect Callback] Allowing relative URL, redirecting to:', redirectUrl);
        return redirectUrl;
      }

      // Starts with baseUrl = same origin URL
      if (url.startsWith(baseUrl)) {
        console.log('[Redirect Callback] Allowing same-origin URL:', url);
        return url;
      }

      // Default to base URL for safety (prevents open redirects)
      console.log('[Redirect Callback] Falling back to baseUrl:', baseUrl);
      return baseUrl;
    },
    async signIn({ user, profile }) {
      // Normalize display name for our Prisma schema
      const displayName =
        (profile as { name?: string })?.name ??
        user.name ??
        user.email ??
        'User';

      // Upsert the user into our Prisma User table to satisfy API FKs
      await prisma.user.upsert({
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
      return true;
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

          console.log('[JWT Callback] Updated token with:', {
            role: token.role,
            betaAccess: token.betaAccess,
            providerBeta: token.providerBeta,
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
