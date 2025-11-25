'use server';

import { getLogtoContext, signIn, signOut } from '@logto/next/server-actions';

import { logtoConfig } from '../logto';

/**
 * Server action to get authentication status
 */
export async function getAuthStatus() {
  const { isAuthenticated, claims } = await getLogtoContext(logtoConfig);
  return {
    isAuthenticated,
    user: claims
      ? {
          id: claims.sub || '',
          email: (claims.email as string) || '',
          displayName: (claims.name as string) || (claims.username as string) || '',
        }
      : null,
  };
}

/**
 * Server action to sign in
 * This redirects to Logto's sign-in page
 */
export async function handleSignIn() {
  await signIn(logtoConfig);
}

/**
 * Server action to sign out
 */
export async function handleSignOut() {
  await signOut(logtoConfig);
}

