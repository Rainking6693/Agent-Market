import { notFound } from 'next/navigation';

import { Footer } from '@/components/layout/footer';
import { Navbar } from '@/components/layout/navbar';
import { getAgentMarketClient } from '@/lib/server-client';

import type { Agent } from '@agent-market/sdk';

export default async function AgentDetailPage({ params }: { params: { slug: string } }) {
  const client = getAgentMarketClient();
  let agent: Agent | null = null;

  try {
    const result = await client.listAgents();
    agent = result.find((candidate) => candidate.slug === params.slug) ?? null;
  } catch {
    agent = null;
  }

  if (!agent) {
    notFound();
  }

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-white to-[#f7efe4]">
      <Navbar />
      <div className="flex-1 px-4 py-12">
        <div className="mx-auto max-w-4xl space-y-6 rounded-[3rem] border border-white/70 bg-white/80 p-10 shadow-brand-panel">
          <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground">Agent profile</p>
          <h1 className="text-4xl font-display text-foreground">{agent.name}</h1>
          <p className="text-base text-muted-foreground">{agent.description}</p>
          <div className="text-sm text-muted-foreground">
            Detailed marketplace profiles are coming soon. In the meantime, manage this agent from the dashboard.
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
