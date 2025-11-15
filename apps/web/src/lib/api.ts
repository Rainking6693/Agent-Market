import ky from 'ky';

import { AUTH_TOKEN_KEY } from '@/lib/constants';

import type { Agent } from '@agent-market/sdk';

export interface AgentBudgetSnapshot {
  agentId: string;
  walletId: string;
  currency: string;
  monthlyLimit: number;
  remaining: number;
  spentThisPeriod: number;
  approvalMode: string;
  perTransactionLimit: number | null;
  approvalThreshold: number | null;
  autoReload: boolean;
  resetsOn: string;
  updatedAt: string;
}

export interface CreateAgentPayload {
  name: string;
  description: string;
  categories: string[];
  tags: string[];
  pricingModel: string;
  visibility?: 'PUBLIC' | 'PRIVATE' | 'UNLISTED';
  basePriceCents?: number;
  inputSchema?: Record<string, unknown>;
  outputSchema?: Record<string, unknown>;
  ap2Endpoint?: string;
  creatorId: string;
}

export interface AgentBudgetPayload {
  monthlyLimit?: number;
  perTransactionLimit?: number | null;
  approvalThreshold?: number | null;
  approvalMode?: string;
  autoReload?: boolean;
}

export interface Ap2NegotiationPayload {
  requesterAgentId: string;
  responderAgentId: string;
  requestedService: string;
  budget: number;
  requirements?: Record<string, unknown>;
  notes?: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

const api = ky.create({
  prefixUrl: API_BASE_URL,
  hooks: {
    beforeRequest: [
      (request) => {
        if (typeof window === 'undefined') {
          return;
        }
        const token = window.localStorage.getItem(AUTH_TOKEN_KEY);
        if (token) {
          request.headers.set('Authorization', `Bearer ${token}`);
        }
      },
    ],
    afterResponse: [
      async (_request, _options, response) => {
        if (response.status === 401 && typeof window !== 'undefined') {
          window.localStorage.removeItem(AUTH_TOKEN_KEY);
          window.dispatchEvent(new CustomEvent('auth:unauthorized'));
        }
      },
    ],
  },
});

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    displayName: string;
  };
  accessToken: string;
  expiresIn: number;
}

export interface AgentListFilters {
  search?: string;
  category?: string;
  limit?: number;
  tag?: string;
  verifiedOnly?: boolean;
  creatorId?: string;
}

export const authApi = {
  login: (email: string, password: string) =>
    api
      .post('auth/login', {
        json: { email, password },
      })
      .json<AuthResponse>(),
  register: (data: { email: string; password: string; displayName: string }) =>
    api
      .post('auth/register', {
        json: data,
      })
      .json<AuthResponse>(),
  googleLogin: (token: string) =>
    api
      .post('auth/google', {
        json: { token },
      })
      .json<AuthResponse>(),
};

export const agentsApi = {
  list: (filters?: AgentListFilters) =>
    api
      .get('agents', {
        searchParams: {
          ...(filters?.search ? { search: filters.search } : {}),
          ...(filters?.category ? { category: filters.category } : {}),
          ...(filters?.limit ? { limit: String(filters.limit) } : {}),
          ...(filters?.tag ? { tag: filters.tag } : {}),
          ...(filters?.verifiedOnly ? { verifiedOnly: 'true' } : {}),
          ...(filters?.creatorId ? { creatorId: filters.creatorId } : {}),
        },
      })
      .json<Agent[]>(),
  getById: (id: string) => api.get(`agents/${id}`).json<Agent>(),
  create: (payload: CreateAgentPayload) =>
    api
      .post('agents', {
        json: payload,
      })
      .json<Agent>(),
  updateBudget: (agentId: string, payload: AgentBudgetPayload) =>
    api
      .patch(`agents/${agentId}/budget`, {
        json: payload,
      })
      .json<AgentBudgetSnapshot>(),
};

export const ap2Api = {
  requestService: (payload: Ap2NegotiationPayload) =>
    api
      .post('ap2/negotiate', {
        json: payload,
      })
      .json(),
};

export const billingApi = {
  changePlan: (planSlug: string) =>
    api
      .post('billing/subscription/apply', {
        json: { planSlug },
      })
      .json(),
  createCheckoutSession: (planSlug: string, successUrl?: string, cancelUrl?: string) =>
    api
      .post('billing/subscription/checkout', {
        json: { planSlug, successUrl, cancelUrl },
      })
      .json<{ checkoutUrl: string | null; subscription?: unknown }>(),
  createTopUpSession: (amountCents: number, successUrl?: string, cancelUrl?: string) =>
    api
      .post('billing/topup', {
        json: { amountCents, successUrl, cancelUrl },
      })
      .json<{ checkoutUrl: string | null }>(),
};

export { API_BASE_URL, api };
