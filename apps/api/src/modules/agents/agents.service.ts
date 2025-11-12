import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import {
  AgentStatus,
  AgentVisibility,
  BudgetApprovalMode,
  ExecutionStatus,
  InitiatorType,
  PaymentEventStatus,
  Prisma,
  ReviewStatus,
  type Wallet as WalletModel,
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
    const initiatorType = data.initiatorType ?? InitiatorType.USER;

    const paymentAmount = data.budget ? new Prisma.Decimal(data.budget) : new Prisma.Decimal(5);

    const fundingWallet = await this.resolveFundingWallet({
      initiatorType,
      initiatorUserId: data.initiatorId,
      initiatorAgentId: data.initiatorAgentId,
      sourceWalletId: data.sourceWalletId,
      amount: paymentAmount,
    });

    const execution = await this.prisma.agentExecution.create({
      data: {
        agentId: id,
        initiatorId: data.initiatorId,
        initiatorType,
        sourceWalletId: fundingWallet.id,
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

    const paymentTransaction = await this.ap2Service.directTransfer(
      fundingWallet.id,
      agentWallet.id,
      paymentAmount.toNumber(),
      data.jobReference ?? `execution:${execution.id}`,
    );

    await this.recordPaymentEvent({
      transactionId: paymentTransaction.id,
      sourceWalletId: fundingWallet.id,
      destinationWalletId: agentWallet.id,
      amount: paymentAmount,
      initiatorType,
    });

    const counterAgentId =
      initiatorType === InitiatorType.AGENT ? data.initiatorAgentId ?? null : null;
    await this.recordAgentEngagement(id, counterAgentId, initiatorType, paymentAmount);

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

  private async resolveFundingWallet(params: {
    initiatorType: InitiatorType;
    initiatorUserId: string;
    initiatorAgentId?: string;
    sourceWalletId?: string;
    amount: Prisma.Decimal;
  }): Promise<WalletModel> {
    if (params.initiatorType === InitiatorType.USER) {
      const wallet = await this.walletsService.ensureUserWallet(params.initiatorUserId);
      this.assertWalletCanSpend(wallet, params.amount);
      return wallet;
    }

    if (params.initiatorType === InitiatorType.AGENT) {
      const agentId = params.initiatorAgentId;
      if (!agentId) {
        throw new BadRequestException('initiatorAgentId is required for agent-initiated executions');
      }
      await this.ensureExists(agentId);
      const wallet = await this.walletsService.ensureAgentWallet(agentId);
      await this.applyAgentBudget(agentId, params.amount);
      this.assertWalletCanSpend(wallet, params.amount);
      return wallet;
    }

    if (!params.sourceWalletId) {
      throw new BadRequestException('sourceWalletId is required for workflow-initiated executions');
    }

    const wallet = await this.prisma.wallet.findUnique({
      where: { id: params.sourceWalletId },
    });

    if (!wallet) {
      throw new NotFoundException('Wallet not found');
    }

    this.assertWalletCanSpend(wallet, params.amount);
    return wallet;
  }

  private assertWalletCanSpend(wallet: WalletModel, amount: Prisma.Decimal) {
    const available = wallet.balance.minus(wallet.reserved);
    if (available.lessThan(amount)) {
      throw new BadRequestException('Insufficient available funds');
    }

    if (wallet.spendCeiling && amount.greaterThan(wallet.spendCeiling)) {
      throw new BadRequestException('Amount exceeds wallet spend ceiling');
    }

    if (wallet.autoApproveThreshold && amount.greaterThan(wallet.autoApproveThreshold)) {
      throw new BadRequestException('Amount exceeds wallet auto-approval threshold');
    }
  }

  private async applyAgentBudget(agentId: string, amount: Prisma.Decimal) {
    const budget = await this.prisma.agentBudget.findFirst({
      where: { agentId },
      orderBy: { updatedAt: 'desc' },
    });

    if (!budget) {
      return;
    }

    if (budget.approvalMode === BudgetApprovalMode.MANUAL) {
      throw new BadRequestException('Manual approval required before initiating spend');
    }

    if (budget.remaining.lessThan(amount)) {
      throw new BadRequestException('Agent budget exhausted');
    }

    await this.prisma.agentBudget.update({
      where: { id: budget.id },
      data: {
        remaining: budget.remaining.minus(amount),
      },
    });
  }

  private async recordPaymentEvent(params: {
    transactionId: string;
    sourceWalletId: string;
    destinationWalletId: string;
    amount: Prisma.Decimal;
    initiatorType: InitiatorType;
  }) {
    await this.prisma.paymentEvent.create({
      data: {
        transactionId: params.transactionId,
        protocol: 'LEDGER',
        status: PaymentEventStatus.SETTLED,
        sourceWalletId: params.sourceWalletId,
        destinationWalletId: params.destinationWalletId,
        amount: params.amount,
        initiatorType: params.initiatorType,
      },
    });
  }

  private async recordAgentEngagement(
    agentId: string,
    counterAgentId: string | null,
    initiatorType: InitiatorType,
    amount: Prisma.Decimal,
  ) {
    await this.prisma.agentEngagementMetric.upsert({
      where: {
        agentId_counterAgentId_initiatorType: {
          agentId,
          counterAgentId,
          initiatorType,
        },
      },
      update: {
        a2aCount: { increment: 1 },
        totalSpend: { increment: amount },
        lastInteraction: new Date(),
      },
      create: {
        agentId,
        counterAgentId,
        initiatorType,
        a2aCount: 1,
        totalSpend: amount,
        lastInteraction: new Date(),
      },
    });
  }
}
