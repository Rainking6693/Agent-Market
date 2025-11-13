import { BillingSubscription } from '@agent-market/sdk';

interface CreditSummaryCardProps {
  subscription: BillingSubscription | null;
}

export function CreditSummaryCard({ subscription }: CreditSummaryCardProps) {
  if (!subscription) {
    return (
      <div className="glass-card p-6 text-sm text-ink-muted">
        No plan assigned yet. Visit the <span className="text-ink">Billing</span> tab to activate a
        plan.
      </div>
    );
  }

  const remaining = Math.max(subscription.creditAllowance - subscription.creditUsed, 0);
  const remainingPercent = Math.min(
    Math.round((remaining / subscription.creditAllowance) * 100),
    100,
  );

  return (
    <div className="glass-card space-y-4 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-ink-muted">Plan</p>
          <h3 className="text-xl font-semibold text-ink">{subscription.plan.name}</h3>
        </div>
        <div className="text-right text-xs text-ink-muted">
          Period ends {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
        </div>
      </div>

      <div>
        <p className="text-xs uppercase tracking-wide text-ink-muted">Credits remaining</p>
        <div className="mt-2 text-3xl font-headline text-ink">
          {remaining.toLocaleString()}{' '}
          <span className="text-base text-ink-muted">
            / {subscription.creditAllowance.toLocaleString()}
          </span>
        </div>
      </div>

      <div className="rounded-full bg-outline/40">
        <div
          className="rounded-full bg-accent px-2 py-1 text-xs font-semibold text-carrara"
          style={{ width: `${remainingPercent}%` }}
        >
          {remainingPercent}% left
        </div>
      </div>

      <p className="text-xs text-ink-muted">
        Need more runway?{' '}
        <a href="/billing" className="text-accent underline">
          Upgrade your plan
        </a>
        .
      </p>
    </div>
  );
}
