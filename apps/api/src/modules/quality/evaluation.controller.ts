import { Body, Controller, Get, Param, Post } from '@nestjs/common';

import { RunEvaluationDto } from './dto/run-evaluation.dto.js';
import { EvaluationService } from './evaluation.service.js';

@Controller('quality/evaluations')
export class EvaluationController {
  constructor(private readonly evaluationService: EvaluationService) {}

  @Post('run')
  run(@Body() body: RunEvaluationDto) {
    return this.evaluationService.runScenario(body);
  }

  @Get('agent/:agentId')
  listAgentResults(@Param('agentId') agentId: string) {
    return this.evaluationService.listResults(agentId);
  }
}
