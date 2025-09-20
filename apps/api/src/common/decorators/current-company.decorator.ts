import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { RequestUser } from '../interfaces/request-user.interface';
import type { RequestApiKeyContext } from '../interfaces/request-api-key.interface';

export const CurrentCompany = createParamDecorator((data: unknown, ctx: ExecutionContext): string | undefined => {
  const request = ctx.switchToHttp().getRequest();
  const user = request.user as RequestUser | undefined;
  const apiKey = request.apiKey as RequestApiKeyContext | undefined;
  return user?.companyId ?? apiKey?.companyId;
});

