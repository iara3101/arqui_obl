import { Injectable } from '@nestjs/common';
import {
  Counter,
  Histogram,
  Registry,
  collectDefaultMetrics,
} from 'prom-client';

@Injectable()
export class MetricsService {
  private readonly registry = new Registry();
  private readonly httpDuration: Histogram<string>;
  private readonly httpCounter: Counter<string>;

  constructor() {
    collectDefaultMetrics({ register: this.registry });

    this.httpDuration = new Histogram({
      name: 'http_request_duration_seconds',
      help: 'Duration of HTTP requests in seconds',
      labelNames: ['method', 'route', 'status'],
      buckets: [0.05, 0.1, 0.2, 0.5, 1, 2, 5],
      registers: [this.registry],
    });

    this.httpCounter = new Counter({
      name: 'http_requests_total',
      help: 'Count of HTTP requests',
      labelNames: ['method', 'route', 'status'],
      registers: [this.registry],
    });
  }

  observeRequest(
    method: string,
    route: string,
    status: number,
    durationSeconds: number,
  ): void {
    const labels = { method, route, status: status.toString() };
    this.httpDuration.observe(labels, durationSeconds);
    this.httpCounter.inc(labels);
  }

  async getMetrics(): Promise<string> {
    return this.registry.metrics();
  }
}
