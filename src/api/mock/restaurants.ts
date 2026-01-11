import { getDatabase, saveDatabase, getSession } from './storage';
import { addAuditEvent } from './audit';
import type { Restaurant, RestaurantFormData, QRCode, QRBatchCreateRequest } from '../../types';

export const mockRestaurantsApi = {
  list: async (): Promise<Restaurant[]> => {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 300));

    const db = getDatabase();
    return [...db.restaurants];
  },

  getById: async (id: number): Promise<Restaurant> => {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 200));

    const db = getDatabase();
    const restaurant = db.restaurants.find((r) => r.id === id);

    if (!restaurant) {
      throw new Error('Restaurant not found');
    }

    return restaurant;
  },

  create: async (data: RestaurantFormData): Promise<Restaurant> => {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 400));

    const db = getDatabase();
    const session = getSession();
    const now = Math.floor(Date.now() / 1000);

    const restaurant: Restaurant = {
      id: db.nextId.restaurant++,
      name: data.name,
      crmUrl: data.crmUrl,
      countryId: data.countryId,
      cityId: data.cityId,
      districtId: data.districtId,
      address: data.address,
      lat: data.lat,
      lng: data.lng,
      typeId: data.typeId,
      priceSegmentId: data.priceSegmentId,
      menuTypeId: data.menuTypeId,
      integrationTypeId: data.integrationTypeId,
      adminEmail: data.adminEmail,
      connectionData: {
        host: data.connectionData.host,
        port: data.connectionData.port,
        username: data.connectionData.username,
        // Store password only if provided
        ...(data.connectionData.password && { password: data.connectionData.password }),
      },
      blocked: data.blocked,
      createdAt: now,
      updatedAt: now,
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
        entityLabel: restaurant.name,
      });
    }

    return restaurant;
  },

  update: async (id: number, data: RestaurantFormData): Promise<Restaurant> => {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 400));

    const db = getDatabase();
    const session = getSession();
    const index = db.restaurants.findIndex((r) => r.id === id);

    if (index === -1) {
      throw new Error('Restaurant not found');
    }

    const now = Math.floor(Date.now() / 1000);
    const existing = db.restaurants[index];

    const restaurant: Restaurant = {
      ...existing,
      name: data.name,
      crmUrl: data.crmUrl,
      countryId: data.countryId,
      cityId: data.cityId,
      districtId: data.districtId,
      address: data.address,
      lat: data.lat,
      lng: data.lng,
      typeId: data.typeId,
      priceSegmentId: data.priceSegmentId,
      menuTypeId: data.menuTypeId,
      integrationTypeId: data.integrationTypeId,
      adminEmail: data.adminEmail,
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
      blocked: data.blocked,
      updatedAt: now,
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
        entityLabel: restaurant.name,
      });
    }

    return restaurant;
  },

  block: async (id: number, blocked: boolean): Promise<Restaurant> => {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 300));

    const db = getDatabase();
    const session = getSession();
    const index = db.restaurants.findIndex((r) => r.id === id);

    if (index === -1) {
      throw new Error('Restaurant not found');
    }

    const now = Math.floor(Date.now() / 1000);
    const restaurant = {
      ...db.restaurants[index],
      blocked,
      updatedAt: now,
    };

    db.restaurants[index] = restaurant;
    saveDatabase(db);

    // Log audit event
    if (session) {
      addAuditEvent({
        actorId: session.id,
        actorName: `${session.firstName} ${session.lastName}`,
        action: blocked ? 'block' : 'unblock',
        entityType: 'restaurant',
        entityId: restaurant.id,
        entityLabel: restaurant.name,
      });
    }

    return restaurant;
  },

  // QR Code operations
  getQRCodes: async (restaurantId: number): Promise<QRCode[]> => {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 300));

    const db = getDatabase();
    const qrCodes = db.qrCodes.filter((qr) => qr.restaurantId === restaurantId);
    return [...qrCodes];
  },

  createQRBatch: async (restaurantId: number, request: QRBatchCreateRequest): Promise<QRCode[]> => {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    const db = getDatabase();
    const session = getSession();
    const now = Math.floor(Date.now() / 1000);

    // Verify restaurant exists
    const restaurant = db.restaurants.find((r) => r.id === restaurantId);
    if (!restaurant) {
      throw new Error('Restaurant not found');
    }

    const newQRCodes: QRCode[] = [];
    const restaurantCode = restaurant.name.substring(0, 3).toUpperCase();

    for (let i = 0; i < request.count; i++) {
      const qrId = db.nextId.qr++;
      const qrCode: QRCode = {
        id: qrId,
        restaurantId,
        qrText: `https://menu.trio.com/qr/${restaurantCode}-${String(qrId).padStart(3, '0')}`,
        blocked: false,
        createdAt: now,
        updatedAt: now,
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
        entityLabel: restaurant.name,
        metadata: {
          count: request.count,
        },
      });
    }

    return newQRCodes;
  },

  blockQR: async (restaurantId: number, qrId: number, blocked: boolean): Promise<QRCode> => {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 300));

    const db = getDatabase();
    const session = getSession();
    const index = db.qrCodes.findIndex((qr) => qr.id === qrId && qr.restaurantId === restaurantId);

    if (index === -1) {
      throw new Error('QR code not found');
    }

    const now = Math.floor(Date.now() / 1000);
    const qrCode = {
      ...db.qrCodes[index],
      blocked,
      updatedAt: now,
    };

    db.qrCodes[index] = qrCode;
    saveDatabase(db);

    // Log audit event
    if (session) {
      addAuditEvent({
        actorId: session.id,
        actorName: `${session.firstName} ${session.lastName}`,
        action: blocked ? 'block' : 'unblock',
        entityType: 'qr',
        entityId: qrCode.id,
        entityLabel: qrCode.qrText,
      });
    }

    return qrCode;
  },
};
