# Agent Marketplace - Project Context for Claude

## Project Overview

An agent-to-agent marketplace platform enabling AI agents to discover, transact with, and collaborate with other agents autonomously. This is a true agent commerce platform with built-in payment infrastructure, orchestration capabilities, and trust systems.

## Core Vision

- **Primary Goal**: Build a marketplace where AI agents can buy/sell services from other agents
- **Key Innovation**: Agent-led payments (AP2 protocol), autonomous agent-to-agent transactions
- **Market Opportunity**: First-mover in the emerging A2A commerce space

## Technology Stack

### Backend

- **Primary**: Node.js (TypeScript) with NestJS framework
- **Alternative**: Go (for performance-critical services like payments, orchestration)
- **Runtime**: Node.js 20 LTS

### Frontend

- **Web**: Next.js 14 (React) with Tailwind CSS + shadcn/ui
- **State Management**: Zustand + React Query
- **Agent SDK**: TypeScript/JavaScript

### Databases

- **Primary**: PostgreSQL 16 (with pgvector extension for similarity search)
- **Time-Series**: TimescaleDB (metrics, analytics)
- **Cache**: Redis 7 (sessions, rate limiting, discovery cache)
- **Search**: Elasticsearch 8 (agent discovery, full-text search)
- **Message Queue**: RabbitMQ (async jobs, events)

### Infrastructure

- **Cloud**: AWS (ECS Fargate, ALB, CloudFront, S3, Secrets Manager)
- **Containers**: Docker + ECS (simpler than Kubernetes initially)
- **CI/CD**: GitHub Actions
- **IaC**: Terraform
- **Monitoring**: DataDog (APM), Sentry (errors), PostHog (analytics)

## Core System Components

### 1. Agent Payment Infrastructure (AP2 Protocol)

- Agent-led payment protocol (payment processor agnostic)
- Multi-processor support: Stripe Connect (primary), PayPal, Crypto (x402)
- Escrow service for holding funds until service completion
- Settlement engine for batch processing, fees, payouts
- Transaction lifecycle: initiate → authorize → complete/dispute

### 2. Agent-to-Agent Protocol (A2A)

- Agent discovery service (find agents by capability)
- A2A communication protocol (request/response/negotiation)
- Service requests with budget, deadline, expected outcomes
- Agent negotiation and counter-offers
- Cryptographically signed messages

### 3. Agent Wallet System

- Virtual wallets for each agent
- Budget limits and spending controls
- Auto-reload functionality
- Multiple funding sources (credit card, bank, crypto)
- Transaction history and analytics

### 4. Agent Registry & Marketplace

- Agent listing service (CRUD operations)
- Submission and approval workflow
- Agent capabilities catalog (input/output schemas, pricing, SLAs)
- Search and filtering by category, tags, capabilities
- Agent stats (runs, success rate, ratings, revenue)

### 5. Agent Runtime Environment

- Sandboxed execution environment
- Resource monitoring and limits
- Timeout and budget controls
- Execution logging and debugging
- Support for A2A calls within execution

### 6. Orchestration Engine

- Multi-agent workflow system
- Visual workflow builder (drag-and-drop UI)
- Workflow nodes: agents, conditions, loops, merge/split
- Conditional logic and variable binding
- Workflow monitoring and control (pause/resume)

### 7. Security & Trust Infrastructure

- **KYA (Know Your Agent)**: Agent identity verification, trust scoring
- **Sandboxing**: Isolated execution environments
- **Fraud Detection**: Anomaly detection, suspicious behavior monitoring
- **Reputation System**: Multi-factor reputation scoring (reliability, quality, speed, honesty)
- **Dispute Resolution**: Automated and manual dispute handling

## Database Schema (Key Tables)

- **users**: User accounts, roles, organizations
- **agents**: Agent listings, capabilities, pricing, stats
- **agent_wallets**: Balances, limits, funding sources, auto-reload config
- **transactions**: All payment transactions (A2A, H2A, payouts, refunds)
- **agent_executions**: Execution history, input/output, costs, duration
- **reputation_events**: Time-series reputation data (TimescaleDB)
- **escrow_accounts**: Funds held pending service completion
- **workflows**: Multi-agent workflow definitions
- **certifications**: Agent certifications and test results
- **disputes**: Transaction disputes and resolutions

## API Architecture

### REST API Endpoints

- `/api/v1/agents/*` - Agent management (CRUD, publish, execute)
- `/api/v1/executions/*` - Execution status, logs, cancellation
- `/api/v1/a2a/*` - Agent discovery, requests, messaging
- `/api/v1/wallets/*` - Wallet operations, funding, transactions
- `/api/v1/workflows/*` - Workflow management and execution

### WebSocket API

- Real-time execution updates
- Live agent status
- A2A message notifications

### Agent SDK

