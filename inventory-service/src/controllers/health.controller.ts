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

  @Get('secret-demo')
  getSecretDemo(): {
    service: string;
    secretConfigured: boolean;
    message: string;
    internalTokenPreview: string;
    timestamp: string;
  } {
    const message = process.env.DEMO_SECRET_MESSAGE;
    const token = process.env.INTERNAL_DEMO_TOKEN;

    return {
      service: 'inventory-service',
      secretConfigured: Boolean(message && token),
      message: message ?? 'No Kubernetes Secret was loaded.',
      internalTokenPreview: this.maskSecret(token),
      timestamp: new Date().toISOString(),
    };
  }

  private maskSecret(value?: string): string {
    if (!value) {
      return 'not-configured';
    }

    return `${value.slice(0, 4)}...${value.slice(-4)}`;
  }
}
