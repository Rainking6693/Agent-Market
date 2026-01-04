/**
 * Next.js Middleware for Beta Access Gating
 * Runs on every request to gate non-public routes
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { isPublicPath, requiresBetaAccess, hasBetaAccess } from '@/lib/beta-access';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  console.log('[Middleware] Request to:', pathname);

  // Allow public paths without any checks
  if (isPublicPath(pathname)) {
    console.log('[Middleware] Path is public, allowing');
    return NextResponse.next();
  }

  // Check if this route requires beta access
  if (!requiresBetaAccess(pathname)) {
    console.log('[Middleware] Path does not require beta access, allowing');
    return NextResponse.next();
  }

  console.log('[Middleware] Path requires beta access, checking token...');

  // Get the user's session token
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  console.log('[Middleware] Token:', token ? 'EXISTS' : 'NULL');
  if (token) {
    console.log('[Middleware] Token email:', token.email);
    console.log('[Middleware] Token role:', (token as any).role);
    console.log('[Middleware] Token betaAccess:', (token as any).betaAccess);
    console.log('[Middleware] Token providerBeta:', (token as any).providerBeta);
  }

  // No token = not authenticated
  if (!token) {
    console.log('[Middleware] No token, redirecting to beta-gate');
    // Redirect to beta gate page
    const url = request.nextUrl.clone();
    url.pathname = '/beta-gate';
    url.searchParams.set('from', pathname);
    return NextResponse.redirect(url);
  }

  // Check if user has beta access
  const user = {
    id: token.sub ?? '',
    email: token.email ?? '',
    role: (token as any).role,
    betaAccess: (token as any).betaAccess,
    providerBeta: (token as any).providerBeta,
  };

  console.log('[Middleware] User object:', JSON.stringify(user, null, 2));

  const hasAccess = hasBetaAccess(user);
  console.log('[Middleware] hasBetaAccess result:', hasAccess);

  if (!hasAccess) {
    console.log('[Middleware] User lacks beta access, redirecting to beta-gate');
    // User is authenticated but doesn't have beta access
    // Redirect to beta gate page
    const url = request.nextUrl.clone();
    url.pathname = '/beta-gate';
    url.searchParams.set('from', pathname);
    return NextResponse.redirect(url);
  }

  console.log('[Middleware] User has beta access, allowing through');
  // User has beta access, allow through
  return NextResponse.next();
}

// Configure which routes the middleware runs on
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public assets (images, etc.)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
