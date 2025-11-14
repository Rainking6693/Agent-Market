import { ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private readonly configService: ConfigService) {
    super();
  }

  canActivate(context: ExecutionContext) {
    if (!this.isEnforced()) {
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
    const flag = this.configService.get<string>('AP2_REQUIRE_AUTH', 'false');
    return flag?.toLowerCase() === 'true';
  }
}
