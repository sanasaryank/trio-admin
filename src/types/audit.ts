export interface AuditEvent {
  id: number;
  timestamp: number;
  actorId: number;
  actorName: string;
  action: string;
  entityType: string;
  entityId: number;
  entityLabel: string;
}

export type AuditAction = 
  | 'login'
  | 'logout'
  | 'create'
  | 'update'
  | 'block'
  | 'unblock'
  | 'create_qr'
  | 'block_qr'
  | 'unblock_qr';
