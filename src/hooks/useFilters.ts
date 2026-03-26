import { useState, useCallback, useEffect } from 'react';

/**
 * Return type for useFilters hook
 */
export interface UseFiltersReturn<T> {
  /** Current filter values */
  filters: T;
  /** Update a single filter value */
  updateFilter: <K extends keyof T>(key: K, value: T[K]) => void;
  /** Reset all filters to initial values */
  resetFilters: () => void;
  /** Apply filters to data array */
  applyFilters: <D>(data: D[], filterFn: (item: D, filters: T) => boolean) => D[];
}

/**
 * Hook for managing filters state and applying filters to data
 *
 * @template T - The type of filters object
 * @param initialFilters - Initial filter values
 * @returns Object with filters state and filter operations
 *
 * @example
 * ```tsx
 * interface UserFilters {
 *   search: string;
 *   status: 'active' | 'blocked' | 'all';
 *   role: string;
 * }
 *
 * const {
 *   filters,
 *   updateFilter,
 *   resetFilters,
 *   applyFilters
 * } = useFilters<UserFilters>({
 *   search: '',
 *   status: 'all',
 *   role: '',
 * });
 *
 * const filteredUsers = applyFilters(users, (user, filters) => {
 *   if (filters.status !== 'all' && user.status !== filters.status) return false;
 *   if (filters.search && !user.name.includes(filters.search)) return false;
 *   return true;
 * });
 * ```
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function useFilters<T extends Record<string, any>>(
  initialFilters: T,
  persistenceKey?: string
): UseFiltersReturn<T> {
  const [filters, setFilters] = useState<T>(() => {
    if (persistenceKey) {
      const saved = localStorage.getItem(`filters_${persistenceKey}`);
      if (saved) {
        try {
          return { ...initialFilters, ...JSON.parse(saved) };
        } catch (error) {
          return initialFilters;
        }
      }
    }
    return initialFilters;
  });

  // Save filters to localStorage whenever they change
  useEffect(() => {
    if (persistenceKey) {
      localStorage.setItem(`filters_${persistenceKey}`, JSON.stringify(filters));
    }
  }, [filters, persistenceKey]);

  const updateFilter = useCallback(<K extends keyof T>(key: K, value: T[K]) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(initialFilters);
  }, [initialFilters]);

  const applyFilters = useCallback(
    <D,>(data: D[], filterFn: (item: D, filters: T) => boolean): D[] => {
      return data.filter((item) => filterFn(item, filters));
    },
    [filters]
  );

  return {
    filters,
    updateFilter,
    resetFilters,
    applyFilters,
  };
}

export default useFilters;
