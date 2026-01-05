import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { cookies } from 'next/headers';

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

    // Use atob for edge runtime compatibility (Buffer is not available in some environments)
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('[Auth Helper] JWT decode error:', error);
    return null;
  }
}

/**
 * Get authenticated user from either NextAuth or custom auth token
 * Supports both OAuth (NextAuth) and email/password (custom auth_token)
 */
export async function getAuthenticatedUser(): Promise<{
  email: string;
  role?: string;
  betaAccess?: boolean;
  providerBeta?: boolean;
} | null> {
  // Try NextAuth first (OAuth)
  const session = await getServerSession(authOptions);
  if (session?.user?.email) {
    return {
      email: session.user.email,
      role: (session.user as any).role,
      betaAccess: (session.user as any).betaAccess,
      providerBeta: (session.user as any).providerBeta,
    };
  }

  // Try custom auth token (email/password)
  const cookieStore = cookies();
  const authToken = cookieStore.get('auth_token')?.value;

  if (authToken) {
    const decoded = decodeJWT(authToken);
    if (decoded?.email) {
      return {
        email: decoded.email,
        role: decoded.role,
        betaAccess: decoded.betaAccess,
        providerBeta: decoded.providerBeta,
      };
    }
  }

  return null;
}
