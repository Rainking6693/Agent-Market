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
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Helper to decode JWT (basic base64 decode for payload)
function decodeJWT(token: string): { email?: string } | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
    return payload;
  } catch {
    return null;
  }
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

  let userEmail: string | null = null;

  // Try NextAuth JWT first (OAuth)
  const nextAuthToken = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  if (nextAuthToken?.email) {
    console.log('[Middleware] Found NextAuth JWT for:', nextAuthToken.email);
    userEmail = nextAuthToken.email;
  } else {
    // Try custom auth token cookie (email/password)
    const customAuthToken = request.cookies.get('auth_token')?.value;

    if (customAuthToken) {
      console.log('[Middleware] Found custom auth_token cookie');
      const decoded = decodeJWT(customAuthToken);
      if (decoded?.email) {
        console.log('[Middleware] Decoded email from custom token:', decoded.email);
        userEmail = decoded.email;
      }
    }
  }

  // No email = not authenticated
  if (!userEmail) {
    console.log('[Middleware] No authentication found, redirecting to beta-gate');
    const url = request.nextUrl.clone();
    url.pathname = '/beta-gate';
    url.searchParams.set('from', pathname);
    return NextResponse.redirect(url);
  }

  // Check database for user's beta access
  try {
    console.log('[Middleware] Checking database for user:', userEmail);
    const user = await prisma.user.findUnique({
      where: { email: userEmail },
      select: { role: true, betaAccess: true, providerBeta: true },
    });

    console.log('[Middleware] DB User:', user);

    if (!user) {
      console.log('[Middleware] User not found in DB, redirecting to beta-gate');
      const url = request.nextUrl.clone();
      url.pathname = '/beta-gate';
      url.searchParams.set('from', pathname);
      return NextResponse.redirect(url);
    }

    // Check if user has beta access
    const hasAccess = user.role === 'admin' || user.betaAccess || user.providerBeta;
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
  } catch (error) {
    console.error('[Middleware] Database error:', error);
    // On error, redirect to beta gate
    const url = request.nextUrl.clone();
    url.pathname = '/beta-gate';
    url.searchParams.set('from', pathname);
    return NextResponse.redirect(url);
  } finally {
    await prisma.$disconnect();
  }
}

// Configure which routes the middleware runs on
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
