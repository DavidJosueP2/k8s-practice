import { Provider } from '@nestjs/common';
import Redis from 'ioredis';
import { REDIS_CLIENT } from './redis.constants';

export const redisProvider: Provider = {
  provide: REDIS_CLIENT,
  useFactory: () => {
    const host = process.env.REDIS_HOST ?? 'localhost';
    const parsedPort = Number(process.env.REDIS_PORT ?? 6379);

    return new Redis({
      host,
      port: Number.isNaN(parsedPort) ? 6379 : parsedPort,
      maxRetriesPerRequest: 3,
      enableReadyCheck: true,
    });
  },
};
