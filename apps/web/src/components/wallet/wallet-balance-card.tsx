'use client';

import { Wallet } from '@agent-market/sdk';

interface WalletBalanceCardProps {
  wallet: Wallet | null;
}

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
});

export function WalletBalanceCard({ wallet }: WalletBalanceCardProps) {
  const balance = wallet ? Number.parseFloat(wallet.balance) : 0;
  const reserved = wallet ? Number.parseFloat(wallet.reserved) : 0;
  const available = balance - reserved;

  return (
    <div className="glass-card space-y-4 p-6">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-ink-muted">Balance</p>
        <h3 className="text-3xl font-headline text-ink">{currencyFormatter.format(balance)}</h3>
      </div>
      <div className="grid gap-4 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-ink-muted">Available</span>
          <span className="font-semibold text-ink">{currencyFormatter.format(available)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-ink-muted">Reserved</span>
          <span className="font-semibold text-ink">{currencyFormatter.format(reserved)}</span>
        </div>
        <div className="flex items-center justify-between border-t border-outline pt-2">
          <span className="text-ink-muted">Currency</span>
          <span className="font-semibold text-ink">{wallet?.currency ?? 'USD'}</span>
        </div>
      </div>
      {!wallet && (
        <p className="text-xs text-ink-muted">
          Wallet will be created automatically when you add funds.
        </p>
      )}
    </div>
  );
}

