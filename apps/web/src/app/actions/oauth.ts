'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import { logtoConfig } from '../logto';

const OAUTH_PROVIDER_COOKIE = 'oauth_provider';
const OAUTH_PROVIDER_MAX_AGE = 600; // 10 minutes

/**
 * Store OAuth provider in secure HTTP-only cookie for tracking
 * Note: Logto handles state parameter internally, so we don't need to manage it
 */
async function setOAuthProvider(provider: 'google' | 'github') {
  const cookieStore = await cookies();
  cookieStore.set(OAUTH_PROVIDER_COOKIE, provider, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: OAUTH_PROVIDER_MAX_AGE,
    path: '/',
  });
}

/**
 * Get OAuth provider from cookie
 */
export async function getOAuthProvider(): Promise<'google' | 'github' | null> {
  const cookieStore = await cookies();
  const provider = cookieStore.get(OAUTH_PROVIDER_COOKIE);
  const value = provider?.value;
  if (value === 'google' || value === 'github') {
    return value;
  }
  return null;
}

/**
 * Delete OAuth provider cookie after use
 */
export async function deleteOAuthProvider() {
  const cookieStore = await cookies();
  cookieStore.delete(OAUTH_PROVIDER_COOKIE);
}

/**
 * Initiate Google OAuth login
 * Logto handles state parameter internally, so we don't add our own
 */
export async function initiateGoogleLogin() {
  // Store provider for tracking (optional, for analytics/logging)
  await setOAuthProvider('google');

  const signInUrl = new URL(`${logtoConfig.endpoint}oidc/auth`);
  signInUrl.searchParams.set('client_id', logtoConfig.appId);
  signInUrl.searchParams.set('redirect_uri', `${logtoConfig.baseUrl}/callback`);
  signInUrl.searchParams.set('response_type', 'code');
  signInUrl.searchParams.set('scope', 'openid profile email');
  signInUrl.searchParams.set('prompt', 'consent');
  signInUrl.searchParams.set('interaction_hint', 'google');
  // Note: We don't add 'state' parameter - Logto handles it internally

  redirect(signInUrl.toString());
}

/**
 * Initiate GitHub OAuth login
 * Logto handles state parameter internally, so we don't add our own
 */
export async function initiateGitHubLogin() {
  // Store provider for tracking (optional, for analytics/logging)
  await setOAuthProvider('github');

  const signInUrl = new URL(`${logtoConfig.endpoint}oidc/auth`);
  signInUrl.searchParams.set('client_id', logtoConfig.appId);
  signInUrl.searchParams.set('redirect_uri', `${logtoConfig.baseUrl}/callback`);
  signInUrl.searchParams.set('response_type', 'code');
  signInUrl.searchParams.set('scope', 'openid profile email');
  signInUrl.searchParams.set('prompt', 'consent');
  signInUrl.searchParams.set('interaction_hint', 'github');
  // Note: We don't add 'state' parameter - Logto handles it internally

  redirect(signInUrl.toString());
}

