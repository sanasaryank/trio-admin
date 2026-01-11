import { BaseEntity } from './common';

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

export type DictionaryType = 
  | 'countries'
  | 'cities'
  | 'districts'
  | 'restaurantTypes'
  | 'priceSegments'
  | 'menuTypes'
  | 'integrationTypes';
