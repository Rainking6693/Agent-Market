import { Module } from '@nestjs/common';

import { AgentsController } from './agents.controller.js';
import { AgentsService } from './agents.service.js';
import { CollaborationController } from './collaboration/collaboration.controller.js';
import { CollaborationService } from './collaboration/collaboration.service.js';
import { PaymentsModule } from '../payments/payments.module.js';
import { X402Module } from '../x402/x402.module.js';

@Module({
  imports: [PaymentsModule, X402Module],
  controllers: [AgentsController, CollaborationController],
  providers: [AgentsService, CollaborationService],
  exports: [AgentsService],
})
export class AgentsModule {}
