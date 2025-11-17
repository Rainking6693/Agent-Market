'use client';

import { useGoogleLogin } from '@react-oauth/google';
import { Loader2 } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';

import type { MutationStatus } from '@tanstack/react-query';

interface GoogleSignInButtonProps {
  label?: string;
  status: MutationStatus;
  onToken: (token: string) => void;
}

export function GoogleSignInButton({
  label = 'Continue with Google',
  status,
  onToken,
}: GoogleSignInButtonProps) {
  const [error, setError] = useState<string | null>(null);
  const googleConfigured = Boolean(process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID);

  const triggerLogin = useGoogleLogin({
    flow: 'implicit',
    scope: 'openid email profile',
    onSuccess: (response) => {
      const resp = response as { id_token?: string; access_token?: string };
      const token = resp.id_token ?? resp.access_token;
      if (!token) {
        setError('Unable to retrieve Google token. Please try again.');
        return;
      }
      setError(null);
      onToken(token);
    },
    onError: () => {
      setError('Google sign-in failed. Please try again.');
    },
  });

  const isDisabled = status === 'pending' || !googleConfigured;

  return (
    <div className="space-y-2">
      <Button
        type="button"
        variant="outline"
        className="w-full border-muted bg-background text-sm font-semibold text-foreground"
        disabled={isDisabled}
        onClick={() => {
          if (isDisabled) {
            return;
          }
          triggerLogin();
        }}
      >
        {status === 'pending' ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Connecting to Google...
          </>
        ) : !googleConfigured ? (
          'Google login unavailable'
        ) : (
          <span className="flex w-full items-center justify-center gap-2">
            <GoogleGlyph />
            {label}
          </span>
        )}
      </Button>
      {error && <p className="text-sm text-destructive">{error}</p>}
      {!googleConfigured && (
        <p className="text-sm text-muted-foreground">
          Add NEXT_PUBLIC_GOOGLE_CLIENT_ID to enable Google sign-in.
        </p>
      )}
    </div>
  );
}

function GoogleGlyph() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M23.49 12.27c0-.78-.07-1.53-.2-2.27H12v4.3h6.48c-.28 1.48-1.12 2.73-2.38 3.57v2.96h3.85c2.25-2.08 3.54-5.15 3.54-8.56z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.96-1.07 7.95-2.91l-3.85-2.96c-1.07.72-2.45 1.15-4.1 1.15-3.15 0-5.82-2.13-6.78-5h-4.02v3.13C3.17 21.3 7.27 24 12 24z"
      />
      <path
        fill="#FBBC05"
        d="M5.22 14.28c-.24-.72-.38-1.49-.38-2.28s.14-1.56.38-2.28V6.59H1.2a11.96 11.96 0 0 0 0 10.83l4.02-3.13z"
      />
      <path
        fill="#EA4335"
        d="M12 4.77c1.76 0 3.33.6 4.57 1.78l3.42-3.42C17.95 1.22 15.23 0 12 0 7.27 0 3.17 2.7 1.2 6.59l4.02 3.13c.96-2.87 3.63-4.95 6.78-4.95z"
      />
    </svg>
  );
}
