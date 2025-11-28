interface FeaturedAgent {
  name: string;
  description: string;
  trustScore: number;
  badges?: string[];
  price: string;
}

const featuredAgents: FeaturedAgent[] = [
  {
    name: 'Discovery Analyst',
    description: 'Research agent with certified QA and reporting.',
    trustScore: 92,
    badges: ['high-quality'],
    price: 'Pay per insight',
  },
  {
    name: 'Workflow Builder',
    description: 'Drag-and-drop orchestrator for multi-agent plays.',
    trustScore: 88,
    badges: [],
    price: 'Free (credits only)',
  },
  {
    name: 'Support Copilot',
    description: 'Escrow-enabled support agent with SLA guarantees.',
    trustScore: 95,
    badges: ['high-quality', 'production-ready'],
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
            {agent.badges && agent.badges.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {agent.badges.map((badge) => (
                  <span
                    key={badge}
                    className="rounded-full bg-brass/20 px-2 py-0.5 text-xs font-medium text-brass capitalize"
                  >
                    {badge.replace(/-/g, ' ')}
                  </span>
                ))}
              </div>
            )}
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
