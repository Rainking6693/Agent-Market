import { ArrowUpRight, Star } from 'lucide-react';
import Link from 'next/link';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

import type { Agent } from '@agent-market/sdk';

interface AgentCardProps {
  agent: Agent;
}

const formatRating = (trustScore: number) => Math.max(3.5, Math.min(5, +(trustScore / 20).toFixed(1)));

export function AgentCard({ agent }: AgentCardProps) {
  const rating = formatRating(agent.trustScore);
  const categories = agent.categories.length ? agent.categories : ['Generalist'];

  return (
    <Card className="h-full rounded-[2.5rem] border-white/70 bg-white/80 shadow-brand-panel transition hover:-translate-y-1 hover:shadow-2xl">
      <CardContent className="flex h-full flex-col gap-4 p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground">
              {categories[0]}
            </p>
            <h3 className="mt-2 text-2xl font-semibold text-foreground">{agent.name}</h3>
          </div>
          <Badge variant="accent" className="text-xs uppercase tracking-wide">
            {agent.pricingModel}
          </Badge>
        </div>

        <p className="text-sm text-muted-foreground line-clamp-3">{agent.description}</p>

        <div className="mt-auto flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-1 font-semibold text-foreground">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            {rating}
            <span className="text-xs text-muted-foreground">({agent.successCount} runs)</span>
          </div>
          <Link
            href={`/agents/${agent.slug}`}
            className={cn(
              'inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-xs font-semibold uppercase tracking-wide text-foreground transition hover:bg-foreground hover:text-background',
            )}
          >
            View profile
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
