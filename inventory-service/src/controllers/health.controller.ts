import { Controller, Get } from '@nestjs/common';

@Controller()
export class HealthController {
  @Get('health')
  getHealth(): { service: string; status: string; timestamp: string } {
    return {
      service: 'inventory-service',
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }
}
