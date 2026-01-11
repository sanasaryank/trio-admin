import { initializeSeeds } from './seeds';
import { STORAGE_KEYS } from '@/utils/constants';

// Initialize storage with seed data if not already initialized
if (!localStorage.getItem(STORAGE_KEYS.INITIALIZED)) {
  initializeSeeds();
}

// Export all API modules
export { authAPI } from './auth';
export { employeesAPI } from './employees';
export { restaurantsAPI } from './restaurants';
export { dictionariesAPI } from './dictionaries';
export { getFromStorage, saveToStorage } from './storage';
