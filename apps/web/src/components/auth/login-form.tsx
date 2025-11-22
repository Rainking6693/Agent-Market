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

const schema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type FormData = z.infer<typeof schema>;

export function LoginForm() {
  const {
    login,
    loginStatus,
    loginError,
  } = useAuth();
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  // Watch for login errors and display them
  useEffect(() => {
    if (loginStatus === 'error') {
      let errorMessage =
        'Login failed. Please check your email and password and try again. If you forgot your password, contact support.';
      
      // Try to extract a more specific error message from the API response
      if (loginError) {
        // ky HTTPError has a response property with json() method
        const httpError = loginError as unknown as {
          response?: { 
            json?: () => Promise<{ message?: string }>;
            status?: number;
          };
          message?: string;
        };
        
        // Check for CORS errors
        const errorMessageLower = httpError.message?.toLowerCase() || '';
        if (
          errorMessageLower.includes('cors') ||
          errorMessageLower.includes('access-control') ||
          errorMessageLower === 'failed to fetch' ||
          (httpError.response?.status === 0 && !httpError.response?.json)
        ) {
          errorMessage =
            'Connection error: Unable to reach the server. This may be a CORS configuration issue. Please contact support if this persists.';
          setError('root', {
            type: 'manual',
            message: errorMessage,
          });
          return;
        }
        
        if (httpError.response?.json) {
          httpError.response
            .json()
            .then((body) => {
              if (body?.message) {
                setError('root', {
                  type: 'manual',
                  message: body.message,
                });
              } else {
                setError('root', {
                  type: 'manual',
                  message: errorMessage,
                });
              }
            })
            .catch(() => {
              // Fall through to default message
              setError('root', {
                type: 'manual',
                message: errorMessage,
              });
            });
          return; // Early return since we're handling async
        }
        
        // If we have a message in the error itself, use it
        if (httpError.message && httpError.message !== 'Failed to fetch') {
          errorMessage = httpError.message;
        }
      }
      
      setError('root', {
        type: 'manual',
        message: errorMessage,
      });
    }
  }, [loginStatus, loginError, setError]);

  const onSubmit = (data: FormData) => {
    login(data);
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
          placeholder="••••••••"
          autoComplete="current-password"
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
        disabled={loginStatus === 'pending'}
        aria-busy={loginStatus === 'pending'}
      >
        {loginStatus === 'pending' ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
            Signing in...
          </>
        ) : (
          'Sign In'
        )}
      </Button>

    </form>
  );
}
