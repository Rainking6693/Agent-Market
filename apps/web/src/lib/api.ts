import ky from 'ky';

import { AUTH_TOKEN_KEY } from '@/lib/constants';

import type { Agent } from '@agent-market/sdk';

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
};

export const agentsApi = {
  list: (filters?: AgentListFilters) =>
    api
      .get('agents', {
        searchParams: {
          ...(filters?.search ? { search: filters.search } : {}),
          ...(filters?.category ? { category: filters.category } : {}),
          ...(filters?.limit ? { limit: String(filters.limit) } : {}),
        },
      })
      .json<Agent[]>(),
  getById: (id: string) => api.get(`agents/${id}`).json<Agent>(),
};

export { API_BASE_URL, api };
