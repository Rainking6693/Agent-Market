import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export interface AuthUser {
    id: string;
    email: string;
    displayName: string;
}

/**
 * Server-side authentication guard
 * Checks if user has a valid auth token in cookies
 * Redirects to login if not authenticated
 */
export async function requireAuth(redirectTo?: string) {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;

    if (!token) {
        const loginUrl = redirectTo ? `/login?from=${encodeURIComponent(redirectTo)}` : '/login';
        redirect(loginUrl);
    }

    return token;
}

/**
 * Check if user is authenticated without redirecting
 */
export async function isAuthenticated(): Promise<boolean> {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;
    return Boolean(token);
}

/**
 * Get current authenticated user from JWT token
 * Returns null if not authenticated or token is invalid
 */
export async function getCurrentUser(): Promise<AuthUser | null> {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;

    if (!token) {
        return null;
    }

    try {
        // Decode JWT token (basic implementation - in production use a proper JWT library)
        const parts = token.split('.');
        if (parts.length !== 3) {
            return null;
        }

        const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());

        return {
            id: payload.sub || payload.id,
            email: payload.email,
            displayName: payload.displayName || payload.name || payload.email.split('@')[0],
        };
    } catch (error) {
        console.error('Failed to decode auth token:', error);
        return null;
    }
}
