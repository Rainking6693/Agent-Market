'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

/**
 * Callback page for Logto OAuth
 * The actual callback handling is done in /callback/route.ts
 * This page just shows a loading state while the redirect happens
 */
export default function AuthCallbackPage() {
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');

  useEffect(() => {
    // The callback route handler will redirect us, but in case it doesn't
    // we'll redirect to dashboard after a short delay
    const timeout = setTimeout(() => {
      setStatus('success');
      setTimeout(() => {
        router.push('/dashboard');
      }, 1000);
    }, 2000);

    return () => clearTimeout(timeout);
  }, [router]);

  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
          <p className="text-muted-foreground">Completing authentication...</p>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="mb-4 text-2xl font-bold">Authentication Error</h1>
          <p className="mb-4 text-muted-foreground">An error occurred during authentication</p>
          <button
            onClick={() => router.push('/login')}
            className="rounded bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <div className="mb-4 text-2xl">✓</div>
        <p className="text-muted-foreground">Authentication successful! Redirecting...</p>
      </div>
    </div>
  );
}
