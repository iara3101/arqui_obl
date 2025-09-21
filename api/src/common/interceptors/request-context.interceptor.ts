import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { FastifyRequest } from 'fastify';
import { Observable, from, lastValueFrom } from 'rxjs';
import { randomUUID } from 'crypto';
import { RequestContextService } from '../context/request-context.service';

@Injectable()
export class RequestContextInterceptor implements NestInterceptor {
  constructor(private readonly context: RequestContextService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<FastifyRequest>();
    const requestId =
      (request.headers['x-request-id'] as string | undefined) ?? randomUUID();

    return from(
      this.context.run(
        {
          requestId,
          authType: 'anonymous',
          ip: request.ip,
          userAgent: request.headers['user-agent'],
        },
        () => lastValueFrom(next.handle()),
      ),
    );
  }
}
