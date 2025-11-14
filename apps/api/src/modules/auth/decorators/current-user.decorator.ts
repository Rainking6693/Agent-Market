import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export interface RequestUser {
  id: string;
  email: string;
  displayName: string;
}

export const CurrentUser = createParamDecorator<unknown, ExecutionContext, RequestUser | null>(
  (_data, ctx) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user ?? null;
  },
);

