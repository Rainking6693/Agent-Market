'use client';

import { signOut } from '@logto/next/server-actions';
import { Loader2 } from 'lucide-react';
import { useState } from 'react';

import { logtoConfig } from '@/app/logto';
import { Button } from '@/components/ui/button';

export function SignOutButton() {
  const [isLoading, setIsLoading] = useState(false);

  const handleSignOut = async () => {
    setIsLoading(true);
    try {
      await signOut(logtoConfig);
    } catch (error) {
      console.error('Sign out failed:', error);
      setIsLoading(false);
    }
  };

  return (
    <Button
      type="button"
      variant="outline"
      onClick={handleSignOut}
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

