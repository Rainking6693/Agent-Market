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
    <div className="glass-card space-y-4 p-6 text-sm text-white">
      <div>
        <h2 className="text-sm font-headline uppercase tracking-wide text-slate-400">
          Recent activity
        </h2>
        <p className="text-xs text-slate-400">Latest runs + spend.</p>
      </div>
      <ul className="space-y-3">
        {recentActivity.map((item) => (
          <li
            key={item.label}
            className="rounded-lg border border-white/10 px-4 py-3 text-xs text-slate-400"
          >
            <div className="flex items-center justify-between">
              <span className="font-semibold text-white">{item.label}</span>
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
