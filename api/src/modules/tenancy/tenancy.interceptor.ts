import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { RequestContextService } from '../../common/context/request-context.service';

@Injectable()
export class TenancyInterceptor implements NestInterceptor {
  constructor(private readonly context: RequestContextService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const companyId = request.companyId as string | undefined;
    if (companyId) {
      this.context.set({ companyId });
    }
    return next.handle();
  }
}
