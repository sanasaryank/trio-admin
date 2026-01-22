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

    if (!response.ok) {
      throw new Error(`Failed to fetch restaurants: ${response.status}`);
    }

    return response.json();
  },

  getById: async (id: string): Promise<Restaurant> => {
    const response = await realApiFetch(`${RESTAURANTS_BASE_URL}/${id}`, {
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch restaurant: ${response.status}`);
    }

    return response.json();
  },

  create: async (data: RestaurantFormData): Promise<Restaurant> => {
    const response = await realApiFetch(RESTAURANTS_BASE_URL, {
      method: 'POST',
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Failed to create restaurant: ${response.status}`);
    }

    return response.json();
  },

  update: async (id: string, data: RestaurantFormData): Promise<Restaurant> => {
    const response = await realApiFetch(`${RESTAURANTS_BASE_URL}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Failed to update restaurant: ${response.status}`);
    }

    return response.json();
  },

  block: async (id: string, isBlocked: boolean): Promise<Restaurant> => {
    const response = await realApiFetch(`${RESTAURANTS_BASE_URL}/${id}/block`, {
      method: 'PATCH',
      body: JSON.stringify({ isBlocked }),
    });

    if (!response.ok) {
      throw new Error(`Failed to block/unblock restaurant: ${response.status}`);
    }

    return response.json();
  },

  getQRCodes: async (restaurantId: string): Promise<QRCode[]> => {
    const response = await realApiFetch(`${RESTAURANTS_BASE_URL}/${restaurantId}/qr`, {
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch QR codes: ${response.status}`);
    }

    return response.json();
  },

  blockQR: async (restaurantId: string, qrId: string, isBlocked: boolean): Promise<QRCode> => {
    const response = await realApiFetch(`${RESTAURANTS_BASE_URL}/${restaurantId}/qr/${qrId}/block`, {
      method: 'PATCH',
      body: JSON.stringify({ isBlocked }),
    });

    if (!response.ok) {
      throw new Error(`Failed to block/unblock QR code: ${response.status}`);
    }

    return response.json();
  },

  createQRBatch: async (restaurantId: string, request: QRBatchCreateRequest): Promise<QRCode[]> => {
    const response = await realApiFetch(`${RESTAURANTS_BASE_URL}/${restaurantId}/qr/batch`, {
      method: 'POST',
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`Failed to create QR batch: ${response.status}`);
    }

    return response.json();
  },

  updateQRType: async (restaurantId: string, qrId: string, type: QRType): Promise<QRCode> => {
    const response = await realApiFetch(`${RESTAURANTS_BASE_URL}/${restaurantId}/qr/${qrId}/type`, {
      method: 'PATCH',
      body: JSON.stringify({ type }),
    });

    if (!response.ok) {
      throw new Error(`Failed to update QR type: ${response.status}`);
    }

    return response.json();
  },

  getLocations: async (): Promise<LocationsResponse> => {
    const response = await realApiFetch(LOCATIONS_BASE_URL, {
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch locations: ${response.status}`);
    }

    return response.json();
  },
};
