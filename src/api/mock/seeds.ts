import { STORAGE_KEYS } from '@/utils/constants';
import { saveToStorage } from './storage';
import type { Employee } from '@/types/employee';
import type { Restaurant } from '@/types/restaurant';
import type { Country, City, District, RestaurantType, PriceSegment, MenuType, IntegrationType } from '@/types/dictionary';
import type { RestaurantQR } from '@/types/qr';
import type { AuditEvent } from '@/types/audit';

interface User {
  id: number;
  username: string;
  password: string;
  name: string;
}

/**
 * Initialize all seed data in localStorage
 */
export function initializeSeeds(): void {
  const now = Math.floor(Date.now() / 1000);

  // User
  const user: User = {
    id: 1,
    username: 'admin',
    password: 'admin',
    name: 'Администратор'
  };
  saveToStorage('trio_user', user);

  // Employees
  const employees: Employee[] = [
    { id: 1, firstName: 'Иван', lastName: 'Петров', blocked: false, createdAt: now - 86400 * 30, updatedAt: now - 86400 * 5 },
    { id: 2, firstName: 'Мария', lastName: 'Сидорова', blocked: false, createdAt: now - 86400 * 25, updatedAt: now - 86400 * 3 },
    { id: 3, firstName: 'Алексей', lastName: 'Козлов', blocked: false, createdAt: now - 86400 * 20, updatedAt: now - 86400 * 2 },
    { id: 4, firstName: 'Елена', lastName: 'Морозова', blocked: true, createdAt: now - 86400 * 15, updatedAt: now - 86400 * 1 },
    { id: 5, firstName: 'Дмитрий', lastName: 'Новиков', blocked: false, createdAt: now - 86400 * 10, updatedAt: now },
  ];
  saveToStorage(STORAGE_KEYS.EMPLOYEES, employees);

  // Countries
  const countries: Country[] = [
    { id: 1, name: 'Россия', blocked: false, createdAt: now - 86400 * 100, updatedAt: now - 86400 * 50 },
    { id: 2, name: 'Казахстан', blocked: false, createdAt: now - 86400 * 100, updatedAt: now - 86400 * 50 },
    { id: 3, name: 'Узбекистан', blocked: false, createdAt: now - 86400 * 100, updatedAt: now - 86400 * 50 },
  ];
  saveToStorage(STORAGE_KEYS.COUNTRIES, countries);

  // Cities
  const cities: City[] = [
    { id: 1, name: 'Москва', countryId: 1, blocked: false, createdAt: now - 86400 * 90, updatedAt: now - 86400 * 45 },
    { id: 2, name: 'Санкт-Петербург', countryId: 1, blocked: false, createdAt: now - 86400 * 90, updatedAt: now - 86400 * 45 },
    { id: 3, name: 'Алматы', countryId: 2, blocked: false, createdAt: now - 86400 * 90, updatedAt: now - 86400 * 45 },
    { id: 4, name: 'Нур-Султан', countryId: 2, blocked: false, createdAt: now - 86400 * 90, updatedAt: now - 86400 * 45 },
    { id: 5, name: 'Ташкент', countryId: 3, blocked: false, createdAt: now - 86400 * 90, updatedAt: now - 86400 * 45 },
  ];
  saveToStorage(STORAGE_KEYS.CITIES, cities);

  // Districts
  const districts: District[] = [
    { id: 1, name: 'Центральный', cityId: 1, blocked: false, createdAt: now - 86400 * 80, updatedAt: now - 86400 * 40 },
    { id: 2, name: 'Северный', cityId: 1, blocked: false, createdAt: now - 86400 * 80, updatedAt: now - 86400 * 40 },
    { id: 3, name: 'Южный', cityId: 1, blocked: false, createdAt: now - 86400 * 80, updatedAt: now - 86400 * 40 },
    { id: 4, name: 'Невский', cityId: 2, blocked: false, createdAt: now - 86400 * 80, updatedAt: now - 86400 * 40 },
    { id: 5, name: 'Василеостровский', cityId: 2, blocked: false, createdAt: now - 86400 * 80, updatedAt: now - 86400 * 40 },
    { id: 6, name: 'Алмалинский', cityId: 3, blocked: false, createdAt: now - 86400 * 80, updatedAt: now - 86400 * 40 },
    { id: 7, name: 'Медеуский', cityId: 3, blocked: false, createdAt: now - 86400 * 80, updatedAt: now - 86400 * 40 },
    { id: 8, name: 'Есильский', cityId: 4, blocked: false, createdAt: now - 86400 * 80, updatedAt: now - 86400 * 40 },
    { id: 9, name: 'Юнусабадский', cityId: 5, blocked: false, createdAt: now - 86400 * 80, updatedAt: now - 86400 * 40 },
    { id: 10, name: 'Мирабадский', cityId: 5, blocked: false, createdAt: now - 86400 * 80, updatedAt: now - 86400 * 40 },
  ];
  saveToStorage(STORAGE_KEYS.DISTRICTS, districts);

  // Restaurant Types
  const restaurantTypes: RestaurantType[] = [
    { id: 1, name: 'Кафе', blocked: false, createdAt: now - 86400 * 100, updatedAt: now - 86400 * 50 },
    { id: 2, name: 'Ресторан', blocked: false, createdAt: now - 86400 * 100, updatedAt: now - 86400 * 50 },
    { id: 3, name: 'Фастфуд', blocked: false, createdAt: now - 86400 * 100, updatedAt: now - 86400 * 50 },
  ];
  saveToStorage(STORAGE_KEYS.RESTAURANT_TYPES, restaurantTypes);

  // Price Segments
  const priceSegments: PriceSegment[] = [
    { id: 1, name: 'Бюджетный', blocked: false, createdAt: now - 86400 * 100, updatedAt: now - 86400 * 50 },
    { id: 2, name: 'Средний', blocked: false, createdAt: now - 86400 * 100, updatedAt: now - 86400 * 50 },
    { id: 3, name: 'Премиум', blocked: false, createdAt: now - 86400 * 100, updatedAt: now - 86400 * 50 },
  ];
  saveToStorage(STORAGE_KEYS.PRICE_SEGMENTS, priceSegments);

  // Menu Types
  const menuTypes: MenuType[] = [
    { id: 1, name: 'Европейская кухня', blocked: false, createdAt: now - 86400 * 100, updatedAt: now - 86400 * 50 },
    { id: 2, name: 'Азиатская кухня', blocked: false, createdAt: now - 86400 * 100, updatedAt: now - 86400 * 50 },
    { id: 3, name: 'Смешанная кухня', blocked: false, createdAt: now - 86400 * 100, updatedAt: now - 86400 * 50 },
  ];
  saveToStorage(STORAGE_KEYS.MENU_TYPES, menuTypes);

  // Integration Types
  const integrationTypes: IntegrationType[] = [
    { id: 1, name: 'iiko', blocked: false, createdAt: now - 86400 * 100, updatedAt: now - 86400 * 50 },
    { id: 2, name: 'Poster', blocked: false, createdAt: now - 86400 * 100, updatedAt: now - 86400 * 50 },
    { id: 3, name: 'R-Keeper', blocked: false, createdAt: now - 86400 * 100, updatedAt: now - 86400 * 50 },
  ];
  saveToStorage(STORAGE_KEYS.INTEGRATION_TYPES, integrationTypes);

  // Restaurants
  const restaurants: Restaurant[] = [
    {
      id: 1,
      name: 'Ресторан Москва',
      crmLink: 'https://crm.example.com/rest1',
      countryId: 1,
      cityId: 1,
      districtId: 1,
      address: 'ул. Тверская, 10',
      latitude: 55.7558,
      longitude: 37.6173,
      typeId: 2,
      priceSegmentId: 3,
      menuTypeId: 1,
      integrationTypeId: 1,
      adminEmail: 'admin@moscow.rest',
      connectionData: { host: 'localhost', port: 5432, username: 'admin', password: 'secret123' },
      blocked: false,
      createdAt: now - 86400 * 60,
      updatedAt: now - 86400 * 10,
      lastClientActivityAt: now - 3600,
      lastRestaurantActivityAt: now - 7200,
    },
    {
      id: 2,
      name: 'Кафе Нева',
      crmLink: 'https://crm.example.com/rest2',
      countryId: 1,
      cityId: 2,
      districtId: 4,
      address: 'Невский пр., 55',
      latitude: 59.9343,
      longitude: 30.3351,
      typeId: 1,
      priceSegmentId: 2,
      menuTypeId: 3,
      integrationTypeId: 2,
      adminEmail: 'admin@neva.cafe',
      connectionData: { host: 'localhost', port: 5432, username: 'admin', password: 'pass456' },
      blocked: false,
      createdAt: now - 86400 * 50,
      updatedAt: now - 86400 * 8,
      lastClientActivityAt: now - 1800,
    },
    {
      id: 3,
      name: 'Фастфуд Алматы',
      crmLink: 'https://crm.example.com/rest3',
      countryId: 2,
      cityId: 3,
      districtId: 6,
      address: 'пр. Абая, 120',
      latitude: 43.2220,
      longitude: 76.8512,
      typeId: 3,
      priceSegmentId: 1,
      menuTypeId: 2,
      integrationTypeId: 1,
      adminEmail: 'admin@almaty.fast',
      connectionData: { host: 'localhost', port: 5432, username: 'admin' },
      blocked: false,
      createdAt: now - 86400 * 40,
      updatedAt: now - 86400 * 5,
      lastRestaurantActivityAt: now - 10800,
    },
    {
      id: 4,
      name: 'Ресторан Астана',
      crmLink: 'https://crm.example.com/rest4',
      countryId: 2,
      cityId: 4,
      districtId: 8,
      address: 'ул. Кунаева, 8',
      latitude: 51.1694,
      longitude: 71.4491,
      typeId: 2,
      priceSegmentId: 2,
      menuTypeId: 1,
      integrationTypeId: 3,
      adminEmail: 'admin@astana.rest',
      connectionData: { host: 'localhost', port: 5432, username: 'admin', password: 'secure789' },
      blocked: true,
      createdAt: now - 86400 * 35,
      updatedAt: now - 86400 * 3,
    },
    {
      id: 5,
      name: 'Кафе Ташкент',
      crmLink: 'https://crm.example.com/rest5',
      countryId: 3,
      cityId: 5,
      districtId: 9,
      address: 'ул. Амира Темура, 32',
      latitude: 41.2995,
      longitude: 69.2401,
      typeId: 1,
      priceSegmentId: 2,
      menuTypeId: 2,
      integrationTypeId: 2,
      adminEmail: 'admin@tashkent.cafe',
      connectionData: { host: 'localhost', port: 5432, username: 'admin', password: 'tash2023' },
      blocked: false,
      createdAt: now - 86400 * 30,
      updatedAt: now - 86400 * 2,
      lastClientActivityAt: now - 5400,
      lastRestaurantActivityAt: now - 14400,
    },
  ];
  saveToStorage(STORAGE_KEYS.RESTAURANTS, restaurants);

  // QR Codes
  const qrCodes: RestaurantQR[] = [
    { id: 1, restaurantId: 1, qrCode: 'QR-REST1-TABLE1', tableNumber: '1', blocked: false, createdAt: now - 86400 * 50, updatedAt: now - 86400 * 10 },
    { id: 2, restaurantId: 1, qrCode: 'QR-REST1-TABLE2', tableNumber: '2', blocked: false, createdAt: now - 86400 * 50, updatedAt: now - 86400 * 10 },
    { id: 3, restaurantId: 1, qrCode: 'QR-REST1-TABLE3', tableNumber: '3', blocked: false, createdAt: now - 86400 * 50, updatedAt: now - 86400 * 10 },
    { id: 4, restaurantId: 2, qrCode: 'QR-REST2-TABLE1', tableNumber: '1', blocked: false, createdAt: now - 86400 * 40, updatedAt: now - 86400 * 8 },
    { id: 5, restaurantId: 2, qrCode: 'QR-REST2-TABLE2', tableNumber: '2', blocked: false, createdAt: now - 86400 * 40, updatedAt: now - 86400 * 8 },
    { id: 6, restaurantId: 3, qrCode: 'QR-REST3-TABLE1', tableNumber: '1', blocked: false, createdAt: now - 86400 * 30, updatedAt: now - 86400 * 5 },
    { id: 7, restaurantId: 3, qrCode: 'QR-REST3-TABLE2', tableNumber: '2', blocked: true, createdAt: now - 86400 * 30, updatedAt: now - 86400 * 1 },
    { id: 8, restaurantId: 5, qrCode: 'QR-REST5-TABLE1', tableNumber: '1', blocked: false, createdAt: now - 86400 * 25, updatedAt: now - 86400 * 2 },
  ];
  saveToStorage(STORAGE_KEYS.QR_CODES, qrCodes);

  // Audit Log
  const auditLog: AuditEvent[] = [
    {
      id: 1,
      timestamp: now - 86400 * 10,
      actorId: 1,
      actorName: 'Администратор',
      action: 'create',
      entityType: 'employee',
      entityId: 5,
      entityLabel: 'Дмитрий Новиков',
    },
    {
      id: 2,
      timestamp: now - 86400 * 8,
      actorId: 1,
      actorName: 'Администратор',
      action: 'update',
      entityType: 'restaurant',
      entityId: 2,
      entityLabel: 'Кафе Нева',
    },
    {
      id: 3,
      timestamp: now - 86400 * 5,
      actorId: 1,
      actorName: 'Администратор',
      action: 'block',
      entityType: 'employee',
      entityId: 4,
      entityLabel: 'Елена Морозова',
    },
  ];
  saveToStorage(STORAGE_KEYS.AUDIT_LOG, auditLog);

  // Mark as initialized
  localStorage.setItem(STORAGE_KEYS.INITIALIZED, 'true');
}
