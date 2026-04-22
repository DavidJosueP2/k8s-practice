import { Inject, Injectable, OnModuleDestroy } from '@nestjs/common';
import Redis from 'ioredis';
import { REDIS_CLIENT } from './redis.constants';

@Injectable()
export class RedisService implements OnModuleDestroy {
  constructor(@Inject(REDIS_CLIENT) private readonly redisClient: Redis) {}

  get client(): Redis {
    return this.redisClient;
  }

  async onModuleDestroy(): Promise<void> {
    if (this.redisClient.status !== 'end') {
      await this.redisClient.quit();
    }
  }
}
