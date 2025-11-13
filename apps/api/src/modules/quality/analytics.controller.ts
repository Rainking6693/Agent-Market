import { Controller, Get, Param, Query } from '@nestjs/common';

import { QualityAnalyticsService } from './analytics.service.js';

@Controller('quality/analytics')
export class QualityAnalyticsController {
  constructor(private readonly analyticsService: QualityAnalyticsService) {}

  @Get('agents/:agentId')
  getAgentAnalytics(@Param('agentId') agentId: string) {
    return this.analyticsService.getAgentSummary(agentId);
  }

  @Get('agents/:agentId/timeseries')
  getAgentTimeseries(
    @Param('agentId') agentId: string,
    @Query('days') days?: string,
  ) {
    const parsedDays = days ? Number.parseInt(days, 10) : undefined;
    return this.analyticsService.getAgentRoiTimeseries(agentId, parsedDays);
  }
}
