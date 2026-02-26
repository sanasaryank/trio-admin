import type { AuditEvent, AuditEntityType } from '../../types';

// Audit API - placeholder for real implementation
export const auditApi = {
  getEvents: async (params?: {
    entityType?: AuditEntityType;
    entityId?: string;
  }): Promise<AuditEvent[]> => {
    // TODO: Implement real audit API when endpoint is available
    console.warn('Audit API not yet implemented, returning empty array');
    return [];
  },
};
