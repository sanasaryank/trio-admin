import type { Restaurant, RestaurantListItem, RestaurantFormData, QRCode, QRBatchCreateRequest, QRType, LocationsResponse } from '../../types';
import { realApiFetch } from './client';
import { env } from '../../config/env';

const RESTAURANTS_BASE_URL = `${env.apiBaseUrl}/admin/restaurants`;
const LOCATIONS_BASE_URL = `${env.apiBaseUrl}/admin/locations`;

export const realRestaurantsApi = {
  list: async (): Promise<RestaurantListItem[]> => {
    const response = await realApiFetch(RESTAURANTS_BASE_URL, {
      method: 'GET',
    });

    return response.json();
  },

  getById: async (id: string): Promise<Restaurant> => {
    const response = await realApiFetch(`${RESTAURANTS_BASE_URL}/${id}`, {
      method: 'GET',
    });

    return response.json();
  },

  create: async (data: RestaurantFormData): Promise<Restaurant> => {
    const response = await realApiFetch(RESTAURANTS_BASE_URL, {
      method: 'POST',
      body: JSON.stringify(data),
    });

    return response.json();
  },

  update: async (id: string, data: RestaurantFormData): Promise<Restaurant> => {
    const response = await realApiFetch(`${RESTAURANTS_BASE_URL}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });

    return response.json();
  },

  block: async (id: string, isBlocked: boolean): Promise<Restaurant> => {
    const response = await realApiFetch(`${RESTAURANTS_BASE_URL}/${id}/block`, {
      method: 'PATCH',
      body: JSON.stringify({ isBlocked }),
    });

    return response.json();
  },

  getQRCodes: async (restaurantId: string): Promise<QRCode[]> => {
    const response = await realApiFetch(`${RESTAURANTS_BASE_URL}/${restaurantId}/qr`, {
      method: 'GET',
    });

    return response.json();
  },

  blockQR: async (restaurantId: string, qrId: string, isBlocked: boolean): Promise<QRCode> => {
    const response = await realApiFetch(`${RESTAURANTS_BASE_URL}/${restaurantId}/qr/${qrId}/block`, {
      method: 'PATCH',
      body: JSON.stringify({ isBlocked }),
    });

    return response.json();
  },

  createQRBatch: async (restaurantId: string, request: QRBatchCreateRequest): Promise<QRCode[]> => {
    const response = await realApiFetch(`${RESTAURANTS_BASE_URL}/${restaurantId}/qr/batch`, {
      method: 'POST',
      body: JSON.stringify(request),
    });

    return response.json();
  },

  updateQRType: async (restaurantId: string, qrId: string, type: QRType): Promise<QRCode> => {
    const response = await realApiFetch(`${RESTAURANTS_BASE_URL}/${restaurantId}/qr/${qrId}/type`, {
      method: 'PATCH',
      body: JSON.stringify({ type }),
    });

    return response.json();
  },

  getLocations: async (): Promise<LocationsResponse> => {
    const response = await realApiFetch(LOCATIONS_BASE_URL, {
      method: 'GET',
    });

    return response.json();
  },
};
