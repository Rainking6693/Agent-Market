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
    options?: { jobReference?: string; budget?: number },
  ) {
    return this.request
      .post(`agents/${id}/execute`, {
        json: {
          initiatorId,
          input: JSON.stringify(input),
          jobReference: options?.jobReference,
          budget: options?.budget,
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
}

export const createAgentMarketClient = (options?: AgentMarketClientOptions) =>
  new AgentMarketClient(options);
