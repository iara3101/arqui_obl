import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import fastifyCors from '@fastify/cors';
import type { FastifyCorsOptions, FastifyCorsOptionsDelegate } from '@fastify/cors';
import fastifyHelmet from '@fastify/helmet';
import type { FastifyHelmetOptions } from '@fastify/helmet';
import fastifyMultipart from '@fastify/multipart';
import type {
  FastifyMultipartAttachFieldsToBodyOptions,
  FastifyMultipartBaseOptions,
  FastifyMultipartOptions,
} from '@fastify/multipart';
import { ConfigService } from '@nestjs/config';
import pino from 'pino';
import { AppModule } from './app.module';
import { PrismaService } from './infrastructure/prisma/prisma.service';
import type {
  FastifyPluginAsync,
  FastifyPluginCallback,
  FastifyPluginOptions,
} from 'fastify';

type CompatibleFastifyPlugin<TOptions extends FastifyPluginOptions> =
  | FastifyPluginCallback<TOptions>
  | FastifyPluginAsync<TOptions>;

type FastifyCorsPluginOptions = FastifyCorsOptions | FastifyCorsOptionsDelegate;

type FastifyMultipartPluginOptions =
  | FastifyMultipartBaseOptions
  | FastifyMultipartOptions
  | FastifyMultipartAttachFieldsToBodyOptions;

async function bootstrap() {
  const adapter = new FastifyAdapter({
    logger: pino({
      level: process.env.LOG_LEVEL ?? 'info',
      transport:
        process.env.NODE_ENV !== 'production'
          ? {
              target: 'pino-pretty',
              options: {
                colorize: true,
                translateTime: 'SYS:standard',
              },
            }
          : undefined,
    }),
  });

  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    adapter,
    {
      bufferLogs: true,
    },
  );
  const logger = new Logger('Bootstrap');

  const configService = app.get(ConfigService);

  await app.register(
    fastifyHelmet as CompatibleFastifyPlugin<FastifyHelmetOptions>,
    { contentSecurityPolicy: false },
  );
  await app.register(
    fastifyCors as CompatibleFastifyPlugin<FastifyCorsPluginOptions>,
    { origin: true },
  );
  await app.register(
    fastifyMultipart as CompatibleFastifyPlugin<FastifyMultipartPluginOptions>,
    {},
  );

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  const swaggerConfig = new DocumentBuilder()
    .setTitle('CRM SaaS API')
    .setDescription('API documentation for CRM SaaS')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, document);

  const prismaService = app.get(PrismaService);
  await prismaService.enableShutdownHooks(app);

  const port = configService.get<number>('app.port', 3000);
  await app.listen({ port, host: '0.0.0.0' });
  logger.log(`Application running on http://localhost:${port}`);
}

void bootstrap();
