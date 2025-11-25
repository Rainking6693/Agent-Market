'use client';

import { signIn } from '@logto/next/server-actions';
import { Loader2 } from 'lucide-react';
import { useState } from 'react';

import { logtoConfig } from '@/app/logto';
import { Button } from '@/components/ui/button';

export function SignInButton() {
  const [isLoading, setIsLoading] = useState(false);

  const handleSignIn = async () => {
    setIsLoading(true);
    try {
      await signIn(logtoConfig);
    } catch (error) {
      console.error('Sign in failed:', error);
      setIsLoading(false);
    }
  };

  return (
    <Button
      type="button"
      className="w-full"
      onClick={handleSignIn}
      disabled={isLoading}
      aria-busy={isLoading}
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
          Redirecting...
        </>
      ) : (
        'Sign In'
      )}
    </Button>
  );
}

