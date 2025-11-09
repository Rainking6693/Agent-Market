import { Module } from '@nestjs/common';

import { AgentsController } from './agents.controller.js';
import { AgentsService } from './agents.service.js';
import { CollaborationController } from './collaboration/collaboration.controller.js';
import { CollaborationService } from './collaboration/collaboration.service.js';
import { PaymentsModule } from '../payments/payments.module.js';

@Module({
  imports: [PaymentsModule],
  controllers: [AgentsController, CollaborationController],
  providers: [AgentsService, CollaborationService],
  exports: [AgentsService],
})
export class AgentsModule {}
