import { TopUpCard } from '@/components/billing/top-up-card';
import { WalletBalanceCard } from '@/components/wallet/wallet-balance-card';
import { WalletTransactionsList } from '@/components/wallet/wallet-transactions-list';

interface Transaction {
  id: string;
  type: string;
  amount: string;
  currency: string;
  status: string;
  createdAt: string;
  reference?: string;
}

export default async function WalletPage() {
  // Note: In a real implementation, you'd get the user ID from the auth session
  // and fetch wallet data. For now, this shows the UI structure.
  // The wallet will be created automatically when funds are added via TopUpCard.
  const wallet = null;
  const transactions: Transaction[] = [];

  return (
    <div className="space-y-8">
      <header className="glass-card p-8">
        <p className="text-xs uppercase tracking-[0.3em] text-brass/70">Wallet</p>
        <h1 className="mt-2 text-3xl font-headline text-ink">Funds & Transactions</h1>
        <p className="mt-2 max-w-3xl text-sm text-ink-muted">
          Manage your wallet balance, add funds via Stripe, and view transaction history.
        </p>
      </header>

      <section className="grid gap-6 lg:grid-cols-2">
        <WalletBalanceCard wallet={wallet} />
        <TopUpCard />
      </section>

      <WalletTransactionsList transactions={transactions} />
    </div>
  );
}

