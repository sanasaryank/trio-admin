import { schedulesApiMock } from '../mock';
import type { Schedule, ScheduleFormData } from '../../types';

export const schedulesApi = {
  list: async (): Promise<Schedule[]> => {
    return schedulesApiMock.list();
  },

  getById: async (id: number): Promise<Schedule> => {
    return schedulesApiMock.getById(id);
  },

  create: async (data: ScheduleFormData): Promise<Schedule> => {
    return schedulesApiMock.create(data);
  },

  update: async (id: number, data: ScheduleFormData): Promise<Schedule> => {
    return schedulesApiMock.update(id, data);
  },

  delete: async (id: number): Promise<void> => {
    return schedulesApiMock.delete(id);
  },

  block: async (id: number, blocked: boolean): Promise<void> => {
    return schedulesApiMock.block(id, blocked);
  },
};
