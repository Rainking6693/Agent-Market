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

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') ?? 'https://swarmsync-api.up.railway.app';
const DEFAULT_ORG_SLUG = process.env.NEXT_PUBLIC_DEFAULT_ORG_SLUG ?? 'swarmsync';

async function fetchOrgWallet() {
  try {
    const res = await fetch(`${API_BASE}/wallets/org/${DEFAULT_ORG_SLUG}`, {
      cache: 'no-store',
    });
    if (!res.ok) {
      return null;
    }
    return res.json();
  } catch (error) {
    console.error('Failed to fetch org wallet', error);
    return null;
  }
}

export default async function WalletPage() {
  // Note: In a real implementation, you'd get the user ID from the auth session
  // and fetch wallet data. For now, this shows the UI structure.
  // The wallet will be created automatically when funds are added via TopUpCard.
  const wallet = null;
  const orgWallet = await fetchOrgWallet();
  const transactions: Transaction[] = [];

  return (
    <div className="space-y-8">
      <header className="glass-card p-8">
        <p className="text-xs uppercase tracking-[0.3em] text-brass/70">Wallet</p>
        <h1 className="mt-2 text-3xl font-headline text-ink">Funds & Transactions</h1>
        <p className="mt-2 max-w-3xl text-sm text-ink-muted">
          Manage your wallet balance, add funds via Stripe, and view transaction history.
          Your organization wallet is shown below so you can see the balance the platform collects.
        </p>
      </header>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-ink">Your wallet</h2>
            <span className="text-xs text-ink-muted">User balance</span>
          </div>
          <WalletBalanceCard wallet={wallet} />
        </div>
        <TopUpCard />
      </section>

      <section className="grid gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-ink">
            Organization wallet ({DEFAULT_ORG_SLUG})
          </h2>
          <span className="text-xs text-ink-muted">Platform funds and fees</span>
        </div>
        <WalletBalanceCard wallet={orgWallet} />
        {!orgWallet && (
          <p className="text-xs text-amber-700">
            No organization wallet found yet. It will be created automatically when fees settle or
            funds are added.
          </p>
        )}
      </section>

      <WalletTransactionsList transactions={transactions} />
    </div>
  );
}
