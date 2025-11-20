'use client';

import { Loader2 } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';

import type { MutationStatus } from '@tanstack/react-query';

interface GitHubSignInButtonProps {
  label?: string;
  status: MutationStatus;
  onToken?: (token: string) => void;
}

export function GitHubSignInButton({
  label = 'Continue with GitHub',
  status,
}: GitHubSignInButtonProps) {
  const [error, setError] = useState<string | null>(null);
  const githubClientId = process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID;
  const githubConfigured = Boolean(githubClientId);

  const triggerLogin = () => {
    if (!githubClientId) {
      setError('GitHub login is not configured');
      return;
    }

    // GitHub OAuth flow
    // Always use www.swarmsync.ai to match the single callback URL GitHub allows
    const redirectUri = 'https://www.swarmsync.ai/auth/github/callback';
    const scope = 'user:email';
    const state = Math.random().toString(36).substring(7);
    sessionStorage.setItem('github_oauth_state', state);

    const authUrl = `https://github.com/login/oauth/authorize?client_id=${githubClientId}&redirect_uri=${encodeURIComponent(
      redirectUri,
    )}&scope=${scope}&state=${state}`;

    window.location.href = authUrl;
  };

  const isDisabled = status === 'pending' || !githubConfigured;

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
            Connecting to GitHub...
          </>
        ) : !githubConfigured ? (
          'GitHub login unavailable'
        ) : (
          <span className="flex w-full items-center justify-center gap-2">
            <GitHubGlyph />
            {label}
          </span>
        )}
      </Button>
      {error && <p className="text-sm text-destructive">{error}</p>}
      {!githubConfigured && process.env.NODE_ENV === 'development' && (
        <p className="text-sm text-muted-foreground">
          Add NEXT_PUBLIC_GITHUB_CLIENT_ID to enable GitHub sign-in.
        </p>
      )}
    </div>
  );
}

function GitHubGlyph() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path
        fillRule="evenodd"
        d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
        clipRule="evenodd"
      />
    </svg>
  );
}

