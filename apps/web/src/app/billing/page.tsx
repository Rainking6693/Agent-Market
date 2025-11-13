import { BillingPlan, BillingSubscription } from '@agent-market/sdk';

import { PlanCard } from '@/components/billing/plan-card';
import { getAgentMarketClient } from '@/lib/api';

export default async function BillingPage() {
  const client = getAgentMarketClient();
  let plans: BillingPlan[] = [];
  let subscription: BillingSubscription | null = null;

  try {
    [plans, subscription] = await Promise.all([
      client.listBillingPlans(),
      client.getBillingSubscription(),
    ]);
  } catch (error) {
    console.warn('Billing data unavailable during build', error);
  }

  if (!plans.length) {
    return (
      <div className="glass-card p-8 text-sm text-ink-muted">
        Billing data is unavailable right now. Try refreshing once the API is reachable.
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <header className="glass-card p-8">
        <p className="text-xs uppercase tracking-[0.3em] text-brass/70">Billing</p>
        <h1 className="mt-2 text-3xl font-headline text-ink">Plans & Usage</h1>
        <p className="mt-2 max-w-3xl text-sm text-ink-muted">
          Choose the plan that fits your agent marketplace. Upgrades unlock higher credit pools,
          lower take rates, and additional support options.
        </p>
        {subscription && (
          <div className="mt-4 rounded-lg border border-outline bg-surfaceAlt/70 px-4 py-3 text-sm text-ink">
            Active plan: <span className="font-semibold text-accent">{subscription.plan.name}</span>{' '}
            — {subscription.creditUsed}/{subscription.creditAllowance} credits this period
          </div>
        )}
      </header>

      <section className="grid gap-6 lg:grid-cols-3">
        {plans.map((plan) => (
          <PlanCard
            key={plan.slug}
            plan={plan as BillingPlan}
            subscription={subscription as BillingSubscription | null}
          />
        ))}
      </section>
    </div>
  );
}
