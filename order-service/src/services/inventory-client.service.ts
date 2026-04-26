import { BadGatewayException, Injectable, Logger } from '@nestjs/common';
import axios, { AxiosError, AxiosInstance } from 'axios';
import { InventoryReserveResponse } from '../interfaces/inventory-reserve-response.interface';

@Injectable()
export class InventoryClientService {
  private readonly logger = new Logger(InventoryClientService.name);
  private readonly axiosClient: AxiosInstance;

  constructor() {
    const baseURL =
      process.env.INVENTORY_SERVICE_URL ?? 'http://localhost:3001';

    this.axiosClient = axios.create({
      baseURL,
      timeout: 3000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.logger.log(`Inventory target configured: ${baseURL}.`);
  }

  async reserveStock(
    productId: number,
    quantity: number,
  ): Promise<InventoryReserveResponse> {
    try {
      this.logger.log(
        `Calling inventory-service: product=${productId}, quantity=${quantity}.`,
      );

      const response = await this.axiosClient.post<InventoryReserveResponse>(
        '/inventory/reserve',
        {
          productId,
          quantity,
        },
      );

      this.logger.log(`Inventory replied: ${response.data.status}.`);
      return response.data;
    } catch (error) {
      const details = this.describeAxiosError(error);
      this.logger.error(`Inventory call failed: ${details}.`);

      throw new BadGatewayException({
        message: 'Failed to communicate with inventory-service.',
        details,
      });
    }
  }

  private describeAxiosError(error: unknown): string {
    if (error instanceof AxiosError) {
      const statusCode = error.response?.status;
      const statusText = error.response?.statusText;

      if (statusCode) {
        return `inventory-service responded with ${statusCode} ${statusText ?? ''}`.trim();
      }

      if (error.code) {
        return `request failed with code ${error.code}`;
      }

      return error.message;
    }

    return 'unexpected error while calling inventory-service';
  }
}
