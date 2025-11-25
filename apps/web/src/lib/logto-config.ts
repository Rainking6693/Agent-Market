/**
 * Logto configuration
 * 
 * Required environment variables:
 * - NEXT_PUBLIC_LOGTO_ENDPOINT: Your Logto endpoint (e.g., https://your-logto-instance.com)
 * - NEXT_PUBLIC_LOGTO_APP_ID: Your Logto application ID
 */

export const logtoConfig = {
  endpoint: process.env.NEXT_PUBLIC_LOGTO_ENDPOINT || '',
  appId: process.env.NEXT_PUBLIC_LOGTO_APP_ID || '',
  resources: process.env.NEXT_PUBLIC_LOGTO_RESOURCES?.split(',') || [],
  scopes: process.env.NEXT_PUBLIC_LOGTO_SCOPES?.split(',') || ['openid', 'profile', 'email', 'offline_access'],
};

if (!logtoConfig.endpoint || !logtoConfig.appId) {
  console.warn(
    'Logto configuration is incomplete. Please set NEXT_PUBLIC_LOGTO_ENDPOINT and NEXT_PUBLIC_LOGTO_APP_ID environment variables.'
  );
}

