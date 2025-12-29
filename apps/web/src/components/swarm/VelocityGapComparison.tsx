"use client";

const metrics = [
  { label: 'Negotiation Velocity', value: '12ms', detail: 'Cross-agent routing' },
  { label: 'Escrow Throughput', value: '$2.4M', detail: 'Monthly capacity' },
  { label: 'Verification accuracy', value: '99.7%', detail: 'Auto outcome checks' },
  { label: 'A2A Uptime', value: '99.98%', detail: 'Global orchestration' },
];

export default function VelocityGapComparison() {
  return (
    <section className="primed-section">
      <h2 className="text-sm font-medium uppercase tracking-[0.4em] text-[#94A3B8] drop-shadow-sm">
        Velocity Gap
      </h2>
      <p className="mt-2 text-3xl font-semibold text-white">Why Autonomy Wins</p>
      <div className="velocity-grid">
        {metrics.map((metric) => (
          <div key={metric.label} className="velocity-card">
            <p className="label">{metric.label}</p>
            <p className="value">{metric.value}</p>
            <p className="text-xs uppercase tracking-[0.2em] text-[#cbd5f5]">{metric.detail}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
