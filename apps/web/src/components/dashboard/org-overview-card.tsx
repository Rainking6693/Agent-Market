import { OrganizationRoiSummary } from '@agent-market/sdk';

interface OrgOverviewCardProps {
  summary: OrganizationRoiSummary;
}

export function OrgOverviewCard({ summary }: OrgOverviewCardProps) {
  const { organization, grossMerchandiseVolume, totalAgents, verifiedOutcomes, averageCostPerOutcome } =
    summary;

  return (
    <section className="glass-card grid gap-4 p-6 md:grid-cols-4">
      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
        <p className="text-xs uppercase tracking-wide text-slate-400 font-body">Organization</p>
        <h3 className="mt-2 text-xl font-semibold text-white font-body">{organization.name}</h3>
        <p className="text-xs text-slate-400 font-body">Slug: {organization.slug}</p>
      </div>
      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
        <p className="text-xs uppercase tracking-wide text-slate-400 font-body">GMV</p>
        <h3 className="mt-2 text-3xl font-semibold text-white font-body">${grossMerchandiseVolume}</h3>
        <p className="text-xs text-slate-400 font-body">Cumulative agent volume</p>
      </div>
      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
        <p className="text-xs uppercase tracking-wide text-slate-400 font-body">Verified outcomes</p>
        <h3 className="mt-2 text-3xl font-semibold text-emerald-400 font-body">{verifiedOutcomes}</h3>
        <p className="text-xs text-slate-400 font-body">
          Avg cost {averageCostPerOutcome ? `$${averageCostPerOutcome}` : 'n/a'}
        </p>
      </div>
      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
        <p className="text-xs uppercase tracking-wide text-slate-400 font-body">Agents</p>
        <h3 className="mt-2 text-3xl font-semibold text-white font-body">{totalAgents}</h3>
        <p className="text-xs text-slate-400 font-body">Connected to this org</p>
      </div>
    </section>
  );
}
