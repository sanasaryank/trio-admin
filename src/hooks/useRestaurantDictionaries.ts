import useFetch from './useFetch';
import { restaurantsApi, dictionariesApi } from '../api/endpoints';
import type {
  Country,
  City,
  District,
  RestaurantType,
  PriceSegment,
  MenuType,
  IntegrationType,
} from '../types';

interface RestaurantDictionaries {
  countries: Country[];
  cities: City[];
  districts: District[];
  restaurantTypes: RestaurantType[];
  priceSegments: PriceSegment[];
  menuTypes: MenuType[];
  integrationTypes: IntegrationType[];
}

/**
 * Reusable hook for fetching all restaurant-related dictionaries
 * Used by RestaurantsListPage and RestaurantFormPage
 */
export const useRestaurantDictionaries = () => {
  return useFetch<RestaurantDictionaries>(
    async () => {
      try {
        const [
          locationsData,
          restaurantTypesData,
          priceSegmentsData,
          menuTypesData,
          integrationTypesData,
        ] = await Promise.all([
          restaurantsApi.getLocations().catch(() => ({ countries: [], cities: [], districts: [] })),
          dictionariesApi.list('restaurant-types').catch(() => []),
          dictionariesApi.list('price-segments').catch(() => []),
          dictionariesApi.list('menu-types').catch(() => []),
          dictionariesApi.list('integration-types').catch(() => []),
        ]);

        return {
          countries: locationsData.countries || [],
          cities: locationsData.cities || [],
          districts: locationsData.districts || [],
          restaurantTypes: restaurantTypesData as RestaurantType[],
          priceSegments: priceSegmentsData as PriceSegment[],
          menuTypes: menuTypesData as MenuType[],
          integrationTypes: integrationTypesData as IntegrationType[],
        };
      } catch (error) {
        // Return empty arrays on error
        return {
          countries: [],
          cities: [],
          districts: [],
          restaurantTypes: [],
          priceSegments: [],
          menuTypes: [],
          integrationTypes: [],
        };
      }
    },
    []
  );
};
