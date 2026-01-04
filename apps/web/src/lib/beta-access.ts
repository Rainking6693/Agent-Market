/**
 * Beta Access Control Utilities
 * Handles soft launch mode gating logic
 */

import { Session } from 'next-auth';

export interface BetaUser {
  id: string;
  email: string;
  role?: string;
  betaAccess?: boolean;
  providerBeta?: boolean;
}

/**
 * Check if a user has beta access to the platform
 * @param user - User object from session or database
 * @returns true if user can access gated routes
 */
export function hasBetaAccess(user: BetaUser | null | undefined): boolean {
  if (!user) return false;

  // Admins always have access
  if (user.role === 'admin') return true;

  // Check for either beta access flag
  if (user.betaAccess === true || user.providerBeta === true) return true;

  return false;
}

/**
 * Check if a user has beta access from a NextAuth session
 * @param session - NextAuth session object
 * @returns true if user can access gated routes
 */
export function hasSessionBetaAccess(session: Session | null): boolean {
  if (!session?.user) return false;

  // Type is properly extended in types/next-auth.d.ts
  return hasBetaAccess({
    id: session.user.id ?? '',
    email: session.user.email ?? '',
    role: session.user.role,
    betaAccess: session.user.betaAccess,
    providerBeta: session.user.providerBeta,
  });
}

/**
 * Routes that are publicly accessible (exact match, no beta access required)
 */
export const PUBLIC_ROUTES = [
  '/',
  '/login',
  '/register',
  '/auth/error',
  '/beta-gate',
  '/privacy',
  '/terms',
];

/**
 * Route prefixes that are publicly accessible (prefix match, no beta access required)
 * All routes starting with these prefixes are public
 */
export const PUBLIC_ROUTE_PREFIXES = [
  '/providers',  // Provider landing page and thank you page
];

/**
 * API routes that are publicly accessible
 */
export const PUBLIC_API_ROUTES = [
  '/api/auth',
  '/api/health',
  '/api/provider-apply',
  '/api/beta-invites',
];

/**
 * Static asset patterns that should always be accessible
 */
export const PUBLIC_ASSETS = [
  '/_next',
  '/favicon.ico',
  '/robots.txt',
  '/sitemap.xml',
  '/logos',
  '/images',
];

/**
 * Routes that require authentication (invite flow)
 */
export const INVITE_ROUTES = ['/invite'];

/**
 * Check if a path is publicly accessible
 * @param path - URL pathname
 * @returns true if path is public
 */
export function isPublicPath(path: string): boolean {
  // Check exact matches
  if (PUBLIC_ROUTES.includes(path)) return true;

  // Check public route prefixes
  if (PUBLIC_ROUTE_PREFIXES.some((prefix) => path === prefix || path.startsWith(prefix + '/'))) return true;

  // Check API routes
  if (PUBLIC_API_ROUTES.some((route) => path.startsWith(route))) return true;

  // Check static assets
  if (PUBLIC_ASSETS.some((asset) => path.startsWith(asset))) return true;

  // Check invite routes
  if (INVITE_ROUTES.some((route) => path.startsWith(route))) return true;

  return false;
}

/**
 * Check if a path requires beta access (app routes)
 * @param path - URL pathname
 * @returns true if path is gated behind beta access
 */
export function requiresBetaAccess(path: string): boolean {
  // If it's a public path, no beta access required
  if (isPublicPath(path)) return false;

  // All other paths require beta access
  return true;
}
