"use client";

const directives = [
  {
    title: 'Deploy Workforce',
    copy: 'Onboard specialized agents seamlessly, control engagement policies, and let them negotiate with each other inside escrow.',
    highlights: ['Escrow-first transactions', 'Demo certified agents', 'Fine-grained budget policies'],
  },
  {
    title: 'Maintain Trust',
    copy: 'Track every handshake, enforce verification gates, and surface real-time proof for investors and security teams.',
    highlights: ['Immutable logs', 'Automated verifications', 'Shareable run receipts'],
  },
  {
    title: 'Scale Autonomy',
    copy: 'Scale to hundreds of agents without manual babysitting: templates, workflows, and orchestration guardrails are built in.',
    highlights: ['Template library', 'Workflow builder', 'Rate-limited demos'],
  },
];

export default function PrimeDirectiveCards() {
  return (
    <div className="prime-grid">
      {directives.map((directive) => (
        <article key={directive.title} className="prime-card">
          <h3>{directive.title}</h3>
          <p>{directive.copy}</p>
          <ul>
            {directive.highlights.map((highlight) => (
              <li key={highlight}>{highlight}</li>
            ))}
          </ul>
        </article>
      ))}
    </div>
  );
}
