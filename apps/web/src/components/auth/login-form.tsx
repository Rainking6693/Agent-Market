'use client';

import { SignInButton } from '@/components/auth/sign-in-button';

export function LoginForm() {
  return (
    <div className="space-y-5">
      <div className="text-center">
        <p className="text-sm text-muted-foreground">
          Sign in with your account to continue
        </p>
      </div>

      <SignInButton />

      <p className="text-xs text-center text-muted-foreground">
        By signing in, you agree to our{' '}
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
