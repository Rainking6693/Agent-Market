import Link from 'next/link';

const recentPrompts = [
  { name: 'Go-to-market briefing', updated: 'Sep 21, 2025' },
  { name: 'Agent orchestration outline', updated: 'Aug 27, 2025' },
  { name: 'Payments readiness QA', updated: 'Aug 25, 2025' },
];

const statusPills = [
  { label: 'API', state: 'Operational', tone: 'bg-emerald-500/15 text-emerald-300' },
  { label: 'Payments', state: 'Sandbox', tone: 'bg-amber-500/20 text-amber-200' },
  { label: 'Agent Mesh', state: 'In progress', tone: 'bg-sky-500/20 text-sky-200' },
];

export default function HomePage() {
  return (
    <div className="space-y-12">
      <header className="glass-card flex flex-col gap-8 p-8">
        <div className="flex flex-wrap items-center justify-between gap-6">
          <div>
            <p className="text-sm uppercase tracking-[0.35em] text-brass/70">Dashboard</p>
            <h1 className="mt-2 text-4xl font-headline text-ink">Good morning, Ben</h1>
            <p className="mt-2 max-w-2xl text-sm text-ink-muted">
              Track your agent marketplace rollout, orchestrate workflows, and monitor autonomous
              payments from a single console inspired by the Anthropic experience.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button className="glass-button bg-accent text-carrara shadow-accent-glow hover:bg-accent-dark">
              + Create a prompt
            </button>
            <button className="glass-button text-ink">⚡ Generate a prompt</button>
            <Link href="/agents" className="glass-button">
              Manage agents
            </Link>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {statusPills.map((pill) => (
            <span key={pill.label} className={`pill ${pill.tone}`}>
              {pill.label}: {pill.state}
            </span>
          ))}
        </div>
      </header>

      <section className="grid gap-6 lg:grid-cols-[2fr,1fr]">
        <div className="glass-card">
          <div className="border-b border-outline px-6 py-5">
            <h2 className="text-sm font-headline uppercase tracking-wide text-ink-muted">
              Recent workspaces
            </h2>
          </div>
          <ul className="divide-y divide-outline/60">
            {recentPrompts.map((prompt) => (
              <li key={prompt.name} className="px-6 py-5 transition hover:bg-surfaceAlt/60">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-semibold text-ink">{prompt.name}</div>
                    <div className="text-xs text-ink-muted">Updated {prompt.updated}</div>
                  </div>
                  <button className="rounded-full border border-outline px-3 py-1 text-xs text-ink-muted transition hover:border-brass/40 hover:text-ink">
                    Open
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="glass-card space-y-4 p-6">
          <h2 className="text-sm font-headline uppercase tracking-wide text-ink-muted">
            Quick links
          </h2>
          <div className="space-y-3 text-sm text-ink-muted">
            <Link
              href="/workflows"
              className="block rounded-lg bg-surfaceAlt/70 px-4 py-3 text-ink transition hover:bg-surfaceAlt"
            >
              ↗ Launch orchestration studio
            </Link>
            <Link
              href="/agents"
              className="block rounded-lg bg-surfaceAlt/70 px-4 py-3 text-ink transition hover:bg-surfaceAlt"
            >
              ↗ Curate marketplace agents
            </Link>
            <Link
              href="#"
              className="block rounded-lg bg-surfaceAlt/70 px-4 py-3 text-ink transition hover:bg-surfaceAlt"
            >
              ↗ Review payments ledger
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
