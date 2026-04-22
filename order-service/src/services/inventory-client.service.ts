import { BadGatewayException, Injectable } from '@nestjs/common';
import axios, { AxiosError, AxiosInstance } from 'axios';
import { InventoryReserveResponse } from '../interfaces/inventory-reserve-response.interface';

@Injectable()
export class InventoryClientService {
  private readonly axiosClient: AxiosInstance;

  constructor() {
    this.axiosClient = axios.create({
      baseURL: process.env.INVENTORY_SERVICE_URL ?? 'http://localhost:3001',
      timeout: 3000,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  async reserveStock(
    productId: number,
    quantity: number,
  ): Promise<InventoryReserveResponse> {
    try {
      const response = await this.axiosClient.post<InventoryReserveResponse>(
        '/inventory/reserve',
        {
          productId,
          quantity,
        },
      );

      return response.data;
    } catch (error) {
      throw new BadGatewayException({
        message: 'Failed to communicate with inventory-service.',
        details: this.describeAxiosError(error),
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
