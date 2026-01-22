/**
 * Custom React hooks library
 *
 * This module exports all custom hooks for state management,
 * data fetching, form handling, and UI interactions.
 */

// Table and data management
export { default as useTableState } from './useTableState';
export type { UseTableStateProps, UseTableStateReturn } from './useTableState';

export { default as useFilters } from './useFilters';
export type { UseFiltersReturn } from './useFilters';

// API and data fetching
export { default as useFetch } from './useFetch';
export type { UseFetchReturn } from './useFetch';

export { default as useAuditLog } from './useAuditLog';
export type { UseAuditLogProps, UseAuditLogReturn } from './useAuditLog';

// Form handling
export { default as useFormSubmit } from './useFormSubmit';
export type { UseFormSubmitReturn } from './useFormSubmit';

// UI state management
export { default as useDrawer } from './useDrawer';
export type { UseDrawerReturn } from './useDrawer';

export { default as useConfirmDialog } from './useConfirmDialog';
export type {
  ConfirmDialogConfig,
  ConfirmDialogProps,
  UseConfirmDialogReturn,
} from './useConfirmDialog';

export { default as useToggle } from './useToggle';

// Utility hooks
export { default as useDebounce } from './useDebounce';
export { default as useLocalStorage } from './useLocalStorage';
