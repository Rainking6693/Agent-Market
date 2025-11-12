import { Body, Controller, Get, Param, Post } from '@nestjs/common';

import { CertificationService } from './certification.service.js';
import { CreateCertificationDto } from './dto/create-certification.dto.js';
import { UpdateCertificationStatusDto } from './dto/update-certification-status.dto.js';

@Controller('quality/certifications')
export class CertificationController {
  constructor(private readonly certificationService: CertificationService) {}

  @Post()
  create(@Body() body: CreateCertificationDto) {
    return this.certificationService.createCertification(body);
  }

  @Post(':id/advance')
  advance(@Param('id') id: string, @Body() body: UpdateCertificationStatusDto) {
    return this.certificationService.advanceCertification(id, body);
  }

  @Get('agent/:agentId')
  listByAgent(@Param('agentId') agentId: string) {
    return this.certificationService.listForAgent(agentId);
  }
}
