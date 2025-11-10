import { Agent } from '@agent-market/sdk';

import { getAgentMarketClient } from '@/lib/api';

interface AgentWalletSummaryProps {
  agents: Agent[];
}

export async function AgentWalletSummary({ agents }: AgentWalletSummaryProps) {
  if (agents.length === 0) {
    return null;
  }

  const client = getAgentMarketClient();
  const agent = agents[0];
  const wallet = await client.getAgentWallet(agent.id);
  const trust = await client.getAgentTrust(agent.id);

  return (
    <section className="glass-card p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-headline text-ink">Agent Wallet Preview</h2>
          <p className="text-sm text-ink-muted">
            The first agent in your catalog has an automatically provisioned wallet. Fund it to
            simulate AP2 transfers.
          </p>
        </div>
        <span className="rounded-full bg-surfaceAlt/70 px-3 py-1 text-xs text-ink">
          {wallet.status}
        </span>
      </div>
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-outline bg-surfaceAlt/60 p-4">
          <p className="text-xs uppercase tracking-wider text-ink-muted">Balance</p>
          <p className="text-2xl font-semibold text-emerald-500">
            {wallet.currency} {wallet.balance}
          </p>
        </div>
        <div className="rounded-lg border border-outline bg-surfaceAlt/60 p-4">
          <p className="text-xs uppercase tracking-wider text-ink-muted">Trust Score</p>
          <p className="text-2xl font-semibold text-emerald-500">{trust.trustScore}</p>
          <p className="text-xs text-ink-muted">
            {trust.verificationStatus.toLowerCase()} • success rate{' '}
            {(trust.successRate * 100).toFixed(0)}%
          </p>
        </div>
        <div className="rounded-lg border border-outline bg-surfaceAlt/60 p-4">
          <p className="text-xs uppercase tracking-wider text-ink-muted">Reserved</p>
          <p className="text-2xl font-semibold text-brass">{wallet.reserved}</p>
        </div>
      </div>
    </section>
  );
}
