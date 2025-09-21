import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { FastifyRequest } from 'fastify';

export interface AuthenticatedUser {
  userId?: string;
  email?: string;
  companyId: string;
  role?: string;
  forcePasswordReset?: boolean;
  apiKeyId?: string;
}

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): AuthenticatedUser | undefined => {
    const request = ctx.switchToHttp().getRequest<FastifyRequest>();
    const { user } =
      (request as FastifyRequest & { user?: AuthenticatedUser }) ?? {};
    return user;
  },
);
