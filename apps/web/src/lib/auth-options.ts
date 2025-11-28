import crypto from 'crypto';

import GithubProvider from 'next-auth/providers/github';
import GoogleProvider from 'next-auth/providers/google';

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
  secret: nextAuthSecret,
  session: {
    strategy: 'jwt',
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
