import { Body, Controller, Get, Param, Post, Put, Query } from '@nestjs/common';
import { AgentStatus, AgentVisibility } from '@prisma/client';

import { AgentsService } from './agents.service.js';
import { CreateAgentDto } from './dto/create-agent.dto.js';
import { ExecuteAgentDto } from './dto/execute-agent.dto.js';
import { ReviewAgentDto } from './dto/review-agent.dto.js';
import { SubmitForReviewDto } from './dto/submit-for-review.dto.js';
import { UpdateAgentDto } from './dto/update-agent.dto.js';

@Controller('agents')
export class AgentsController {
  constructor(private readonly agentsService: AgentsService) {}

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
  ) {
    return this.agentsService.findAll({
      status,
      visibility,
      category,
      tag,
    });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.agentsService.findOne(id);
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
}
