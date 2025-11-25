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
  
  try {
    await handleSignIn(logtoConfig, searchParams);
    // Redirect to dashboard after successful sign-in
    redirect('/dashboard');
  } catch (error) {
    console.error('Sign-in callback error:', error);
    // Redirect to error page on failure
    redirect('/auth/error?message=Authentication failed');
  }
}

