'use client';

import { Loader2 } from 'lucide-react';
import { useState } from 'react';

import { handleSignOut } from '@/app/actions/auth';
import { Button } from '@/components/ui/button';

export function SignOutButton() {
  const [isLoading, setIsLoading] = useState(false);

  const onSignOut = async () => {
    setIsLoading(true);
    try {
      await handleSignOut();
      // handleSignOut will redirect, so we don't need to reset loading state
    } catch (error) {
      console.error('Sign out failed:', error);
      setIsLoading(false);
    }
  };

  return (
    <Button
      type="button"
      variant="outline"
      onClick={onSignOut}
      disabled={isLoading}
      aria-busy={isLoading}
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
          Signing out...
        </>
      ) : (
        'Sign Out'
      )}
    </Button>
  );
}

