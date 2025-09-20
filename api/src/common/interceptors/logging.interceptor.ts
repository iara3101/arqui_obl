import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { FastifyReply, FastifyRequest } from 'fastify';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { RequestContextService } from '../context/request-context.service';
import { MetricsService } from '../../modules/metrics/metrics.service';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(
    private readonly context: RequestContextService,
    private readonly metrics: MetricsService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<FastifyRequest>();
    const fastifyRequest = request as FastifyRequest & {
      routerPath?: string;
      log: FastifyRequest['log'];
    };
    const reply = context.switchToHttp().getResponse<FastifyReply>();
    const start = process.hrtime();
    return next.handle().pipe(
      tap({
        next: () => {
          const diff = process.hrtime(start);
          const duration = diff[0] + diff[1] / 1e9;
          const requestContext = this.context.get();
          const route = fastifyRequest.routerPath ?? fastifyRequest.url;
          this.metrics.observeRequest(
            fastifyRequest.method,
            route,
            reply.statusCode ?? 200,
            duration,
          );
          fastifyRequest.log.info(
            {
              route,
              method: fastifyRequest.method,
              status: reply.statusCode,
              durationMs: duration * 1000,
              companyId: requestContext?.companyId,
              userId: requestContext?.userId,
              authType: requestContext?.authType,
            },
            'request completed',
          );
        },
        error: (error) => {
          const diff = process.hrtime(start);
          const duration = diff[0] + diff[1] / 1e9;
          const requestContext = this.context.get();
          const route = fastifyRequest.routerPath ?? fastifyRequest.url;
          const status = error?.status ?? 500;
          this.metrics.observeRequest(
            fastifyRequest.method,
            route,
            status,
            duration,
          );
          fastifyRequest.log.error(
            {
              route,
              method: fastifyRequest.method,
              status,
              durationMs: duration * 1000,
              companyId: requestContext?.companyId,
              userId: requestContext?.userId,
              authType: requestContext?.authType,
              error: error.message,
            },
            'request failed',
          );
        },
      }),
    );
  }
}
