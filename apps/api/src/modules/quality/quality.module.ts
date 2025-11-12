import { Module } from '@nestjs/common';

import { AnalyticsController } from './analytics.controller.js';
import { AnalyticsService } from './analytics.service.js';
import { CertificationController } from './certification.controller.js';
import { CertificationService } from './certification.service.js';
import { EvaluationController } from './evaluation.controller.js';
import { EvaluationService } from './evaluation.service.js';
import { OutcomesController } from './outcomes.controller.js';
import { OutcomesService } from './outcomes.service.js';
import { DatabaseModule } from '../database/database.module.js';
import { PaymentsModule } from '../payments/payments.module.js';

@Module({
  imports: [DatabaseModule, PaymentsModule],
  controllers: [
    CertificationController,
    EvaluationController,
    OutcomesController,
    AnalyticsController,
  ],
  providers: [CertificationService, EvaluationService, OutcomesService, AnalyticsService],
  exports: [CertificationService, EvaluationService, OutcomesService, AnalyticsService],
})
export class QualityModule {}
