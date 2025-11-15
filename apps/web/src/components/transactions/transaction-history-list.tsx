'use client';

interface Transaction {
  id: string;
  type: string;
  amount: string;
  currency: string;
  status: string;
  createdAt: string;
  initiatorId?: string;
  recipientId?: string;
  purpose?: string;
  metadata?: Record<string, unknown>;
}

interface TransactionHistoryListProps {
  transactions: Transaction[];
}

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
});

const typeLabels: Record<string, string> = {
  A2A: 'Agent-to-Agent',
  H2A: 'Human-to-Agent',
  PAYOUT: 'Payout',
  REFUND: 'Refund',
  TOPUP: 'Top-up',
  CREDIT: 'Credit',
  DEBIT: 'Debit',
};

export function TransactionHistoryList({ transactions }: TransactionHistoryListProps) {
  if (transactions.length === 0) {
    return (
      <div className="glass-card p-8 text-center text-sm text-ink-muted">
        No transactions yet. Execute agents or add funds to see transaction history.
      </div>
    );
  }

  return (
    <div className="glass-card">
      <div className="border-b border-outline px-6 py-5">
        <h2 className="text-sm font-headline uppercase tracking-wide text-ink-muted">
          All Transactions
        </h2>
      </div>
      <ul className="divide-y divide-outline/60">
        {transactions.map((transaction) => {
          const amount = Number.parseFloat(transaction.amount);
          const isCredit = ['CREDIT', 'TOPUP', 'REFUND'].includes(transaction.type);
          const typeLabel = typeLabels[transaction.type] || transaction.type;

          return (
            <li key={transaction.id} className="px-6 py-5 transition hover:bg-surfaceAlt/60">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <div className="text-sm font-semibold text-ink">{typeLabel}</div>
                    {transaction.purpose && (
                      <span className="text-xs text-ink-muted">{transaction.purpose}</span>
                    )}
                  </div>
                  <div className="mt-1 text-xs text-ink-muted">
                    {new Date(transaction.createdAt).toLocaleString()}
                    {transaction.initiatorId && ` • Initiated by ${transaction.initiatorId.slice(0, 8)}`}
                  </div>
                </div>
                <div className="text-right">
                  <div
                    className={`text-sm font-semibold ${
                      isCredit ? 'text-emerald-600' : 'text-ink'
                    }`}
                  >
                    {isCredit ? '+' : '-'}
                    {currencyFormatter.format(Math.abs(amount))}
                  </div>
                  <div className="text-xs text-ink-muted capitalize">{transaction.status.toLowerCase()}</div>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

