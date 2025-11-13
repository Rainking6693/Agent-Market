import ky, { Options as KyOptions } from 'ky';

export interface AgentMarketClientOptions {
  baseUrl?: string;
  apiKey?: string;
  kyOptions?: KyOptions;
}

export interface AgentFilters extends Record<string, string | undefined> {
  status?: string;
  visibility?: string;
}

export interface AgentPayload {
  name: string;
  description: string;
  categories: string[];
  tags?: string[];
  pricingModel: string;
  visibility?: string;
  creatorId: string;
}

export interface Agent {
  id: string;
  slug: string;
  name: string;
  description: string;
  status: string;
  visibility: string;
  categories: string[];
  tags: string[];
  pricingModel: string;
  creatorId: string;
  createdAt: string;
  updatedAt: string;
  verificationStatus: string;
  trustScore: number;
  successCount: number;
  failureCount: number;
}

export interface AgentExecution {
  id: string;
  status: string;
  agentId: string;
  initiatorId: string;
  initiatorType: string;
  sourceWalletId?: string;
  input: unknown;
  output?: unknown;
  error?: string;
  cost?: string;
  createdAt: string;
  completedAt?: string;
}

export interface AgentExecutionResponse {
  execution: AgentExecution;
  paymentTransaction: Transaction;
}

export interface Wallet {
  id: string;
  ownerType: string;
  ownerUserId?: string | null;
  ownerAgentId?: string | null;
  currency: string;
  balance: string;
  reserved: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateWalletPayload {
  ownerType: string;
  ownerUserId?: string;
  ownerAgentId?: string;
  currency?: string;
}

export interface Transaction {
  id: string;
  walletId: string;
  type: string;
  status: string;
  amount: string;
  reference?: string | null;
  metadata?: Record<string, unknown> | null;
  createdAt: string;
  settledAt?: string | null;
}

export interface InitiateAp2PaymentPayload {
  sourceWalletId: string;
  destinationWalletId: string;
  amount: number;
  purpose: string;
  memo?: string;
  metadata?: Record<string, unknown>;
}

export interface Ap2PaymentResponse {
  escrow: {
    id: string;
    status: string;
    amount: string;
    sourceWalletId: string;
    destinationWalletId: string;
    createdAt: string;
  };
  holdTransaction: Transaction;
}

export interface AgentCertificationRecord {
  id: string;
  agentId: string;
  status: string;
  reviewerId?: string | null;
  checklistId?: string | null;
  evidence?: Record<string, unknown> | null;
  notes?: string | null;
  expiresAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface EvaluationScenarioSummary {
  id: string;
  name: string;
  vertical?: string | null;
  input: Record<string, unknown>;
  expected?: Record<string, unknown> | null;
  tolerances?: Record<string, unknown> | null;
}

export interface EvaluationResultRecord {
  id: string;
  agentId: string;
  scenario: EvaluationScenarioSummary;
  status: string;
  latencyMs?: number | null;
  cost?: string | null;
  logs?: Record<string, unknown> | null;
  createdAt: string;
}

export interface ServiceAgreementRecord {
  id: string;
  agentId: string;
  buyerId?: string | null;
  workflowId?: string | null;
  escrowId?: string | null;
  outcomeType: string;
  targetDescription: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface OutcomeVerificationRecord {
  id: string;
  serviceAgreementId: string;
  escrowId?: string | null;
  status: string;
  evidence?: Record<string, unknown> | null;
  notes?: string | null;
  verifiedBy?: string | null;
  verifiedAt?: string | null;
  createdAt: string;
}

export interface ServiceAgreementWithVerifications extends ServiceAgreementRecord {
  verifications: OutcomeVerificationRecord[];
}

export interface AgentQualityAnalytics {
  agentId: string;
  certification: {
    status: string | null;
    updatedAt?: string | null;
    expiresAt?: string | null;
    total: number;
  };
  evaluations: {
    total: number;
    passed: number;
    passRate: number;
    averageLatencyMs: number | null;
    averageCost: string | null;
  };
  agreements: {
    active: number;
    completed: number;
    disputed: number;
    pending: number;
  };
  verifications: {
    verified: number;
    rejected: number;
    pending: number;
  };
  a2a: {
    engagements: number;
    totalSpend: string;
  };
  roi: {
    grossMerchandiseVolume: string;
    averageCostPerOutcome: string | null;
    averageCostPerEngagement: string | null;
    verifiedOutcomeRate: number;
  };
}

export interface AgentRoiTimeseriesPoint {
  date: string;
  grossMerchandiseVolume: string;
  verifiedOutcomes: number;
  averageCostPerOutcome: string | null;
}

export interface OrganizationRoiSummary {
  organization: {
    id: string;
    name: string;
    slug: string;
  };
  grossMerchandiseVolume: string;
  totalAgents: number;
  verifiedOutcomes: number;
  averageCostPerOutcome: string | null;
}

export interface OrganizationRoiTimeseriesPoint {
  date: string;
  grossMerchandiseVolume: string;
  verifiedOutcomes: number;
  averageCostPerOutcome: string | null;
}

export interface BillingPlan {
  id: string;
  name: string;
  slug: string;
  priceCents: number;
  seats: number;
  agentLimit: number;
  workflowLimit: number;
  monthlyCredits: number;
  takeRateBasisPoints: number;
  features: string[];
}

export interface BillingSubscription {
  id: string;
  status: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  creditAllowance: number;
  creditUsed: number;
  plan: BillingPlan;
}

export interface CollaborationRequest {
  id: string;
  requesterAgentId: string;
  responderAgentId: string;
  status: string;
  payload?: Record<string, unknown>;
  counterPayload?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface Workflow {
  id: string;
  name: string;
  description?: string | null;
  creatorId: string;
  steps: WorkflowStepInput[];
  budget: string;
  createdAt: string;
  updatedAt: string;
}

export interface WorkflowStepInput {
  agentId: string;
  jobReference?: string;
  budget?: number;
  input?: Record<string, unknown>;
}

export interface WorkflowRun {
  id: string;
  workflowId: string;
  status: string;
  context?: Record<string, unknown> | null;
  totalCost?: string | null;
  createdAt: string;
  completedAt?: string | null;
}

export interface AgentTrustMetrics {
  agentId: string;
  trustScore: number;
  verificationStatus: string;
  verifiedAt?: string | null;
  successCount: number;
  failureCount: number;
  successRate: number;
}
export class AgentMarketClient {
  private readonly request;

