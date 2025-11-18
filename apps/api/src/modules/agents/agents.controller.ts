import { Body, Controller, Get, Inject, Param, Patch, Post, Put, Query } from '@nestjs/common';
import { AgentStatus, AgentVisibility } from '@prisma/client';

import { AgentsService } from './agents.service.js';
import { AgentDiscoveryQueryDto } from './dto/agent-discovery-query.dto.js';
import { CreateAgentDto } from './dto/create-agent.dto.js';
import { ExecuteAgentDto } from './dto/execute-agent.dto.js';
import { ReviewAgentDto } from './dto/review-agent.dto.js';
import { SubmitForReviewDto } from './dto/submit-for-review.dto.js';
import { UpdateAgentDto } from './dto/update-agent.dto.js';
import { UpdateAgentBudgetDto } from './dto/update-budget.dto.js';
import { X402Service } from '../x402/x402.service.js';

@Controller('agents')
export class AgentsController {
  constructor(
    @Inject(AgentsService) private readonly agentsService: AgentsService,
    @Inject(X402Service) private readonly x402Service: X402Service,
  ) {}

  @Post()
  create(@Body() body: CreateAgentDto) {
    return this.agentsService.create(body);
  }

  @Get()
  findAll(
    @Query('status') status?: AgentStatus,
    @Query('visibility') visibility?: AgentVisibility,
    @Query('category') category?: string,
    @Query('tag') tag?: string,
    @Query('search') search?: string,
    @Query('verifiedOnly') verifiedOnly?: string,
    @Query('creatorId') creatorId?: string,
  ) {
    return this.agentsService.findAll({
      status,
      visibility,
      category,
      tag,
      search,
      verifiedOnly: (verifiedOnly ?? '').toLowerCase() === 'true',
      creatorId,
    });
  }

  @Get('discover')
  async discover(@Query() query: AgentDiscoveryQueryDto) {
    const discovery = await this.agentsService.discover(query);
    const agentsWithPayments = await Promise.all(
      discovery.agents.map(async (agent) => ({
        ...agent,
        paymentMethods: await this.safePaymentMethods(agent.id),
      })),
    );

    return {
      ...discovery,
      agents: agentsWithPayments,
    };
  }

  @Get(':id/schema')
  getSchema(@Param('id') id: string) {
    return this.agentsService.getAgentSchema(id);
  }

  @Get(':id/a2a-transactions')
  listA2aTransactions(@Param('id') id: string) {
    return this.agentsService.listAgentA2aTransactions(id);
  }

  @Get(':id/network')
  getNetwork(@Param('id') id: string) {
    return this.agentsService.getAgentNetwork(id);
  }

  @Get(':id/budget')
  getBudget(@Param('id') id: string) {
    return this.agentsService.getAgentBudget(id);
  }

  @Get(':id/payment-history')
  getPaymentHistory(@Param('id') id: string) {
    return this.agentsService.getAgentPaymentHistory(id);
  }

  @Patch(':id/budget')
  updateBudget(@Param('id') id: string, @Body() body: UpdateAgentBudgetDto) {
    return this.agentsService.updateAgentBudget(id, body);
  }

  @Get('slug/:slug')
  async findBySlug(@Param('slug') slug: string) {
    const agent = await this.agentsService.findBySlug(slug);
    return {
      ...agent,
      paymentMethods: await this.safePaymentMethods(agent.id),
    };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const agent = await this.agentsService.findOne(id);
    return {
      ...agent,
      paymentMethods: await this.safePaymentMethods(agent.id),
    };
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() body: UpdateAgentDto) {
    return this.agentsService.update(id, body);
  }

  @Post(':id/submit')
  submit(@Param('id') id: string, @Body() body: SubmitForReviewDto) {
    return this.agentsService.submitForReview(id, body);
  }

  @Post(':id/review')
  review(@Param('id') id: string, @Body() body: ReviewAgentDto) {
    return this.agentsService.reviewAgent(id, body);
  }

  @Post(':id/execute')
  execute(@Param('id') id: string, @Body() body: ExecuteAgentDto) {
    return this.agentsService.executeAgent(id, body);
  }

  @Get(':id/executions')
  executions(@Param('id') id: string) {
    return this.agentsService.listExecutions(id);
  }

  @Get(':id/reviews')
  reviews(@Param('id') id: string) {
    return this.agentsService.listReviews(id);
  }

  private async safePaymentMethods(agentId: string) {
    try {
      return await this.x402Service.getPaymentMethods(agentId);
    } catch {
      return [];
    }
  }
}
