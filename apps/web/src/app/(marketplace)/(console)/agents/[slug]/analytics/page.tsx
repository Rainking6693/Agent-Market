'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';

import { CreatorAnalyticsDashboard } from '@/components/analytics/creator-analytics-dashboard';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/stores/auth-store';

export default function AgentAnalyticsPage() {
  const params = useParams();
  const user = useAuthStore((state) => state.user);
  const slug = params?.slug as string;
  const agentName = params?.agentName as string || 'Agent';

  if (!user) {
    return (
      <div className="space-y-6 rounded-[3rem] border border-outline/40 bg-surfaceAlt/60 p-10 text-ink">
        <h1 className="text-3xl font-headline">Sign in to view analytics</h1>
        <p className="text-sm text-ink-muted">
          You need an authenticated session to view detailed analytics for your agents.
        </p>
        <Button asChild>
          <Link href="/login">Go to login</Link>
        </Button>
      </div>
    );
  }

  if (!slug) {
    return (
      <div className="space-y-6 rounded-[3rem] border border-outline/40 bg-surfaceAlt/60 p-10 text-ink">
        <h1 className="text-3xl font-headline">Agent not found</h1>
        <p className="text-sm text-ink-muted">
          Unable to load analytics for this agent.
        </p>
        <Button asChild>
          <Link href="/agents">Back to agents</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <div className="flex items-center justify-between">
        <Button variant="ghost" asChild>
          <Link href="/agents">← Back to agents</Link>
        </Button>
        <Button asChild variant="secondary">
          <Link href={`/agents/${slug}/settings`}>Agent settings</Link>
        </Button>
      </div>

      <CreatorAnalyticsDashboard agentId={slug} agentName={agentName} />
    </div>
  );
}
