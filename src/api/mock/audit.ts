import { getDatabase, saveDatabase } from './storage';
import type { AuditEvent, AuditAction, AuditEntityType } from '../../types';

interface AddAuditEventParams {
  actorId: number;
  actorName: string;
  action: AuditAction;
  entityType: AuditEntityType;
  entityId: number | string;
  entityLabel: string;
  metadata?: Record<string, unknown>;
}

export const addAuditEvent = (params: AddAuditEventParams): void => {
  const db = getDatabase();
  const now = Math.floor(Date.now() / 1000);

  const event: AuditEvent = {
    id: db.nextId.audit++,
    timestamp: now,
    actorId: params.actorId,
    actorName: params.actorName,
    action: params.action,
    entityType: params.entityType,
    entityId: params.entityId,
    entityLabel: params.entityLabel,
    metadata: params.metadata,
  };

  db.auditEvents.push(event);
  saveDatabase(db);
};

export const mockAuditApi = {
  getEvents: async (params?: {
    entityType?: AuditEntityType;
    entityId?: number | string;
  }): Promise<AuditEvent[]> => {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 300));

    const db = getDatabase();
    let events = [...db.auditEvents];

    if (params?.entityType) {
      events = events.filter((e) => e.entityType === params.entityType);
    }

    if (params?.entityId !== undefined) {
      events = events.filter((e) => e.entityId === params.entityId);
    }

    // Sort by timestamp descending (newest first)
    events.sort((a, b) => b.timestamp - a.timestamp);

    return events;
  },
};
