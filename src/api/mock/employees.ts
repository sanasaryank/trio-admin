import { getFromStorage, saveToStorage } from './storage';
import { STORAGE_KEYS } from '@/utils/constants';
import type { Employee, EmployeeFormData } from '@/types/employee';
import type { AuditEvent } from '@/types/audit';
import { authAPI } from './auth';

/**
 * Mock Employees API
 */
export const employeesAPI = {
  /**
   * Get all employees
   */
  getAll: (): Employee[] => {
    return getFromStorage<Employee[]>(STORAGE_KEYS.EMPLOYEES) || [];
  },

  /**
   * Get employee by ID
   */
  getById: (id: number): Employee | null => {
    const employees = employeesAPI.getAll();
    return employees.find(emp => emp.id === id) || null;
  },

  /**
   * Create new employee
   */
  create: (data: EmployeeFormData): Employee => {
    const employees = employeesAPI.getAll();
    const now = Math.floor(Date.now() / 1000);
    const newId = Math.max(0, ...employees.map(e => e.id)) + 1;
    
    const newEmployee: Employee = {
      ...data,
      id: newId,
      createdAt: now,
      updatedAt: now,
    };
    
    employees.push(newEmployee);
    saveToStorage(STORAGE_KEYS.EMPLOYEES, employees);
    
    // Log audit event
    const user = authAPI.getCurrentUser();
    if (user) {
      const auditLog = getFromStorage<AuditEvent[]>(STORAGE_KEYS.AUDIT_LOG) || [];
      const newEvent: AuditEvent = {
        id: auditLog.length + 1,
        timestamp: now,
        actorId: user.id,
        actorName: user.name,
        action: 'create',
        entityType: 'employee',
        entityId: newEmployee.id,
        entityLabel: `${newEmployee.firstName} ${newEmployee.lastName}`,
      };
      auditLog.push(newEvent);
      saveToStorage(STORAGE_KEYS.AUDIT_LOG, auditLog);
    }
    
    return newEmployee;
  },

  /**
   * Update employee
   */
  update: (id: number, data: Partial<EmployeeFormData>): Employee | null => {
    const employees = employeesAPI.getAll();
    const index = employees.findIndex(emp => emp.id === id);
    
    if (index === -1) return null;
    
    const now = Math.floor(Date.now() / 1000);
    employees[index] = {
      ...employees[index],
      ...data,
      updatedAt: now,
    };
    
    saveToStorage(STORAGE_KEYS.EMPLOYEES, employees);
    
    // Log audit event
    const user = authAPI.getCurrentUser();
    if (user) {
      const auditLog = getFromStorage<AuditEvent[]>(STORAGE_KEYS.AUDIT_LOG) || [];
      const newEvent: AuditEvent = {
        id: auditLog.length + 1,
        timestamp: now,
        actorId: user.id,
        actorName: user.name,
        action: 'update',
        entityType: 'employee',
        entityId: employees[index].id,
        entityLabel: `${employees[index].firstName} ${employees[index].lastName}`,
      };
      auditLog.push(newEvent);
      saveToStorage(STORAGE_KEYS.AUDIT_LOG, auditLog);
    }
    
    return employees[index];
  },

  /**
   * Block/Unblock employee
   */
  toggleBlock: (id: number): Employee | null => {
    const employees = employeesAPI.getAll();
    const index = employees.findIndex(emp => emp.id === id);
    
    if (index === -1) return null;
    
    const now = Math.floor(Date.now() / 1000);
    employees[index].blocked = !employees[index].blocked;
    employees[index].updatedAt = now;
    
    saveToStorage(STORAGE_KEYS.EMPLOYEES, employees);
    
    // Log audit event
    const user = authAPI.getCurrentUser();
    if (user) {
      const auditLog = getFromStorage<AuditEvent[]>(STORAGE_KEYS.AUDIT_LOG) || [];
      const newEvent: AuditEvent = {
        id: auditLog.length + 1,
        timestamp: now,
        actorId: user.id,
        actorName: user.name,
        action: employees[index].blocked ? 'block' : 'unblock',
        entityType: 'employee',
        entityId: employees[index].id,
        entityLabel: `${employees[index].firstName} ${employees[index].lastName}`,
      };
      auditLog.push(newEvent);
      saveToStorage(STORAGE_KEYS.AUDIT_LOG, auditLog);
    }
    
    return employees[index];
  },

  /**
   * Get audit log for employee
   */
  getAuditLog: (employeeId: number): AuditEvent[] => {
    const auditLog = getFromStorage<AuditEvent[]>(STORAGE_KEYS.AUDIT_LOG) || [];
    return auditLog.filter(event => event.entityType === 'employee' && event.entityId === employeeId);
  },
};
