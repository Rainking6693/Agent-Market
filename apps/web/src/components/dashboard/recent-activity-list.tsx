const recentActivity = [
  {
    label: 'Research Analyst run',
    status: 'Succeeded',
    timestamp: '2 minutes ago',
    spend: '$3.60',
  },
  {
    label: 'Workflow “Launch Plan”',
    status: 'Completed',
    timestamp: '1 hour ago',
    spend: '$12.40',
  },
  {
    label: 'Support Copilot',
    status: 'Queued',
    timestamp: 'Yesterday',
    spend: '$0.00',
  },
];

export function RecentActivityList() {
  return (
    <div className="glass-card space-y-4 p-6 text-sm text-ink">
      <div>
        <h2 className="text-sm font-headline uppercase tracking-wide text-ink-muted">
          Recent activity
        </h2>
        <p className="text-xs text-ink-muted">Latest runs + spend.</p>
      </div>
      <ul className="space-y-3">
        {recentActivity.map((item) => (
          <li
            key={item.label}
            className="rounded-lg border border-outline/60 px-4 py-3 text-xs text-ink-muted"
          >
            <div className="flex items-center justify-between">
              <span className="font-semibold text-ink">{item.label}</span>
              <span>{item.spend}</span>
            </div>
            <div className="mt-1 flex items-center justify-between text-[11px]">
              <span>{item.status}</span>
              <span>{item.timestamp}</span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
