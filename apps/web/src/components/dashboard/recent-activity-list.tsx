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
    <div className="glass-card space-y-4 p-6 text-sm text-text">
      <div>
        <h2 className="heading-label uppercase">Recent activity</h2>
        <p className="text-xs text-muted">Latest runs + spend.</p>
      </div>
      <ul className="space-y-3">
        {recentActivity.map((item) => (
          <li
            key={item.label}
            className="surface-card rounded-2xl px-4 py-3 text-sm"
          >
            <div className="flex items-center justify-between">
              <span className="font-semibold text-text">{item.label}</span>
              <span className="text-text2">{item.spend}</span>
            </div>
            <div className="mt-1 flex items-center justify-between row-meta">
              <span>{item.status}</span>
              <span>{item.timestamp}</span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
