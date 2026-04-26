import { ConflictException, Injectable, Logger } from '@nestjs/common';
import { randomBytes } from 'crypto';
import { CreateOrderDto } from '../dto/create-order.dto';
import { OrderResponse } from '../interfaces/order-response.interface';
import { InventoryClientService } from './inventory-client.service';

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);

  constructor(private readonly inventoryClient: InventoryClientService) {}

  async createOrder(dto: CreateOrderDto): Promise<OrderResponse> {
    this.logger.log(
      `Order requested: product=${dto.productId}, quantity=${dto.quantity}.`,
    );

    const reservation = await this.inventoryClient.reserveStock(
      dto.productId,
      dto.quantity,
    );

    const orderId = this.generateOrderId();

    if (reservation.status === 'APPROVED') {
      this.logger.log(`Order confirmed: ${orderId}.`);

      return {
        orderId,
        productId: dto.productId,
        quantity: dto.quantity,
        status: 'CONFIRMED',
        message: 'Order confirmed and stock reserved.',
        timestamp: new Date().toISOString(),
      };
    }

    this.logger.warn(`Order rejected: ${orderId}.`);

    throw new ConflictException({
      orderId,
      productId: dto.productId,
      quantity: dto.quantity,
      available: reservation.available,
      status: 'REJECTED',
      message: reservation.message,
    });
  }

  getDemo(): {
    description: string;
    sampleRequest: CreateOrderDto;
    serviceTarget: string;
    timestamp: string;
  } {
    return {
      description: 'Demo payload for placing an order.',
      sampleRequest: {
        productId: 1,
        quantity: 2,
      },
      serviceTarget:
        process.env.INVENTORY_SERVICE_URL ?? 'http://localhost:3001',
      timestamp: new Date().toISOString(),
    };
  }

  private generateOrderId(): string {
    return `ord_${randomBytes(6).toString('hex')}`;
  }
}