- Easy integration for agent creators
- Capability registration and handlers
- A2A call helpers
- Wallet management utilities

## Implementation Phases

### Phase 1: MVP (Weeks 1-12)

**Goal**: Basic marketplace with A2A payment capability

- Foundation: Auth, DB setup, CI/CD
- Agent Management: Registry, CRUD, listing UI
- Payment Infrastructure: Wallets, transactions, escrow
- A2A Foundation: AP2 protocol, discovery, messaging
- Agent SDK (basic version)
- **Success**: 10 design partners, 20 agents, 100 A2A transactions

### Phase 2: Orchestration & Scale (Months 4-6)

**Goal**: Multi-agent workflows, advanced features

- Workflow engine with visual builder
- Agent negotiation and recommendations
- Certification and quality assurance
- Dispute resolution system
- Enhanced analytics
- **Success**: 50 agents, $10K GMV, 1,000 transactions

### Phase 3: Ecosystem & Network Effects (Months 7-12)

**Goal**: Build moat through ecosystem

- Creator analytics dashboard
- Enterprise features (SSO, teams, private libraries)
- Third-party integrations
- Mobile apps
- Community features
- **Success**: 1,000+ agents, $1M GMV, 50% A2A transaction rate

## Key Architectural Principles

1. **Microservices Architecture**: Independently deployable services
2. **Event-Driven**: Asynchronous communication via message queues
3. **API-First**: All functionality exposed via documented APIs
4. **Multi-Protocol Support**: AP2, A2A, MCP, custom protocols
5. **Horizontal Scalability**: Stateless services, distributed caching
6. **Security-First**: Zero-trust, end-to-end encryption
7. **Observability**: Comprehensive logging, metrics, tracing

## Critical Features

### Payment Flow

1. Agent A initiates payment to Agent B via AP2
2. System authorizes (checks budget, fraud detection)
3. Funds move to escrow
4. Service executed
5. Outcome validated
6. Escrow released (or refunded if dispute)
7. Settlement engine processes fees and payouts

### A2A Transaction Flow

1. Agent A discovers agents with needed capability
2. Agent A sends service request to Agent B
3. Agent B accepts/rejects/counter-offers
4. Terms negotiated and agreed
5. Payment initiated (via AP2)
6. Service executed
7. Outcome delivered and validated
8. Payment completed
9. Reputation updated for both agents

### Trust & Safety

- Agent identity verification (KYA)
- Reputation scoring across multiple dimensions
- Fraud detection and anomaly monitoring
- Sandboxed execution environments
- Dispute resolution (automated + manual)
- Transaction escrow protection

## Current Status

Repository initialized. Ready to begin Phase 1 implementation starting with:

1. Project structure setup (monorepo)
2. Authentication system
3. Database schemas
4. Core API framework

## Development Priorities

1. **Always**: Security, performance, scalability
2. **Phase 1 Focus**: Core A2A payment flow (agent discovery → transaction → execution → payment)
3. **Quick Wins**: Agent SDK, basic UI, simple workflows
4. **Defer**: Complex enterprise features, mobile apps until Phase 3

## Success Metrics

- **Engagement**: A2A transaction rate (target: 40-50%)
- **Growth**: Number of agents, users, GMV
- **Quality**: Agent ratings (target: 4.5+), success rates
- **Performance**: API response time (<500ms), uptime (99%+)
- **Trust**: Dispute rate (<5%), fraud rate (<1%)

## Team Requirements

**Phase 1**: 5 people (Full-stack lead, Backend, Frontend, DevOps pt, Designer)
**Phase 2-3**: Add 3-4 more (engineers, ML, security)

## Infrastructure Costs

- **Phase 1**: ~$1-2K/month
- **Phase 3**: ~$7-14K/month
- **Services**: Stripe 2.9% + 30¢, variable LLM costs (pass-through)

---

## Quick Reference for Development

### When Adding Features

- Check if it needs A2A protocol support
- Consider payment/escrow implications
- Update reputation system if needed
- Add appropriate logging/metrics
- Document API changes

### When Modifying Agent Logic

- Ensure sandboxing is maintained
- Check budget/spending limits
- Update execution logs
- Consider multi-agent workflow impacts

### When Changing Payment Flow

- Test escrow behavior
- Verify settlement calculations
- Check dispute handling
- Update transaction history
- Test fraud detection rules

### Architecture Decisions

- Favor async operations (use message queues)
- Keep services stateless for scalability
- Use caching aggressively (Redis)
- Log everything (structured JSON logs)
- Measure everything (custom metrics)

<!-- TRIGGER.DEV basic START -->

# Trigger.dev Basic Tasks (v4)

**MUST use `@trigger.dev/sdk` (v4), NEVER `client.defineJob`**

## Basic Task

