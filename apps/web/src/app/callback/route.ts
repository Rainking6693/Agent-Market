import { handleSignIn } from '@logto/next/server-actions';
import { redirect } from 'next/navigation';
import { NextRequest } from 'next/server';

import { deleteOAuthProvider, getOAuthProvider } from '../actions/oauth';
import { logtoConfig } from '../logto';

/**
 * OAuth callback route handler
 * This is called by Logto after user authentication
 * 
 * Note: Logto handles state parameter validation internally via handleSignIn
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;

  // Enhanced logging for debugging OAuth callback issues
  const state = searchParams.get('state');
  const code = searchParams.get('code');
  const error = searchParams.get('error');
  const errorDescription = searchParams.get('error_description');
  
  console.log('Logto callback received:', {
    url: request.url,
    hostname: request.nextUrl.hostname,
    origin: request.headers.get('origin'),
    referer: request.headers.get('referer'),
    searchParams: Object.fromEntries(searchParams.entries()),
    hasState: !!state,
    hasCode: !!code,
    hasError: !!error,
    logtoConfig: {
      endpoint: logtoConfig.endpoint,
      appId: logtoConfig.appId,
      baseUrl: logtoConfig.baseUrl,
      // Don't log secrets
    },
    cookies: {
      // Log cookie names (not values) for debugging
      cookieHeader: request.headers.get('cookie')?.split(';').map(c => c.split('=')[0].trim()) || [],
    },
  });

  // Check for OAuth error in query params
  if (error) {
    console.error('OAuth error from Logto:', { error, errorDescription });
    // Clean up provider cookie on error
    await deleteOAuthProvider();
    redirect(`/auth/error?message=${encodeURIComponent(errorDescription || error)}`);
  }

  // Log which provider was used (for analytics/debugging)
  const provider = await getOAuthProvider();
  if (provider) {
    console.log(`OAuth callback for provider: ${provider}`);
  }

  try {
    // Logto's handleSignIn validates the state parameter internally
    // If state is invalid, it will throw an error
    await handleSignIn(logtoConfig, searchParams);
    
    // Clean up provider cookie after successful sign-in
    await deleteOAuthProvider();
    
    // Redirect to dashboard after successful sign-in
    redirect('/dashboard');
  } catch (error) {
    console.error('Sign-in callback error:', error);
    
    // Clean up provider cookie on error
    await deleteOAuthProvider();
    
    const errorMessage = error instanceof Error ? error.message : 'Authentication failed';
    // Redirect to error page on failure with actual error message
    redirect(`/auth/error?message=${encodeURIComponent(errorMessage)}`);
  }
}

