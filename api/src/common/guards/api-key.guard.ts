import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RequestContextService } from '../context/request-context.service';

@Injectable()
export class ApiKeyAuthGuard extends AuthGuard('api-key') {
  constructor(private readonly context: RequestContextService) {
    super();
  }

  handleRequest(
    err: any,
    user: any,
    info: any,
    context: ExecutionContext,
    status?: any,
  ) {
    if (user) {
      this.context.set({
        authType: 'api-key',
        companyId: user.companyId,
      });
      const request = context.switchToHttp().getRequest();
      request.companyId = user.companyId;
      request.apiKeyId = user.apiKeyId;
    }
    return super.handleRequest(err, user, info, context, status);
  }
}
