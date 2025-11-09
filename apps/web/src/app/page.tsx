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
      <header className="glass-card flex flex-col gap-8 bg-white/5 p-8 shadow-fly-card">
        <div className="flex flex-wrap items-center justify-between gap-6">
          <div>
            <p className="text-sm uppercase tracking-[0.35em] text-fly-muted">Dashboard</p>
            <h1 className="mt-2 text-4xl font-semibold text-white">Good morning, Ben</h1>
            <p className="mt-2 max-w-2xl text-sm text-fly-muted">
              Track your agent marketplace rollout, orchestrate workflows, and monitor autonomous
              payments from a single console inspired by the Anthropic experience.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button className="glass-button bg-fly-primary text-white shadow-lg shadow-fly-primary/40 hover:bg-fly-primaryDark">
              + Create a prompt
            </button>
            <button className="glass-button">⚡ Generate a prompt</button>
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
        <div className="glass-card bg-white/5">
          <div className="border-b border-white/10 px-6 py-5">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-fly-muted">
              Recent workspaces
            </h2>
          </div>
          <ul className="divide-y divide-white/5">
            {recentPrompts.map((prompt) => (
              <li key={prompt.name} className="px-6 py-5 transition hover:bg-white/5">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-semibold text-white">{prompt.name}</div>
                    <div className="text-xs text-fly-muted">Updated {prompt.updated}</div>
                  </div>
                  <button className="rounded-full border border-white/10 px-3 py-1 text-xs text-fly-muted transition hover:border-white/30 hover:text-white">
                    Open
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="glass-card space-y-4 bg-white/5 p-6">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-fly-muted">
            Quick links
          </h2>
          <div className="space-y-3 text-sm text-fly-muted">
            <Link
              href="/workflows"
              className="block rounded-lg bg-white/5 px-4 py-3 text-white transition hover:bg-white/10"
            >
              ↗ Launch orchestration studio
            </Link>
            <Link
              href="/agents"
              className="block rounded-lg bg-white/5 px-4 py-3 text-white transition hover:bg-white/10"
            >
              ↗ Curate marketplace agents
            </Link>
            <Link
              href="#"
              className="block rounded-lg bg-white/5 px-4 py-3 text-white transition hover:bg-white/10"
            >
              ↗ Review payments ledger
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
