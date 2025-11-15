'use client';

interface Transaction {
  id: string;
  type: string;
  amount: string;
  currency: string;
  status: string;
  createdAt: string;
  reference?: string;
}

interface WalletTransactionsListProps {
  transactions: Transaction[];
}

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
});

export function WalletTransactionsList({ transactions }: WalletTransactionsListProps) {
  if (transactions.length === 0) {
    return (
      <div className="glass-card p-8 text-center text-sm text-ink-muted">
        No transactions yet. Add funds to get started.
      </div>
    );
  }

  return (
    <div className="glass-card">
      <div className="border-b border-outline px-6 py-5">
        <h2 className="text-sm font-headline uppercase tracking-wide text-ink-muted">
          Transaction History
        </h2>
      </div>
      <ul className="divide-y divide-outline/60">
        {transactions.map((transaction) => {
          const amount = Number.parseFloat(transaction.amount);
          const isCredit = transaction.type === 'CREDIT';
          return (
            <li key={transaction.id} className="px-6 py-5 transition hover:bg-surfaceAlt/60">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold text-ink">
                    {isCredit ? 'Fund Added' : 'Payment'}
                  </div>
                  <div className="text-xs text-ink-muted">
                    {new Date(transaction.createdAt).toLocaleDateString()}
                    {transaction.reference && ` • ${transaction.reference}`}
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
                  <div className="text-xs text-ink-muted">{transaction.status}</div>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

