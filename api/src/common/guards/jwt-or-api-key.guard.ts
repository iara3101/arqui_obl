import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { JwtAuthGuard } from './jwt-auth.guard';
import { ApiKeyAuthGuard } from './api-key.guard';

@Injectable()
export class JwtOrApiKeyGuard implements CanActivate {
  constructor(
    private readonly jwtGuard: JwtAuthGuard,
    private readonly apiKeyGuard: ApiKeyAuthGuard,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const jwtResult = await Promise.resolve(
        this.jwtGuard.canActivate(context),
      );
      if (jwtResult) {
        return true;
      }
    } catch {
      // ignore and fallback to API key
    }
    const apiKeyResult = await Promise.resolve(
      this.apiKeyGuard.canActivate(context),
    );
    return apiKeyResult === true;
  }
}
