import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { MetricsInterceptor } from './common/interceptors/metrics.interceptor';
import { HealthController } from './controllers/health.controller';
import { InventoryController } from './controllers/inventory.controller';
import { MetricsController } from './controllers/metrics.controller';
import { RedisModule } from './redis/redis.module';
import { InventoryService } from './services/inventory.service';
import { MetricsService } from './services/metrics.service';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), RedisModule],
  controllers: [InventoryController, HealthController, MetricsController],
  providers: [
    InventoryService,
    MetricsService,
    {
      provide: APP_INTERCEPTOR,
      useClass: MetricsInterceptor,
    },
  ],
})
export class AppModule {}