  constructor(options: AgentMarketClientOptions = {}) {
    const { baseUrl = 'http://localhost:4000', apiKey, kyOptions } = options;

    this.request = ky.create({
      prefixUrl: baseUrl,
      headers: apiKey
        ? {
            Authorization: `Bearer ${apiKey}`,
          }
        : undefined,
      ...kyOptions,
    });
  }

  async health() {
    return this.request.get('health').json();
  }

  async listAgents(filters?: AgentFilters) {
    return this.request
      .get('agents', {
        searchParams: filters,
      })
      .json<Agent[]>();
  }

  async getAgent(id: string) {
    return this.request.get(`agents/${id}`).json<Agent>();
  }

  async createAgent(payload: AgentPayload) {
    return this.request.post('agents', { json: payload }).json<Agent>();
  }

  async updateAgent(id: string, payload: Partial<AgentPayload>) {
    return this.request.put(`agents/${id}`, { json: payload }).json<Agent>();
  }

  async submitAgent(id: string, reviewerId: string, notes?: string) {
    return this.request
      .post(`agents/${id}/submit`, {
        json: { reviewerId, notes },
      })
      .json<Agent>();
  }

  async executeAgent(
    id: string,
    initiatorId: string,
    input: unknown = {},
    options?: {
      jobReference?: string;
      budget?: number;
      initiatorType?: string;
      initiatorAgentId?: string;
      sourceWalletId?: string;
    },
  ) {
    return this.request
      .post(`agents/${id}/execute`, {
        json: {
          initiatorId,
          input: JSON.stringify(input),
          jobReference: options?.jobReference,
          budget: options?.budget,
          initiatorType: options?.initiatorType,
          initiatorAgentId: options?.initiatorAgentId,
          sourceWalletId: options?.sourceWalletId,
        },
      })
      .json<AgentExecutionResponse>();
  }

  async createWallet(payload: CreateWalletPayload) {
    return this.request.post('wallets', { json: payload }).json<Wallet>();
  }

  async getAgentWallet(agentId: string) {
    return this.request.get(`wallets/agent/${agentId}`).json<Wallet>();
  }

  async getUserWallet(userId: string) {
    return this.request.get(`wallets/user/${userId}`).json<Wallet>();
  }

  async getWallet(id: string) {
    return this.request.get(`wallets/${id}`).json<Wallet>();
  }

  async fundWallet(id: string, amount: number, reference?: string) {
    return this.request
      .post(`wallets/${id}/fund`, {
        json: { amount, reference },
      })
      .json();
  }

  async initiateAp2Payment(payload: InitiateAp2PaymentPayload) {
    return this.request.post('payments/ap2/initiate', { json: payload }).json<Ap2PaymentResponse>();
  }

  async completeAp2Payment(escrowId: string, status: string, failureReason?: string) {
    return this.request
      .post('payments/ap2/complete', {
        json: { escrowId, status, failureReason },
      })
      .json();
  }

  async releaseEscrow(escrowId: string, memo?: string) {
    return this.request
      .post('payments/ap2/release', {
        json: { escrowId, memo },
      })
      .json();
  }

  async createCollaborationRequest(payload: {
    requesterAgentId: string;
    responderAgentId: string;
    payload?: Record<string, unknown>;
  }) {
    return this.request
      .post('agents/a2a', {
        json: payload,
      })
      .json<CollaborationRequest>();
  }

  async respondToCollaboration(payload: {
    requestId: string;
    status: string;
    counterPayload?: Record<string, unknown>;
  }) {
    return this.request
      .post('agents/a2a/respond', {
        json: payload,
      })
      .json<CollaborationRequest>();
  }

  async listCollaborations(agentId: string) {
    return this.request.get(`agents/a2a/${agentId}`).json<CollaborationRequest[]>();
  }

