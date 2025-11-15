import { ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthGuard } from '@nestjs/passport';

import { ServiceAccountsService } from '../service-accounts.service.js';

import type { Request } from 'express';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(
    private readonly configService: ConfigService,
    private readonly serviceAccounts: ServiceAccountsService,
  ) {
    super();
  }

  async canActivate(context: ExecutionContext) {
    if (!this.isEnforced()) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();
    const apiKey = this.extractApiKey(request);

    if (apiKey) {
      const principal = await this.serviceAccounts.validateApiKey(apiKey);
      if (!principal) {
        throw new UnauthorizedException('Invalid API key');
      }
      request.user = principal;
      return true;
    }

    return super.canActivate(context);
  }

  handleRequest(err: unknown, user: unknown) {
    if (!this.isEnforced()) {
      if (err) {
        throw err;
      }
      return user ?? null;
    }

    if (err || !user) {
      throw err || new UnauthorizedException();
    }

    return user;
  }

  private isEnforced() {
    const flag = this.configService.get<string>('AP2_REQUIRE_AUTH', 'true');
    return flag?.toLowerCase() === 'true';
  }

  private extractApiKey(request: Request) {
    const headerKey = (request.headers['x-agent-api-key'] ??
      request.headers['x-api-key']) as string | string[] | undefined;
    if (typeof headerKey === 'string' && headerKey.trim().length > 0) {
      return headerKey.trim();
    }
    if (Array.isArray(headerKey)) {
      const first = headerKey.find((value) => value && value.trim().length > 0);
      if (first) {
        return first.trim();
      }
    }

    const authHeader = request.headers.authorization;
    if (typeof authHeader === 'string' && authHeader.startsWith('ApiKey ')) {
      return authHeader.slice('ApiKey '.length).trim();
    }

    return null;
  }
}
