import Link from 'next/link';
import { notFound } from 'next/navigation';

import { AgentActionPanel } from '@/components/agents/agent-action-panel';
import { RequestServiceForm } from '@/components/agents/request-service-form';
import { Footer } from '@/components/layout/footer';
import { Navbar } from '@/components/layout/navbar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { getAgentMarketClient } from '@/lib/server-client';

import type { Agent, AgentSchemaDefinition } from '@agent-market/sdk';

const currency = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
});

export default async function AgentDetailPage({ params }: { params: { slug: string } }) {
  const client = getAgentMarketClient();
  let agent: Agent | null = null;

  try {
    agent = await client.getAgentBySlug(params.slug);
  } catch {
    agent = null;
  }

  if (!agent) {
    notFound();
  }

  const [schema, budget] = await Promise.all([
    client.getAgentSchema(agent.id).catch(() => null),
    client.getAgentBudget(agent.id).catch(() => null),
  ]);

  const categories = agent.categories.length ? agent.categories : ['Generalist'];
  const price =
    typeof agent.basePriceCents === 'number'
      ? currency.format(agent.basePriceCents / 100)
      : 'Custom';

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-white to-[#f7efe4]">
      <Navbar />
      <div className="flex-1 px-4 py-12">
        <div className="mx-auto flex max-w-5xl flex-col gap-10">
          <header className="rounded-[3rem] border border-white/70 bg-white/80 p-10 shadow-brand-panel">
            <div className="flex flex-wrap items-center gap-4 text-xs uppercase tracking-[0.4em] text-muted-foreground">
              <span>{categories[0]}</span>
              {agent.verificationStatus === 'VERIFIED' && (
                <Badge variant="accent" className="text-[0.65rem] uppercase tracking-wide">
                  Verified
                </Badge>
              )}
            </div>
            <div className="mt-6 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h1 className="text-4xl font-display text-foreground">{agent.name}</h1>
                <p className="mt-4 text-base text-muted-foreground">{agent.description}</p>
                <div className="mt-4 flex flex-wrap gap-2 text-xs text-muted-foreground">
                  {agent.tags.map((tag) => (
                    <Badge key={tag} variant="outline">
                      {formatTag(tag)}
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="flex flex-col gap-3">
                <div className="rounded-full border border-border px-4 py-2 text-center text-xs uppercase tracking-wide text-muted-foreground">
                  Pricing model: {agent.pricingModel}
                </div>
                <div className="text-3xl font-headline text-foreground">{price} / engagement</div>
                <div className="flex flex-wrap gap-3">
                  <Button asChild className="rounded-full px-6 py-2 text-sm font-semibold uppercase tracking-wide">
                    <Link href="#request-service-panel">Request service</Link>
                  </Button>
                  <AgentActionPanel agentSlug={agent.slug} />
                </div>
              </div>
            </div>
          </header>

          <section className="grid gap-4 md:grid-cols-3">
            <StatCard label="Trust rating" value={`${ratingFromTrust(agent.trustScore)} / 5`} />
            <StatCard
              label="Successful runs"
              value={agent.successCount.toLocaleString()}
              hint={`${agent.failureCount.toLocaleString()} failures`}
            />
            <StatCard
              label="Budget ceiling"
              value={
                budget
                  ? `${currency.format(budget.perTransactionLimit ?? budget.monthlyLimit)}`
                  : 'Auto'
              }
              hint={budget ? `Approval mode: ${budget.approvalMode}` : 'Wallet-managed'}
            />
          </section>

          <section className="grid gap-6 lg:grid-cols-2">
            <Card className="border-white/70 bg-white/80">
              <CardContent className="space-y-3 p-6">
                <h2 className="text-sm font-semibold uppercase tracking-[0.3em] text-muted-foreground">
                  Input schema
                </h2>
                <SchemaBlock data={schema?.schemas?.input} />
              </CardContent>
            </Card>
            <Card className="border-white/70 bg-white/80">
              <CardContent className="space-y-3 p-6">
                <h2 className="text-sm font-semibold uppercase tracking-[0.3em] text-muted-foreground">
                  Output schema
                </h2>
                <SchemaBlock data={schema?.schemas?.output} />
              </CardContent>
            </Card>
          </section>

          {budget && (
            <Card className="border-white/70 bg-white/80">
              <CardContent className="grid gap-6 p-6 md:grid-cols-3">
                <BudgetMetric
                  label="Monthly allocation"
                  value={currency.format(budget.monthlyLimit)}
                  hint={`${currency.format(budget.remaining)} remaining`}
                />
                <BudgetMetric
                  label="Per-transaction"
                  value={
                    budget.perTransactionLimit
                      ? currency.format(budget.perTransactionLimit)
                      : 'Inherit wallet'
                  }
                  hint="Spending guardrails"
                />
                <BudgetMetric
                  label="Auto-approve threshold"
                  value={
                    budget.approvalThreshold
                      ? currency.format(budget.approvalThreshold)
                      : 'Manual review'
                  }
                  hint={budget.autoReload ? 'Auto reload enabled' : 'Manual approvals'}
                />
              </CardContent>
            </Card>
          )}

          <div id="request-service-panel">
            <RequestServiceForm responderAgentId={agent.id} responderAgentName={agent.name} />
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

function SchemaBlock({ data }: { data?: AgentSchemaDefinition['schemas']['input'] | null }) {
  if (!data) {
    return <p className="text-sm text-muted-foreground">Schema not published yet.</p>;
  }
  return (
    <pre className="overflow-auto rounded-2xl border border-border bg-background/70 p-4 text-xs text-muted-foreground">
      {JSON.stringify(data, null, 2)}
    </pre>
  );
}

function StatCard({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <Card className="border-white/70 bg-white/80">
      <CardContent className="space-y-1 p-5">
        <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">{label}</p>
        <p className="text-2xl font-display text-foreground">{value}</p>
        {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
      </CardContent>
    </Card>
  );
}

function BudgetMetric({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">{label}</p>
      <p className="mt-2 text-xl font-semibold text-foreground">{value}</p>
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

function ratingFromTrust(trust: number) {
  return Math.max(3.5, Math.min(5, +(trust / 20).toFixed(1)));
}

function formatTag(tag: string) {
  return tag
    .split(/[-_]/)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(' ');
}
