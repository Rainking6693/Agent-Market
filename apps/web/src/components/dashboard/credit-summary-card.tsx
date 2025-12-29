import { BillingSubscription } from '@agent-market/sdk';

interface CreditSummaryCardProps {
  subscription: BillingSubscription | null;
}

export function CreditSummaryCard({ subscription }: CreditSummaryCardProps) {
  if (!subscription) {
    return (
      <div className="glass-card p-6 text-sm text-slate-400">
        No plan assigned yet. Visit the <span className="text-white">Billing</span> tab to activate a
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
          <p className="text-xs uppercase tracking-wide text-slate-400">Plan</p>
          <h3 className="text-xl font-semibold text-white">{subscription.plan.name}</h3>
        </div>
        <div className="text-right text-xs text-slate-400">
          Period ends {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
        </div>
      </div>

      <div>
        <p className="text-xs uppercase tracking-wide text-slate-400">Credits remaining</p>
        <div className="mt-2 text-3xl font-headline text-white">
          {remaining.toLocaleString()}{' '}
          <span className="text-base text-slate-400">
            / {subscription.creditAllowance.toLocaleString()}
          </span>
        </div>
      </div>

      <div className="rounded-full bg-white/10">
        <div
          className="rounded-full bg-gradient-to-br from-[#94A3B8] via-[#cbd5f5] to-[#f8fafc] px-2 py-1 text-xs font-semibold text-black"
          style={{ width: `${remainingPercent}%` }}
        >
          {remainingPercent}% left
        </div>
      </div>

      <p className="text-xs text-slate-400">
        Need more runway?{' '}
        <a href="/billing" className="text-slate-300 underline hover:text-white">
          Upgrade your plan
        </a>
        .
      </p>
    </div>
  );
}
