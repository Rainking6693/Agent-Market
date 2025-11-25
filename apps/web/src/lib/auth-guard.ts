import { getLogtoContext } from '@logto/next/server-actions';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import { logtoConfig } from '@/app/logto';

export interface AuthUser {
    id: string;
    email: string;
    displayName: string;
}

/**
 * Server-side authentication guard
 * Checks both JWT token (email/password) and Logto (OAuth) authentication
 * Redirects to login if not authenticated
 */
export async function requireAuth(redirectTo?: string) {
    // First check JWT token cookie (email/password auth)
    const cookieStore = await cookies();
    const jwtToken = cookieStore.get('auth_token')?.value;

    if (jwtToken) {
        return jwtToken;
    }

    // Check Logto authentication (OAuth - Google/GitHub)
    try {
        const { isAuthenticated: logtoAuth } = await getLogtoContext(logtoConfig);
        if (logtoAuth) {
            return 'logto'; // Return indicator that user is authenticated via Logto
        }
    } catch (error) {
        console.error('Logto auth check failed:', error);
    }

    // Not authenticated by either method
    const loginUrl = redirectTo ? `/login?from=${encodeURIComponent(redirectTo)}` : '/login';
    redirect(loginUrl);
}

/**
 * Check if user is authenticated without redirecting
 * Checks both JWT and Logto authentication
 */
export async function isAuthenticated(): Promise<boolean> {
    const cookieStore = await cookies();
    const jwtToken = cookieStore.get('auth_token')?.value;

    if (jwtToken) {
        return true;
    }

    // Check Logto authentication
    try {
        const { isAuthenticated: logtoAuth } = await getLogtoContext(logtoConfig);
        return logtoAuth;
    } catch {
        return false;
    }
}

/**
 * Get current authenticated user
 * Checks both JWT token and Logto claims
 * Returns null if not authenticated or token is invalid
 */
export async function getCurrentUser(): Promise<AuthUser | null> {
    const cookieStore = await cookies();
    const jwtToken = cookieStore.get('auth_token')?.value;

    // First try JWT token (email/password auth)
    if (jwtToken) {
        try {
            const parts = jwtToken.split('.');
            if (parts.length === 3) {
                const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
                return {
                    id: payload.sub || payload.id,
                    email: payload.email,
                    displayName: payload.displayName || payload.name || payload.email?.split('@')[0] || '',
                };
            }
        } catch (error) {
            console.error('Failed to decode JWT token:', error);
        }
    }

    // Try Logto authentication (OAuth)
    try {
        const { isAuthenticated: logtoAuth, claims } = await getLogtoContext(logtoConfig);
        if (logtoAuth && claims) {
            return {
                id: claims.sub || '',
                email: (claims.email as string) || '',
                displayName: (claims.name as string) || (claims.username as string) || '',
            };
        }
    } catch (error) {
        console.error('Failed to get Logto context:', error);
    }

    return null;
}
