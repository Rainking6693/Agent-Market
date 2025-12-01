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
    strategy: 'database', // Use database sessions with PrismaAdapter
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
    async session({ session, user }) {
      // user is the Prisma User model when using database sessions
      if (session.user && user) {
        session.user.id = user.id;
        session.user.email = user.email;
        session.user.name = (user as { displayName?: string }).displayName ?? user.name ?? user.email;
        session.user.image = user.image ?? undefined;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
    error: '/auth/error',
  },
};
