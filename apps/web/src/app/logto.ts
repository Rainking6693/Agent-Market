/**
 * Logto configuration for Next.js App Router
 *
 * Environment variables (set in Netlify):
 * - LOGTO_ENDPOINT: Your Logto tenant endpoint (e.g., https://4yl56u.logto.app/)
 * - LOGTO_APP_ID: Your Logto application ID
 * - LOGTO_APP_SECRET: Your Logto application secret
 * - LOGTO_COOKIE_SECRET: A random 32-character secret for cookie encryption
 * - NEXT_PUBLIC_BASE_URL: Your application's base URL (for production)
 */

function getBaseUrl() {
  // Server-side: use environment variable or infer from request
  if (typeof window === 'undefined') {
    // In production, check for NEXT_PUBLIC_BASE_URL first
    if (process.env.NEXT_PUBLIC_BASE_URL) {
      return process.env.NEXT_PUBLIC_BASE_URL;
    }
    // Fallback: use swarmsync.ai as primary production domain
    if (process.env.NODE_ENV === 'production') {
      return 'https://swarmsync.ai';
    }
    return process.env.WEB_URL || 'http://localhost:3000';
  }
  // Client-side: use current origin (this is what actually matters for redirects)
  return window.location.origin;
}

export const logtoConfig = {
  endpoint: process.env.LOGTO_ENDPOINT || 'https://wbeku3.logto.app/',
  appId: process.env.LOGTO_APP_ID || '6spemk59pwj9csi6b9i46',
  appSecret: process.env.LOGTO_APP_SECRET || 's9ocgmCjFj8Mzjmfk2wNmQbX5Us5Y2gz',
  baseUrl: getBaseUrl(),
  cookieSecret:
    process.env.LOGTO_COOKIE_SECRET || 'HNT0jWSyAGYkf3DAaUgpIUgfJdY7jwMW',
  cookieSecure: process.env.NODE_ENV === 'production',
  // Note: @logto/next SDK handles cookies internally via Next.js cookies() API
  // Cookie domain is set in server actions using cookies().set() with domain option
};