```ts
import { task } from '@trigger.dev/sdk';

export const processData = task({
  id: 'process-data',
  retry: {
    maxAttempts: 10,
    factor: 1.8,
    minTimeoutInMs: 500,
    maxTimeoutInMs: 30_000,
    randomize: false,
  },
  run: async (payload: { userId: string; data: any[] }) => {
    // Task logic - runs for long time, no timeouts
    console.log(`Processing ${payload.data.length} items for user ${payload.userId}`);
    return { processed: payload.data.length };
  },
});
```

## Schema Task (with validation)

```ts
import { schemaTask } from '@trigger.dev/sdk';
import { z } from 'zod';

export const validatedTask = schemaTask({
  id: 'validated-task',
  schema: z.object({
    name: z.string(),
    age: z.number(),
    email: z.string().email(),
  }),
  run: async (payload) => {
    // Payload is automatically validated and typed
    return { message: `Hello ${payload.name}, age ${payload.age}` };
  },
});
```

## Scheduled Task

```ts
import { schedules } from '@trigger.dev/sdk';

const dailyReport = schedules.task({
  id: 'daily-report',
  cron: '0 9 * * *', // Daily at 9:00 AM UTC
  // or with timezone: cron: { pattern: "0 9 * * *", timezone: "America/New_York" },
  run: async (payload) => {
    console.log('Scheduled run at:', payload.timestamp);
    console.log('Last run was:', payload.lastTimestamp);
    console.log('Next 5 runs:', payload.upcoming);

    // Generate daily report logic
    return { reportGenerated: true, date: payload.timestamp };
  },
});
```

## Triggering Tasks

### From Backend Code

```ts
import { tasks } from '@trigger.dev/sdk';
import type { processData } from './trigger/tasks';

// Single trigger
const handle = await tasks.trigger<typeof processData>('process-data', {
  userId: '123',
  data: [{ id: 1 }, { id: 2 }],
});

// Batch trigger
const batchHandle = await tasks.batchTrigger<typeof processData>('process-data', [
  { payload: { userId: '123', data: [{ id: 1 }] } },
  { payload: { userId: '456', data: [{ id: 2 }] } },
]);
```

### From Inside Tasks (with Result handling)

```ts
export const parentTask = task({
  id: 'parent-task',
  run: async (payload) => {
    // Trigger and continue
    const handle = await childTask.trigger({ data: 'value' });

    // Trigger and wait - returns Result object, NOT task output
    const result = await childTask.triggerAndWait({ data: 'value' });
    if (result.ok) {
      console.log('Task output:', result.output); // Actual task return value
    } else {
      console.error('Task failed:', result.error);
    }

    // Quick unwrap (throws on error)
    const output = await childTask.triggerAndWait({ data: 'value' }).unwrap();

    // Batch trigger and wait
    const results = await childTask.batchTriggerAndWait([
      { payload: { data: 'item1' } },
      { payload: { data: 'item2' } },
    ]);

    for (const run of results) {
      if (run.ok) {
        console.log('Success:', run.output);
      } else {
        console.log('Failed:', run.error);
      }
    }
  },
});

export const childTask = task({
  id: 'child-task',
  run: async (payload: { data: string }) => {
    return { processed: payload.data };
  },
});
```

> Never wrap triggerAndWait or batchTriggerAndWait calls in a Promise.all or Promise.allSettled as this is not supported in Trigger.dev tasks.

## Waits

```ts
import { task, wait } from '@trigger.dev/sdk';

export const taskWithWaits = task({
  id: 'task-with-waits',
  run: async (payload) => {
    console.log('Starting task');

    // Wait for specific duration
    await wait.for({ seconds: 30 });
    await wait.for({ minutes: 5 });
    await wait.for({ hours: 1 });
    await wait.for({ days: 1 });

    // Wait until specific date
    await wait.until({ date: new Date('2024-12-25') });

    // Wait for token (from external system)
    await wait.forToken({
      token: 'user-approval-token',
      timeoutInSeconds: 3600, // 1 hour timeout
    });

    console.log('All waits completed');
    return { status: 'completed' };
  },
});
```

> Never wrap wait calls in a Promise.all or Promise.allSettled as this is not supported in Trigger.dev tasks.

## Key Points

- **Result vs Output**: `triggerAndWait()` returns a `Result` object with `ok`, `output`, `error` properties - NOT the direct task output
- **Type safety**: Use `import type` for task references when triggering from backend
- **Waits > 5 seconds**: Automatically checkpointed, don't count toward compute usage

## NEVER Use (v2 deprecated)

```ts
// BREAKS APPLICATION
client.defineJob({
  id: 'job-id',
  run: async (payload, io) => {
    /* ... */
  },
});
```

Use v4 SDK (`@trigger.dev/sdk`), check `result.ok` before accessing `result.output`

<!-- TRIGGER.DEV basic END -->
