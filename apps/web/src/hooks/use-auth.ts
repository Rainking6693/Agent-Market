'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { getAuthStatus, handleSignOut } from '@/app/actions/auth';
import { AUTH_TOKEN_KEY } from '@/lib/constants';
import { useAuthStore } from '@/stores/auth-store';

export function useAuth() {
  const router = useRouter();
  const { user, token, setAuth, clearAuth } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check auth status on mount and periodically
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // First check if we have a JWT token in localStorage
        const storedToken = typeof window !== 'undefined' ? window.localStorage.getItem(AUTH_TOKEN_KEY) : null;
        
        if (storedToken && user) {
          // We have a token and user in store, consider authenticated
          setIsAuthenticated(true);
          setIsLoading(false);
          return;
        }

        // If no token, check Logto (for social login users)
        try {
          const { isAuthenticated: authStatus, user: authUser } = await getAuthStatus();
          setIsAuthenticated(authStatus);
          if (authStatus && authUser) {
            setAuth(authUser, ''); // Logto handles tokens via cookies
          } else if (!storedToken) {
            clearAuth();
          }
        } catch {
          // Logto check failed, but we might still have JWT auth
          if (!storedToken) {
            clearAuth();
            setIsAuthenticated(false);
          }
        }
      } catch (error) {
        console.error('Failed to check auth status:', error);
        const storedToken = typeof window !== 'undefined' ? window.localStorage.getItem(AUTH_TOKEN_KEY) : null;
        if (!storedToken) {
          clearAuth();
          setIsAuthenticated(false);
        }
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();

    // Check auth status every 30 seconds
    const interval = setInterval(checkAuth, 30000);
    return () => clearInterval(interval);
  }, [setAuth, clearAuth, user]);

  const logout = async () => {
    try {
      // Clear JWT token
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(AUTH_TOKEN_KEY);
      }
      
      // Try Logto logout (for social login users)
      try {
        await handleSignOut();
      } catch {
        // Ignore Logto logout errors
      }
      
      clearAuth();
      setIsAuthenticated(false);
      router.push('/');
    } catch (error) {
      console.error('Logout failed:', error);
      clearAuth();
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(AUTH_TOKEN_KEY);
      }
      router.push('/');
    }
  };

  return {
    user,
    token: token || (typeof window !== 'undefined' ? window.localStorage.getItem(AUTH_TOKEN_KEY) : null),
    isAuthenticated: isAuthenticated || !!user,
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
