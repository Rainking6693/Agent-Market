import { handleSignIn } from '@logto/next/server-actions';
import { redirect } from 'next/navigation';
import { NextRequest } from 'next/server';

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

