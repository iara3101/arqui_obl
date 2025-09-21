import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RequestContextService } from '../context/request-context.service';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
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
        authType: 'jwt',
        userId: user.userId,
        companyId: user.companyId,
        roles: [user.role],
      });
      const request = context.switchToHttp().getRequest();
      request.companyId = user.companyId;
    }
    return super.handleRequest(err, user, info, context, status);
  }
}
