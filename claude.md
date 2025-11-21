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
