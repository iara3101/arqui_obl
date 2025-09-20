import { Injectable, Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class HealthService {
  private readonly logger = new Logger(HealthService.name);

  constructor(private readonly prisma: PrismaService) {}

  async check() {
    try {
      await this.prisma.$queryRaw(Prisma.sql`SELECT 1`);
      return { db: 'up' };
    } catch (error) {
      this.logger.error('Database health check failed', error instanceof Error ? error.stack : undefined);
      return { db: 'down' };
    }
  }
}
