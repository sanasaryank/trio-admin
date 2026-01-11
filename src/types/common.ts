export interface BaseEntity {
  id: number;
  blocked: boolean;
  createdAt: number; // Unix timestamp seconds
  updatedAt: number;
}

export type FilterStatus = 'active' | 'blocked' | 'all';
