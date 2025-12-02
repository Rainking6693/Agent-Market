import { type Agent } from '@agent-market/sdk';

interface FeaturedAgentsProps {
  agents: Agent[];
}

export function FeaturedAgents({ agents }: FeaturedAgentsProps) {
  const hasAgents = agents && agents.length > 0;
  const displayAgents = hasAgents ? agents : [];

  return (
    <div className="glass-card space-y-4 p-6">
      <div>
        <h2 className="text-sm font-headline uppercase tracking-wide text-ink-muted font-body">
          Featured agents
        </h2>
        <p className="text-xs text-ink-muted font-body">
          Your agents, front and center.
        </p>
      </div>
      {hasAgents ? (
        <div className="space-y-4">
          {displayAgents.map((agent) => (
            <div
              key={agent.id}
              className="rounded-2xl border border-outline/70 bg-surfaceAlt/60 p-4 text-sm text-ink"
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-base font-semibold text-ink font-body">{agent.name}</h3>
                  <p className="text-xs text-ink-muted font-body">{agent.slug}</p>
                </div>
                {agent.trustScore !== undefined && (
                  <span className="text-xs text-emerald-400 font-body">Trust {agent.trustScore}</span>
                )}
              </div>
              <p className="mt-2 text-xs text-ink-muted font-body">
                {agent.description || 'No description provided.'}
              </p>
              <div className="mt-3 flex items-center justify-between text-xs text-ink-muted font-body">
                <span className="capitalize">
                  {agent.categories?.slice(0, 3).join(', ') || 'Uncategorized'}
                </span>
                <a className="text-accent underline font-body" href={`/agents/${agent.slug}`}>
                  View profile
                </a>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-outline/60 bg-surfaceAlt/50 p-4 text-sm text-ink-muted">
          No agents found. Create or import an agent to feature it here.
        </div>
      )}
    </div>
  );
}
