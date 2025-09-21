import { Injectable, Logger } from '@nestjs/common';
import type { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient {
  private readonly logger = new Logger(PrismaService.name);

  constructor(configService: ConfigService) {
    super({
      datasources: {
        db: {
          url: configService.getOrThrow<string>('database.url'),
        },
      },
      log: ['error', 'warn'],
    });

    this.logger.log('Prisma client configured');
  }

  async enableShutdownHooks(app: INestApplication): Promise<void> {
    app.enableShutdownHooks();
  }
}
