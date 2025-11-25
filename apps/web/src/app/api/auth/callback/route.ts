import { NextRequest, NextResponse } from 'next/server';

/**
 * Next.js API route to handle Logto OAuth callback
 * This receives the callback from the backend and stores the token
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const accessToken = searchParams.get('access_token');
  const refreshToken = searchParams.get('refresh_token');
  const error = searchParams.get('error');
  const errorDescription = searchParams.get('error_description');

  if (error) {
    // Redirect to error page
    const errorUrl = new URL('/auth/error', request.url);
    errorUrl.searchParams.set('message', errorDescription || error);
    return NextResponse.redirect(errorUrl);
  }

  if (!accessToken) {
    const errorUrl = new URL('/auth/error', request.url);
    errorUrl.searchParams.set('message', 'No access token received');
    return NextResponse.redirect(errorUrl);
  }

  // Store tokens in session storage (you may want to use httpOnly cookies for better security)
  // For now, we'll redirect to a page that handles token storage
  const successUrl = new URL('/auth/success', request.url);
  successUrl.searchParams.set('access_token', accessToken);
  if (refreshToken) {
    successUrl.searchParams.set('refresh_token', refreshToken);
  }

  return NextResponse.redirect(successUrl);
}

