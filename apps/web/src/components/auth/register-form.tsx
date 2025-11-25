'use client';

import { Loader2 } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';

export function RegisterForm() {
  const { register, isLoading } = useAuth();
  const [isRedirecting, setIsRedirecting] = useState(false);

  const handleRegister = async () => {
    setIsRedirecting(true);
    try {
      await register();
    } catch (error) {
      console.error('Registration failed:', error);
      setIsRedirecting(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="text-center">
        <p className="text-sm text-muted-foreground">
          Create an account to get started
        </p>
      </div>

      <Button
        type="button"
        className="w-full"
        onClick={handleRegister}
        disabled={isLoading || isRedirecting}
        aria-busy={isLoading || isRedirecting}
      >
        {(isLoading || isRedirecting) ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
            Redirecting to sign up...
          </>
        ) : (
          'Create account'
        )}
      </Button>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={handleRegister}
          disabled={isLoading || isRedirecting}
        >
          Google
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={handleRegister}
          disabled={isLoading || isRedirecting}
        >
          GitHub
        </Button>
      </div>

      <p className="text-xs text-center text-muted-foreground">
        By creating an account, you agree to our{' '}
        <a href="/terms" className="text-brass hover:underline font-medium">
          Terms of Service
        </a>{' '}
        and{' '}
        <a href="/privacy" className="text-brass hover:underline font-medium">
          Privacy Policy
        </a>
      </p>
    </div>
  );
}
