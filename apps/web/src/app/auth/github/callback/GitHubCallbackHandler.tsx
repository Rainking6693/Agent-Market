'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

import { authApi } from '@/lib/api';

export function GitHubCallbackHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const storedState = sessionStorage.getItem('github_oauth_state');

    if (!code) {
      setError('No authorization code received');
      router.push('/login');
      return;
    }

    if (state !== storedState) {
      setError('Invalid state parameter');
      router.push('/login');
      return;
    }

    const exchangeToken = async () => {
      try {
        const response = await fetch('/api/auth/github/callback', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code }),
        });

        if (!response.ok) {
          const errorData = (await response.json()) as { error?: string };
          throw new Error(errorData.error || 'Failed to exchange code for token');
        }

        const { token } = (await response.json()) as { token: string };

        await authApi.githubLogin(token);
        sessionStorage.removeItem('github_oauth_state');
        router.push('/dashboard');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Authentication failed');
        sessionStorage.removeItem('github_oauth_state');
        setTimeout(() => router.push('/login'), 2000);
      }
    };

    exchangeToken();
  }, [searchParams, router]);

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-destructive">{error}</p>
          <p className="mt-4 text-sm text-muted-foreground">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <p className="text-muted-foreground">Completing GitHub authentication...</p>
      </div>
    </div>
  );
}
