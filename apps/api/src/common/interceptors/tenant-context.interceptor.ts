import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import type { Observable } from 'rxjs';
import type { RequestApiKeyContext } from '../interfaces/request-api-key.interface';
import type { RequestUser } from '../interfaces/request-user.interface';
import { TenantContextService } from '../../tenancy/tenant-context.service';

@Injectable()
export class TenantContextInterceptor implements NestInterceptor {
  constructor(private readonly tenantContext: TenantContextService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest();
    const user = request.user as RequestUser | undefined;
    const apiKey = request.apiKey as RequestApiKeyContext | undefined;
    const companyId = user?.companyId ?? apiKey?.companyId;
    if (companyId) {
      this.tenantContext.patch({ companyId, userId: user?.userId });
    }
    return next.handle();
  }
}

