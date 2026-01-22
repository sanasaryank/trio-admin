import { realEmployeesApi } from '../real';
import type { Employee, EmployeeFormData } from '../../types';

export const employeesApi = {
  list: (): Promise<Employee[]> => {
    return realEmployeesApi.list();
  },

  getById: (id: string): Promise<Employee> => {
    return realEmployeesApi.getById(id);
  },

  create: (data: EmployeeFormData): Promise<Employee> => {
    return realEmployeesApi.create(data);
  },

  update: (id: string, data: EmployeeFormData): Promise<Employee> => {
    return realEmployeesApi.update(id, data);
  },

  block: (id: string, isBlocked: boolean): Promise<Employee> => {
    return realEmployeesApi.block(id, isBlocked);
  },
};
