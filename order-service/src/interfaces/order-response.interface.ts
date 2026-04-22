export type OrderStatus = 'CONFIRMED' | 'REJECTED';

export interface OrderResponse {
  orderId: string;
  productId: number;
  quantity: number;
  status: OrderStatus;
  message: string;
  timestamp: string;
}
