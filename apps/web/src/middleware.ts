/**
 * Middleware for Beta Access Gating
 * 
 * IMPORTANT: This middleware ONLY runs on gated routes defined in the config matcher.
 * This prevents interference with public assets (CSS/JS), login flows, 
 * and OAuth handshakes at /api/auth.
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

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

    // Use atob for edge runtime compatibility
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

  console.log('[Middleware] Gated route triggered:', pathname);

  let user: {
    email?: string;
    role?: string;
    betaAccess?: boolean;
    providerBeta?: boolean;
  } | null = null;

  // Use both secrets for maximum compatibility
  const secret = process.env.NEXTAUTH_SECRET || process.env.JWT_SECRET || 'fallback-stable-secret-32-chars-long-!!!';

  // Try NextAuth JWT first (OAuth)
  const nextAuthToken = await getToken({
    req: request,
    secret: secret,
  });

  if (nextAuthToken?.email) {
    console.log('[Middleware] Authenticated via NextAuth:', nextAuthToken.email);
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
      const decoded = decodeJWT(customAuthToken);
      if (decoded?.email) {
        console.log('[Middleware] Authenticated via Custom Auth:', decoded.email);
        user = {
          email: decoded.email,
          role: decoded.role,
          betaAccess: decoded.betaAccess,
          providerBeta: decoded.providerBeta,
        };
      }
    }
  }

  // Not authenticated?
  if (!user || !user.email) {
    console.log('[Middleware] Unauthenticated access to gated route, redirecting to login');
    const url = request.nextUrl.clone();
    // Use /login directly if not authenticated
    url.pathname = '/login';
    url.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(url);
  }

  // authenticated but lacks beta access?
  if (!hasBetaAccess(user)) {
    console.log('[Middleware] User lacks beta access flag, redirecting to beta-gate');
    const url = request.nextUrl.clone();
    url.pathname = '/beta-gate';
    url.searchParams.set('from', pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

/**
 * MANDATORY CONFIGURATION:
 * We ONLY run middleware on routes that MUST be protected.
 * This completely prevents "SyntaxError: Unexpected token <" on CSS/JS files
 * and avoids breaking the OAuth handshake at /api/auth.
 */
export const config = {
  matcher: [
    /*
     * Only match paths that require AUTH and BETA ACCESS.
     * Add any new gated paths here.
     */
    '/dashboard/:path*',
    '/agents/:path*',
    '/org/:path*',
    '/billing/:path*',
    '/settings/:path*',
    '/console/:path*',
    '/admin/:path*',
    '/overview/:path*',
  ],
};
