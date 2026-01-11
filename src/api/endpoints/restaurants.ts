import { mockRestaurantsApi } from '../mock';
import type { Restaurant, RestaurantFormData, QRCode, QRBatchCreateRequest } from '../../types';

export const restaurantsApi = {
  list: (): Promise<Restaurant[]> => {
    return mockRestaurantsApi.list();
  },

  getById: (id: number): Promise<Restaurant> => {
    return mockRestaurantsApi.getById(id);
  },

  create: (data: RestaurantFormData): Promise<Restaurant> => {
    return mockRestaurantsApi.create(data);
  },

  update: (id: number, data: RestaurantFormData): Promise<Restaurant> => {
    return mockRestaurantsApi.update(id, data);
  },

  block: (id: number, blocked: boolean): Promise<Restaurant> => {
    return mockRestaurantsApi.block(id, blocked);
  },

  getQRCodes: (restaurantId: number): Promise<QRCode[]> => {
    return mockRestaurantsApi.getQRCodes(restaurantId);
  },

  createQRBatch: (restaurantId: number, request: QRBatchCreateRequest): Promise<QRCode[]> => {
    return mockRestaurantsApi.createQRBatch(restaurantId, request);
  },

  blockQR: (restaurantId: number, qrId: number, blocked: boolean): Promise<QRCode> => {
    return mockRestaurantsApi.blockQR(restaurantId, qrId, blocked);
  },
};
