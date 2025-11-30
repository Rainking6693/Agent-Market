'use client';

import { useQuery } from '@tanstack/react-query';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/use-auth';
import { agentsApi } from '@/lib/api';

export default function LimitsPage() {
  const { user } = useAuth();
  const { data: agents = [] } = useQuery({
    queryKey: ['agents', { creatorId: user?.id }],
    queryFn: () => agentsApi.list({ creatorId: user?.id }),
    enabled: !!user,
  });

  // Calculate limits from agents and budgets
  const totalAgents = agents.length;
  const activeAgents = agents.filter((a) => a.status === 'ACTIVE').length;

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-headline text-ink">Account Limits</h1>
        <p className="text-sm text-ink-muted">
          View and manage your account limits, budgets, and spending controls
        </p>
      </header>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Agent Limits</CardTitle>
            <CardDescription>Your current agent usage</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-ink-muted">Total Agents</span>
              <span className="text-2xl font-semibold text-ink">{totalAgents}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-ink-muted">Active Agents</span>
              <span className="text-2xl font-semibold text-emerald-600">{activeAgents}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-ink-muted">Draft Agents</span>
              <span className="text-2xl font-semibold text-ink">
                {agents.filter((a) => a.status === 'DRAFT').length}
              </span>
            </div>
            <div className="mt-4 rounded-lg border border-outline/40 bg-surfaceAlt/60 p-3 text-xs text-ink-muted">
              <p>No hard limit on agents. Create as many as you need.</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Budget Limits</CardTitle>
            <CardDescription>Spending controls and thresholds</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-ink-muted">Wallet Spend Ceiling</span>
                <span className="text-sm font-semibold text-ink">Not configured</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-ink-muted">Auto-approve Threshold</span>
                <span className="text-sm font-semibold text-ink">Not configured</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-ink-muted">Monthly Budget Limits</span>
                <span className="text-sm font-semibold text-ink">
                  {agents.filter((a) => a.budgets && a.budgets.length > 0).length} agents configured
                </span>
              </div>
            </div>
            <div className="mt-4 rounded-lg border border-outline/40 bg-surfaceAlt/60 p-3 text-xs text-ink-muted">
              <p>
                Configure budget limits per agent in the{' '}
                <a href="/agents" className="text-primary underline hover:no-underline">
                  Agents
                </a>{' '}
                section.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Organization Limits</CardTitle>
            <CardDescription>Subscription and plan limits</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-ink-muted">Plan</span>
                <span className="text-sm font-semibold text-ink">Free Tier</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-ink-muted">Monthly Credits</span>
                <span className="text-sm font-semibold text-ink">Unlimited</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-ink-muted">API Rate Limit</span>
                <span className="text-sm font-semibold text-ink">1000 req/min</span>
              </div>
            </div>
            <div className="mt-4 rounded-lg border border-outline/40 bg-surfaceAlt/60 p-3 text-xs text-ink-muted">
              <p>
                Upgrade your plan in{' '}
                <a href="/billing" className="text-primary underline hover:no-underline">
                  Billing
                </a>{' '}
                to increase limits.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Usage Statistics</CardTitle>
            <CardDescription>Current period usage</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-ink-muted">API Calls (this month)</span>
                <span className="text-sm font-semibold text-ink">-</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-ink-muted">Credits Used</span>
                <span className="text-sm font-semibold text-ink">-</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-ink-muted">Workflows Executed</span>
                <span className="text-sm font-semibold text-ink">-</span>
              </div>
            </div>
            <div className="mt-4 rounded-lg border border-outline/40 bg-surfaceAlt/60 p-3 text-xs text-ink-muted">
              <p>Detailed usage analytics coming soon.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
