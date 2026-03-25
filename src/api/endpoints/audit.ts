import type { AuditEvent, AuditEntityType } from '../../types';

// Builds query string for audit events (used by real impl: GET /audit/events?entityType=...&entityId=...)
function buildAuditQuery(params?: {
  entityType?: AuditEntityType;
  entityId?: string;
}): URLSearchParams {
  const query = new URLSearchParams();
  if (params?.entityType) query.set('entityType', params.entityType);
  if (params?.entityId) query.set('entityId', params.entityId);
  return query;
}

// Audit API - placeholder for real implementation
export const auditApi = {
  getEvents: async (params?: {
    entityType?: AuditEntityType;
    entityId?: string;
  }): Promise<AuditEvent[]> => {
    const query = buildAuditQuery(params);
    // TODO: Implement real audit API: GET /audit/events?${query.toString()}
    console.warn('Audit API not yet implemented, returning empty array. Query would be:', query.toString());
    return [];
  },
};
