import { mockRestaurantsApi } from '../mock';
import type { Restaurant } from '../../types';

export const restaurantsApi = {
  list: (): Promise<Restaurant[]> => {
    return mockRestaurantsApi.list();
  },

  getById: (id: number): Promise<Restaurant> => {
    return mockRestaurantsApi.getById(id);
  },

  block: (id: number, blocked: boolean): Promise<Restaurant> => {
    return mockRestaurantsApi.block(id, blocked);
  },
};
