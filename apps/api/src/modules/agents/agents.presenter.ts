import type {
  Agent,
  AgentExecution,
  AgentReview,
  AgentStatus,
  AgentVisibility,
} from '@prisma/client';

export interface AgentResponse {
  id: string;
  slug: string;
  name: string;
  description: string;
  status: AgentStatus;
  visibility: AgentVisibility;
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

export const presentAgent = (agent: Agent): AgentResponse => ({
  id: agent.id,
  slug: agent.slug,
  name: agent.name,
  description: agent.description,
  status: agent.status,
  visibility: agent.visibility,
  categories: agent.categories,
  tags: agent.tags,
  pricingModel: agent.pricingModel,
  creatorId: agent.creatorId,
  createdAt: agent.createdAt.toISOString(),
  updatedAt: agent.updatedAt.toISOString(),
  verificationStatus: agent.verificationStatus,
  trustScore: agent.trustScore,
  successCount: agent.successCount,
  failureCount: agent.failureCount,
});

export interface AgentExecutionResponse {
  id: string;
  status: AgentExecution['status'];
  agentId: string;
  initiatorId: string;
  input: unknown;
  output?: unknown;
  cost?: string;
  error?: string;
  createdAt: string;
  completedAt?: string;
}

export const presentExecution = (execution: AgentExecution): AgentExecutionResponse => ({
  id: execution.id,
  status: execution.status,
  agentId: execution.agentId,
  initiatorId: execution.initiatorId,
  input: execution.input as unknown,
  output: execution.output as unknown | undefined,
  cost: execution.cost?.toString(),
  error: execution.error ?? undefined,
  createdAt: execution.createdAt.toISOString(),
  completedAt: execution.completedAt?.toISOString(),
});

export interface AgentReviewResponse {
  id: string;
  status: AgentReview['status'];
  notes?: string;
  reviewerId: string;
  createdAt: string;
}

export const presentReview = (review: AgentReview): AgentReviewResponse => ({
  id: review.id,
  status: review.status,
  notes: review.notes ?? undefined,
  reviewerId: review.reviewerId,
  createdAt: review.createdAt.toISOString(),
});
