import { Injectable } from '@nestjs/common';
import { Counter, Registry, collectDefaultMetrics } from 'prom-client';

@Injectable()
export class MetricsService {
  private readonly registry = new Registry();
  private readonly requestCounter: Counter<'route' | 'method'>;

  constructor() {
    collectDefaultMetrics({ register: this.registry });

    this.requestCounter = new Counter({
      name: 'order_service_requests_total',
      help: 'Total HTTP requests handled by order-service',
      labelNames: ['route', 'method'],
      registers: [this.registry],
    });
  }

  increment(route: string, method: string): void {
    this.requestCounter.inc({ route, method });
  }

  async getMetrics(): Promise<string> {
    return this.registry.metrics();
  }

  get contentType(): string {
    return this.registry.contentType;
  }
}
