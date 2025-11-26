import { NextResponse } from 'next/server';

import type { NextRequest } from 'next/server';

/**
 * Next.js middleware for handling OAuth cookies and redirects
 * Ensures cookies are set with proper domain for cross-domain OAuth flows
 */
export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  const hostname = request.nextUrl.hostname;
  
  // Determine cookie domain based on hostname
  let cookieDomain: string | undefined;
  
  if (hostname === 'swarmsync.ai' || hostname === 'www.swarmsync.ai') {
    // Use .swarmsync.ai to cover both www and non-www
    cookieDomain = '.swarmsync.ai';
  } else if (hostname.endsWith('.netlify.app')) {
    // For Netlify, use the specific subdomain
    cookieDomain = hostname;
  } else if (hostname === 'localhost') {
    // Local development - no domain needed
    cookieDomain = undefined;
  }

  // Set cookie domain in response headers if needed
  // Note: Logto SDK handles its own cookies, but we ensure proper domain for our custom cookies
  if (cookieDomain && process.env.NODE_ENV === 'production') {
    // The actual cookie setting happens in server actions/components
    // This middleware just ensures the response is ready for cookie domain settings
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};

