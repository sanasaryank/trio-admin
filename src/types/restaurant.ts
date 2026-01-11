import { BaseEntity } from './common';

export interface ConnectionData {
  host: string;
  port: number;
  username: string;
  password?: string;
}

export interface Restaurant extends BaseEntity {
  name: string;
  crmLink: string;
  countryId: number;
  cityId: number;
  districtId: number;
  address: string;
  latitude: number;
  longitude: number;
  typeId: number;
  priceSegmentId: number;
  menuTypeId: number;
  integrationTypeId: number;
  adminEmail: string;
  connectionData: ConnectionData;
  lastClientActivityAt?: number;
  lastRestaurantActivityAt?: number;
}

export type RestaurantFormData = Omit<Restaurant, 'id' | 'createdAt' | 'updatedAt'>;
