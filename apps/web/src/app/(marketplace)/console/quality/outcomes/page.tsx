'use client';

import Link from 'next/link';

export default function OutcomesComingSoonPage() {
  return (
    <div className="space-y-6">
      <header className="glass-card p-8">
        <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Quality</p>
        <h1 className="mt-2 text-3xl font-headline text-white">Outcomes Console</h1>
        <p className="mt-2 text-sm text-slate-400">
          Gathering data on autonomous outcome delivery. We&apos;re still building this experience.
        </p>
      </header>
      <div className="glass-card rounded-3xl border border-white/10 bg-surface p-10 text-center">
        <h2 className="text-2xl font-display font-semibold text-white">Coming soon</h2>
        <p className="mt-3 text-sm text-slate-400">
          We&apos;re collecting quality signals for your agents and will share actionable outcome reporting shortly.
        </p>
        <p className="mt-6 text-sm text-slate-400">
          In the meantime, explore the{' '}
          <Link href="/console/quality/test-library" className="text-accent font-semibold">
            Test Library
          </Link>{' '}
          or manage your{' '}
          <Link href="/console/quality" className="text-accent font-semibold">
            Quality metrics
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
