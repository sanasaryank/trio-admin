import type { Schedule, ScheduleFormData } from '../../types';
import { getDatabase, saveDatabase } from './storage';

export const schedulesApiMock = {
  list: async (): Promise<Schedule[]> => {
    const db = getDatabase();
    return db.schedules || [];
  },

  getById: async (id: number): Promise<Schedule> => {
    const db = getDatabase();
    const schedule = db.schedules?.find((s: Schedule) => s.id === id);
    if (!schedule) {
      throw new Error('Schedule not found');
    }
    return schedule;
  },

  create: async (data: ScheduleFormData): Promise<Schedule> => {
    const db = getDatabase();
    const now = Math.floor(Date.now() / 1000);

    const newSchedule: Schedule = {
      id: db.nextId.schedule++,
      ...data,
      createdAt: now,
      updatedAt: now,
    };

    db.schedules.push(newSchedule);
    saveDatabase(db);

    return newSchedule;
  },

  update: async (id: number, data: ScheduleFormData): Promise<Schedule> => {
    const db = getDatabase();
    const index = db.schedules.findIndex((s: Schedule) => s.id === id);

    if (index === -1) {
      throw new Error('Schedule not found');
    }

    const oldSchedule = db.schedules[index];
    const now = Math.floor(Date.now() / 1000);

    const updatedSchedule: Schedule = {
      ...oldSchedule,
      ...data,
      id,
      createdAt: oldSchedule.createdAt,
      updatedAt: now,
    };

    db.schedules[index] = updatedSchedule;
    saveDatabase(db);

    return updatedSchedule;
  },

  delete: async (id: number): Promise<void> => {
    const db = getDatabase();
    const index = db.schedules.findIndex((s: Schedule) => s.id === id);

    if (index === -1) {
      throw new Error('Schedule not found');
    }

    db.schedules.splice(index, 1);
    saveDatabase(db);
  },

  block: async (id: number, blocked: boolean): Promise<void> => {
    const db = getDatabase();
    const schedule = db.schedules.find((s: Schedule) => s.id === id);

    if (!schedule) {
      throw new Error('Schedule not found');
    }

    schedule.blocked = blocked;
    schedule.updatedAt = Math.floor(Date.now() / 1000);
    saveDatabase(db);
  },
};
