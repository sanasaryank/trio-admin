import { BaseEntity } from './common';

export interface RestaurantQR extends BaseEntity {
  restaurantId: number;
  qrCode: string;
  tableNumber?: string;
}
