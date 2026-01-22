import { getDatabase, saveDatabase, getSession, generateHash } from './storage';
import { addAuditEvent } from './audit';
import type { Restaurant, RestaurantListItem, RestaurantFormData, QRCode, QRBatchCreateRequest, LocationsResponse } from '../../types';

export const mockRestaurantsApi = {
  list: async (): Promise<RestaurantListItem[]> => {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 300));

    const db = getDatabase();
    
    // Map restaurants to list items with city and district names
    return db.restaurants.map((restaurant) => {
      const city = db.cities.find(c => c.id === restaurant.cityId);
      const district = db.districts.find(d => d.id === restaurant.districtId);
      
      // Extract name - handle both string and DictionaryName object formats
      let restaurantName = 'Unknown';
      try {
        if (!restaurant.name) {
          console.warn('Restaurant missing name:', restaurant.id);
          restaurantName = 'Unknown';
        } else if (typeof restaurant.name === 'string') {
          restaurantName = restaurant.name;
        } else if (typeof restaurant.name === 'object') {
          // Try different keys that might exist
          restaurantName = (restaurant.name as any).ENG || 
                          (restaurant.name as any).eng || 
                          (restaurant.name as any).RUS || 
                          (restaurant.name as any).rus ||
                          (restaurant.name as any).ARM || 
                          (restaurant.name as any).arm ||
                          JSON.stringify(restaurant.name); // Last resort
        } else {
          restaurantName = String(restaurant.name);
        }
      } catch (error) {
        console.error('Error extracting restaurant name:', error, restaurant);
        restaurantName = `Restaurant ${restaurant.id}`;
      }
      
      return {
        id: restaurant.id,
        name: restaurantName,
        crmUrl: restaurant.crmUrl || '',
        cityName: city?.name || 'Unknown',
        districtName: district?.name || 'Unknown',
        isBlocked: restaurant.isBlocked || false,
      };
    });
  },

  getById: async (id: string): Promise<Restaurant> => {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 200));

    const db = getDatabase();
    const restaurant = db.restaurants.find((r) => r.id === id);

    if (!restaurant) {
      throw new Error('Restaurant not found');
    }

    // Add hash for GET by ID
    return {
      ...restaurant,
      hash: generateHash(),
    };
  },

  create: async (data: RestaurantFormData): Promise<Restaurant> => {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 400));

    const db = getDatabase();
    const session = getSession();

    const restaurant: Restaurant = {
      id: `rest${db.nextId.restaurant++}`,
      name: data.name,
      crmUrl: data.crmUrl,
      countryId: data.countryId,
      cityId: data.cityId,
      districtId: data.districtId,
      lat: data.lat,
      lng: data.lng,
      typeId: data.typeId,
      priceSegmentId: data.priceSegmentId,
      menuTypeId: data.menuTypeId,
      integrationTypeId: data.integrationTypeId,
      adminEmail: data.adminEmail,
      adminUsername: data.adminUsername,
      // Store admin password only if provided
      ...(data.adminPassword && { adminPassword: data.adminPassword }),
      legalAddress: data.legalAddress,
      tin: data.tin,
      connectionData: {
        host: data.connectionData.host,
        port: data.connectionData.port,
        username: data.connectionData.username,
        // Store password only if provided
        ...(data.connectionData.password && { password: data.connectionData.password }),
      },
      isBlocked: data.isBlocked,
    };

    db.restaurants.push(restaurant);
    saveDatabase(db);

    // Log audit event
    if (session) {
      addAuditEvent({
        actorId: session.id,
        actorName: `${session.firstName} ${session.lastName}`,
        action: 'create',
        entityType: 'restaurant',
        entityId: restaurant.id,
        entityLabel: restaurant.name.ENG,
      });
    }

    return restaurant;
  },

  update: async (id: string, data: RestaurantFormData): Promise<Restaurant> => {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 400));

    const db = getDatabase();
    const session = getSession();
    const index = db.restaurants.findIndex((r) => r.id === id);

    if (index === -1) {
      throw new Error('Restaurant not found');
    }

    // Validate hash if provided (optimistic concurrency control)
    if (data.hash) {
      // In a real implementation, we would validate the hash here
      // For mock, we'll just accept it
    }

    const existing = db.restaurants[index];

    const restaurant: Restaurant = {
      ...existing,
      name: data.name,
      crmUrl: data.crmUrl,
      countryId: data.countryId,
      cityId: data.cityId,
      districtId: data.districtId,
      lat: data.lat,
      lng: data.lng,
      typeId: data.typeId,
      priceSegmentId: data.priceSegmentId,
      menuTypeId: data.menuTypeId,
      integrationTypeId: data.integrationTypeId,
      adminEmail: data.adminEmail,
      adminUsername: data.adminUsername,
      // Only update admin password if adminChangePassword is true
      ...(data.adminChangePassword && data.adminPassword
        ? { adminPassword: data.adminPassword }
        : existing.adminPassword
        ? { adminPassword: existing.adminPassword }
        : {}),
      legalAddress: data.legalAddress,
      tin: data.tin,
      connectionData: {
        host: data.connectionData.host,
        port: data.connectionData.port,
        username: data.connectionData.username,
        // Only update password if changePassword is true
        ...(data.connectionData.changePassword && data.connectionData.password
          ? { password: data.connectionData.password }
          : existing.connectionData.password
          ? { password: existing.connectionData.password }
          : {}),
      },
      isBlocked: data.isBlocked,
    };

    db.restaurants[index] = restaurant;
    saveDatabase(db);

    // Log audit event
    if (session) {
      addAuditEvent({
        actorId: session.id,
        actorName: `${session.firstName} ${session.lastName}`,
        action: 'update',
        entityType: 'restaurant',
        entityId: restaurant.id,
        entityLabel: updatedRestaurant.name.ENG,
      });
    }

    return restaurant;
  },

  block: async (id: string, isBlocked: boolean): Promise<Restaurant> => {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 300));

    const db = getDatabase();
    const session = getSession();
    const index = db.restaurants.findIndex((r) => r.id === id);

    if (index === -1) {
      throw new Error('Restaurant not found');
    }

    const restaurant = {
      ...db.restaurants[index],
      isBlocked,
    };

    db.restaurants[index] = restaurant;
    saveDatabase(db);

    // Log audit event
    if (session) {
      addAuditEvent({
        actorId: session.id,
        actorName: `${session.firstName} ${session.lastName}`,
        action: isBlocked ? 'block' : 'unblock',
        entityType: 'restaurant',
        entityId: restaurant.id,
        entityLabel: updatedRestaurant.name.ENG,
      });
    }

    return restaurant;
  },

  // QR Code operations
  getQRCodes: async (restaurantId: string): Promise<QRCode[]> => {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 300));

    const db = getDatabase();
    const qrCodes = db.qrCodes.filter((qr) => qr.restaurantId === restaurantId);
    return [...qrCodes];
  },

  createQRBatch: async (restaurantId: string, request: QRBatchCreateRequest): Promise<QRCode[]> => {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    const db = getDatabase();
    const session = getSession();

    // Verify restaurant exists
    const restaurant = db.restaurants.find((r) => r.id === restaurantId);
    if (!restaurant) {
      throw new Error('Restaurant not found');
    }

    const newQRCodes: QRCode[] = [];
    const restaurantCode = restaurant.name.substring(0, 3).toUpperCase();

    for (let i = 0; i < request.count; i++) {
      const qrId = `qr${db.nextId.qr++}`;
      const qrCode: QRCode = {
        id: qrId,
        restaurantId,
        qrText: `https://menu.trio.com/qr/${restaurantCode}-${String(db.nextId.qr).padStart(3, '0')}`,
        blocked: false,
      };
      db.qrCodes.push(qrCode);
      newQRCodes.push(qrCode);
    }

    saveDatabase(db);

    // Log audit event
    if (session) {
      addAuditEvent({
        actorId: session.id,
        actorName: `${session.firstName} ${session.lastName}`,
        action: 'batch_create_qr',
        entityType: 'qr',
        entityId: restaurantId,
        entityLabel: restaurant.name.ENG,
        metadata: {
          count: request.count,
        },
      });
    }

    return newQRCodes;
  },

  blockQR: async (restaurantId: string, qrId: string, isBlocked: boolean): Promise<QRCode> => {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 300));

    const db = getDatabase();
    const session = getSession();
    const index = db.qrCodes.findIndex((qr) => qr.id === qrId && qr.restaurantId === restaurantId);

    if (index === -1) {
      throw new Error('QR code not found');
    }

    const qrCode = {
      ...db.qrCodes[index],
      isBlocked,
    };

    db.qrCodes[index] = qrCode;
    saveDatabase(db);

    // Log audit event
    if (session) {
      addAuditEvent({
        actorId: session.id,
        actorName: `${session.firstName} ${session.lastName}`,
        action: isBlocked ? 'block' : 'unblock',
        entityType: 'qr',
        entityId: qrCode.id,
        entityLabel: qrCode.qrText,
      });
    }

    return qrCode;
  },

  getLocations: async (): Promise<LocationsResponse> => {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 200));

    const db = getDatabase();
    
    return {
      countries: db.countries,
      cities: db.cities,
      districts: db.districts,
    };
  },
};
