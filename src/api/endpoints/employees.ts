import { mockEmployeesApi } from '../mock';
import type { Employee, EmployeeFormData } from '../../types';

export const employeesApi = {
  list: (): Promise<Employee[]> => {
    return mockEmployeesApi.list();
  },

  getById: (id: number): Promise<Employee> => {
    return mockEmployeesApi.getById(id);
  },

  create: (data: EmployeeFormData): Promise<Employee> => {
    return mockEmployeesApi.create(data);
  },

  update: (id: number, data: EmployeeFormData): Promise<Employee> => {
    return mockEmployeesApi.update(id, data);
  },

  block: (id: number, blocked: boolean): Promise<Employee> => {
    return mockEmployeesApi.block(id, blocked);
  },
};
