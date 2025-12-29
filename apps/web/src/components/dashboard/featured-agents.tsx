"use client";

import { type Agent } from "@agent-market/sdk";
import Link from "next/link";
import { useMemo, useState } from "react";

interface FeaturedAgentsProps {
  agents: Agent[];
}

export function FeaturedAgents({ agents }: FeaturedAgentsProps) {
  const hasAgents = agents && agents.length > 0;
  const [selectedId, setSelectedId] = useState<string | null>(
    hasAgents ? agents[0]?.id ?? null : null,
  );

  const selectedAgent = useMemo(() => {
    if (!hasAgents || !selectedId) return null;
    return agents.find((a) => a.id === selectedId) ?? agents[0] ?? null;
  }, [agents, hasAgents, selectedId]);

  return (
    <div className="glass-card space-y-4 p-6">
      <div>
        <h2 className="text-sm font-headline uppercase tracking-wide text-slate-400 font-body">
          Featured agents
        </h2>
        <p className="text-xs text-slate-400 font-body">
          Pick an agent from the dropdown to see details. No long scrolling.
        </p>
      </div>
      {hasAgents ? (
        <div className="space-y-4">
          <label className="block text-xs font-semibold uppercase tracking-wide text-slate-400">
            Choose an agent
          </label>
          <select
            value={selectedId ?? ""}
            onChange={(e) => setSelectedId(e.target.value)}
            className="w-full rounded-lg border border-white/10 bg-white/5/80 px-3 py-2 text-sm text-white"
          >
            {agents.map((agent) => (
              <option key={agent.id} value={agent.id}>
                {agent.name}{" "}
                {agent.trustScore !== undefined ? `(Trust ${agent.trustScore})` : ""}
              </option>
            ))}
          </select>

          {selectedAgent && (
            <div className="rounded-2xl border border-white/10/70 bg-white/5 p-4 text-sm text-white">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-base font-semibold text-white font-body">
                    {selectedAgent.name}
                  </h3>
                  <p className="text-xs text-slate-400 font-body">{selectedAgent.slug}</p>
                </div>
                {selectedAgent.trustScore !== undefined && (
                  <span className="text-xs text-emerald-400 font-body">
                    Trust {selectedAgent.trustScore}
                  </span>
                )}
              </div>
              <p className="mt-2 text-xs text-slate-400 font-body">
                {selectedAgent.description || "No description provided."}
              </p>
              <div className="mt-3 flex items-center justify-between text-xs text-slate-400 font-body">
                <span className="capitalize">
                  {selectedAgent.categories?.slice(0, 3).join(", ") || "Uncategorized"}
                </span>
                <Link className="text-accent underline font-body" href={`/agents/${selectedAgent.slug}`}>
                  View profile
                </Link>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="rounded-xl border border-white/10 bg-white/5/50 p-4 text-sm text-slate-400">
          No agents found. Create or import an agent to feature it here.
        </div>
      )}
    </div>
  );
}
