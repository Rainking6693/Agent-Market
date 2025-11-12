import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AgentsModule } from './agents/agents.module.js';
import { AuthModule } from './auth/auth.module.js';
import { DatabaseModule } from './database/database.module.js';
import { HealthModule } from './health/health.module.js';
import { PaymentsModule } from './payments/payments.module.js';
import { QualityModule } from './quality/quality.module.js';
import { TrustModule } from './trust/trust.module.js';
import { WorkflowsModule } from './workflows/workflows.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', 'env.example'],
    }),
    DatabaseModule,
    AgentsModule,
    PaymentsModule,
    TrustModule,
    WorkflowsModule,
    QualityModule,
    AuthModule,
    HealthModule,
  ],
})
export class AppModule {}
