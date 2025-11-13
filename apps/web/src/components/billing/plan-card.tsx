'use client';

import { BillingPlan, BillingSubscription } from '@agent-market/sdk';
import { useState } from 'react';

interface PlanCardProps {
  plan: BillingPlan;
  subscription: BillingSubscription | null;
}

const formatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 0,
});

export function PlanCard({ plan, subscription }: PlanCardProps) {
  const isActive = subscription?.plan.slug === plan.slug;
  const [isLoading, setIsLoading] = useState(false);
  const priceLabel =
    plan.priceCents === 0 ? 'Free' : `${formatter.format(plan.priceCents / 100)}/mo`;

  const handleSelectPlan = async () => {
    if (isActive) {
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000'}/billing/${
          plan.priceCents === 0 ? 'subscription/apply' : 'subscription/checkout'
        }`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            planSlug: plan.slug,
            successUrl: `${window.location.origin}/billing?status=success`,
            cancelUrl: `${window.location.origin}/billing?status=cancel`,
          }),
        },
      );
      const data = await response.json();

      if (plan.priceCents === 0 || data.subscription) {
        window.location.reload();
      } else if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      }
    } catch (error) {
      console.error('Failed to switch plan', error);
      alert('Unable to change plan. Please try again or contact support.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className={`glass-card flex flex-col gap-4 p-6 ${isActive ? 'border border-accent' : 'border border-outline/60'}`}
    >
      <div>
        <p className="text-xs uppercase tracking-wide text-ink-muted">{plan.slug}</p>
        <h3 className="text-2xl font-semibold text-ink">{plan.name}</h3>
      </div>

      <div className="text-3xl font-headline text-ink">{priceLabel}</div>

      <ul className="space-y-2 text-sm text-ink-muted">
        <li>Seats: {plan.seats === 0 ? 'Unlimited' : plan.seats}</li>
        <li>Agents: {plan.agentLimit === 0 ? 'Unlimited' : plan.agentLimit}</li>
        <li>Workflows: {plan.workflowLimit === 0 ? 'Unlimited' : plan.workflowLimit}</li>
        <li>Credits / month: {plan.monthlyCredits === 0 ? 'Custom' : plan.monthlyCredits.toLocaleString()}</li>
        <li>Take rate: {(plan.takeRateBasisPoints / 100).toFixed(1)}%</li>
      </ul>

      <div className="space-y-2 text-sm text-ink-muted">
        {plan.features.map((feature) => (
          <div key={feature} className="flex items-center gap-2">
            <span className="text-accent">✺</span>
            <span>{feature}</span>
          </div>
        ))}
      </div>

      <button
        type="button"
        disabled={isActive || isLoading}
        onClick={handleSelectPlan}
        className={`glass-button mt-auto w-full px-4 py-2 text-sm font-semibold ${
          isActive ? 'bg-outline/60 text-ink cursor-not-allowed' : 'bg-accent text-carrara'
        }`}
      >
        {isActive ? 'Current plan' : isLoading ? 'Processing…' : 'Choose plan'}
      </button>
    </div>
  );
}
