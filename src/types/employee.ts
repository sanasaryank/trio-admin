import { BaseEntity } from './common';

export interface Employee extends BaseEntity {
  firstName: string;
  lastName: string;
}

export type EmployeeFormData = Omit<Employee, 'id' | 'createdAt' | 'updatedAt'>;
