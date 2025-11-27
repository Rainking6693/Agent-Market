'use client';

import { useRouter } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';

import { clearStoredAuth, getStoredAuth } from '@/lib/auth';
import { AUTH_TOKEN_KEY } from '@/lib/constants';
import { useAuthStore } from '@/stores/auth-store';

export function useAuth() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { user, token, setAuth, clearAuth } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);

  const sessionUser =
    session?.user?.email && session?.user
      ? {
          id: session.user.id || session.user.email,
          email: session.user.email,
          displayName: session.user.name || session.user.email,
        }
      : null;

  // Keep local store in sync with NextAuth session or JWT login
  useEffect(() => {
    const stored = getStoredAuth();

    if (status === 'authenticated' && sessionUser) {
      setAuth(sessionUser, '');
      setIsLoading(false);
      return;
    }

    if (stored) {
      setAuth(stored.user, stored.token);
    } else if (status === 'unauthenticated') {
      clearAuth();
      clearStoredAuth();
    }

    setIsLoading(status === 'loading');
  }, [status, sessionUser, setAuth, clearAuth]);

  const logout = async () => {
    try {
      clearStoredAuth();

      clearAuth();
      await signOut({ callbackUrl: '/' });
    } catch (error) {
      console.error('Logout failed:', error);
      clearAuth();
      clearStoredAuth();
      router.push('/');
    }
  };

  const localToken =
    typeof window !== 'undefined' ? window.localStorage.getItem(AUTH_TOKEN_KEY) : null;
  const isAuthenticated =
    status === 'authenticated' || !!sessionUser || !!token || !!localToken;

  return {
    user: sessionUser || user,
    token: token || localToken,
    isAuthenticated,
    isLoading,
    login: () => {
      // Login is handled by EmailLoginForm or SocialLoginButtons
      console.warn('Use EmailLoginForm or SocialLoginButtons for login');
    },
    loginStatus: 'idle' as const,
    loginError: null,
    register: () => {
      // Registration is handled by EmailRegisterForm or SocialLoginButtons
      console.warn('Use EmailRegisterForm or SocialLoginButtons for registration');
    },
    registerStatus: 'idle' as const,
    registerError: null,
    logout,
  };
}
