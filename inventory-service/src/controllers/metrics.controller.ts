import { Controller, Get, Res } from '@nestjs/common';
import * as Express from 'express';
import { MetricsService } from '../services/metrics.service';

@Controller()
export class MetricsController {
  constructor(private readonly metricsService: MetricsService) {}

  @Get('metrics')
  async getMetrics(@Res() response: Express.Response): Promise<void> {
    response.setHeader('Content-Type', this.metricsService.contentType);
    response.send(await this.metricsService.getMetrics());
  }
}
