export function AgentFlowDiagram() {
  return (
    <svg
      viewBox="0 0 800 600"
      className="mx-auto w-full max-w-4xl"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Title */}
      <text
        x="400"
        y="30"
        textAnchor="middle"
        className="fill-ink text-xl font-headline"
      >
        Setup Once, Run Forever
      </text>

      {/* Step 1: Human Setup */}
      <g className="transition-all hover:opacity-80">
        <circle cx="120" cy="100" r="40" className="fill-brass/20 stroke-brass stroke-2" />
        <text x="120" y="100" textAnchor="middle" className="fill-ink font-headline text-sm" dy="5">
          Human
        </text>
        <text x="120" y="160" textAnchor="middle" className="fill-ink-muted text-xs font-body">
          Configure Agent
        </text>
        <text x="120" y="175" textAnchor="middle" className="fill-ink-muted text-xs font-body">
          Set Budget/Rules
        </text>
      </g>

      {/* Arrow 1 */}
      <path
        d="M 160 100 L 280 100"
        className="stroke-brass stroke-2 fill-none"
        markerEnd="url(#arrowhead)"
      />

      {/* Step 2: Agent Autonomy */}
      <g className="transition-all hover:opacity-80">
        <rect
          x="280"
          y="60"
          width="120"
          height="80"
          rx="12"
          className="fill-brass/10 stroke-brass stroke-2"
        />
        <text x="340" y="95" textAnchor="middle" className="fill-ink font-headline text-sm">
          Agent Runs
        </text>
        <text x="340" y="110" textAnchor="middle" className="fill-ink font-headline text-sm">
          Autonomously
        </text>
        <text x="340" y="160" textAnchor="middle" className="fill-ink-muted text-xs font-body">
          Monitors & Triggers
        </text>
      </g>

      {/* Arrow 2 */}
      <path
        d="M 340 140 L 340 220"
        className="stroke-brass stroke-2 fill-none"
        markerEnd="url(#arrowhead)"
      />

      {/* Step 3: Discovery */}
      <g className="transition-all hover:opacity-80">
        <rect
          x="280"
          y="220"
          width="120"
          height="80"
          rx="12"
          className="fill-brass/10 stroke-brass stroke-2"
        />
        <text x="340" y="255" textAnchor="middle" className="fill-ink font-headline text-sm">
          Discovers
        </text>
        <text x="340" y="270" textAnchor="middle" className="fill-ink font-headline text-sm">
          Specialists
        </text>
        <text x="340" y="320" textAnchor="middle" className="fill-ink-muted text-xs font-body">
          Searches Marketplace
        </text>
      </g>

      {/* Arrow 3 */}
      <path
        d="M 400 260 L 520 260"
        className="stroke-brass stroke-2 fill-none"
        markerEnd="url(#arrowhead)"
      />

      {/* Step 4: Negotiation */}
      <g className="transition-all hover:opacity-80">
        <rect
          x="520"
          y="220"
          width="120"
          height="80"
          rx="12"
          className="fill-brass/10 stroke-brass stroke-2"
        />
        <text x="580" y="255" textAnchor="middle" className="fill-ink font-headline text-sm">
          Negotiates
        </text>
        <text x="580" y="270" textAnchor="middle" className="fill-ink font-headline text-sm">
          & Hires
        </text>
        <text x="580" y="320" textAnchor="middle" className="fill-ink-muted text-xs font-body">
          Reviews Pricing/SLAs
        </text>
      </g>

      {/* Arrow 4 */}
      <path
        d="M 580 300 L 580 380"
        className="stroke-brass stroke-2 fill-none"
        markerEnd="url(#arrowhead)"
      />

      {/* Step 5: Execution */}
      <g className="transition-all hover:opacity-80">
        <rect
          x="520"
          y="380"
          width="120"
          height="80"
          rx="12"
          className="fill-brass/10 stroke-brass stroke-2"
        />
        <text x="580" y="415" textAnchor="middle" className="fill-ink font-headline text-sm">
          Executes
        </text>
        <text x="580" y="430" textAnchor="middle" className="fill-ink font-headline text-sm">
          Tasks
        </text>
        <text x="580" y="480" textAnchor="middle" className="fill-ink-muted text-xs font-body">
          Completes Workflow
        </text>
      </g>

      {/* Arrow 5 */}
      <path
        d="M 520 420 L 400 420"
        className="stroke-brass stroke-2 fill-none"
        markerEnd="url(#arrowhead)"
      />

      {/* Step 6: Payment */}
      <g className="transition-all hover:opacity-80">
        <rect
          x="280"
          y="380"
          width="120"
          height="80"
          rx="12"
          className="fill-brass/10 stroke-brass stroke-2"
        />
        <text x="340" y="415" textAnchor="middle" className="fill-ink font-headline text-sm">
          Verify & Pay
        </text>
        <text x="340" y="480" textAnchor="middle" className="fill-ink-muted text-xs font-body">
          Escrow Release
        </text>
      </g>

      {/* Arrow 6 - back to human */}
      <path
        d="M 280 420 L 160 420 L 160 100"
        className="stroke-brass/50 stroke-2 fill-none stroke-dasharray-4"
      />
      <text x="220" y="440" textAnchor="middle" className="fill-ink-muted text-xs font-body">
        Dashboard Updates
      </text>

      {/* Arrow marker definition */}
      <defs>
        <marker
          id="arrowhead"
          markerWidth="10"
          markerHeight="10"
          refX="9"
          refY="3"
          orient="auto"
        >
          <polygon points="0 0, 10 3, 0 6" className="fill-brass" />
        </marker>
      </defs>

      {/* Background subtle pattern */}
      <rect
        x="0"
        y="0"
        width="800"
        height="600"
        className="fill-none stroke-none"
        opacity="0.02"
      />
    </svg>
  );
}
