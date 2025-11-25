import { LogtoClient } from '@logto/node';
import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';

@Injectable()
export class LogtoAuthGuard implements CanActivate {
  private logtoClient: LogtoClient | null = null;

  constructor(private readonly configService: ConfigService) {
    const endpoint = this.configService.get<string>('LOGTO_ENDPOINT');
    const appId = this.configService.get<string>('LOGTO_APP_ID');
    const appSecret = this.configService.get<string>('LOGTO_APP_SECRET');

    if (endpoint && appId && appSecret) {
      this.logtoClient = new LogtoClient({
        endpoint,
        appId,
        appSecret,
      });
    }
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    if (!this.logtoClient) {
      throw new UnauthorizedException('Logto is not configured');
    }

    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException('No token provided');
    }

    try {
      // Verify the access token with Logto
      const userInfo = await this.logtoClient.verifyAccessToken(token);
      
      // Attach user info to request for use in controllers
      (request as Request & { user: typeof userInfo }).user = userInfo;
      
      return true;
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}

