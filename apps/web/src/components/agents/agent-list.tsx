'use client';

import { Agent } from '@agent-market/sdk';
import { useMemo } from 'react';

interface AgentListProps {
  agents: Agent[];
}

const statusStyles: Record<string, string> = {
  DRAFT: 'bg-white/10 text-fly-muted',
  PENDING: 'bg-amber-500/20 text-amber-200',
  APPROVED: 'bg-emerald-500/20 text-emerald-200',
  REJECTED: 'bg-red-500/25 text-red-200',
  DISABLED: 'bg-white/10 text-fly-muted/80',
};

export const AgentList = ({ agents }: AgentListProps) => {
  const sortedAgents = useMemo(
    () =>
      [...agents].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()),
    [agents],
  );

  if (sortedAgents.length === 0) {
    return (
      <div className="glass-card bg-white/5 p-6 text-center text-fly-muted">
        No agents yet. Draft your first agent to seed the marketplace.
      </div>
    );
  }

  return (
    <div className="glass-card overflow-hidden bg-white/5">
      <table className="min-w-full divide-y divide-white/10">
        <thead>
          <tr className="bg-white/5 text-left text-xs uppercase tracking-wider text-fly-muted">
            <th className="px-4 py-3">Agent</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Trust</th>
            <th className="px-4 py-3">Pricing</th>
            <th className="px-4 py-3">Categories</th>
            <th className="px-4 py-3">Updated</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5 text-sm text-fly-muted">
          {sortedAgents.map((agent) => (
            <tr key={agent.id} className="transition hover:bg-white/5">
              <td className="px-4 py-4">
                <div className="space-y-1">
                  <div className="font-semibold text-white">{agent.name}</div>
                  <p className="line-clamp-2 text-xs text-fly-muted">{agent.description}</p>
                </div>
              </td>
              <td className="px-4 py-4">
                <span
                  className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[agent.status] ?? 'bg-white/10 text-fly-muted'}`}
                >
                  {agent.status}
                </span>
              </td>
              <td className="px-4 py-4">
                <div className="flex flex-col gap-1 text-xs">
                  <span className="font-semibold text-emerald-300">Score {agent.trustScore}</span>
                  <span className="text-slate-400">{agent.verificationStatus.toLowerCase()}</span>
                </div>
              </td>
              <td className="px-4 py-4 text-white">{agent.pricingModel}</td>
              <td className="px-4 py-4">
                <div className="flex flex-wrap gap-2">
                  {agent.categories.map((category) => (
                    <span
                      key={category}
                      className="rounded-full bg-white/10 px-3 py-1 text-xs text-fly-muted"
                    >
                      {category}
                    </span>
                  ))}
                </div>
              </td>
              <td className="px-4 py-4 text-xs text-fly-muted/80">
                {new Date(agent.updatedAt).toLocaleString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
