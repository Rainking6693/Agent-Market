'use client';

import { Loader2 } from 'lucide-react';
import { useState } from 'react';

import { handleSignIn } from '@/app/actions/auth';
import { Button } from '@/components/ui/button';

export function SignInButton() {
  const [isLoading, setIsLoading] = useState(false);

  const onSignIn = async () => {
    setIsLoading(true);
    try {
      await handleSignIn();
      // handleSignIn will redirect, so we don't need to reset loading state
    } catch (error) {
      console.error('Sign in failed:', error);
      setIsLoading(false);
    }
  };

  return (
    <Button
      type="button"
      className="w-full"
      onClick={onSignIn}
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

