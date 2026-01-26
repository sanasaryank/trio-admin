import { getDatabase, saveDatabase, getSession } from './storage';
import { addAuditEvent } from './audit';
import type { Advertiser, AdvertiserFormData } from '../../types';

export const mockAdvertisersApi = {
  list: async (): Promise<Advertiser[]> => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const db = getDatabase();
    return [...db.advertisers];
  },

  getById: async (id: number): Promise<Advertiser> => {
    await new Promise((resolve) => setTimeout(resolve, 200));
    const db = getDatabase();
    const advertiser = db.advertisers.find((a) => a.id === id);
    if (!advertiser) {
      throw new Error('Advertiser not found');
    }
    return advertiser;
  },

  create: async (data: AdvertiserFormData): Promise<Advertiser> => {
    await new Promise((resolve) => setTimeout(resolve, 400));
    const db = getDatabase();
    const session = getSession();
    const now = Math.floor(Date.now() / 1000);

    const advertiser: Advertiser = {
      id: db.nextId.advertiser++,
      name: data.name,
      tin: data.tin,
      blocked: data.blocked,
      createdAt: now,
      updatedAt: now,
    };

    db.advertisers.push(advertiser);
    saveDatabase(db);

    if (session) {
      addAuditEvent({
        actorId: session.id,
        actorName: `${session.firstName} ${session.lastName}`,
        action: 'create',
        entityType: 'advertiser',
        entityId: advertiser.id,
        entityLabel: advertiser.name,
      });
    }

    return advertiser;
  },

  update: async (id: number, data: AdvertiserFormData): Promise<Advertiser> => {
    await new Promise((resolve) => setTimeout(resolve, 400));
    const db = getDatabase();
    const session = getSession();
    const index = db.advertisers.findIndex((a) => a.id === id);

    if (index === -1) {
      throw new Error('Advertiser not found');
    }

    const now = Math.floor(Date.now() / 1000);
    const advertiser: Advertiser = {
      ...db.advertisers[index],
      name: data.name,
      tin: data.tin,
      blocked: data.blocked,
      updatedAt: now,
    };

    db.advertisers[index] = advertiser;
    saveDatabase(db);

    if (session) {
      addAuditEvent({
        actorId: session.id,
        actorName: `${session.firstName} ${session.lastName}`,
        action: 'update',
        entityType: 'advertiser',
        entityId: advertiser.id,
        entityLabel: advertiser.name,
      });
    }

    return advertiser;
  },

  block: async (id: number, blocked: boolean): Promise<Advertiser> => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const db = getDatabase();
    const session = getSession();
    const index = db.advertisers.findIndex((a) => a.id === id);

    if (index === -1) {
      throw new Error('Advertiser not found');
    }

    const now = Math.floor(Date.now() / 1000);
    const advertiser = {
      ...db.advertisers[index],
      blocked,
      updatedAt: now,
    };

    db.advertisers[index] = advertiser;
    saveDatabase(db);

    if (session) {
      addAuditEvent({
        actorId: session.id,
        actorName: `${session.firstName} ${session.lastName}`,
        action: blocked ? 'block' : 'unblock',
        entityType: 'advertiser',
        entityId: advertiser.id,
        entityLabel: advertiser.name,
      });
    }

    return advertiser;
  },
};
