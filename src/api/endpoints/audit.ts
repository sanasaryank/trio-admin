import { mockAuditApi } from '../mock';
import type { AuditEvent, AuditEntityType } from '../../types';

export const auditApi = {
  getEvents: (params?: {
    entityType?: AuditEntityType;
    entityId?: number | string;
  }): Promise<AuditEvent[]> => {
    return mockAuditApi.getEvents(params);
  },
};
