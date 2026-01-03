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

  // Allow public paths without any checks
  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  // Check if this route requires beta access
  if (!requiresBetaAccess(pathname)) {
    return NextResponse.next();
  }

  // Get the user's session token
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  // No token = not authenticated
  if (!token) {
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

  if (!hasBetaAccess(user)) {
    // User is authenticated but doesn't have beta access
    // Redirect to beta gate page
    const url = request.nextUrl.clone();
    url.pathname = '/beta-gate';
    url.searchParams.set('from', pathname);
    return NextResponse.redirect(url);
  }

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
