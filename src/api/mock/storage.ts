/**
 * Get data from localStorage by key
 */
export function getFromStorage<T>(key: string): T | null {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : null;
}

/**
 * Save data to localStorage
 */
export function saveToStorage<T>(key: string, data: T): void {
  localStorage.setItem(key, JSON.stringify(data));
}

/**
 * Initialize storage with seed data on first load
 */
export function initializeStorage(): void {
  // Проверить наличие данных, если нет - инициализировать seeds
  if (!localStorage.getItem('trio_initialized')) {
    // импортировать и применить seeds
    // This will be called from seeds.ts
  }
}
