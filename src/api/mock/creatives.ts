import { getDatabase, saveDatabase, getSession } from './storage';
import { addAuditEvent } from './audit';
import type { Creative, CreativeFormData } from '../../types';

export const mockCreativesApi = {
  list: async (): Promise<Creative[]> => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const db = getDatabase();
    return [...db.creatives];
  },

  getById: async (id: number): Promise<Creative> => {
    await new Promise((resolve) => setTimeout(resolve, 200));
    const db = getDatabase();
    const creative = db.creatives.find((c) => c.id === id);
    if (!creative) {
      throw new Error('Creative not found');
    }
    return creative;
  },

  create: async (data: CreativeFormData): Promise<Creative> => {
    await new Promise((resolve) => setTimeout(resolve, 400));
    const db = getDatabase();
    const session = getSession();
    const now = Math.floor(Date.now() / 1000);

    const creative: Creative = {
      id: db.nextId.creative++,
      campaignId: data.campaignId,
      name: data.name,
      dataUrl: data.dataUrl,
      htmlContent: data.htmlContent,
      minHeight: data.minHeight,
      maxHeight: data.maxHeight,
      minWidth: data.minWidth,
      maxWidth: data.maxWidth,
      previewWidth: data.previewWidth,
      previewHeight: data.previewHeight,
      blocked: data.blocked,
      createdAt: now,
      updatedAt: now,
    };

    db.creatives.push(creative);
    saveDatabase(db);

    if (session) {
      addAuditEvent({
        actorId: session.id,
        actorName: `${session.firstName} ${session.lastName}`,
        action: 'create',
        entityType: 'creative',
        entityId: creative.id,
        entityLabel: creative.name,
      });
    }

    return creative;
  },

  update: async (id: number, data: CreativeFormData): Promise<Creative> => {
    await new Promise((resolve) => setTimeout(resolve, 400));
    const db = getDatabase();
    const session = getSession();
    const index = db.creatives.findIndex((c) => c.id === id);

    if (index === -1) {
      throw new Error('Creative not found');
    }

    const now = Math.floor(Date.now() / 1000);
    const creative: Creative = {
      ...db.creatives[index],
      campaignId: data.campaignId,
      name: data.name,
      dataUrl: data.dataUrl,
      htmlContent: data.htmlContent,
      minHeight: data.minHeight,
      maxHeight: data.maxHeight,
      minWidth: data.minWidth,
      maxWidth: data.maxWidth,
      previewWidth: data.previewWidth,
      previewHeight: data.previewHeight,
      blocked: data.blocked,
      updatedAt: now,
    };

    db.creatives[index] = creative;
    saveDatabase(db);

    if (session) {
      addAuditEvent({
        actorId: session.id,
        actorName: `${session.firstName} ${session.lastName}`,
        action: 'update',
        entityType: 'creative',
        entityId: creative.id,
        entityLabel: creative.name,
      });
    }

    return creative;
  },

  block: async (id: number, blocked: boolean): Promise<Creative> => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const db = getDatabase();
    const session = getSession();
    const index = db.creatives.findIndex((c) => c.id === id);

    if (index === -1) {
      throw new Error('Creative not found');
    }

    const now = Math.floor(Date.now() / 1000);
    const creative = {
      ...db.creatives[index],
      blocked,
      updatedAt: now,
    };

    db.creatives[index] = creative;
    saveDatabase(db);

    if (session) {
      addAuditEvent({
        actorId: session.id,
        actorName: `${session.firstName} ${session.lastName}`,
        action: blocked ? 'block' : 'unblock',
        entityType: 'creative',
        entityId: creative.id,
        entityLabel: creative.name,
      });
    }

    return creative;
  },
};
