import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
} from '@nestjs/common';
import { ReserveStockDto } from '../dto/reserve-stock.dto';
import { Product } from '../interfaces/product.interface';
import { ReserveStockResponse } from '../interfaces/reserve-stock-response.interface';
import { InventoryService } from '../services/inventory.service';

@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Get()
  async getInventory(): Promise<{ products: Product[]; timestamp: string }> {
    return {
      products: await this.inventoryService.getAllProducts(),
      timestamp: new Date().toISOString(),
    };
  }

  @Get(':id')
  async getInventoryById(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<{ product: Product; timestamp: string }> {
    return {
      product: await this.inventoryService.getProductById(id),
      timestamp: new Date().toISOString(),
    };
  }

  @Post('reserve')
  @HttpCode(HttpStatus.OK)
  async reserveStock(
    @Body() dto: ReserveStockDto,
  ): Promise<ReserveStockResponse> {
    return this.inventoryService.reserveStock(dto);
  }
}
