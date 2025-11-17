<!-- Copilot / AI agent instructions for the Agent-Market monorepo -->

# Quick Purpose

Help contributors and AI coding agents become productive quickly in this monorepo by
giving a short architecture overview, concrete developer workflows, project-specific
patterns, and references to canonical example code.

## Big Picture (read these first)

- Monorepo managed with npm workspaces + `turbo` (root `package.json`).
- Major apps:
  - `apps/api` — NestJS backend (TypeScript) with Prisma. See `apps/api/package.json` and `tsconfig.*` files.
  - `apps/web` — Next.js frontend. See `apps/web/package.json`.
- Key packages:
  - `packages/agent-sdk` — TypeScript SDK for AP2 discovery/negotiation/settlement (see its `README.md` and examples).
  - `packages/testkit` — Python pytest fixtures / test helpers (useful for end-to-end tests).
- Examples: `examples/autonomous-agent` demonstrates a full agent workflow using `@agent-market/agent-sdk`.

## Essential developer workflows (commands)

- Install workspace deps (from repo root):
  - `npm install`
- Local development (parallel across workspace):
  - `npm run dev` # runs `turbo run dev --parallel`
- Build / CI:
  - `npm run build` # runs `turbo run build`
- Run all tests (JS + Python orchestrated via turborepo rules):
  - `npm run test` # runs `turbo run test`
- App-specific dev/run:
  - API: `cd apps/api && npm run dev` (uses `tsx watch src/main.ts`)
  - Web: `cd apps/web && npm run dev` (Next.js)
- API housekeeping:
  - `cd apps/api && npm run prisma:generate` (postinstall runs this automatically)
- Examples and quickstarts:
  - `cd examples/autonomous-agent && npm install && cp .env.example .env && npm start` — uses `@agent-market/agent-sdk` to demonstrate discovery and AP2 negotiation.
- Python testkit quickstart:
  - `cd packages/testkit && poetry install` then run top-level pytest (or `pytest tests/...`)

## Testing conventions

- Unit / integration tests:
  - `apps/api` uses `jest`.
  - `apps/web` uses `vitest`.
  - End-to-end / cross-language tests use `pytest` under the `tests/` directory and `packages/testkit` fixtures.
- Run targeted tests when developing: run the package-local test script or use `turbo` to scope runs.

## Project-specific patterns & conventions

- Workspaces: packages are linked via npm workspaces — prefer workspace references rather than publishing locally.
- Turborepo: high-level orchestration for lint/build/test. Most per-package scripts are surfaced via `turbo`.
- Env variables: use `env.example` at the repo root. Common vars used by examples and tests include `AGENT_MARKET_API_URL`, `AGENT_API_KEY`, and `SALES_AGENT_ID`.
- Prisma: DB client is generated inside `apps/api` (see `prisma`/ config and `prisma generate` script).
- Linting & formatting: ESLint + Prettier + `lint-staged` + `husky` hooks — follow the existing ESLint rules and code style.

## Integration points & runtime behavior to know

- AP2 protocol / agent-to-agent flows are exercised by `packages/agent-sdk` and `examples/autonomous-agent`.
  - Typical flow: discover → requestService / negotiate → waitForCompletion (poll) → transaction settlement.
  - See `packages/agent-sdk/README.md` for a concise usage snippet.
- Config-driven genesis/evaluation data lives in `configs/evaluations/*.json` and is imported by `scripts/import-genesis-scenarios.ts`.
- Runtime entry points:
  - API: `src/main.ts` under `apps/api`.
  - Web: standard Next.js app under `apps/web/src`.

## Files to inspect for concrete examples

- `package.json` (repo root) — turbo scripts, workspaces
- `apps/api/package.json` — NestJS scripts, prisma, jest
- `apps/web/package.json` — Next.js scripts, vitest
- `packages/agent-sdk/README.md` — SDK usage examples (copy snippets when implementing agent helpers)
- `examples/autonomous-agent/README.md` — hands-on example showing env vars and runtime expectations
- `env.example` — canonical environment variables
- `scripts/` — helper scripts for service accounts, evaluations import, and more

## What AI agents should do (practical guidelines)

- Start by reading the files listed above before changing behavior or adding features.
- When suggesting or making code changes, prefer package-local scripts and follow existing `tsconfig.*` and lint rules.
- For runtime or integration changes, run the API locally (`cd apps/api && npm run dev`) and use `examples/autonomous-agent` to reproduce AP2 flows.
- When editing TypeScript, keep types aligned with surrounding modules and reuse `packages/sdk` / `packages/agent-sdk` helpers.

## Small examples (copy-ready)

Agent SDK discovery/negotiation pattern (from `packages/agent-sdk/README.md`):

```ts
const sdk = new AgentMarketSDK({ agentId: 'agent_a_456', apiKey: process.env.AGENT_API_KEY });
const catalog = await sdk.discover({ capability: 'lead_generation', maxPriceCents: 500 });
const negotiation = await sdk.requestService({
  targetAgentId: catalog.agents[0].id,
  service: 'generate_qualified_leads',
  budget: 45,
});
const completed = await sdk.waitForCompletion(negotiation.id, { intervalMs: 5000 });
```

---

If anything here is unclear or you want more examples (for a specific package, test flow, or CI step), tell me which area to expand and I will update this file.
