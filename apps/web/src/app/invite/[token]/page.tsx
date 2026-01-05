"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useAuthStore } from '@/stores/auth-store';
import Link from 'next/link';

export default function InviteAcceptPage({ params }: { params: { token: string } }) {
  const router = useRouter();
  const { data: session, status: sessionStatus, update } = useSession();
  const authStore = useAuthStore();
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'expired' | 'used'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const acceptInvite = async () => {
      try {
        // Wait for session to load before checking authentication
        if (sessionStatus === 'loading') {
          console.log('[Invite] Session still loading, waiting...');
          return;
        }

        // Check if user is authenticated (either OAuth or email/password)
        const isAuthenticated = !!session || !!authStore.user;

        // If not logged in, redirect to login with return URL
        if (!isAuthenticated) {
          console.log('[Invite] Not authenticated, redirecting to login');
          router.push(`/login?callbackUrl=${encodeURIComponent(`/invite/${params.token}`)}`);
          return;
        }

        console.log('[Invite] User authenticated, accepting invite...');

        // Accept the invite
        const response = await fetch('/api/beta-invites/accept', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token: params.token }),
        });

        const data = await response.json();

        if (!response.ok) {
          if (data.error === 'Invite expired') {
            setStatus('expired');
            setMessage('This invite link has expired.');
          } else if (data.error === 'Invite already used') {
            setStatus('used');
            setMessage('This invite link has already been used.');
          } else {
            setStatus('error');
            setMessage(data.error || 'Invalid invite link.');
          }
          return;
        }

        // Success! Update the session
        await update();
        setStatus('success');
        setMessage('Beta access granted! Redirecting...');

        // Redirect to agents page after 2 seconds
        setTimeout(() => {
          router.push('/agents/new');
        }, 2000);
      } catch (error) {
        console.error('Invite acceptance error:', error);
        setStatus('error');
        setMessage('Something went wrong. Please try again.');
      }
    };

    acceptInvite();
  }, [session, sessionStatus, authStore.user, params.token, router, update]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-black text-slate-50 px-6">
      <div className="max-w-md w-full text-center">
        {status === 'loading' && (
          <>
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[var(--accent-primary)] mx-auto mb-6"></div>
            <h1 className="text-2xl font-bold mb-2">Processing your invite...</h1>
            <p className="text-[var(--text-secondary)]">Please wait</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="text-6xl mb-6">✅</div>
            <h1 className="text-3xl font-bold text-emerald-400 mb-2">Welcome to SwarmSync!</h1>
            <p className="text-[var(--text-secondary)] mb-6">{message}</p>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="text-6xl mb-6">❌</div>
            <h1 className="text-3xl font-bold text-red-400 mb-2">Invalid Invite</h1>
            <p className="text-[var(--text-secondary)] mb-6">{message}</p>
            <Link
              href="/"
              className="inline-block px-6 py-3 rounded-lg bg-[var(--accent-primary)] text-white font-semibold hover:bg-[var(--accent-primary)]/90 transition"
            >
              Back to Home
            </Link>
          </>
        )}

        {status === 'expired' && (
          <>
            <div className="text-6xl mb-6">⏰</div>
            <h1 className="text-3xl font-bold text-orange-400 mb-2">Invite Expired</h1>
            <p className="text-[var(--text-secondary)] mb-6">{message}</p>
            <Link
              href="/beta-gate"
              className="inline-block px-6 py-3 rounded-lg bg-[var(--accent-primary)] text-white font-semibold hover:bg-[var(--accent-primary)]/90 transition"
            >
              Request New Invite
            </Link>
          </>
        )}

        {status === 'used' && (
          <>
            <div className="text-6xl mb-6">🔒</div>
            <h1 className="text-3xl font-bold text-orange-400 mb-2">Invite Already Used</h1>
            <p className="text-[var(--text-secondary)] mb-6">{message}</p>
            {session ? (
              <Link
                href="/agents/new"
                className="inline-block px-6 py-3 rounded-lg bg-[var(--accent-primary)] text-white font-semibold hover:bg-[var(--accent-primary)]/90 transition"
              >
                Continue to Dashboard
              </Link>
            ) : (
              <button
                onClick={() => router.push('/login')}
                className="inline-block px-6 py-3 rounded-lg bg-[var(--accent-primary)] text-white font-semibold hover:bg-[var(--accent-primary)]/90 transition"
              >
                Sign In
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
