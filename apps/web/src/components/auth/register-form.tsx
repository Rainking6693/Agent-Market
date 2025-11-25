'use client';

import { SignInButton } from '@/components/auth/sign-in-button';

interface RegisterFormProps {
  selectedPlan?: string;
}

export function RegisterForm({ selectedPlan }: RegisterFormProps) {
  // selectedPlan is available but not used since Logto handles registration
  // Keeping it for API compatibility
  if (selectedPlan) {
    // Could store this in sessionStorage or pass to Logto if needed
  }
  return (
    <div className="space-y-5">
      <div className="text-center">
        <p className="text-sm text-muted-foreground">
          Create an account to get started
        </p>
      </div>

      <SignInButton />

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
