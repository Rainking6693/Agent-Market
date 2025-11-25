'use client';

import { ArrowUpRight, ShieldCheck, Star, Heart, Scale } from 'lucide-react';
import Link from 'next/link';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useMarketplaceStore } from '@/stores/marketplace-store';

import type { Agent } from '@agent-market/sdk';

interface AgentCardProps {
  agent: Agent;
}

const calculateRating = (trustScore: number, successCount: number, failureCount: number) => {
  // Calculate rating from success rate and trust score
  const totalRuns = successCount + failureCount;
  if (totalRuns === 0) {
    // No runs yet, use trust score as base
    return Math.max(3.5, Math.min(5, +(trustScore / 20).toFixed(1)));
  }
  
  const successRate = successCount / totalRuns;
  // Combine success rate (0-1) with trust score (0-100)
  // Success rate contributes 70%, trust score contributes 30%
  const combinedScore = (successRate * 0.7 + (trustScore / 100) * 0.3) * 5;
  return Math.max(3.0, Math.min(5.0, +combinedScore.toFixed(1)));
};

const priceFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
});

export function AgentCard({ agent }: AgentCardProps) {
  const favorites = useMarketplaceStore((state) => state.favorites);
  const compareList = useMarketplaceStore((state) => state.compare);
  const toggleFavorite = useMarketplaceStore((state) => state.toggleFavorite);
  const toggleCompare = useMarketplaceStore((state) => state.toggleCompare);

  const rating = calculateRating(agent.trustScore, agent.successCount, agent.failureCount);
  const categories = agent.categories.length ? agent.categories : ['Generalist'];
  const priceLabel =
    typeof agent.basePriceCents === 'number'
      ? `${priceFormatter.format(agent.basePriceCents / 100)}+`
      : 'Custom pricing';

  return (
    <Card className="h-full rounded-[2.5rem] border-white/70 bg-white/80 shadow-brand-panel transition hover:-translate-y-1 hover:shadow-2xl">
      <CardContent className="flex h-full flex-col gap-4 p-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-muted-foreground">
              {categories[0]}
            </p>
            <h3 className="mt-1 text-2xl font-semibold text-foreground">{agent.name}</h3>
          </div>
          <div className="flex flex-col items-end gap-2 text-xs">
            <Badge variant="accent" className="uppercase tracking-wide">
              {agent.pricingModel}
            </Badge>
            {agent.verificationStatus === 'VERIFIED' && (
              <Badge variant="outline" className="inline-flex items-center gap-1 text-emerald-600">
                <ShieldCheck className="h-3 w-3" />
                Verified
              </Badge>
            )}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => toggleFavorite(agent.slug)}
                className={cn(
                  'rounded-full border border-transparent p-2 text-muted-foreground transition hover:text-destructive',
                  favorites.includes(agent.slug) && 'text-destructive',
                )}
                aria-label="Toggle favorite"
              >
                <Heart className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => toggleCompare(agent.slug)}
                className={cn(
                  'rounded-full border border-transparent p-2 text-muted-foreground transition hover:text-foreground',
                  compareList.includes(agent.slug) && 'text-foreground',
                )}
                aria-label="Toggle compare"
              >
                <Scale className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        <p className="text-sm text-muted-foreground line-clamp-3">{agent.description}</p>

        <div className="flex flex-wrap gap-2">
          {agent.tags.slice(0, 4).map((tag) => (
            <Badge key={tag} variant="outline" className="text-[0.7rem]">
              {formatTag(tag)}
            </Badge>
          ))}
        </div>

        <div className="mt-auto space-y-4 text-sm text-muted-foreground">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 font-semibold text-foreground">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              {rating}
              <span className="text-xs text-muted-foreground">
                ({agent.successCount.toLocaleString()} runs)
              </span>
            </div>
            <div className="text-xs uppercase tracking-wide text-foreground">{priceLabel}</div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              href={`/agents/${agent.slug}`}
              className={cn(
                'inline-flex flex-1 items-center justify-center gap-2 rounded-full border border-border px-4 py-2 text-xs font-semibold uppercase tracking-wide text-foreground transition hover:bg-foreground hover:text-background',
              )}
            >
              View profile
              <ArrowUpRight className="h-4 w-4" />
            </Link>
            <Button
              asChild
              variant="secondary"
              className="flex-1 rounded-full text-xs font-semibold uppercase tracking-wide"
            >
              <Link href={`/dashboard?agent=${agent.slug}&intent=request-service`}>
                Request service
              </Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function formatTag(tag: string) {
  return tag
    .split(/[-_]/)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(' ');
}
