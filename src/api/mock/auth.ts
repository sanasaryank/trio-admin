import { getFromStorage, saveToStorage } from './storage';
import { STORAGE_KEYS } from '@/utils/constants';
import type { AuditEvent } from '@/types/audit';

interface User {
  id: number;
  username: string;
  password: string;
  name: string;
}

/**
 * Mock authentication API
 */
export const authAPI = {
  /**
   * Login with username and password
   */
  login: (username: string, password: string): boolean => {
    const user = getFromStorage<User>('trio_user');
    
    if (user && user.username === username && user.password === password) {
      saveToStorage(STORAGE_KEYS.AUTH_USER, user);
      
      // Log audit event
      const auditLog = getFromStorage<AuditEvent[]>(STORAGE_KEYS.AUDIT_LOG) || [];
      const newEvent: AuditEvent = {
        id: auditLog.length + 1,
        timestamp: Math.floor(Date.now() / 1000),
        actorId: user.id,
        actorName: user.name,
        action: 'login',
        entityType: 'user',
        entityId: user.id,
        entityLabel: user.name,
      };
      auditLog.push(newEvent);
      saveToStorage(STORAGE_KEYS.AUDIT_LOG, auditLog);
      
      return true;
    }
    return false;
  },

  /**
   * Logout current user
   */
  logout: (): void => {
    const user = getFromStorage<User>(STORAGE_KEYS.AUTH_USER);
    
    if (user) {
      // Log audit event
      const auditLog = getFromStorage<AuditEvent[]>(STORAGE_KEYS.AUDIT_LOG) || [];
      const newEvent: AuditEvent = {
        id: auditLog.length + 1,
        timestamp: Math.floor(Date.now() / 1000),
        actorId: user.id,
        actorName: user.name,
        action: 'logout',
        entityType: 'user',
        entityId: user.id,
        entityLabel: user.name,
      };
      auditLog.push(newEvent);
      saveToStorage(STORAGE_KEYS.AUDIT_LOG, auditLog);
    }
    
    localStorage.removeItem(STORAGE_KEYS.AUTH_USER);
  },

  /**
   * Get current authenticated user
   */
  getCurrentUser: (): User | null => {
    return getFromStorage<User>(STORAGE_KEYS.AUTH_USER);
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated: (): boolean => {
    return getFromStorage<User>(STORAGE_KEYS.AUTH_USER) !== null;
  },
};
