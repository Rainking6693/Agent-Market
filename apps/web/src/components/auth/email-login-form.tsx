'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { authApi } from '@/lib/api';
import { persistAuth } from '@/lib/auth';
import { useAuthStore } from '@/stores/auth-store';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export function EmailLoginForm() {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: 'onSubmit',
    reValidateMode: 'onSubmit',
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await authApi.login(data.email, data.password);

      // Store token in localStorage and cookie
      persistAuth(response.user, response.accessToken);

      // Update auth store
      setAuth(response.user, response.accessToken);

      // Redirect to dashboard
      router.push('/dashboard');
    } catch (err: unknown) {
      console.error('Login error:', err);
      let message = 'Login failed. Please check your credentials and try again.';
      
      if (err && typeof err === 'object') {
        // Handle ky HTTPError
        if ('response' in err && err.response && typeof err.response === 'object') {
          const httpError = err as { response: { status: number; statusText: string } };
          const status = httpError.response.status;
          
          if (status === 401) {
            message = 'Invalid email or password. Please try again.';
          } else if (status === 400) {
            message = 'Invalid login data. Please check your information.';
          } else if (status >= 500) {
            message = 'Server error. Please try again later.';
          } else {
            message = httpError.response.statusText || 'Login failed. Please try again.';
          }
        } else if ('message' in err && typeof err.message === 'string') {
          message = err.message;
        } else if (err instanceof Error) {
          message = err.message;
        }
      } else if (err instanceof Error) {
        message = err.message;
      }
      
      setError(message);
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="you@example.com"
          {...register('email')}
          disabled={isLoading}
          aria-invalid={errors.email ? 'true' : 'false'}
        />
        {errors.email && (
          <p className="text-xs text-red-600" role="alert">
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
          {...register('password')}
          disabled={isLoading}
          aria-invalid={errors.password ? 'true' : 'false'}
        />
        {errors.password && (
          <p className="text-xs text-red-600" role="alert">
            {errors.password.message}
          </p>
        )}
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? (
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

