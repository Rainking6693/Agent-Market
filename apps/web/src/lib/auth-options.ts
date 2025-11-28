import crypto from 'crypto';

import GithubProvider from 'next-auth/providers/github';
import GoogleProvider from 'next-auth/providers/google';

import type { NextAuthOptions } from 'next-auth';

function requireEnv(value: string | undefined, name: string) {
  if (!value) {
    throw new Error(`${name} is not set`);
  }
  return value;
}

const googleClientId =
  process.env.GOOGLE_CLIENT_ID ?? process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;

const githubClientId =
  process.env.GITHUB_ID ??
  process.env.GITHUB_CLIENT_ID ??
  process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID;
const githubClientSecret =
  process.env.GITHUB_SECRET ?? process.env.GITHUB_CLIENT_SECRET;

const nextAuthSecret =
  process.env.NEXTAUTH_SECRET ??
  process.env.JWT_SECRET ??
  crypto.randomBytes(32).toString('hex');

if (!process.env.NEXTAUTH_SECRET) {
  console.warn(
    'NEXTAUTH_SECRET is not set; using fallback secret. Set NEXTAUTH_SECRET in your environment for stable sessions.',
  );
}

export const authOptions: NextAuthOptions = {
  secret: nextAuthSecret,
  session: {
    strategy: 'jwt',
  },
  providers: [
    GoogleProvider({
      clientId: requireEnv(googleClientId, 'GOOGLE_CLIENT_ID'),
      clientSecret: requireEnv(
        googleClientSecret,
        'GOOGLE_CLIENT_SECRET',
      ),
    }),
    GithubProvider({
      clientId: requireEnv(githubClientId, 'GITHUB_CLIENT_ID'),
      clientSecret: requireEnv(
        githubClientSecret,
        'GITHUB_CLIENT_SECRET',
      ),
    }),
  ],
  callbacks: {
    async jwt({ token, account, profile }) {
      if (account?.provider && profile) {
        token.provider = account.provider;
        token.name = profile.name ?? token.name;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id =
          (token.sub as string | undefined) ??
          session.user.id ??
          session.user.email ??
          '';
        session.user.provider = token.provider as string | undefined;
      }
      return session;
    },
  },
};
