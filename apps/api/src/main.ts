import 'reflect-metadata';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import express from 'express';
import helmet from 'helmet';

import { AppModule } from './modules/app.module.js';
import { PrismaService } from './modules/database/prisma.service.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });

  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT', 4000);
  const corsOrigins =
    configService.get<string>('CORS_ALLOWED_ORIGINS') ??
    configService.get<string>('WEB_URL', 'http://localhost:3000');
  const normalizeOrigin = (value: string) => value.trim().replace(/\/$/, '');
  const defaultOrigins = ['http://localhost:3000'];
  if (process.env.NODE_ENV === 'production') {
    defaultOrigins.push('https://swarmsync.ai', 'https://www.swarmsync.ai');
  }
  const allowedOrigins = [
    ...defaultOrigins,
    ...corsOrigins.split(',').map(normalizeOrigin).filter(Boolean),
  ].map(normalizeOrigin);

  app.enableCors({
    origin: (origin, callback) => {
      if (!origin) {
        callback(null, true);
        return;
      }
      const normalized = normalizeOrigin(origin);
      if (allowedOrigins.includes(normalized)) {
        callback(null, true);
      } else {
        callback(new Error(`Origin ${origin} not allowed by CORS`));
      }
    },
    credentials: true,
  });

  app.use(helmet());
  // Global JSON body parser
  app.use(express.json());
  app.use('/stripe/webhook', express.raw({ type: '*/*' }));
  // X402 webhook uses JSON body but we need to preserve raw body for signature verification
  app.use('/webhooks/x402', express.json({ verify: (req: unknown, res: unknown, buf: Buffer) => { (req as Record<string, unknown>).rawBody = buf.toString('utf8'); } }));

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidUnknownValues: true,
    }),
  );

  const prismaService = app.get(PrismaService);
  await prismaService.enableShutdownHooks(app);

  await app.listen(port, '0.0.0.0');
}

bootstrap().catch((error) => {
  // eslint-disable-next-line no-console
  console.error('Failed to bootstrap API', error);
  process.exit(1);
});
