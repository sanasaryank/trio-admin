import type { DictionaryKey, DictionaryName } from '../types';
import i18n from 'i18next';

export interface DictionaryFieldsConfig {
  hasCountrySelector: boolean;
  hasCitySelector: boolean;
  hasPlacementFields: boolean;
}

/**
 * Returns the display name from a multilingual dictionary name based on current language
 * Safely handles both string and multilingual object formats
 */
export const getDisplayName = (name: string | DictionaryName | undefined): string => {
  if (!name) return '';
  if (typeof name === 'string') {
    return name;
  }
  // Handle multilingual object
  if (typeof name === 'object' && name !== null) {
    const currentLang = i18n.language.toUpperCase();
    if (currentLang === 'HY' || currentLang === 'ARM') {
      return name.ARM || name.ENG || '';
    } else if (currentLang === 'RU' || currentLang === 'RUS') {
      return name.RUS || name.ENG || '';
    } else {
      return name.ENG || name.ARM || '';
    }
  }
  return String(name);
};

/**
 * Returns a readable title for a dictionary key
 */
export const getDictionaryTitle = (dictKey: DictionaryKey): string => {
  const keys: Record<DictionaryKey, string> = {
    'restaurant-types': 'menu.restaurantTypes',
    'price-segments': 'menu.priceSegments',
    'menu-types': 'menu.menuTypes',
    'integration-types': 'menu.integrationTypes',
    'placements': 'menu.placements',
    'locations': 'menu.locations',
    'countries': 'menu.countries',
    'cities': 'menu.cities',
    'districts': 'menu.districts',
  };

  return i18n.t(keys[dictKey] || dictKey);
};

/**
 * Returns configuration for dictionary fields (which selectors to show)
 */
export const getDictionaryFieldsConfig = (dictKey: DictionaryKey): DictionaryFieldsConfig => {
  switch (dictKey) {
    case 'cities':
      return {
        hasCountrySelector: true,
        hasCitySelector: false,
        hasPlacementFields: false,
      };
    case 'districts':
      return {
        hasCountrySelector: false,
        hasCitySelector: true,
        hasPlacementFields: false,
      };
    case 'placements':
      return {
        hasCountrySelector: false,
        hasCitySelector: false,
        hasPlacementFields: true,
      };
    default:
      return {
        hasCountrySelector: false,
        hasCitySelector: false,
        hasPlacementFields: false,
      };
  }
};
