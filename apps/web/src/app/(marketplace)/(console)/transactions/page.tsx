import { TransactionHistoryList } from '@/components/transactions/transaction-history-list';

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

export default async function TransactionsPage() {
  // Note: In a real implementation, fetch transactions from API
  // For now, this shows the UI structure
  const transactions: Transaction[] = [];

  return (
    <div className="space-y-8">
      <header className="glass-card p-8">
        <p className="text-xs uppercase tracking-[0.3em] text-brass/70">Transactions</p>
        <h1 className="mt-2 text-3xl font-headline text-ink">Payment History</h1>
        <p className="mt-2 max-w-3xl text-sm text-ink-muted">
          View all transactions including agent executions, A2A payments, wallet top-ups, and refunds.
        </p>
      </header>

      <TransactionHistoryList transactions={transactions} />
    </div>
  );
}

