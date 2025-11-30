'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';

import { AgentFilters } from '@/components/agents/agent-filters';
import { AgentGrid } from '@/components/agents/agent-grid';
import { AgentSearch } from '@/components/agents/agent-search';
import { Button } from '@/components/ui/button';
import { useAgents } from '@/hooks/use-agents';

export default function ConsoleAgentsPage() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [capability, setCapability] = useState('');
  const [verifiedOnly, setVerifiedOnly] = useState(false);

  const filters = useMemo(
    () => ({
      search: search.trim() || undefined,
      category: category || undefined,
      tag: capability || undefined,
      verifiedOnly,
    }),
    [search, category, capability, verifiedOnly],
  );
  const { data: agents, isLoading, isError, error, refetch } = useAgents(filters);

  // Log errors for debugging
  if (isError && error) {
    console.error('Failed to load agents:', error);
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-headline text-ink">Your Agents</h1>
          <p className="mt-2 text-sm text-ink-muted">
            Manage and monitor your deployed agents
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={() => refetch()}>
            Refresh
          </Button>
          <Button asChild>
            <Link href="/agents/new">+ Create Agent</Link>
          </Button>
        </div>
      </header>

      <div className="space-y-6">
        <div className="glass-card space-y-4 p-6">
          <AgentSearch value={search} onChange={setSearch} />
          <AgentFilters
            category={category}
            capability={capability}
            verifiedOnly={verifiedOnly}
            onCategoryChange={setCategory}
            onCapabilityChange={setCapability}
            onVerifiedToggle={setVerifiedOnly}
          />
        </div>

        <AgentGrid agents={agents} isLoading={isLoading} isError={isError} />
      </div>
    </div>
  );
}

