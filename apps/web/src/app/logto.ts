/**
 * Logto configuration for Next.js App Router
 *
 * Environment variables (set in Netlify):
 * - LOGTO_ENDPOINT: Your Logto tenant endpoint 
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

// Validate required environment variables
function validateLogtoConfig() {
  const required = ['LOGTO_ENDPOINT', 'LOGTO_APP_ID', 'LOGTO_APP_SECRET'];
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    console.error('Missing required Logto environment variables:', missing);
    console.error('Please set up your Logto instance and configure these variables in .env.local');
    return false;
  }
  return true;
}

export const logtoConfig = {
  endpoint: process.env.LOGTO_ENDPOINT || 'https://demo.logto.app/',
  appId: process.env.LOGTO_APP_ID || 'demo_app_id',
  appSecret: process.env.LOGTO_APP_SECRET || 'demo_app_secret',
  baseUrl: getBaseUrl(),
  cookieSecret:
    process.env.LOGTO_COOKIE_SECRET || 'HNT0jWSyAGYkf3DAaUgpIUgfJdY7jwMW',
  cookieSecure: process.env.NODE_ENV === 'production',
  // Note: @logto/next SDK handles cookies internally via Next.js cookies() API
  // Cookie domain is set in server actions using cookies().set() with domain option
};

// Check configuration on module load
export const isLogtoConfigured = validateLogtoConfig();
