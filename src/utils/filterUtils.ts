import type { TFunction } from 'i18next';

export interface SelectOption {
  value: string | number;
  label: string;
}

/**
 * Returns standard status filter options (active/blocked/all)
 * Used across multiple list pages
 */
export const getStatusFilterOptions = (t: TFunction): SelectOption[] => [
  { value: 'active', label: t('common.active') },
  { value: 'blocked', label: t('common.blocked') },
  { value: 'all', label: t('common.all') },
];
