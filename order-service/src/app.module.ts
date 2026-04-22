import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { MetricsInterceptor } from './common/interceptors/metrics.interceptor';
import { HealthController } from './controllers/health.controller';
import { MetricsController } from './controllers/metrics.controller';
import { OrdersController } from './controllers/orders.controller';
import { InventoryClientService } from './services/inventory-client.service';
import { MetricsService } from './services/metrics.service';
import { OrdersService } from './services/orders.service';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true })],
  controllers: [OrdersController, HealthController, MetricsController],
  providers: [
    OrdersService,
    InventoryClientService,
    MetricsService,
    {
      provide: APP_INTERCEPTOR,
      useClass: MetricsInterceptor,
    },
  ],
})
export class AppModule {}
