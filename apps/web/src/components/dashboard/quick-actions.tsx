import Link from 'next/link';

export function QuickActions() {
  const actions = [
    { label: 'Deploy a new agent', href: '/agents/new' },
    { label: 'Launch orchestration studio', href: '/workflows' },
    { label: 'Test & evaluate agents', href: '/quality' },
    { label: 'Invite collaborator', href: '/agents' },
    { label: 'Review outcomes & quality', href: '/quality' },
  ];

  return (
    <div className="glass-card space-y-4 p-6 text-sm text-ink">
      <div>
        <h2 className="text-sm font-headline uppercase tracking-wide text-ink-muted">
          Quick actions
        </h2>
        <p className="text-xs text-ink-muted">Keep your marketplace humming.</p>
      </div>
      <div className="space-y-3">
        {actions.map((action) => (
          <Link
            key={action.label}
            href={action.href}
            className="flex items-center justify-between rounded-lg border border-outline/60 px-4 py-3 text-ink transition hover:border-brass/40"
          >
            <span>{action.label}</span>
            <span className="text-xs text-ink-muted">→</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
