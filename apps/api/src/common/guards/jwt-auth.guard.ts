import { ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { ALLOW_API_KEY_KEY, API_KEY_ONLY_KEY } from '../decorators/api-key.decorator';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import type { RequestUser } from '../interfaces/request-user.interface';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private readonly reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    const allowApiKey = this.reflector.getAllAndOverride<boolean>(ALLOW_API_KEY_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    const apiKeyOnly = this.reflector.getAllAndOverride<boolean>(API_KEY_ONLY_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    const request = context.switchToHttp().getRequest();
    const apiKeyHeader = request.headers['x-api-key'] as string | undefined;

    if ((allowApiKey || apiKeyOnly) && apiKeyHeader) {
      return true;
    }

    if (apiKeyOnly) {
      return true;
    }

    return super.canActivate(context);
  }

  handleRequest<TUser = RequestUser>(
    err: unknown,
    user: TUser,
    _info: unknown,
    _context: ExecutionContext,
    _status?: unknown,
  ): TUser {
    if (err || !user) {
      throw err ?? new UnauthorizedException();
    }
    return user;
  }
}
