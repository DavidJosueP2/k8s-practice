import {
  ConflictException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import Redis from 'ioredis';
import { ReserveStockDto } from '../dto/reserve-stock.dto';
import {
  ReservationStatus,
  ReserveStockResponse,
} from '../interfaces/reserve-stock-response.interface';
import { Product } from '../interfaces/product.interface';
import { REDIS_CLIENT } from '../redis/redis.constants';

@Injectable()
export class InventoryService implements OnModuleInit {
  private readonly logger = new Logger(InventoryService.name);
  private readonly initialProducts: Product[] = [
    { id: 1, name: 'Laptop', stock: 10 },
    { id: 2, name: 'Mouse', stock: 25 },
    { id: 3, name: 'Keyboard', stock: 15 },
    { id: 4, name: 'Monitor', stock: 8 },
  ];

  constructor(@Inject(REDIS_CLIENT) private readonly redis: Redis) {}

  async onModuleInit(): Promise<void> {
    await this.seedInitialProducts();
  }

  async getAllProducts(): Promise<Product[]> {
    this.logger.log('Inventory list requested.');

    const keys: string[] = [];
    let cursor = '0';

    do {
      const [nextCursor, batch] = await this.redis.scan(
        cursor,
        'MATCH',
        'product:*',
        'COUNT',
        '100',
      );

      cursor = nextCursor;
      keys.push(...batch);
    } while (cursor !== '0');

    if (keys.length === 0) {
      return [];
    }

    const pipeline = this.redis.pipeline();
    keys.forEach((key) => pipeline.hgetall(key));

    const results = await pipeline.exec();
    if (!results) {
      return [];
    }

    return results
      .map(([error, hash]) => {
        if (
          error ||
          typeof hash !== 'object' ||
          hash === null ||
          Object.keys(hash).length === 0
        ) {
          return null;
        }

        return this.parseProduct(hash as Record<string, string>);
      })
      .filter((product): product is Product => product !== null)
      .sort((left, right) => left.id - right.id);
  }

  async getProductById(id: number): Promise<Product> {
    this.logger.log(`Product requested: ${id}.`);

    const hash = await this.redis.hgetall(this.getProductKey(id));

    if (Object.keys(hash).length === 0) {
      this.logger.warn(`Product not found: ${id}.`);
      throw new NotFoundException({ message: `Product ${id} not found.` });
    }

    return this.parseProduct(hash);
  }

  async reserveStock(dto: ReserveStockDto): Promise<ReserveStockResponse> {
    this.logger.log(
      `Stock reservation requested: product=${dto.productId}, quantity=${dto.quantity}.`,
    );

    const productKey = this.getProductKey(dto.productId);

    for (let attempt = 1; attempt <= 5; attempt += 1) {
      await this.redis.watch(productKey);
      const hash = await this.redis.hgetall(productKey);

      if (Object.keys(hash).length === 0) {
        await this.redis.unwatch();
        this.logger.warn(`Product not found: ${dto.productId}.`);
        throw new NotFoundException({
          message: `Product ${dto.productId} not found.`,
        });
      }

      const availableStock = Number(hash.stock ?? 0);

      if (availableStock < dto.quantity) {
        await this.redis.unwatch();
        this.logger.warn(
          `Stock reservation rejected: product=${dto.productId}, available=${availableStock}.`,
        );
        return this.buildReservationResponse(
          dto.productId,
          dto.quantity,
          availableStock,
          'REJECTED',
          `Insufficient stock. Only ${availableStock} unit(s) available.`,
        );
      }

      const remainingStock = availableStock - dto.quantity;
      const txResult = await this.redis
        .multi()
        .hset(productKey, 'stock', remainingStock.toString())
        .exec();

      if (txResult !== null) {
        this.logger.log(
          `Stock reserved: product=${dto.productId}, remaining=${remainingStock}.`,
        );
        return this.buildReservationResponse(
          dto.productId,
          dto.quantity,
          remainingStock,
          'APPROVED',
          'Stock reserved successfully.',
        );
      }

      this.logger.warn(
        `Reservation conflict detected for product ${dto.productId}; retrying attempt ${attempt}.`,
      );
    }

    throw new ConflictException({
      message:
        'Unable to reserve stock due to concurrent updates. Please retry.',
    });
  }

  private async seedInitialProducts(): Promise<void> {
    let seededCount = 0;

    for (const product of this.initialProducts) {
      const key = this.getProductKey(product.id);
      const exists = await this.redis.exists(key);

      if (exists === 0) {
        await this.redis.hset(key, {
          id: product.id.toString(),
          name: product.name,
          stock: product.stock.toString(),
        });
        seededCount += 1;
      }
    }

    this.logger.log(
      seededCount > 0
        ? `Seeded ${seededCount} product(s) in Redis.`
        : 'Redis product seed already initialized.',
    );
  }

  private getProductKey(productId: number): string {
    return `product:${productId}`;
  }

  private parseProduct(hash: Record<string, string>): Product {
    return {
      id: Number(hash.id),
      name: hash.name,
      stock: Number(hash.stock),
    };
  }

  private buildReservationResponse(
    productId: number,
    requested: number,
    available: number,
    status: ReservationStatus,
    message: string,
  ): ReserveStockResponse {
    return {
      productId,
      requested,
      available,
      status,
      message,
      timestamp: new Date().toISOString(),
    };
  }
}
