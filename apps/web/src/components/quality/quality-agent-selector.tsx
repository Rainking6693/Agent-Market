'use client';

import { Agent } from '@agent-market/sdk';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

interface QualityAgentSelectorProps {
  agents: Agent[];
  selectedAgentId: string;
}

export function QualityAgentSelector({ agents, selectedAgentId }: QualityAgentSelectorProps) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value;
    const next = new URLSearchParams(params.toString());
    if (value) {
      next.set('agentId', value);
    } else {
      next.delete('agentId');
    }
    router.push(`${pathname}?${next.toString()}`);
  };

  return (
    <div className="flex flex-col gap-2 text-sm text-ink">
      <label className="text-xs uppercase tracking-[0.2em] text-ink-muted">Agent</label>
      <select
        className="rounded-lg border border-outline bg-surfaceAlt/60 px-4 py-2 text-ink focus:border-brass/40 focus:outline-none"
        value={selectedAgentId}
        onChange={handleChange}
      >
        {agents.map((agent) => (
          <option key={agent.id} value={agent.id}>
            {agent.name} ({agent.status})
          </option>
        ))}
      </select>
    </div>
  );
}
