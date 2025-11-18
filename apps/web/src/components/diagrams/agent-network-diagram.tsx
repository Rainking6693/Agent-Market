export function AgentNetworkDiagram() {
  const specialists = [
    { x: 400, y: 100, label: 'Data Agent', icon: '📊' },
    { x: 600, y: 200, label: 'Analysis Agent', icon: '🔍' },
    { x: 600, y: 400, label: 'Content Agent', icon: '✍️' },
    { x: 400, y: 500, label: 'Code Agent', icon: '💻' },
    { x: 200, y: 400, label: 'API Agent', icon: '🔌' },
    { x: 200, y: 200, label: 'Research Agent', icon: '📚' },
  ];

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
        Your Agent Network
      </text>

      {/* Connection lines from orchestrator to specialists */}
      {specialists.map((spec, idx) => (
        <g key={idx}>
          {/* Connection line */}
          <line
            x1="400"
            y1="300"
            x2={spec.x}
            y2={spec.y}
            className="stroke-brass/30 stroke-1"
            strokeDasharray="4 4"
          />

          {/* Flow indicators */}
          <text
            x={(400 + spec.x) / 2}
            y={(300 + spec.y) / 2}
            textAnchor="middle"
            className="fill-brass/60 text-[10px] font-body"
          >
            hire • pay
          </text>
        </g>
      ))}

      {/* Central Orchestrator Agent */}
      <g className="transition-all hover:scale-105">
        <circle
          cx="400"
          cy="300"
          r="70"
          className="fill-brass/20 stroke-brass stroke-3"
        />
        <text
          x="400"
          y="285"
          textAnchor="middle"
          className="fill-ink font-headline text-lg"
        >
          🎯
        </text>
        <text
          x="400"
          y="305"
          textAnchor="middle"
          className="fill-ink font-headline text-base"
        >
          Your
        </text>
        <text
          x="400"
          y="325"
          textAnchor="middle"
          className="fill-ink font-headline text-base"
        >
          Orchestrator
        </text>
      </g>

      {/* Specialist Agents */}
      {specialists.map((spec, idx) => (
        <g key={idx} className="transition-all hover:scale-110">
          <circle
            cx={spec.x}
            cy={spec.y}
            r="50"
            className="fill-white stroke-brass/40 stroke-2"
          />
          <text
            x={spec.x}
            y={spec.y - 10}
            textAnchor="middle"
            className="fill-ink text-2xl"
          >
            {spec.icon}
          </text>
          <text
            x={spec.x}
            y={spec.y + 20}
            textAnchor="middle"
            className="fill-ink-muted font-body text-xs"
          >
            {spec.label}
          </text>
        </g>
      ))}

      {/* Legend */}
      <g transform="translate(50, 550)">
        <line
          x1="0"
          y1="0"
          x2="30"
          y2="0"
          className="stroke-brass/30 stroke-1"
          strokeDasharray="4 4"
        />
        <text x="35" y="5" className="fill-ink-muted text-xs font-body">
          Autonomous Discovery & Hiring
        </text>
      </g>
    </svg>
  );
}
