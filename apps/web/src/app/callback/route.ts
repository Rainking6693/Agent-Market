import { handleSignIn } from '@logto/next/server-actions';
import { redirect } from 'next/navigation';
import { NextRequest } from 'next/server';

import { deleteOAuthCookies, getOAuthState, validateOAuthState } from '../actions/oauth';
import { logtoConfig } from '../logto';

/**
 * OAuth callback route handler
 * This is called by Logto after user authentication
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;

  // Log configuration for debugging
  console.log('Logto callback received:', {
    url: request.url,
    searchParams: Object.fromEntries(searchParams.entries()),
    logtoConfig: {
      endpoint: logtoConfig.endpoint,
      appId: logtoConfig.appId,
      baseUrl: logtoConfig.baseUrl,
      // Don't log secrets
    },
  });

  // Check for OAuth error in query params
  const error = searchParams.get('error');
  const errorDescription = searchParams.get('error_description');
  if (error) {
    console.error('OAuth error from Logto:', { error, errorDescription });
    redirect(`/auth/error?message=${encodeURIComponent(errorDescription || error)}`);
  }

  // Validate state parameter for CSRF protection
  const receivedState = searchParams.get('state');
  
  // Validate state if present
  // Note: Logto may handle state internally, but we validate it if it's in the URL
  if (receivedState) {
    const provider = await validateOAuthState(receivedState);
    if (!provider) {
      console.error('Invalid or missing OAuth state parameter');
      redirect('/auth/error?message=Authentication Error: Missing or invalid state parameter');
    }
    console.log(`OAuth state validated for provider: ${provider}`);
  } else {
    // If no state in URL, Logto might be handling it internally
    // But we should still check if we have a state cookie (user might have started OAuth flow)
    const storedState = await getOAuthState();
    if (storedState) {
      // We have a state cookie but no state in URL - this might indicate an issue
      console.warn('OAuth state cookie exists but no state in callback URL - Logto may have consumed it');
      // Clean up the cookie
      await deleteOAuthCookies();
    }
  }

  try {
    await handleSignIn(logtoConfig, searchParams);
    // Redirect to dashboard after successful sign-in
    redirect('/dashboard');
  } catch (error) {
    console.error('Sign-in callback error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Authentication failed';
    // Redirect to error page on failure with actual error message
    redirect(`/auth/error?message=${encodeURIComponent(errorMessage)}`);
  }
}

