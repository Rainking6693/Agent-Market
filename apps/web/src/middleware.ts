/**
 * Middleware for Beta Access Gating
 * Supports TWO auth systems:
 * 1. NextAuth JWT (OAuth - Google/GitHub)
 * 2. Custom API JWT (Email/Password via auth_token cookie)
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { isPublicPath, requiresBetaAccess } from '@/lib/beta-access';

// Helper to decode JWT (basic base64 decode for payload)
function decodeJWT(token: string): {
  email?: string;
  role?: string;
  betaAccess?: boolean;
  providerBeta?: boolean;
} | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    // Use atob for edge runtime compatibility (Buffer is not available)
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('[Middleware] JWT decode error:', error);
    return null;
  }
}

// Helper to check if user has beta access
function hasBetaAccess(user: {
  role?: string;
  betaAccess?: boolean;
  providerBeta?: boolean;
}): boolean {
  if (user.role === 'admin') return true;
  if (user.betaAccess === true || user.providerBeta === true) return true;
  return false;
}

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

  console.log('[Middleware] Path requires beta access, checking auth...');

  let user: {
    email?: string;
    role?: string;
    betaAccess?: boolean;
    providerBeta?: boolean;
  } | null = null;

  // Try NextAuth JWT first (OAuth)
  const nextAuthToken = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  if (nextAuthToken?.email) {
    console.log('[Middleware] Found NextAuth JWT for:', nextAuthToken.email);
    user = {
      email: nextAuthToken.email,
      role: (nextAuthToken as any).role,
      betaAccess: (nextAuthToken as any).betaAccess,
      providerBeta: (nextAuthToken as any).providerBeta,
    };
  } else {
    // Try custom auth token cookie (email/password)
    const customAuthToken = request.cookies.get('auth_token')?.value;

    if (customAuthToken) {
      console.log('[Middleware] Found custom auth_token cookie');
      const decoded = decodeJWT(customAuthToken);
      if (decoded?.email) {
        console.log('[Middleware] Decoded custom token for:', decoded.email);
        user = {
          email: decoded.email,
          role: decoded.role,
          betaAccess: decoded.betaAccess,
          providerBeta: decoded.providerBeta,
        };
      }
    }
  }

  // No user = not authenticated
  if (!user || !user.email) {
    console.log('[Middleware] No authentication found, redirecting to beta-gate');
    const url = request.nextUrl.clone();
    url.pathname = '/beta-gate';
    url.searchParams.set('from', pathname);
    return NextResponse.redirect(url);
  }

  console.log('[Middleware] User:', {
    email: user.email,
    role: user.role,
    betaAccess: user.betaAccess,
    providerBeta: user.providerBeta,
  });

  // Check if user has beta access
  const hasAccess = hasBetaAccess(user);
  console.log('[Middleware] Has access:', hasAccess);

  if (!hasAccess) {
    console.log('[Middleware] User lacks beta access, redirecting to beta-gate');
    const url = request.nextUrl.clone();
    url.pathname = '/beta-gate';
    url.searchParams.set('from', pathname);
    return NextResponse.redirect(url);
  }

  console.log('[Middleware] User has beta access, allowing through');
  return NextResponse.next();
}

// Configure which routes the middleware runs on
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
