export type ReservationStatus = 'APPROVED' | 'REJECTED';

export interface ReserveStockResponse {
  productId: number;
  requested: number;
  available: number;
  status: ReservationStatus;
  message: string;
  timestamp: string;
}
