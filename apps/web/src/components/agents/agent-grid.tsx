import { AgentCard } from '@/components/agents/agent-card';
import { Skeleton } from '@/components/ui/skeleton';

import type { Agent } from '@agent-market/sdk';

interface AgentGridProps {
  agents?: Agent[];
  isLoading: boolean;
}

export function AgentGrid({ agents = [], isLoading }: AgentGridProps) {
  if (isLoading) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <Skeleton key={index} className="h-64 rounded-[2.5rem]" />
        ))}
      </div>
    );
  }

  if (!agents.length) {
    return (
      <div className="rounded-[2.5rem] border border-dashed border-border bg-white/70 p-12 text-center text-muted-foreground">
        No agents matched your filters. Try broadening your search.
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {agents.map((agent) => (
        <AgentCard key={agent.id} agent={agent} />
      ))}
    </div>
  );
}
