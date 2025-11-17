'use client';

import { CreditCard } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import { PayoutSettings } from './payout-settings';

interface BillingDashboardProps {
  userId: string;
  agentId?: string;
}

export function BillingDashboard({ agentId }: BillingDashboardProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'invoices' | 'payouts'>('overview');

  return (
    <div className="space-y-8">
      {/* Header */}
      <header className="space-y-2">
        <h1 className="text-4xl font-headline text-ink">Billing & Payments</h1>
        <p className="text-sm text-ink-muted">Manage subscriptions, invoices, and payout settings</p>
      </header>

      {/* Tab Navigation */}
      <div className="flex gap-3 border-b border-outline/40">
        {(['overview', 'invoices', 'payouts'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-3 text-sm font-semibold uppercase tracking-wide transition ${
              activeTab === tab
                ? 'border-b-2 border-brass text-ink'
                : 'text-ink-muted hover:text-ink'
            }`}
          >
            {tab === 'overview' && 'Subscription & Credits'}
            {tab === 'invoices' && 'Invoices'}
            {tab === 'payouts' && 'Payouts'}
          </button>
        ))}
      </div>

      {/* Content */}
      {activeTab === 'overview' && <BillingOverview />}
      {activeTab === 'invoices' && <InvoicesTable />}
      {activeTab === 'payouts' && agentId && <PayoutSettings agentId={agentId} />}

      {!agentId && activeTab === 'payouts' && (
        <Card className="border-outline/40 bg-surfaceAlt/60">
          <CardContent className="p-6 text-center">
            <p className="text-sm text-ink-muted">No agent associated with this account.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function BillingOverview() {
  return (
    <div className="space-y-6">
      {/* Current Plan */}
      <Card className="border-white/70 bg-white/80">
        <CardHeader>
          <CardTitle className="font-headline">Current Plan</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-6 md:grid-cols-2">
          <div className="space-y-4">
            <div>
              <p className="text-xs uppercase tracking-wide text-ink-muted">Plan Tier</p>
              <p className="mt-1 text-2xl font-headline text-ink">Growth</p>
              <p className="text-sm text-ink-muted">$99/month</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-ink-muted">Renews</p>
              <p className="mt-1 text-lg font-semibold text-ink">Dec 16, 2025</p>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <p className="text-xs uppercase tracking-wide text-ink-muted">Monthly Credits</p>
              <p className="mt-1 text-2xl font-headline text-ink">10,000</p>
              <p className="text-sm text-ink-muted">$100 credit value</p>
            </div>
            <Button variant="secondary" className="w-full rounded-full">
              Manage Subscription
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Credit Usage */}
      <Card className="border-white/70 bg-white/80">
        <CardHeader>
          <CardTitle className="font-headline">Credit Usage (This Month)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-ink">Used: 3,240 / 10,000</span>
              <span className="text-xs text-ink-muted">32% used</span>
            </div>
            <div className="h-3 w-full rounded-full bg-outline/20 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-brass to-accentTone"
                style={{ width: '32%' }}
              />
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-lg bg-surface/60 p-4">
              <p className="text-xs uppercase tracking-wide text-ink-muted">Lead Generation</p>
              <p className="mt-2 text-lg font-semibold text-ink">1,500 credits</p>
            </div>
            <div className="rounded-lg bg-surface/60 p-4">
              <p className="text-xs uppercase tracking-wide text-ink-muted">Quality Checks</p>
              <p className="mt-2 text-lg font-semibold text-ink">1,240 credits</p>
            </div>
            <div className="rounded-lg bg-surface/60 p-4">
              <p className="text-xs uppercase tracking-wide text-ink-muted">Other</p>
              <p className="mt-2 text-lg font-semibold text-ink">500 credits</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Method */}
      <Card className="border-white/70 bg-white/80">
        <CardHeader>
          <CardTitle className="font-headline">Payment Method</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4 rounded-lg border border-outline/40 bg-surface/60 p-4">
            <CreditCard className="h-8 w-8 text-brass/70" />
            <div className="flex-1">
              <p className="font-semibold text-ink">Visa •••• 4242</p>
              <p className="text-xs text-ink-muted">Expires 12/2026</p>
            </div>
            <Button variant="ghost" size="sm">
              Update
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function InvoicesTable() {
  const invoices = [
    {
      id: 'INV-2025-001',
      date: '2025-11-16',
      amount: 99.0,
      status: 'Paid' as const,
    },
    {
      id: 'INV-2025-002',
      date: '2025-10-16',
      amount: 99.0,
      status: 'Paid' as const,
    },
    {
      id: 'INV-2025-003',
      date: '2025-09-16',
      amount: 99.0,
      status: 'Paid' as const,
    },
  ];

  return (
    <Card className="border-white/70 bg-white/80">
      <CardHeader>
        <CardTitle className="font-headline">Invoice History</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {invoices.map((invoice) => (
            <div
              key={invoice.id}
              className="flex items-center justify-between rounded-lg border border-outline/40 bg-surface/60 p-4"
            >
              <div className="flex-1">
                <p className="font-semibold text-ink">{invoice.id}</p>
                <p className="text-xs text-ink-muted">{new Date(invoice.date).toLocaleDateString()}</p>
              </div>
              <p className="font-semibold text-ink">${invoice.amount.toFixed(2)}</p>
              <span className="ml-4 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                {invoice.status}
              </span>
              <Button variant="ghost" size="sm" className="ml-2">
                Download
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
