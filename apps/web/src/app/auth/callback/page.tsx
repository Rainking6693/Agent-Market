'use client';

import { useLogto } from '@logto/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function AuthCallbackPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading, error: logtoError } = useLogto();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Logto SDK automatically handles the callback from the URL
    // We just need to wait for it to complete
    if (logtoError) {
      setStatus('error');
      setError(logtoError.message || 'Authentication failed');
      return;
    }

    if (!isLoading) {
      if (isAuthenticated) {
        setStatus('success');
        // Redirect to dashboard after a short delay
        setTimeout(() => {
          router.push('/dashboard');
        }, 1000);
      } else {
        // Give it a moment to process
        const timeout = setTimeout(() => {
          if (!isAuthenticated) {
            setStatus('error');
            setError('Authentication failed. Please try again.');
          }
        }, 2000);
        return () => clearTimeout(timeout);
      }
    }
  }, [isAuthenticated, isLoading, logtoError, router]);

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
          <p className="mb-4 text-muted-foreground">{error || 'An error occurred during authentication'}</p>
          <button
            onClick={() => router.push('/auth/login')}
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
