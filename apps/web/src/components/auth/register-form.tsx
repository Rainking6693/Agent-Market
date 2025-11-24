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

const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character');

const schema = z
  .object({
    displayName: z.string().min(3, 'Name must be at least 3 characters'),
    email: z.string().email('Invalid email address'),
    password: passwordSchema,
    confirmPassword: z.string(),
    plan: z.string().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type FormData = z.infer<typeof schema>;

export function RegisterForm({ selectedPlan }: { selectedPlan?: string }) {
  const {
    register: registerUser,
    registerStatus,
    registerError,
  } = useAuth();
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    setValue,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    mode: 'onSubmit', // Only validate on submit, not on blur/change
    reValidateMode: 'onSubmit', // Only re-validate on submit after error
    defaultValues: {
      plan: selectedPlan,
    },
  });

  // Update plan if prop changes
  useEffect(() => {
    if (selectedPlan) {
      setValue('plan', selectedPlan);
    }
  }, [selectedPlan, setValue]);

  // Watch for registration errors and display them
  useEffect(() => {
    if (registerStatus === 'error') {
      let errorMessage =
        'Registration failed. Please ensure all fields are correct and try again. If the problem persists, please contact support.';
      
      // Try to extract a more specific error message from the API response
      if (registerError) {
        // ky HTTPError has a response property with json() method
        const httpError = registerError as unknown as {
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
  }, [registerStatus, registerError, setError]);

  const onSubmit = (data: FormData) => {
    // Extract only the fields needed for registration (exclude confirmPassword)
    registerUser({
      email: data.email,
      password: data.password,
      displayName: data.displayName,
    });
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
        <p className="text-xs text-muted-foreground">
          Must be at least 8 characters with uppercase, lowercase, number, and special character
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Confirm Password</Label>
        <Input
          id="confirmPassword"
          type="password"
          placeholder="Confirm your password"
          autoComplete="new-password"
          aria-required="true"
          aria-invalid={!!errors.confirmPassword}
          aria-describedby={errors.confirmPassword ? 'confirmPassword-error' : undefined}
          {...register('confirmPassword')}
        />
        {errors.confirmPassword && (
          <p id="confirmPassword-error" className="text-sm text-destructive" role="alert">
            {errors.confirmPassword.message}
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

      <p className="text-xs text-muted-foreground text-center mt-4">
        By creating an account, you agree to our{' '}
        <a href="/terms" className="text-brass hover:underline font-medium">
          Terms of Service
        </a>{' '}
        and{' '}
        <a href="/privacy" className="text-brass hover:underline font-medium">
          Privacy Policy
        </a>
      </p>
    </form>
  );
}
