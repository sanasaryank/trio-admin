import { useCallback } from 'react';
import useDrawer from './useDrawer';

interface UseFilterDrawerOptions<T> {
  tempFilters: T;
  updateFilter: (key: keyof T, value: any) => void;
  resetFilters: () => void;
  resetTempFilters?: () => void;
  tableState?: {
    handlePageChange: (page: number) => void;
  };
}

/**
 * Reusable hook for managing filter drawer state and handlers
 * Encapsulates common pattern of:
 * 1. Open/close drawer
 * 2. Apply filters (copy temp to active, reset pagination, close drawer)
 * 3. Reset filters (clear all, reset pagination, close drawer)
 */
export const useFilterDrawer = <T extends Record<string, any>>({
  tempFilters,
  updateFilter,
  resetFilters,
  resetTempFilters,
  tableState,
}: UseFilterDrawerOptions<T>) => {
  const drawer = useDrawer();

  const handleApplyFilters = useCallback(() => {
    // Copy temp filters to active filters
    Object.keys(tempFilters).forEach((key) => {
      updateFilter(key as keyof T, tempFilters[key as keyof T]);
    });
    
    // Reset to first page
    if (tableState) {
      tableState.handlePageChange(0);
    }
    
    drawer.close();
  }, [tempFilters, updateFilter, tableState, drawer]);

  const handleResetFilters = useCallback(() => {
    resetFilters();
    if (resetTempFilters) {
      resetTempFilters();
    }
    
    // Reset to first page
    if (tableState) {
      tableState.handlePageChange(0);
    }
    
    drawer.close();
  }, [resetFilters, resetTempFilters, tableState, drawer]);

  return {
    drawer,
    handleApplyFilters,
    handleResetFilters,
  };
};
