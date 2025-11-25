'use client';

import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import { billingApi } from '@/lib/api';

interface CheckoutButtonProps {
  planSlug: string;
  stripeLink: string | null;
  ctaLink: string;
  cta: string;
  popular?: boolean;
}

export function CheckoutButton({
  planSlug,
  stripeLink,
  ctaLink,
  cta,
  popular = false,
}: CheckoutButtonProps) {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [error, setError] = useState<string | null>(null);

  const checkoutMutation = useMutation({
    mutationFn: async () => {
      if (!isAuthenticated) {
        // Redirect to register with plan selected
        router.push(`${ctaLink}`);
        return { checkoutUrl: null };
      }

      const successUrl = `${window.location.origin}/billing?status=success`;
      const cancelUrl = `${window.location.origin}/pricing?status=cancel`;

      // For free plans, just redirect to register
      if (planSlug === 'starter' || planSlug === 'starter-swarm') {
        router.push(ctaLink);
        return { checkoutUrl: null };
      }

      // Create checkout session via API
      return billingApi.createCheckoutSession(planSlug, successUrl, cancelUrl);
    },
    onSuccess: (result) => {
      if (result.checkoutUrl) {
        window.location.href = result.checkoutUrl;
      }
    },
    onError: (error: unknown) => {
      const message =
        error instanceof Error ? error.message : 'Unable to start checkout. Please try again.';
      setError(message);
      console.error('Checkout error:', error);
    },
  });

  const handleCheckout = () => {
    setError(null);
    checkoutMutation.mutate();
  };

  // If no Stripe link, just show the regular CTA
  if (!stripeLink) {
    return (
      <Button
        asChild
        className="w-full"
        variant={popular ? 'default' : 'outline'}
      >
        <a href={ctaLink}>{cta}</a>
      </Button>
    );
  }

  return (
    <div className="space-y-2">
      <Button
        className="w-full"
        variant={popular ? 'default' : 'outline'}
        onClick={handleCheckout}
        disabled={checkoutMutation.isPending}
      >
        {checkoutMutation.isPending ? 'Processing...' : 'Checkout with Stripe'}
      </Button>
      {error && (
        <p className="text-xs text-center text-red-600">{error}</p>
      )}
      <p className="text-center text-xs text-muted-foreground">
        Secure payment via Stripe
      </p>
      <Button asChild className="w-full" variant="ghost">
        <a href={ctaLink}>{cta}</a>
      </Button>
    </div>
  );
}

