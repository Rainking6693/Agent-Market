/**
 * TEMPORARY MIDDLEWARE FIX
 * This bypasses JWT and checks database directly
 * Use this while debugging the JWT token issue
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { isPublicPath, requiresBetaAccess } from '@/lib/beta-access';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  console.log('[Middleware TEMP] Request to:', pathname);

  // Allow public paths without any checks
  if (isPublicPath(pathname)) {
    console.log('[Middleware TEMP] Path is public, allowing');
    return NextResponse.next();
  }

  // Check if this route requires beta access
  if (!requiresBetaAccess(pathname)) {
    console.log('[Middleware TEMP] Path does not require beta access, allowing');
    return NextResponse.next();
  }

  console.log('[Middleware TEMP] Path requires beta access, checking token...');

  // Get the user's session token
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  console.log('[Middleware TEMP] Token:', token ? 'EXISTS' : 'NULL');
  if (token) {
    console.log('[Middleware TEMP] Token email:', token.email);
  }

  // No token = not authenticated
  if (!token || !token.email) {
    console.log('[Middleware TEMP] No token/email, redirecting to beta-gate');
    const url = request.nextUrl.clone();
    url.pathname = '/beta-gate';
    url.searchParams.set('from', pathname);
    return NextResponse.redirect(url);
  }

  // TEMPORARY FIX: Check database directly
  try {
    console.log('[Middleware TEMP] Checking database for user:', token.email);
    const user = await prisma.user.findUnique({
      where: { email: token.email },
      select: { role: true, betaAccess: true, providerBeta: true },
    });

    console.log('[Middleware TEMP] DB User:', user);

    if (!user) {
      console.log('[Middleware TEMP] User not found in DB, redirecting to beta-gate');
      const url = request.nextUrl.clone();
      url.pathname = '/beta-gate';
      url.searchParams.set('from', pathname);
      return NextResponse.redirect(url);
    }

    // Check if user has beta access
    const hasAccess = user.role === 'admin' || user.betaAccess || user.providerBeta;
    console.log('[Middleware TEMP] Has access:', hasAccess);

    if (!hasAccess) {
      console.log('[Middleware TEMP] User lacks beta access, redirecting to beta-gate');
      const url = request.nextUrl.clone();
      url.pathname = '/beta-gate';
      url.searchParams.set('from', pathname);
      return NextResponse.redirect(url);
    }

    console.log('[Middleware TEMP] User has beta access, allowing through');
    return NextResponse.next();
  } catch (error) {
    console.error('[Middleware TEMP] Database error:', error);
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