  async getAgentTrust(agentId: string) {
    return this.request.get(`trust/agents/${agentId}`).json<AgentTrustMetrics>();
  }

  async createWorkflow(payload: {
    name: string;
    description?: string;
    creatorId: string;
    budget: number;
    steps: WorkflowStepInput[];
  }) {
    return this.request.post('workflows', { json: payload }).json<Workflow>();
  }

  async listWorkflows() {
    return this.request.get('workflows').json<Workflow[]>();
  }

  async runWorkflow(workflowId: string, initiatorUserId: string) {
    return this.request
      .post(`workflows/${workflowId}/run`, {
        json: { initiatorUserId },
      })
      .json<WorkflowRun>();
  }

  async listWorkflowRuns(workflowId: string) {
    return this.request.get(`workflows/${workflowId}/runs`).json<WorkflowRun[]>();
  }

  async createCertification(payload: {
    agentId: string;
    checklistId?: string;
    evidence?: Record<string, unknown>;
    notes?: string;
  }) {
    return this.request
      .post('quality/certifications', {
        json: payload,
      })
      .json<AgentCertificationRecord>();
  }

  async advanceCertification(
    certificationId: string,
    payload: {
      status?: string;
      reviewerId?: string;
      evidence?: Record<string, unknown>;
      notes?: string;
      expiresAt?: string;
    },
  ) {
    return this.request
      .post(`quality/certifications/${certificationId}/advance`, {
        json: payload,
      })
      .json<AgentCertificationRecord>();
  }

  async listCertifications(agentId: string) {
    return this.request
      .get(`quality/certifications/agent/${agentId}`)
      .json<AgentCertificationRecord[]>();
  }

  async runEvaluation(payload: {
    agentId: string;
    scenarioId?: string;
    scenarioName?: string;
    vertical?: string;
    input?: Record<string, unknown>;
    expected?: Record<string, unknown>;
    tolerances?: Record<string, unknown>;
    passed?: boolean;
    latencyMs?: number;
    cost?: number;
    logs?: Record<string, unknown>;
    certificationId?: string;
  }) {
    return this.request
      .post('quality/evaluations/run', {
        json: payload,
      })
      .json<EvaluationResultRecord>();
  }

  async listEvaluationResults(agentId: string) {
    return this.request
      .get(`quality/evaluations/agent/${agentId}`)
      .json<EvaluationResultRecord[]>();
  }

  async createServiceAgreement(payload: {
    agentId: string;
    buyerId?: string;
    workflowId?: string;
    escrowId?: string;
    outcomeType: string;
    targetDescription: string;
  }) {
    return this.request
      .post('quality/outcomes/agreements', {
        json: payload,
      })
      .json<ServiceAgreementRecord>();
  }

  async recordOutcomeVerification(
    agreementId: string,
    payload: {
      status: string;
      escrowId?: string;
      evidence?: Record<string, unknown>;
      notes?: string;
      reviewerId?: string;
    },
  ) {
    return this.request
      .post(`quality/outcomes/agreements/${agreementId}/verify`, {
        json: payload,
      })
      .json<OutcomeVerificationRecord>();
  }

  async listServiceAgreements(agentId: string) {
    return this.request
      .get(`quality/outcomes/agreements/agent/${agentId}`)
      .json<ServiceAgreementWithVerifications[]>();
  }

  async getAgentQualityAnalytics(agentId: string) {
    return this.request
      .get(`quality/analytics/agents/${agentId}`)
      .json<AgentQualityAnalytics>();
  }

  async getAgentQualityTimeseries(agentId: string, days?: number) {
    return this.request
      .get(`quality/analytics/agents/${agentId}/timeseries`, {
        searchParams: days ? { days: String(days) } : undefined,
      })
      .json<AgentRoiTimeseriesPoint[]>();
  }

  async getOrganizationRoi(slug: string) {
    return this.request.get(`organizations/${slug}/roi`).json<OrganizationRoiSummary>();
  }

  async getOrganizationRoiTimeseries(slug: string, days?: number) {
    return this.request
      .get(`organizations/${slug}/roi/timeseries`, {
        searchParams: days ? { days: String(days) } : undefined,
      })
      .json<OrganizationRoiTimeseriesPoint[]>();
  }

  async listBillingPlans() {
    return this.request.get('billing/plans').json<BillingPlan[]>();
  }

  async getBillingSubscription() {
    return this.request.get('billing/subscription').json<BillingSubscription | null>();
  }

  async applyBillingPlan(planSlug: string) {
    return this.request
      .post('billing/subscription/apply', {
        json: { planSlug },
      })
      .json<BillingSubscription>();
  }

  async createBillingCheckoutSession(
    planSlug: string,
    options?: { successUrl?: string; cancelUrl?: string },
  ) {
    return this.request
      .post('billing/subscription/checkout', {
        json: {
          planSlug,
          successUrl: options?.successUrl,
          cancelUrl: options?.cancelUrl,
        },
      })
      .json<{ checkoutUrl: string | null; subscription?: BillingSubscription }>();
  }
}

export const createAgentMarketClient = (options?: AgentMarketClientOptions) =>
  new AgentMarketClient(options);
