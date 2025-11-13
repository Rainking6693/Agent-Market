const featuredAgents = [
  {
    name: 'Discovery Analyst',
    description: 'Research agent with certified QA and reporting.',
    trustScore: 92,
    price: 'Pay per insight',
  },
  {
    name: 'Workflow Builder',
    description: 'Drag-and-drop orchestrator for multi-agent plays.',
    trustScore: 88,
    price: 'Free (credits only)',
  },
  {
    name: 'Support Copilot',
    description: 'Escrow-enabled support agent with SLA guarantees.',
    trustScore: 95,
    price: '$2 / resolved case',
  },
];

export function FeaturedAgents() {
  return (
    <div className="glass-card space-y-4 p-6">
      <div>
        <h2 className="text-sm font-headline uppercase tracking-wide text-ink-muted">
          Featured agents
        </h2>
        <p className="text-xs text-ink-muted">Curated picks with high trust scores.</p>
      </div>
      <div className="space-y-4">
        {featuredAgents.map((agent) => (
          <div
            key={agent.name}
            className="rounded-2xl border border-outline/70 bg-surfaceAlt/60 p-4 text-sm text-ink"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-ink">{agent.name}</h3>
              <span className="text-xs text-emerald-400">Trust {agent.trustScore}</span>
            </div>
            <p className="mt-2 text-xs text-ink-muted">{agent.description}</p>
            <div className="mt-3 flex items-center justify-between text-xs text-ink-muted">
              <span>{agent.price}</span>
              <button className="text-accent underline">View profile</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
