import { getFromStorage, saveToStorage } from './storage';
import { STORAGE_KEYS } from '@/utils/constants';
import type { Restaurant, RestaurantFormData } from '@/types/restaurant';
import type { RestaurantQR } from '@/types/qr';
import type { AuditEvent } from '@/types/audit';
import { authAPI } from './auth';

/**
 * Mock Restaurants API
 */
export const restaurantsAPI = {
  /**
   * Get all restaurants
   */
  getAll: (): Restaurant[] => {
    return getFromStorage<Restaurant[]>(STORAGE_KEYS.RESTAURANTS) || [];
  },

  /**
   * Get restaurant by ID
   */
  getById: (id: number): Restaurant | null => {
    const restaurants = restaurantsAPI.getAll();
    return restaurants.find(rest => rest.id === id) || null;
  },

  /**
   * Create new restaurant
   */
  create: (data: RestaurantFormData): Restaurant => {
    const restaurants = restaurantsAPI.getAll();
    const now = Math.floor(Date.now() / 1000);
    const newId = Math.max(0, ...restaurants.map(r => r.id)) + 1;
    
    const newRestaurant: Restaurant = {
      ...data,
      id: newId,
      createdAt: now,
      updatedAt: now,
    };
    
    restaurants.push(newRestaurant);
    saveToStorage(STORAGE_KEYS.RESTAURANTS, restaurants);
    
    // Log audit event
    const user = authAPI.getCurrentUser();
    if (user) {
      const auditLog = getFromStorage<AuditEvent[]>(STORAGE_KEYS.AUDIT_LOG) || [];
      const newEvent: AuditEvent = {
        id: auditLog.length + 1,
        timestamp: now,
        actorId: user.id,
        actorName: user.name,
        action: 'create',
        entityType: 'restaurant',
        entityId: newRestaurant.id,
        entityLabel: newRestaurant.name,
      };
      auditLog.push(newEvent);
      saveToStorage(STORAGE_KEYS.AUDIT_LOG, auditLog);
    }
    
    return newRestaurant;
  },

  /**
   * Update restaurant
   */
  update: (id: number, data: Partial<RestaurantFormData>): Restaurant | null => {
    const restaurants = restaurantsAPI.getAll();
    const index = restaurants.findIndex(rest => rest.id === id);
    
    if (index === -1) return null;
    
    const now = Math.floor(Date.now() / 1000);
    restaurants[index] = {
      ...restaurants[index],
      ...data,
      updatedAt: now,
    };
    
    saveToStorage(STORAGE_KEYS.RESTAURANTS, restaurants);
    
    // Log audit event
    const user = authAPI.getCurrentUser();
    if (user) {
      const auditLog = getFromStorage<AuditEvent[]>(STORAGE_KEYS.AUDIT_LOG) || [];
      const newEvent: AuditEvent = {
        id: auditLog.length + 1,
        timestamp: now,
        actorId: user.id,
        actorName: user.name,
        action: 'update',
        entityType: 'restaurant',
        entityId: restaurants[index].id,
        entityLabel: restaurants[index].name,
      };
      auditLog.push(newEvent);
      saveToStorage(STORAGE_KEYS.AUDIT_LOG, auditLog);
    }
    
    return restaurants[index];
  },

  /**
   * Block/Unblock restaurant
   */
  toggleBlock: (id: number): Restaurant | null => {
    const restaurants = restaurantsAPI.getAll();
    const index = restaurants.findIndex(rest => rest.id === id);
    
    if (index === -1) return null;
    
    const now = Math.floor(Date.now() / 1000);
    restaurants[index].blocked = !restaurants[index].blocked;
    restaurants[index].updatedAt = now;
    
    saveToStorage(STORAGE_KEYS.RESTAURANTS, restaurants);
    
    // Log audit event
    const user = authAPI.getCurrentUser();
    if (user) {
      const auditLog = getFromStorage<AuditEvent[]>(STORAGE_KEYS.AUDIT_LOG) || [];
      const newEvent: AuditEvent = {
        id: auditLog.length + 1,
        timestamp: now,
        actorId: user.id,
        actorName: user.name,
        action: restaurants[index].blocked ? 'block' : 'unblock',
        entityType: 'restaurant',
        entityId: restaurants[index].id,
        entityLabel: restaurants[index].name,
      };
      auditLog.push(newEvent);
      saveToStorage(STORAGE_KEYS.AUDIT_LOG, auditLog);
    }
    
    return restaurants[index];
  },

  /**
   * Get QR codes for restaurant
   */
  getQRCodes: (restaurantId: number): RestaurantQR[] => {
    const qrCodes = getFromStorage<RestaurantQR[]>(STORAGE_KEYS.QR_CODES) || [];
    return qrCodes.filter(qr => qr.restaurantId === restaurantId);
  },

  /**
   * Create QR codes for restaurant
   */
  createQRCodes: (restaurantId: number, count: number): RestaurantQR[] => {
    const qrCodes = getFromStorage<RestaurantQR[]>(STORAGE_KEYS.QR_CODES) || [];
    const now = Math.floor(Date.now() / 1000);
    const newQRs: RestaurantQR[] = [];
    
    const maxId = Math.max(0, ...qrCodes.map(qr => qr.id));
    const existingCount = qrCodes.filter(qr => qr.restaurantId === restaurantId).length;
    
    for (let i = 0; i < count; i++) {
      const newQR: RestaurantQR = {
        id: maxId + i + 1,
        restaurantId,
        qrCode: `QR-REST${restaurantId}-TABLE${existingCount + i + 1}`,
        tableNumber: `${existingCount + i + 1}`,
        blocked: false,
        createdAt: now,
        updatedAt: now,
      };
      newQRs.push(newQR);
      qrCodes.push(newQR);
    }
    
    saveToStorage(STORAGE_KEYS.QR_CODES, qrCodes);
    
    // Log audit event
    const user = authAPI.getCurrentUser();
    const restaurant = restaurantsAPI.getById(restaurantId);
    if (user && restaurant) {
      const auditLog = getFromStorage<AuditEvent[]>(STORAGE_KEYS.AUDIT_LOG) || [];
      const newEvent: AuditEvent = {
        id: auditLog.length + 1,
        timestamp: now,
        actorId: user.id,
        actorName: user.name,
        action: 'create_qr',
        entityType: 'restaurant',
        entityId: restaurantId,
        entityLabel: `${restaurant.name} (${count} QR)`,
      };
      auditLog.push(newEvent);
      saveToStorage(STORAGE_KEYS.AUDIT_LOG, auditLog);
    }
    
    return newQRs;
  },

  /**
   * Toggle QR code block status
   */
  toggleQRBlock: (qrId: number): RestaurantQR | null => {
    const qrCodes = getFromStorage<RestaurantQR[]>(STORAGE_KEYS.QR_CODES) || [];
    const index = qrCodes.findIndex(qr => qr.id === qrId);
    
    if (index === -1) return null;
    
    const now = Math.floor(Date.now() / 1000);
    qrCodes[index].blocked = !qrCodes[index].blocked;
    qrCodes[index].updatedAt = now;
    
    saveToStorage(STORAGE_KEYS.QR_CODES, qrCodes);
    
    // Log audit event
    const user = authAPI.getCurrentUser();
    const restaurant = restaurantsAPI.getById(qrCodes[index].restaurantId);
    if (user && restaurant) {
      const auditLog = getFromStorage<AuditEvent[]>(STORAGE_KEYS.AUDIT_LOG) || [];
      const newEvent: AuditEvent = {
        id: auditLog.length + 1,
        timestamp: now,
        actorId: user.id,
        actorName: user.name,
        action: qrCodes[index].blocked ? 'block_qr' : 'unblock_qr',
        entityType: 'qr',
        entityId: qrCodes[index].id,
        entityLabel: `${restaurant.name} - ${qrCodes[index].qrCode}`,
      };
      auditLog.push(newEvent);
      saveToStorage(STORAGE_KEYS.AUDIT_LOG, auditLog);
    }
    
    return qrCodes[index];
  },

  /**
   * Get audit log for restaurant
   */
  getAuditLog: (restaurantId: number): AuditEvent[] => {
    const auditLog = getFromStorage<AuditEvent[]>(STORAGE_KEYS.AUDIT_LOG) || [];
    return auditLog.filter(event => 
      (event.entityType === 'restaurant' && event.entityId === restaurantId) ||
      (event.entityType === 'qr' && event.entityLabel.includes(`REST${restaurantId}`))
    );
  },
};
