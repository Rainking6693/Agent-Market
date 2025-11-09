import { Injectable, NotFoundException } from '@nestjs/common';
import {
  AgentStatus,
  AgentVisibility,
  ExecutionStatus,
  Prisma,
  ReviewStatus,
} from '@prisma/client';

import { presentAgent, presentExecution, presentReview } from './agents.presenter.js';
import { PrismaService } from '../database/prisma.service.js';
import { Ap2Service } from '../payments/ap2.service.js';
import { WalletsService } from '../payments/wallets.service.js';
import { CreateAgentDto } from './dto/create-agent.dto.js';
import { ExecuteAgentDto } from './dto/execute-agent.dto.js';
import { ReviewAgentDto } from './dto/review-agent.dto.js';
import { SubmitForReviewDto } from './dto/submit-for-review.dto.js';
import { UpdateAgentDto } from './dto/update-agent.dto.js';

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

@Injectable()
export class AgentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly walletsService: WalletsService,
    private readonly ap2Service: Ap2Service,
  ) {}

  async create(data: CreateAgentDto) {
    const slug = slugify(`${data.name}-${Date.now()}`);

    const agent = await this.prisma.agent.create({
      data: {
        slug,
        name: data.name,
        description: data.description,
        categories: data.categories,
        tags: data.tags ?? [],
        pricingModel: data.pricingModel,
        visibility: data.visibility ?? AgentVisibility.PUBLIC,
        creatorId: data.creatorId,
      },
    });

    return presentAgent(agent);
  }

  async findAll(params?: {
    status?: AgentStatus;
    visibility?: AgentVisibility;
    category?: string;
    tag?: string;
  }) {
    const where: Prisma.AgentWhereInput = {};
    if (params?.status) {
      where.status = params.status;
    }
    if (params?.visibility) {
      where.visibility = params.visibility;
    }
    if (params?.category) {
      where.categories = {
        has: params.category,
      };
    }
    if (params?.tag) {
      where.tags = {
        has: params.tag,
      };
    }

    const agents = await this.prisma.agent.findMany({
      where,
      orderBy: {
        updatedAt: 'desc',
      },
    });

    return agents.map(presentAgent);
  }

  async findOne(id: string) {
    const agent = await this.prisma.agent.findUnique({
      where: { id },
    });

    if (!agent) {
      throw new NotFoundException('Agent not found');
    }

    return presentAgent(agent);
  }

  async update(id: string, data: UpdateAgentDto) {
    await this.ensureExists(id);
    const agent = await this.prisma.agent.findUnique({ where: { id } });
    if (!agent) {
      throw new NotFoundException('Agent not found');
    }

    const { categories, tags, ...rest } = data;

    const updatedAgent = await this.prisma.agent.update({
      where: { id },
      data: {
        ...rest,
        categories: categories ?? undefined,
        tags: tags ?? undefined,
      },
    });

    return presentAgent(updatedAgent);
  }

  async submitForReview(id: string, data: SubmitForReviewDto) {
    await this.ensureExists(id);

    const agent = await this.prisma.agent.update({
      where: { id },
      data: {
        status: AgentStatus.PENDING,
      },
    });

    if (data.notes) {
      await this.prisma.agentReview.create({
        data: {
          agentId: id,
          reviewerId: data.reviewerId,
          status: ReviewStatus.NEEDS_WORK,
          notes: data.notes,
        },
      });
    }

    return presentAgent(agent);
  }

  async reviewAgent(id: string, data: ReviewAgentDto) {
    await this.ensureExists(id);

    const agent = await this.prisma.agent.update({
      where: { id },
      data: {
        status: data.targetStatus,
      },
    });

    const review = await this.prisma.agentReview.create({
      data: {
        agentId: id,
        reviewerId: data.reviewerId,
        status: data.reviewStatus,
        notes: data.notes,
      },
    });

    return {
      agent: presentAgent(agent),
      review: presentReview(review),
    };
  }

  async executeAgent(id: string, data: ExecuteAgentDto) {
    await this.ensureExists(id);
    const agentRecord = await this.prisma.agent.findUnique({ where: { id } });
    if (!agentRecord) {
      throw new NotFoundException('Agent not found');
    }
    const parsedInput = this.safeParseJson(data.input);

    const execution = await this.prisma.agentExecution.create({
      data: {
        agentId: id,
        initiatorId: data.initiatorId,
        input: parsedInput,
        status: ExecutionStatus.SUCCEEDED,
        output: {
          message: 'Execution simulated',
          jobReference: data.jobReference ?? null,
        },
        completedAt: new Date(),
      },
    });

    const agentWallet = await this.walletsService.ensureAgentWallet(id);
    const initiatorWallet = await this.walletsService.ensureUserWallet(data.initiatorId);

    const paymentAmount = data.budget ? new Prisma.Decimal(data.budget) : new Prisma.Decimal(5);

    const paymentTransaction = await this.ap2Service.directTransfer(
      initiatorWallet.id,
      agentWallet.id,
      paymentAmount.toNumber(),
      data.jobReference ?? `execution:${execution.id}`,
    );

    const nextTrustScore = Math.min(100, agentRecord.trustScore + 1);
    await this.prisma.agent.update({
      where: { id },
      data: {
        successCount: { increment: 1 },
        trustScore: nextTrustScore,
        lastExecutedAt: new Date(),
      },
    });

    return {
      execution: presentExecution(execution),
      paymentTransaction,
    };
  }

  async listExecutions(agentId: string) {
    await this.ensureExists(agentId);

    const executions = await this.prisma.agentExecution.findMany({
      where: { agentId },
      orderBy: { createdAt: 'desc' },
      take: 25,
    });

    return executions.map(presentExecution);
  }

  async listReviews(agentId: string) {
    await this.ensureExists(agentId);

    const reviews = await this.prisma.agentReview.findMany({
      where: { agentId },
      orderBy: { createdAt: 'desc' },
      take: 25,
    });

    return reviews.map(presentReview);
  }

  private async ensureExists(id: string) {
    const exists = await this.prisma.agent.count({ where: { id } });
    if (!exists) {
      throw new NotFoundException('Agent not found');
    }
  }

  private safeParseJson(raw: string | Record<string, unknown> | undefined) {
    if (!raw) {
      return {};
    }

    if (typeof raw === 'string') {
      try {
        return JSON.parse(raw);
      } catch {
        return { raw };
      }
    }

    return raw;
  }
}
