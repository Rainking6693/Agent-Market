import { Controller, Get, Param } from '@nestjs/common';

import { QualityAnalyticsService } from './analytics.service.js';

@Controller('quality/analytics')
export class QualityAnalyticsController {
  constructor(private readonly analyticsService: QualityAnalyticsService) {}

  @Get('agents/:agentId')
  getAgentAnalytics(@Param('agentId') agentId: string) {
    return this.analyticsService.getAgentSummary(agentId);
  }
}
