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
export interface Placement extends DictionaryItem {
  rotation: number; // seconds
  refreshTtl: number; // seconds
  noAdjacentSameAdvertiser: boolean;
}

export type DictionaryKey =
  | 'restaurant-types'
  | 'price-segments'
  | 'menu-types'
  | 'integration-types'
  | 'placements'
  | 'locations'
  | 'countries'
  | 'cities'
  | 'districts';

export type Dictionary = DictionaryItem;

export type DictionaryItemType =
  | RestaurantType
  | PriceSegment
  | MenuType
  | IntegrationType
  | Placement
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
  typeId: number[]; // restaurant-types
  priceSegmentId: number[]; // price-segments
  menuTypeId: number[]; // menu-types
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
  | 'user'
  | 'advertiser'
  | 'campaign'
  | 'creative';

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
  typeId?: number[];
  priceSegmentId?: number[];
  menuTypeId?: number[];
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
  typeId: number[];
  priceSegmentId: number[];
  menuTypeId: number[];
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
  rotation?: number; // For placements
  refreshTtl?: number; // For placements
  noAdjacentSameAdvertiser?: boolean; // For placements
}

export interface QRBatchCreateRequest {
  count: number;
}

// Advertisement types
export interface Advertiser extends BaseEntity {
  name: string;
  tin: string; // Tax Identification Number
}

export interface Campaign extends BaseEntity {
  advertiserId: number;
  name: string;
  startDate: number; // Unix timestamp (seconds)
  endDate: number; // Unix timestamp (seconds)
  budget: number;
  budgetDaily: number;
  price: number;
  pricingModel: 'CPM' | 'CPC' | 'CPV' | 'CPA';
  spendStrategy: 'even' | 'asap' | 'frontload';
  frequencyCapStrategy: 'soft' | 'strict';
  frequencyCap: {
    per_user: {
      impressions: { count: number; window_sec: number };
      clicks: { count: number; window_sec: number };
    };
    per_session: {
      impressions: { count: number; window_sec: number };
      clicks: { count: number; window_sec: number };
    };
  };
  priority: number;
  weight: number;
  overdeliveryRatio: number; // percentage
  locationsMode: 'allowed' | 'denied';
  locations: number[]; // district IDs, empty = All
  restaurantTypesMode: 'allowed' | 'denied';
  restaurantTypes: number[]; // restaurant type IDs, empty = All
  menuTypesMode: 'allowed' | 'denied';
  menuTypes: number[]; // menu type IDs, empty = All
  placements: number[]; // ads slot IDs, empty = All
  targets: CampaignTarget[];
}

export interface CampaignTarget {
  id: number; // restaurant id
  slots: CampaignTargetSlot[];
}

export interface CampaignTargetSlot {
  id: number; // slot id
  schedules: number[]; // schedule ids
}

export interface Creative extends BaseEntity {
  campaignId: number;
  name: string;
  minHeight: number;
  maxHeight: number;
  minWidth: number;
  maxWidth: number;
  dataUrl: string;
  htmlContent?: string; // Optional inline HTML content (overrides dataUrl if present)
  previewWidth: number;
  previewHeight: number;
}

export interface DaySchedule {
  day: 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun';
  enabled: boolean;
  startTime: string; // HH:mm format
  endTime: string; // HH:mm format
}

export interface Schedule extends BaseEntity {
  name: string;
  color: string; // hex color
  weekSchedule: DaySchedule[];
}

// Advertisement filters
export interface AdvertiserFilters {
  search: string;
  status: 'active' | 'blocked' | 'all';
}

export interface CampaignFilters {
  search: string;
  status: 'active' | 'blocked' | 'all';
  advertiserId?: number;
}

export interface CreativeFilters {
  status: 'active' | 'blocked' | 'all';
  campaignId?: number;
  advertiserId?: number;
}

// Advertisement form data
export interface AdvertiserFormData {
  name: string;
  tin: string;
  blocked: boolean;
}

export interface CampaignFormData {
  advertiserId: number;
  name: string;
  startDate: number;
  endDate: number;
  budget: number;
  budgetDaily: number;
  price: number;
  pricingModel: 'CPM' | 'CPC' | 'CPV' | 'CPA';
  spendStrategy: 'even' | 'asap' | 'frontload';
  frequencyCapStrategy: 'soft' | 'strict';
  frequencyCap: {
    per_user: {
      impressions: { count: number; window_sec: number };
      clicks: { count: number; window_sec: number };
    };
    per_session: {
      impressions: { count: number; window_sec: number };
      clicks: { count: number; window_sec: number };
    };
  };
  priority: number;
  weight: number;
  overdeliveryRatio: number;
  locationsMode: 'allowed' | 'denied';
  locations: number[];
  restaurantTypesMode: 'allowed' | 'denied';
  restaurantTypes: number[];
  menuTypesMode: 'allowed' | 'denied';
  menuTypes: number[];
  placements: number[];
  targets: CampaignTarget[];
  blocked: boolean;
}

export interface CreativeFormData {
  campaignId: number;
  name: string;
  minHeight: number;
  maxHeight: number;
  minWidth: number;
  maxWidth: number;
  dataUrl: string;
  htmlContent?: string; // Optional inline HTML content (overrides dataUrl if present)
  previewWidth: number;
  previewHeight: number;
  blocked: boolean;
}

export interface ScheduleFormData {
  name: string;
  color: string;
  weekSchedule: DaySchedule[];
  blocked: boolean;
}
