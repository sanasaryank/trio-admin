import type { Employee, EmployeeFormData } from '../../types';
import { realApiFetch } from './client';
import { env } from '../../config/env';

const EMPLOYEES_BASE_URL = `${env.apiBaseUrl}/admin/employees`;

export const realEmployeesApi = {
  list: async (): Promise<Employee[]> => {
    const response = await realApiFetch(EMPLOYEES_BASE_URL, {
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch employees: ${response.status}`);
    }

    return response.json();
  },

  getById: async (id: string): Promise<Employee> => {
    const response = await realApiFetch(`${EMPLOYEES_BASE_URL}/${id}`, {
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch employee: ${response.status}`);
    }

    return response.json();
  },

  create: async (data: EmployeeFormData): Promise<Employee> => {
    const response = await realApiFetch(EMPLOYEES_BASE_URL, {
      method: 'POST',
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Failed to create employee: ${response.status}`);
    }

    return response.json();
  },

  update: async (id: string, data: EmployeeFormData): Promise<Employee> => {
    const response = await realApiFetch(`${EMPLOYEES_BASE_URL}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Failed to update employee: ${response.status}`);
    }

    return response.json();
  },

  block: async (id: string, isBlocked: boolean): Promise<Employee> => {
    const response = await realApiFetch(`${EMPLOYEES_BASE_URL}/${id}/block`, {
      method: 'PATCH',
      body: JSON.stringify({ isBlocked }),
    });

    if (!response.ok) {
      throw new Error(`Failed to block/unblock employee: ${response.status}`);
    }

    return response.json();
  },
};
