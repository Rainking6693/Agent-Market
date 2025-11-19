'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/use-auth';

import { GitHubSignInButton } from './github-signin-button';
import { GoogleSignInButton } from './google-signin-button';

const schema = z.object({
  displayName: z.string().min(3, 'Name must be at least 3 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

type FormData = z.infer<typeof schema>;

export function RegisterForm() {
  const {
    register: registerUser,
    registerStatus,
    loginWithGoogle,
    googleLoginStatus,
    loginWithGitHub,
    githubLoginStatus,
  } = useAuth();
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  // Watch for registration errors and display them
  useEffect(() => {
    if (registerStatus === 'error') {
      setError('root', {
        type: 'manual',
        message:
          'Registration failed. Please ensure all fields are correct and try again. If the problem persists, please contact support.',
      });
    }
  }, [registerStatus, setError]);

  const onSubmit = (data: FormData) => {
    registerUser(data);
  };

  return (
    <form className="space-y-5" onSubmit={handleSubmit(onSubmit)} noValidate>
      {errors.root && (
        <div
          role="alert"
          className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive"
        >
          {errors.root.message}
        </div>
      )}
      <div className="space-y-2">
        <Label htmlFor="displayName">Full name</Label>
        <Input
          id="displayName"
          placeholder="Ava Markets"
          autoComplete="name"
          aria-required="true"
          aria-invalid={!!errors.displayName}
          aria-describedby={errors.displayName ? 'displayName-error' : undefined}
          {...register('displayName')}
        />
        {errors.displayName && (
          <p id="displayName-error" className="text-sm text-destructive" role="alert">
            {errors.displayName.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="you@example.com"
          autoComplete="email"
          aria-required="true"
          aria-invalid={!!errors.email}
          aria-describedby={errors.email ? 'email-error' : undefined}
          {...register('email')}
        />
        {errors.email && (
          <p id="email-error" className="text-sm text-destructive" role="alert">
            {errors.email.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          placeholder="Create a strong password"
          autoComplete="new-password"
          aria-required="true"
          aria-invalid={!!errors.password}
          aria-describedby={errors.password ? 'password-error' : undefined}
          {...register('password')}
        />
        {errors.password && (
          <p id="password-error" className="text-sm text-destructive" role="alert">
            {errors.password.message}
          </p>
        )}
      </div>

      <Button
        type="submit"
        className="w-full"
        disabled={registerStatus === 'pending'}
        aria-busy={registerStatus === 'pending'}
      >
        {registerStatus === 'pending' ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
            Creating account...
          </>
        ) : (
          'Create account'
        )}
      </Button>

      <div
        className="flex items-center gap-3 text-xs uppercase tracking-[0.3em] text-muted-foreground"
        role="separator"
        aria-label="or"
      >
        <div className="h-px flex-1 bg-border" />
        or
        <div className="h-px flex-1 bg-border" />
      </div>

      <GoogleSignInButton
        label="Sign up with Google"
        status={googleLoginStatus}
        onToken={(token) => loginWithGoogle(token)}
      />

      <GitHubSignInButton
        label="Sign up with GitHub"
        status={githubLoginStatus}
        onToken={(token) => loginWithGitHub(token)}
      />
    </form>
  );
}
