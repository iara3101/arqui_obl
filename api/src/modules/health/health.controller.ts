import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async getHealth(): Promise<{ db: string }> {
    await this.prisma.$queryRaw`SELECT 1`;
    return { db: 'up' };
  }
}
