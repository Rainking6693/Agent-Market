'use server';

import { signIn } from '@logto/next/server-actions';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import { logtoConfig, isLogtoConfigured } from '../logto';

const OAUTH_PROVIDER_COOKIE = 'oauth_provider';
const OAUTH_PROVIDER_MAX_AGE = 600; // 10 minutes

/**
 * Get cookie domain for production
 */
function getCookieDomain(): string | undefined {
  if (process.env.NODE_ENV === 'production') {
    // Use .swarmsync.ai to cover both www and non-www
    // For Netlify, we'd need to detect the hostname, but cookies() API
    // in Next.js handles domain automatically based on request
    return '.swarmsync.ai';
  }
  return undefined; // localhost
}

/**
 * Store OAuth provider in secure HTTP-only cookie for tracking
 */
async function setOAuthProvider(provider: 'google' | 'github') {
  const cookieStore = await cookies();
  const cookieDomain = getCookieDomain();
  
  cookieStore.set(OAUTH_PROVIDER_COOKIE, provider, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: OAUTH_PROVIDER_MAX_AGE,
    path: '/',
    ...(cookieDomain && { domain: cookieDomain }),
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
 * Get hardcoded redirect URI to prevent undefined/empty state
 * This ensures the state parameter is always properly set
 * 
 * CRITICAL: Must return a valid URL string, never undefined or empty
 */
function getRedirectUri(): string {
  // Hardcode production URL to prevent undefined/empty state
  if (process.env.NODE_ENV === 'production') {
    // Use environment variable if set, otherwise default to swarmsync.ai
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://swarmsync.ai';
    // Ensure it's a valid URL (no trailing slash, proper protocol)
    const cleanUrl = baseUrl.replace(/\/$/, '');
    return `${cleanUrl}/callback`;
  }
  // Development - always return a valid URL
  const devUrl = process.env.WEB_URL || 'http://localhost:3000';
  return `${devUrl}/callback`;
}

/**
 * Initiate Google OAuth login using Logto's signIn() function
 * This properly handles state generation and PKCE
 * 
 * CRITICAL: This must be called only once per click to prevent empty state
 */
export async function initiateGoogleLogin() {
  // Check if Logto is properly configured
  if (!isLogtoConfigured) {
    console.error('Logto is not properly configured. Please check your environment variables.');
    redirect('/auth/error?message=' + encodeURIComponent('Authentication service is not configured. Please contact support.'));
    return;
  }

  // Store provider for tracking
  await setOAuthProvider('google');

  // Hardcode redirect URI to prevent undefined/empty state
  const redirectUri = getRedirectUri();
  
  console.log('Initiating Google OAuth with Logto signIn():', {
    redirectUri,
    baseUrl: logtoConfig.baseUrl,
    endpoint: logtoConfig.endpoint,
    nodeEnv: process.env.NODE_ENV,
    isConfigured: isLogtoConfigured,
  });

  // Validate redirectUri is not empty (critical for state generation)
  if (!redirectUri || redirectUri.trim() === '') {
    throw new Error('Redirect URI cannot be empty - this would cause empty state parameter');
  }

  try {
    // Use Logto's signIn() function which handles state and PKCE automatically
    // Note: Logto SDK's signIn() handles state generation internally
    // If interaction_hint is needed, user will select Google on Logto's sign-in page
    await signIn(logtoConfig, {
      redirectUri,
    });
    
    // signIn() will redirect via Next.js redirect(), so this line should never execute
    // But we include it as a fallback
    redirect(redirectUri);
  } catch (error) {
    console.error('Failed to initiate Google login:', error);
    await deleteOAuthProvider();
    const errorMessage = error instanceof Error ? error.message : 'Failed to initiate Google login';
    redirect('/auth/error?message=' + encodeURIComponent(errorMessage));
  }
}

/**
 * Initiate GitHub OAuth login using Logto's signIn() function
 * This properly handles state generation and PKCE
 * 
 * CRITICAL: This must be called only once per click to prevent empty state
 */
export async function initiateGitHubLogin() {
  // Check if Logto is properly configured
  if (!isLogtoConfigured) {
    console.error('Logto is not properly configured. Please check your environment variables.');
    redirect('/auth/error?message=' + encodeURIComponent('Authentication service is not configured. Please contact support.'));
    return;
  }

  // Store provider for tracking
  await setOAuthProvider('github');

  // Hardcode redirect URI to prevent undefined/empty state
  const redirectUri = getRedirectUri();
  
  console.log('Initiating GitHub OAuth with Logto signIn():', {
    redirectUri,
    baseUrl: logtoConfig.baseUrl,
    endpoint: logtoConfig.endpoint,
    nodeEnv: process.env.NODE_ENV,
    isConfigured: isLogtoConfigured,
  });

  // Validate redirectUri is not empty (critical for state generation)
  if (!redirectUri || redirectUri.trim() === '') {
    throw new Error('Redirect URI cannot be empty - this would cause empty state parameter');
  }

  try {
    // Use Logto's signIn() function which handles state and PKCE automatically
    await signIn(logtoConfig, {
      redirectUri,
    });
    
    // signIn() will redirect via Next.js redirect(), so this line should never execute
    // But we include it as a fallback
    redirect(redirectUri);
  } catch (error) {
    console.error('Failed to initiate GitHub login:', error);
    await deleteOAuthProvider();
    const errorMessage = error instanceof Error ? error.message : 'Failed to initiate GitHub login';
    redirect('/auth/error?message=' + encodeURIComponent(errorMessage));
  }
}

