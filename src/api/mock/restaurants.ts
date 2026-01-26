import { getDatabase, saveDatabase, getSession } from './storage';
import { addAuditEvent } from './audit';
import type { Restaurant } from '../../types';

export const mockRestaurantsApi = {
  list: async (): Promise<Restaurant[]> => {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 300));

    const db = getDatabase();
    return [...db.restaurants];
  },

  getById: async (id: number): Promise<Restaurant> => {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 200));

    const db = getDatabase();
    const restaurant = db.restaurants.find((r) => r.id === id);

    if (!restaurant) {
      throw new Error('Restaurant not found');
    }

    return restaurant;
  },

  block: async (id: number, blocked: boolean): Promise<Restaurant> => {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 300));

    const db = getDatabase();
    const session = getSession();
    const index = db.restaurants.findIndex((r) => r.id === id);

    if (index === -1) {
      throw new Error('Restaurant not found');
    }

    const now = Math.floor(Date.now() / 1000);
    const restaurant = {
      ...db.restaurants[index],
      blocked,
      updatedAt: now,
    };

    db.restaurants[index] = restaurant;
    saveDatabase(db);

    // Log audit event
    if (session) {
      addAuditEvent({
        actorId: session.id,
        actorName: `${session.firstName} ${session.lastName}`,
        action: blocked ? 'block' : 'unblock',
        entityType: 'restaurant',
        entityId: restaurant.id,
        entityLabel: restaurant.name,
      });
    }

    return restaurant;
  },
};
