'use client';

import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

import { authApi } from '@/lib/api';
import { clearStoredAuth, getStoredAuth, persistAuth } from '@/lib/auth';
import { useAuthStore } from '@/stores/auth-store';

interface LoginPayload {
  email: string;
  password: string;
}

interface RegisterPayload {
  email: string;
  password: string;
  displayName: string;
}

export function useAuth() {
  const router = useRouter();
  const { user, token, setAuth, clearAuth } = useAuthStore();
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (initialized || typeof window === 'undefined') {
      return;
    }
    const stored = getStoredAuth();
    if (stored) {
      setAuth(stored.user, stored.token);
    }
    setInitialized(true);
  }, [initialized, setAuth]);

  const handleSuccess = useCallback(
    (data: Awaited<ReturnType<typeof authApi.login>>) => {
      setAuth(data.user, data.accessToken);
      persistAuth(data.user, data.accessToken);
      router.push('/dashboard');
    },
    [router, setAuth],
  );

  const loginMutation = useMutation({
    mutationFn: (payload: LoginPayload) => authApi.login(payload.email, payload.password),
    onSuccess: handleSuccess,
  });

  const registerMutation = useMutation({
    mutationFn: (payload: RegisterPayload) => authApi.register(payload),
    onSuccess: handleSuccess,
  });

  const googleLoginMutation = useMutation({
    mutationFn: (token: string) => authApi.googleLogin(token),
    onSuccess: handleSuccess,
  });

  const githubLoginMutation = useMutation({
    mutationFn: (token: string) => authApi.githubLogin(token),
    onSuccess: handleSuccess,
  });

  const logout = useCallback(() => {
    clearAuth();
    clearStoredAuth();
    router.push('/');
  }, [clearAuth, router]);

  return {
    user,
    token,
    isAuthenticated: Boolean(user && token),
    isLoading: !initialized,
    login: loginMutation.mutate,
    loginStatus: loginMutation.status,
    loginWithGoogle: googleLoginMutation.mutate,
    googleLoginStatus: googleLoginMutation.status,
    loginWithGitHub: githubLoginMutation.mutate,
    githubLoginStatus: githubLoginMutation.status,
    register: registerMutation.mutate,
    registerStatus: registerMutation.status,
    logout,
  };
}
