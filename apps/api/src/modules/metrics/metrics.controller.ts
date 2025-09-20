import { Controller, Get, Res } from '@nestjs/common';
import type { FastifyReply } from 'fastify';
import { MetricsService } from './metrics.service';

@Controller('metrics')
export class MetricsController {
  constructor(private readonly metricsService: MetricsService) {}

  @Get()
  async getMetrics(@Res({ passthrough: true }) res: FastifyReply) {
    res.header('Content-Type', this.metricsService.getContentType());
    return this.metricsService.expose();
  }
}

