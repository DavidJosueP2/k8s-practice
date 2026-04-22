export type InventoryReservationStatus = 'APPROVED' | 'REJECTED';

export interface InventoryReserveResponse {
  productId: number;
  requested: number;
  available: number;
  status: InventoryReservationStatus;
  message: string;
  timestamp: string;
}
