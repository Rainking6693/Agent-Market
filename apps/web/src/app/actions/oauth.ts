'use server';

import crypto from 'crypto';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import { logtoConfig } from '../logto';

const OAUTH_STATE_COOKIE = 'oauth_state';
const OAUTH_PROVIDER_COOKIE = 'oauth_provider';
const OAUTH_STATE_MAX_AGE = 600; // 10 minutes

/**
 * Generate a secure random state parameter for OAuth
 */
function generateState(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Store OAuth state and provider in secure HTTP-only cookies
 */
async function setOAuthState(state: string, provider: 'google' | 'github') {
  const cookieStore = await cookies();
  cookieStore.set(`${OAUTH_STATE_COOKIE}`, state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: OAUTH_STATE_MAX_AGE,
    path: '/',
  });
  cookieStore.set(`${OAUTH_PROVIDER_COOKIE}`, provider, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: OAUTH_STATE_MAX_AGE,
    path: '/',
  });
}

/**
 * Get OAuth state from cookie
 */
export async function getOAuthState(): Promise<string | null> {
  const cookieStore = await cookies();
  const state = cookieStore.get(OAUTH_STATE_COOKIE);
  return state?.value || null;
}

/**
 * Get OAuth provider from cookie
 */
async function getOAuthProvider(): Promise<'google' | 'github' | null> {
  const cookieStore = await cookies();
  const provider = cookieStore.get(OAUTH_PROVIDER_COOKIE);
  const value = provider?.value;
  if (value === 'google' || value === 'github') {
    return value;
  }
  return null;
}

/**
 * Delete OAuth state and provider cookies after validation
 */
export async function deleteOAuthCookies() {
  const cookieStore = await cookies();
  cookieStore.delete(OAUTH_STATE_COOKIE);
  cookieStore.delete(OAUTH_PROVIDER_COOKIE);
}

/**
 * Initiate Google OAuth login with state parameter
 */
export async function initiateGoogleLogin() {
  const state = generateState();
  await setOAuthState(state, 'google');

  const signInUrl = new URL(`${logtoConfig.endpoint}oidc/auth`);
  signInUrl.searchParams.set('client_id', logtoConfig.appId);
  signInUrl.searchParams.set('redirect_uri', `${logtoConfig.baseUrl}/callback`);
  signInUrl.searchParams.set('response_type', 'code');
  signInUrl.searchParams.set('scope', 'openid profile email');
  signInUrl.searchParams.set('prompt', 'consent');
  signInUrl.searchParams.set('interaction_hint', 'google');
  signInUrl.searchParams.set('state', state);

  redirect(signInUrl.toString());
}

/**
 * Initiate GitHub OAuth login with state parameter
 */
export async function initiateGitHubLogin() {
  const state = generateState();
  await setOAuthState(state, 'github');

  const signInUrl = new URL(`${logtoConfig.endpoint}oidc/auth`);
  signInUrl.searchParams.set('client_id', logtoConfig.appId);
  signInUrl.searchParams.set('redirect_uri', `${logtoConfig.baseUrl}/callback`);
  signInUrl.searchParams.set('response_type', 'code');
  signInUrl.searchParams.set('scope', 'openid profile email');
  signInUrl.searchParams.set('prompt', 'consent');
  signInUrl.searchParams.set('interaction_hint', 'github');
  signInUrl.searchParams.set('state', state);

  redirect(signInUrl.toString());
}

/**
 * Validate OAuth state parameter from callback
 * Returns the provider if state is valid, null otherwise
 */
export async function validateOAuthState(
  receivedState: string | null,
): Promise<'google' | 'github' | null> {
  if (!receivedState) {
    return null;
  }

  const storedState = await getOAuthState();
  if (!storedState) {
    return null;
  }

  // Use constant-time comparison to prevent timing attacks
  const isValid = crypto.timingSafeEqual(
    Buffer.from(receivedState),
    Buffer.from(storedState),
  );

  if (!isValid) {
    return null;
  }

  // Get the provider from cookie
  const provider = await getOAuthProvider();
  
  // Delete the state and provider cookies after successful validation
  await deleteOAuthCookies();

  return provider;
}

