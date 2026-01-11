// Base types
export interface BaseEntity {
  id: number;
  blocked: boolean;
  createdAt: number; // Unix timestamp (seconds)
  updatedAt: number; // Unix timestamp (seconds)
}

// Employee
export interface Employee extends BaseEntity {
  firstName: string;
  lastName: string;
  username: string;
  password?: string; // Optional when fetching, required when creating
}

// Dictionary types
export interface DictionaryItem extends BaseEntity {
  name: string;
}

export interface Country extends DictionaryItem {}

export interface City extends DictionaryItem {
  countryId: number;
}

export interface District extends DictionaryItem {
  cityId: number;
}

export interface RestaurantType extends DictionaryItem {}
export interface PriceSegment extends DictionaryItem {}
export interface MenuType extends DictionaryItem {}
export interface IntegrationType extends DictionaryItem {}

export type DictionaryKey =
  | 'restaurant-types'
  | 'price-segments'
  | 'menu-types'
  | 'integration-types'
  | 'countries'
  | 'cities'
  | 'districts';

export type DictionaryItemType =
  | RestaurantType
  | PriceSegment
  | MenuType
  | IntegrationType
  | Country
  | City
  | District;

// Restaurant
export interface ConnectionData {
  host: string;
  port: number;
  username: string;
  password?: string; // Optional when editing
}

export interface Restaurant extends BaseEntity {
  name: string;
  crmUrl: string;
  countryId: number;
  cityId: number;
  districtId: number;
  address: string;
  lat: number;
  lng: number;
  typeId: number; // restaurant-types
  priceSegmentId: number; // price-segments
  menuTypeId: number; // menu-types
  integrationTypeId: number; // integration-types
  adminEmail: string;
  connectionData: ConnectionData;
  lastClientActivityAt?: number; // Unix timestamp (seconds)
  lastRestaurantActivityAt?: number; // Unix timestamp (seconds)
}

// QR Code
export interface QRCode extends BaseEntity {
  restaurantId: number;
  qrText: string;
  tableNumber?: string; // Comes from integration, not editable
}

// Audit Log
export type AuditAction =
  | 'login'
  | 'logout'
  | 'create'
  | 'update'
  | 'block'
  | 'unblock'
  | 'batch_create_qr';

export type AuditEntityType =
  | 'employee'
  | 'restaurant'
  | 'qr'
  | 'dictionary'
  | 'user';

export interface AuditEvent {
  id: number;
  timestamp: number; // Unix timestamp (seconds)
  actorId: number;
  actorName: string;
  action: AuditAction;
  entityType: AuditEntityType;
  entityId: number | string;
  entityLabel: string;
  metadata?: Record<string, unknown>;
}

// Auth
export interface User {
  id: number;
  username: string;
  firstName: string;
  lastName: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  user: User;
}

// API Response types
export interface ApiResponse<T> {
  data: T;
}

export interface ApiError {
  message: string;
  code?: string;
}

// Filter types
export interface EmployeeFilters {
  search: string;
  status: 'active' | 'blocked' | 'all';
}

export interface RestaurantFilters {
  search: string;
  status: 'active' | 'blocked' | 'all';
  countryId?: number;
  cityId?: number;
  districtId?: number;
  typeId?: number;
  priceSegmentId?: number;
  menuTypeId?: number;
  integrationTypeId?: number;
}

export interface DictionaryFilters {
  status: 'active' | 'blocked' | 'all';
}

// Form types
export interface EmployeeFormData {
  firstName: string;
  lastName: string;
  username: string;
  password?: string; // Optional when editing
  changePassword?: boolean; // Flag for edit mode
  blocked: boolean;
}

export interface RestaurantFormData {
  name: string;
  crmUrl: string;
  countryId: number;
  cityId: number;
  districtId: number;
  address: string;
  lat: number;
  lng: number;
  typeId: number;
  priceSegmentId: number;
  menuTypeId: number;
  integrationTypeId: number;
  adminEmail: string;
  connectionData: {
    host: string;
    port: number;
    username: string;
    password: string;
    changePassword: boolean;
  };
  blocked: boolean;
}

export interface DictionaryFormData {
  name: string;
  blocked: boolean;
  countryId?: number; // For cities
  cityId?: number; // For districts
}

export interface QRBatchCreateRequest {
  count: number;
}
