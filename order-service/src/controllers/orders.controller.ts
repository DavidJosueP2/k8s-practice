import { Body, Controller, Get, Post } from '@nestjs/common';
import { CreateOrderDto } from '../dto/create-order.dto';
import { OrderResponse } from '../interfaces/order-response.interface';
import { OrdersService } from '../services/orders.service';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  async createOrder(@Body() dto: CreateOrderDto): Promise<OrderResponse> {
    return this.ordersService.createOrder(dto);
  }

  @Get('demo')
  getDemo(): {
    description: string;
    sampleRequest: CreateOrderDto;
    serviceTarget: string;
    timestamp: string;
  } {
    return this.ordersService.getDemo();
  }
}
