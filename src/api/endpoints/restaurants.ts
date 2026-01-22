import { realRestaurantsApi } from '../real';
import type { Restaurant, RestaurantListItem, RestaurantFormData, QRCode, QRBatchCreateRequest, QRType, LocationsResponse } from '../../types';

// Always use real API
export const restaurantsApi = {
  list: (): Promise<RestaurantListItem[]> => {
    return realRestaurantsApi.list();
  },

  getById: (id: string): Promise<Restaurant> => {
    return realRestaurantsApi.getById(id);
  },

  create: (data: RestaurantFormData): Promise<Restaurant> => {
    return realRestaurantsApi.create(data);
  },

  update: (id: string, data: RestaurantFormData): Promise<Restaurant> => {
    return realRestaurantsApi.update(id, data);
  },

  block: (id: string, isBlocked: boolean): Promise<Restaurant> => {
    return realRestaurantsApi.block(id, isBlocked);
  },

  getQRCodes: (restaurantId: string): Promise<QRCode[]> => {
    return realRestaurantsApi.getQRCodes(restaurantId);
  },

  createQRBatch: (restaurantId: string, request: QRBatchCreateRequest): Promise<QRCode[]> => {
    return realRestaurantsApi.createQRBatch(restaurantId, request);
  },

  blockQR: (restaurantId: string, qrId: string, isBlocked: boolean): Promise<QRCode> => {
    return realRestaurantsApi.blockQR(restaurantId, qrId, isBlocked);
  },

  updateQRType: (restaurantId: string, qrId: string, type: QRType): Promise<QRCode> => {
    return realRestaurantsApi.updateQRType(restaurantId, qrId, type);
  },

  getLocations: (): Promise<LocationsResponse> => {
    return realRestaurantsApi.getLocations();
  },
};
