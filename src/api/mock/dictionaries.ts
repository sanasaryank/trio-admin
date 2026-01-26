import { getDatabase, saveDatabase, getSession } from './storage';
import { addAuditEvent } from './audit';
import type { DictionaryKey, DictionaryItemType, DictionaryFormData } from '../../types';

export const mockDictionariesApi = {
  list: async (dictKey: DictionaryKey): Promise<DictionaryItemType[]> => {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 300));

    const db = getDatabase();
    const items = db.dictionaries[dictKey];

    if (!items) {
      throw new Error(`Dictionary ${dictKey} not found`);
    }

    return [...items];
  },

  getById: async (dictKey: DictionaryKey, id: number): Promise<DictionaryItemType> => {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 200));

    const db = getDatabase();
    const items = db.dictionaries[dictKey];

    if (!items) {
      throw new Error(`Dictionary ${dictKey} not found`);
    }

    const item = items.find((i: any) => i.id === id);
    if (!item) {
      throw new Error(`Dictionary item not found`);
    }

    return item;
  },

  create: async (dictKey: DictionaryKey, data: DictionaryFormData): Promise<DictionaryItemType> => {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 400));

    const db = getDatabase();
    const session = getSession();
    const now = Math.floor(Date.now() / 1000);

    const items = db.dictionaries[dictKey];
    if (!items) {
      throw new Error(`Dictionary ${dictKey} not found`);
    }

    const item: any = {
      id: db.nextId.dictionary++,
      name: data.name,
      blocked: data.blocked,
      createdAt: now,
      updatedAt: now,
    };

    // Add parent relationships for hierarchical dictionaries
    if (dictKey === 'cities' && data.countryId) {
      item.countryId = data.countryId;
    }
    if (dictKey === 'districts' && data.cityId) {
      item.cityId = data.cityId;
    }
    
    // Add placement fields
    if (dictKey === 'placements') {
      item.rotation = data.rotation || 30;
      item.refreshTtl = data.refreshTtl || 300;
      item.noAdjacentSameAdvertiser = data.noAdjacentSameAdvertiser || false;
    }

    items.push(item);
    saveDatabase(db);

    // Log audit event
    if (session) {
      addAuditEvent({
        actorId: session.id,
        actorName: `${session.firstName} ${session.lastName}`,
        action: 'create',
        entityType: 'dictionary',
        entityId: item.id,
        entityLabel: `${dictKey}: ${item.name}`,
        metadata: {
          dictionaryKey: dictKey,
        },
      });
    }

    return item;
  },

  update: async (
    dictKey: DictionaryKey,
    id: number,
    data: DictionaryFormData
  ): Promise<DictionaryItemType> => {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 400));

    const db = getDatabase();
    const session = getSession();
    const items = db.dictionaries[dictKey];

    if (!items) {
      throw new Error(`Dictionary ${dictKey} not found`);
    }

    const index = items.findIndex((i: any) => i.id === id);
    if (index === -1) {
      throw new Error(`Dictionary item not found`);
    }

    const now = Math.floor(Date.now() / 1000);
    const item: any = {
      ...items[index],
      name: data.name,
      blocked: data.blocked,
      updatedAt: now,
    };

    // Update parent relationships for hierarchical dictionaries
    if (dictKey === 'cities' && data.countryId) {
      item.countryId = data.countryId;
    }
    if (dictKey === 'districts' && data.cityId) {
      item.cityId = data.cityId;
    }
    
    // Update placement fields
    if (dictKey === 'placements') {
      item.rotation = data.rotation !== undefined ? data.rotation : item.rotation;
      item.refreshTtl = data.refreshTtl !== undefined ? data.refreshTtl : item.refreshTtl;
      item.noAdjacentSameAdvertiser = data.noAdjacentSameAdvertiser !== undefined ? data.noAdjacentSameAdvertiser : item.noAdjacentSameAdvertiser;
    }

    items[index] = item;
    saveDatabase(db);

    // Log audit event
    if (session) {
      addAuditEvent({
        actorId: session.id,
        actorName: `${session.firstName} ${session.lastName}`,
        action: 'update',
        entityType: 'dictionary',
        entityId: item.id,
        entityLabel: `${dictKey}: ${item.name}`,
        metadata: {
          dictionaryKey: dictKey,
        },
      });
    }

    return item;
  },

  block: async (dictKey: DictionaryKey, id: number, blocked: boolean): Promise<DictionaryItemType> => {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 300));

    const db = getDatabase();
    const session = getSession();
    const items = db.dictionaries[dictKey];

    if (!items) {
      throw new Error(`Dictionary ${dictKey} not found`);
    }

    const index = items.findIndex((i: any) => i.id === id);
    if (index === -1) {
      throw new Error(`Dictionary item not found`);
    }

    const now = Math.floor(Date.now() / 1000);
    const item = {
      ...items[index],
      blocked,
      updatedAt: now,
    };

    items[index] = item;
    saveDatabase(db);

    // Log audit event
    if (session) {
      addAuditEvent({
        actorId: session.id,
        actorName: `${session.firstName} ${session.lastName}`,
        action: blocked ? 'block' : 'unblock',
        entityType: 'dictionary',
        entityId: item.id,
        entityLabel: `${dictKey}: ${item.name}`,
        metadata: {
          dictionaryKey: dictKey,
        },
      });
    }

    return item;
  },
};
