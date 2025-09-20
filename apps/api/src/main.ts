import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import fastifyCors from '@fastify/cors';
import fastifyMultipart from '@fastify/multipart';
import { randomUUID } from 'crypto';
import pino from 'pino';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { MetricsService } from './modules/metrics/metrics.service';
import { TenantContextService } from './tenancy/tenant-context.service';

function createPinoLogger() {
  const level = process.env.LOG_LEVEL ?? (process.env.NODE_ENV === 'development' ? 'debug' : 'info');
  const isProd = process.env.NODE_ENV === 'production';
  return pino({
    level,
    base: undefined,
    transport: isProd
      ? undefined
      : {
          target: 'pino-pretty',
          options: { singleLine: true, colorize: true },
        },
    redact: { paths: ['req.headers.authorization', 'req.headers.cookie', 'req.body.password'], remove: true },
  });
}

async function bootstrap() {
  const adapter = new FastifyAdapter({
    logger: createPinoLogger(),
    genReqId: () => randomUUID().replace(/-/g, ''),
  });

  const app = await NestFactory.create<NestFastifyApplication>(AppModule, adapter, { bufferLogs: true });

  const configService = app.get(ConfigService);
  const metricsService = app.get(MetricsService);
  const tenantContext = app.get(TenantContextService);
  const swaggerConfig = new DocumentBuilder()
    .setTitle('CRM SaaS API')
    .setDescription('CRM SaaS backend API documentation')
    .setVersion('1.0.0')
    .addBearerAuth({ type: 'http', scheme: 'bearer', bearerFormat: 'JWT' })
    .addApiKey({ type: 'apiKey', name: 'x-api-key', in: 'header' }, 'api-key')
    .build();
  const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, swaggerDocument, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });
  const httpServer = app.getHttpAdapter().getInstance();

  httpServer.addHook('onRequest', (request, reply, done) => {
    tenantContext.enter({ requestId: request.id });
    (request as any).metricsStart = process.hrtime.bigint();
    const childLogger = reply.log.child({ requestId: request.id, path: request.url });
    (reply as any).log = childLogger;
    (request as any).log = childLogger;
    done();
  });

  httpServer.addHook('onResponse', (request, reply, done) => {
    const start = (request as any).metricsStart as bigint | undefined;
    if (start) {
      const diffMs = Number(process.hrtime.bigint() - start) / 1_000_000;
      const route =
        (reply as any).context?.config?.url ??
        (request.routeOptions as any)?.url ??
        (request as any).routerPath ??
        request.url;
      metricsService.recordHttpRequest(request.method, route, reply.statusCode ?? 0, diffMs);
      (reply as any).log.info({ method: request.method, route, statusCode: reply.statusCode, durationMs: diffMs }, 'request.completed');
    }
    done();
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
      forbidNonWhitelisted: true,
    }),
  );

  const corsOrigins = configService.get<string>('CORS_ORIGIN');
  const corsOptions = {
    origin: corsOrigins ? corsOrigins.split(',').map((origin) => origin.trim()) : true,
    credentials: true,
  };
  await app.register(fastifyCors as any, corsOptions as any);

  const maxUploadSize = Number(configService.get<string>('MAX_UPLOAD_SIZE') ?? 10 * 1024 * 1024);
  await app.register(fastifyMultipart as any, {
    limits: { fileSize: maxUploadSize },
  } as any);

  app.enableShutdownHooks();

  const port = Number(configService.get<number>('PORT') ?? 3000);
  const host = configService.get<string>('HOST') ?? '0.0.0.0';

  await app.listen({ port, host });

  httpServer.log.info({ port, host }, 'API listening');
}

bootstrap();

