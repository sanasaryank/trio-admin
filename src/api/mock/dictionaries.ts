import { getFromStorage, saveToStorage } from './storage';
import { STORAGE_KEYS } from '@/utils/constants';
import type { 
  DictionaryItem, 
  Country, 
  City, 
  District, 
  RestaurantType, 
  PriceSegment, 
  MenuType, 
  IntegrationType,
  DictionaryType 
} from '@/types/dictionary';
import type { AuditEvent } from '@/types/audit';
import { authAPI } from './auth';

type DictionaryData = DictionaryItem | Country | City | District | RestaurantType | PriceSegment | MenuType | IntegrationType;

/**
 * Get storage key for dictionary type
 */
function getStorageKey(type: DictionaryType): string {
  const keyMap: Record<DictionaryType, string> = {
    countries: STORAGE_KEYS.COUNTRIES,
    cities: STORAGE_KEYS.CITIES,
    districts: STORAGE_KEYS.DISTRICTS,
    restaurantTypes: STORAGE_KEYS.RESTAURANT_TYPES,
    priceSegments: STORAGE_KEYS.PRICE_SEGMENTS,
    menuTypes: STORAGE_KEYS.MENU_TYPES,
    integrationTypes: STORAGE_KEYS.INTEGRATION_TYPES,
  };
  return keyMap[type];
}

/**
 * Mock Dictionaries API
 */
export const dictionariesAPI = {
  /**
   * Get all items from dictionary
   */
  getAll: (type: DictionaryType): DictionaryData[] => {
    const key = getStorageKey(type);
    return getFromStorage<DictionaryData[]>(key) || [];
  },

  /**
   * Get dictionary item by ID
   */
  getById: (type: DictionaryType, id: number): DictionaryData | null => {
    const items = dictionariesAPI.getAll(type);
    return items.find(item => item.id === id) || null;
  },

  /**
   * Create dictionary item
   */
  create: (type: DictionaryType, data: Omit<DictionaryData, 'id' | 'createdAt' | 'updatedAt'>): DictionaryData => {
    const items = dictionariesAPI.getAll(type);
    const now = Math.floor(Date.now() / 1000);
    const newId = Math.max(0, ...items.map(i => i.id)) + 1;
    
    const newItem: DictionaryData = {
      ...data,
      id: newId,
      createdAt: now,
      updatedAt: now,
    } as DictionaryData;
    
    items.push(newItem);
    const key = getStorageKey(type);
    saveToStorage(key, items);
    
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
        entityType: type,
        entityId: newItem.id,
        entityLabel: newItem.name,
      };
      auditLog.push(newEvent);
      saveToStorage(STORAGE_KEYS.AUDIT_LOG, auditLog);
    }
    
    return newItem;
  },

  /**
   * Update dictionary item
   */
  update: (type: DictionaryType, id: number, data: Partial<Omit<DictionaryData, 'id' | 'createdAt' | 'updatedAt'>>): DictionaryData | null => {
    const items = dictionariesAPI.getAll(type);
    const index = items.findIndex(item => item.id === id);
    
    if (index === -1) return null;
    
    const now = Math.floor(Date.now() / 1000);
    items[index] = {
      ...items[index],
      ...data,
      updatedAt: now,
    };
    
    const key = getStorageKey(type);
    saveToStorage(key, items);
    
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
        entityType: type,
        entityId: items[index].id,
        entityLabel: items[index].name,
      };
      auditLog.push(newEvent);
      saveToStorage(STORAGE_KEYS.AUDIT_LOG, auditLog);
    }
    
    return items[index];
  },

  /**
   * Toggle block status
   */
  toggleBlock: (type: DictionaryType, id: number): DictionaryData | null => {
    const items = dictionariesAPI.getAll(type);
    const index = items.findIndex(item => item.id === id);
    
    if (index === -1) return null;
    
    const now = Math.floor(Date.now() / 1000);
    items[index].blocked = !items[index].blocked;
    items[index].updatedAt = now;
    
    const key = getStorageKey(type);
    saveToStorage(key, items);
    
    // Log audit event
    const user = authAPI.getCurrentUser();
    if (user) {
      const auditLog = getFromStorage<AuditEvent[]>(STORAGE_KEYS.AUDIT_LOG) || [];
      const newEvent: AuditEvent = {
        id: auditLog.length + 1,
        timestamp: now,
        actorId: user.id,
        actorName: user.name,
        action: items[index].blocked ? 'block' : 'unblock',
        entityType: type,
        entityId: items[index].id,
        entityLabel: items[index].name,
      };
      auditLog.push(newEvent);
      saveToStorage(STORAGE_KEYS.AUDIT_LOG, auditLog);
    }
    
    return items[index];
  },

  // Helper methods for hierarchical dictionaries
  getCitiesByCountry: (countryId: number): City[] => {
    const cities = dictionariesAPI.getAll('cities') as City[];
    return cities.filter(city => city.countryId === countryId);
  },

  getDistrictsByCity: (cityId: number): District[] => {
    const districts = dictionariesAPI.getAll('districts') as District[];
    return districts.filter(district => district.cityId === cityId);
  },
};
