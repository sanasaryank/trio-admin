// Base types
export interface BaseEntity {
  id: string;
  isBlocked: boolean;
}

export interface EntityWithHash extends BaseEntity {
  hash: string;
}

// Dictionary multilingual name
export interface DictionaryName {
  ARM: string;
  RUS: string;
  ENG: string;
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
  name: DictionaryName;
  description?: string;
}

// Geographic data types (have simple string names)
export interface Country extends BaseEntity {
  name: string;
  description?: string;
}

export interface City extends BaseEntity {
  name: string;
  countryId: string;
}

export interface District extends BaseEntity {
  name: string;
  cityId: string;
}

// Business dictionary types (have multilingual names)
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

// Restaurant list item (simplified for list view)
export interface RestaurantListItem extends BaseEntity {
  name: string | DictionaryName;
  crmUrl: string;
  cityName: string;
  districtName: string;
}

// Restaurant detail (full data for edit/view)
export interface Restaurant extends EntityWithHash {
  name: DictionaryName;
  crmUrl: string;
  countryId: string;
  cityId: string;
  districtId: string;
  legalAddress: string;
  tin: string;
  lat: number;
  lng: number;
  typeId: string[]; // restaurant-types
  priceSegmentId: string[]; // price-segments
  menuTypeId: string[]; // menu-types
  integrationTypeId: string; // integration-types
  adminEmail: string;
  adminUsername: string;
  adminPassword?: string; // Optional when editing
  connectionData: ConnectionData;
}

// Locations response for geography data
export interface LocationsResponse {
  countries: Country[];
  cities: City[];
  districts: District[];
}

// QR Code
export type QRType = 'Static' | 'Dynamic';

export interface QRCode extends BaseEntity {
  hallId: string; // Comes from integration system
  tableId: string; // Comes from integration system
  qrText: string; // Comes from integration system
  type: QRType;
}

export interface QRBatchCreateRequest {
  count: number;
  type: QRType;
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
  id: string;
  timestamp: number; // Unix timestamp (seconds)
  actorId: string;
  actorName: string;
  action: AuditAction;
  entityType: AuditEntityType;
  entityId: string;
  entityLabel: string;
  metadata?: Record<string, unknown>;
}

// Auth
export interface User {
  id?: string;
  username: string;
  firstName: string;
  lastName: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  username: string;
  firstName: string;
  lastName: string;
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
  countryId?: string;
  cityId?: string;
  districtId?: string;
  typeId?: string[];
  priceSegmentId?: string[];
  menuTypeId?: string[];
  integrationTypeId?: string;
}

export interface DictionaryFilters {
  status: 'active' | 'blocked' | 'all';
}

// Form types
export interface EmployeeFormData {
  hash?: string; // Required for updates
  firstName: string;
  lastName: string;
  username?: string; // Required only for creation, not sent in updates
  password?: string; // Optional when editing
  changePassword?: boolean; // Flag for edit mode
  isBlocked: boolean;
}

export interface RestaurantFormData {
  hash?: string; // Required for updates
  name: DictionaryName;
  crmUrl: string;
  countryId: string;
  cityId: string;
  districtId: string;
  legalAddress: string;
  tin: string;
  lat: number;
  lng: number;
  typeId: string[];
  priceSegmentId: string[];
  menuTypeId: string[];
  integrationTypeId: string;
  adminEmail: string;
  adminUsername: string;
  adminPassword: string;
  adminChangePassword: boolean;
  connectionData: {
    host: string;
    port: number;
    username: string;
    password: string;
    changePassword: boolean;
  };
  isBlocked: boolean;
}

export interface DictionaryFormData {
  hash?: string; // Required for updates
  name: DictionaryName | string; // DictionaryName for dictionaries, string for geographic data
  isBlocked: boolean;
  description?: string;
  countryId?: string; // For cities
  cityId?: string; // For districts
  rotation?: number; // For placements
  refreshTtl?: number; // For placements
  noAdjacentSameAdvertiser?: boolean; // For placements
}

// Advertisement types
export interface Advertiser extends BaseEntity {
  name: string;
  tin: string; // Tax Identification Number
}

export interface Campaign extends BaseEntity {
  advertiserId: string;
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
  locations: string[]; // district IDs, empty = All
  restaurantTypesMode: 'allowed' | 'denied';
  restaurantTypes: string[]; // restaurant type IDs, empty = All
  menuTypesMode: 'allowed' | 'denied';
  menuTypes: string[]; // menu type IDs, empty = All
  placements: string[]; // ads slot IDs, empty = All
  targets: CampaignTarget[];
}

export interface CampaignTarget {
  id: string; // restaurant id
  slots: CampaignTargetSlot[];
}

export interface CampaignTargetSlot {
  id: string; // slot id
  schedules: string[]; // schedule ids
}

export interface Creative extends BaseEntity {
  campaignId: string;
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
  advertiserId?: string;
}

export interface CreativeFilters {
  status: 'active' | 'blocked' | 'all';
  campaignId?: string;
  advertiserId?: string;
}

// Advertisement form data
export interface AdvertiserFormData {
  hash?: string; // Required for updates
  name: string;
  tin: string;
  blocked: boolean;
}

export interface CampaignFormData {
  hash?: string; // Required for updates
  advertiserId: string;
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
  locations: string[];
  restaurantTypesMode: 'allowed' | 'denied';
  restaurantTypes: string[];
  menuTypesMode: 'allowed' | 'denied';
  menuTypes: string[];
  placements: string[];
  targets: CampaignTarget[];
  blocked: boolean;
}

export interface CreativeFormData {
  hash?: string; // Required for updates
  campaignId: string;
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
  hash?: string; // Required for updates
  name: string;
  color: string;
  weekSchedule: DaySchedule[];
  blocked: boolean;
}
