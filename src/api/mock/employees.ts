import { getDatabase, saveDatabase, getSession } from './storage';
import { addAuditEvent } from './audit';
import type { Employee, EmployeeFormData } from '../../types';

export const mockEmployeesApi = {
  list: async (): Promise<Employee[]> => {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 300));

    const db = getDatabase();
    return [...db.employees];
  },

  getById: async (id: number): Promise<Employee> => {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 200));

    const db = getDatabase();
    const employee = db.employees.find((e) => e.id === id);

    if (!employee) {
      throw new Error('Employee not found');
    }

    return employee;
  },

  create: async (data: EmployeeFormData): Promise<Employee> => {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 400));

    const db = getDatabase();
    const session = getSession();
    const now = Math.floor(Date.now() / 1000);

    // Validate required fields
    if (!data.password) {
      throw new Error('Password is required for new employee');
    }

    const employee: Employee = {
      id: db.nextId.employee++,
      firstName: data.firstName,
      lastName: data.lastName,
      username: data.username,
      // In production, password would be hashed
      password: data.password,
      blocked: data.blocked,
      createdAt: now,
      updatedAt: now,
    };

    db.employees.push(employee);
    saveDatabase(db);

    // Log audit event
    if (session) {
      addAuditEvent({
        actorId: session.id,
        actorName: `${session.firstName} ${session.lastName}`,
        action: 'create',
        entityType: 'employee',
        entityId: employee.id,
        entityLabel: `${employee.firstName} ${employee.lastName}`,
      });
    }

    return employee;
  },

  update: async (id: number, data: EmployeeFormData): Promise<Employee> => {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 400));

    const db = getDatabase();
    const session = getSession();
    const index = db.employees.findIndex((e) => e.id === id);

    if (index === -1) {
      throw new Error('Employee not found');
    }

    const now = Math.floor(Date.now() / 1000);
    const employee = {
      ...db.employees[index],
      firstName: data.firstName,
      lastName: data.lastName,
      username: data.username,
      blocked: data.blocked,
      updatedAt: now,
    };

    // Update password only if changePassword flag is true and password is provided
    if (data.changePassword && data.password) {
      employee.password = data.password;
    }

    db.employees[index] = employee;
    saveDatabase(db);

    // Log audit event
    if (session) {
      addAuditEvent({
        actorId: session.id,
        actorName: `${session.firstName} ${session.lastName}`,
        action: 'update',
        entityType: 'employee',
        entityId: employee.id,
        entityLabel: `${employee.firstName} ${employee.lastName}`,
      });
    }

    return employee;
  },

  block: async (id: number, blocked: boolean): Promise<Employee> => {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 300));

    const db = getDatabase();
    const session = getSession();
    const index = db.employees.findIndex((e) => e.id === id);

    if (index === -1) {
      throw new Error('Employee not found');
    }

    const now = Math.floor(Date.now() / 1000);
    const employee = {
      ...db.employees[index],
      blocked,
      updatedAt: now,
    };

    db.employees[index] = employee;
    saveDatabase(db);

    // Log audit event
    if (session) {
      addAuditEvent({
        actorId: session.id,
        actorName: `${session.firstName} ${session.lastName}`,
        action: blocked ? 'block' : 'unblock',
        entityType: 'employee',
        entityId: employee.id,
        entityLabel: `${employee.firstName} ${employee.lastName}`,
      });
    }

    return employee;
  },
};
