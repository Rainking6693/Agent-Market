import { Module } from '@nestjs/common';

import { Ap2Controller } from './ap2.controller.js';
import { Ap2Service } from './ap2.service.js';
import { WalletsController } from './wallets.controller.js';
import { WalletsService } from './wallets.service.js';
import { AuthModule } from '../auth/auth.module.js';

@Module({
  imports: [AuthModule],
  controllers: [WalletsController, Ap2Controller],
  providers: [WalletsService, Ap2Service],
  exports: [WalletsService, Ap2Service],
})
export class PaymentsModule {}
