import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ALLOW_API_KEY_KEY, API_KEY_ONLY_KEY } from '../../../common/decorators/api-key.decorator';
import type { RequestApiKeyContext } from '../../../common/interfaces/request-api-key.interface';
import { ApikeysService } from '../apikeys.service';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(private readonly reflector: Reflector, private readonly apiKeysService: ApikeysService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const allowApiKey = this.reflector.getAllAndOverride<boolean>(ALLOW_API_KEY_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    const apiKeyOnly = this.reflector.getAllAndOverride<boolean>(API_KEY_ONLY_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!allowApiKey && !apiKeyOnly) {
      return true;
    }

    const request = context.switchToHttp().getRequest();

    if (request.user) {
      return true;
    }

    const rawKey = (request.headers['x-api-key'] ?? request.headers['X-API-Key']) as string | undefined;

    if (!rawKey) {
      throw new UnauthorizedException('API key required');
    }

    const apiKey = await this.apiKeysService.validate(rawKey);

    request.apiKey = {
      id: apiKey.id,
      companyId: apiKey.companyId,
      name: apiKey.name,
      prefix: apiKey.prefix,
    } as RequestApiKeyContext;

    return true;
  }
}
