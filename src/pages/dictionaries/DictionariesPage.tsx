import { useCallback, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useSnackbar } from 'notistack';
import { Box, Typography, Alert } from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, FilterList as FilterListIcon } from '@mui/icons-material';
import { dictionariesApi } from '../../api/endpoints';
import { getDictionaryTitle } from '../../utils/dictionaryUtils';
import type {
  DictionaryKey,
  DictionaryItemType,
  DictionaryFilters,
  Country,
  City,
  District,
} from '../../types';

// Reusable components
import Button from '../../components/ui/atoms/Button';
import Select from '../../components/ui/atoms/Select';
import Switch from '../../components/ui/atoms/Switch';
import IconButton from '../../components/ui/atoms/IconButton';
import DataTable, { type Column } from '../../components/ui/molecules/DataTable';
import Pagination from '../../components/ui/molecules/Pagination';
import FilterDrawer from '../../components/ui/molecules/FilterDrawer';
import ConfirmDialog from '../../components/ui/molecules/ConfirmDialog';

// Reusable hooks
import useTableState from '../../hooks/useTableState';
import useFilters from '../../hooks/useFilters';
import useConfirmDialog from '../../hooks/useConfirmDialog';
import useFetch from '../../hooks/useFetch';
import useToggle from '../../hooks/useToggle';
import useDrawer from '../../hooks/useDrawer';
import { logger } from '../../utils/logger';

// Form dialog
import { DictionaryFormDialog } from '../../components/dictionaries/DictionaryFormDialog';

export const DictionariesPage = () => {
  const { dictKey } = useParams<{ dictKey: DictionaryKey }>();
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();

  // State for items and related data
  const [items, setItems] = useState<DictionaryItemType[]>([]);

  // Form dialog state
  const [formDialogOpen, _toggleFormDialog, setFormDialogOpen] = useToggle(false);
  const [editingItemId, setEditingItemId] = useState<number | undefined>(undefined);

  // Hooks
  const filterDrawer = useDrawer();
  const confirmDialog = useConfirmDialog();

  // Filters hook
  const { filters, updateFilter, resetFilters } = useFilters<DictionaryFilters>({
    status: 'active',
  });

  // Fetch main data
  const {
    data: fetchedItems,
    loading: isLoading,
    error: fetchError,
    refetch: loadData,
  } = useFetch<DictionaryItemType[]>(
    async () => {
      if (!dictKey) return [];
      return await dictionariesApi.list(dictKey);
    },
    [dictKey]
  );

  // Fetch countries for cities view
  const { data: countries } = useFetch<Country[]>(
    async () => {
      if (dictKey !== 'cities') return [];
      return (await dictionariesApi.list('countries')) as Country[];
    },
    [dictKey]
  );

  // Fetch cities for districts view
  const { data: cities } = useFetch<City[]>(
    async () => {
      if (dictKey !== 'districts') return [];
      return (await dictionariesApi.list('cities')) as City[];
    },
    [dictKey]
  );

  // Update local items when data is fetched
  useMemo(() => {
    if (fetchedItems) {
      setItems(fetchedItems);
    }
  }, [fetchedItems]);

  // Apply filters to items
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      if (filters.status !== 'all') {
        const isBlocked = filters.status === 'blocked';
        if (item.blocked !== isBlocked) return false;
      }
      return true;
    });
  }, [items, filters]);

  // Table state with sorting and pagination
  const tableState = useTableState<DictionaryItemType>({
    data: filteredItems,
    initialRowsPerPage: 10,
    defaultSortColumn: 'id',
    defaultSortDirection: 'asc',
  });

  // Memoized helper functions for related data
  const getCountryName = useCallback(
    (countryId: number): string => {
      const country = countries?.find((c) => c.id === countryId);
      return country?.name || `Country #${countryId}`;
    },
    [countries]
  );

  const getCityName = useCallback(
    (cityId: number): string => {
      const city = cities?.find((c) => c.id === cityId);
      return city?.name || `City #${cityId}`;
    },
    [cities]
  );

  // Event handlers
  const handleApplyFilters = useCallback(() => {
    filterDrawer.close();
    tableState.handlePageChange(0);
  }, [filterDrawer, tableState]);

  const handleResetFilters = useCallback(() => {
    resetFilters();
    tableState.handlePageChange(0);
  }, [resetFilters, tableState]);

  const handleBlockToggle = useCallback(
    (item: DictionaryItemType) => {
      confirmDialog.open({
        title: item.blocked ? t('dictionaries.unblockConfirmTitle') : t('dictionaries.blockConfirmTitle'),
        message: item.blocked
          ? t('dictionaries.unblockConfirmMessage', { name: item.name })
          : t('dictionaries.blockConfirmMessage', { name: item.name }),
        onConfirm: async () => {
          if (!dictKey) return;
          try {
            await dictionariesApi.block(dictKey, item.id, !item.blocked);
            await loadData();
            enqueueSnackbar(t('common.updatedSuccessfully'), { variant: 'success' });
          } catch (err) {
            logger.error('Error toggling block status', err as Error, { dictKey, itemId: item.id });
            enqueueSnackbar(t('common.error'), { variant: 'error' });
          }
        },
      });
    },
    [confirmDialog, dictKey, loadData, t, enqueueSnackbar]
  );

  const handleEdit = useCallback((id: number) => {
    setEditingItemId(id);
    setFormDialogOpen(true);
  }, [setFormDialogOpen]);

  const handleAddItem = useCallback(() => {
    setEditingItemId(undefined);
    setFormDialogOpen(true);
  }, [setFormDialogOpen]);

  const handleCloseFormDialog = useCallback(() => {
    setFormDialogOpen(false);
    setEditingItemId(undefined);
  }, [setFormDialogOpen]);

  const handleSaveFormDialog = useCallback(async () => {
    await loadData();
    setFormDialogOpen(false);
    setEditingItemId(undefined);
  }, [loadData, setFormDialogOpen]);

  // Define table columns using useMemo
  const columns = useMemo<Column<DictionaryItemType>[]>(() => {
    const baseColumns: Column<DictionaryItemType>[] = [
      {
        id: 'id',
        label: 'ID',
        sortable: true,
        width: 100,
      },
      {
        id: 'name',
        label: t('dictionaries.name'),
        sortable: true,
      },
    ];

    // Add country column for cities
    if (dictKey === 'cities') {
      baseColumns.push({
        id: 'countryId',
        label: t('dictionaries.country'),
        render: (item) => getCountryName((item as City).countryId),
      });
    }

    // Add city column for districts
    if (dictKey === 'districts') {
      baseColumns.push({
        id: 'cityId',
        label: t('dictionaries.city'),
        render: (item) => getCityName((item as District).cityId),
      });
    }

    // Add actions column
    baseColumns.push({
      id: 'actions',
      label: t('common.actions'),
      width: 150,
      render: (item) => (
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 1 }}>
          <Switch
            checked={!item.blocked}
            onChange={() => handleBlockToggle(item)}
            color="primary"
          />
          <IconButton
            icon={<EditIcon />}
            onClick={() => handleEdit(item.id)}
            tooltip={t('common.edit')}
            color="primary"
          />
        </Box>
      ),
    });

    return baseColumns;
  }, [dictKey, getCountryName, getCityName, handleBlockToggle, handleEdit, t]);

  if (!dictKey) {
    return (
      <Box>
        <Alert severity="error">{t('dictionaries.invalidKey')}</Alert>
      </Box>
    );
  }

  const error = fetchError?.message || null;

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">{getDictionaryTitle(dictKey)}</Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<FilterListIcon />}
            onClick={filterDrawer.open}
          >
            {t('common.filters')}
          </Button>
          <Button variant="contained" startIcon={<AddIcon />} onClick={handleAddItem}>
            {t('dictionaries.addEntry')}
          </Button>
        </Box>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={tableState.paginatedData}
        loading={isLoading}
        emptyMessage={t('common.noData')}
        onSort={(column) => tableState.handleSort(column as keyof DictionaryItemType)}
        sortColumn={tableState.sortColumn ?? undefined}
        sortDirection={tableState.sortDirection}
        rowKey="id"
      />

      {/* Pagination */}
      <Pagination
        page={tableState.page}
        totalPages={tableState.totalPages}
        onPageChange={tableState.handlePageChange}
        rowsPerPage={tableState.rowsPerPage}
        onRowsPerPageChange={tableState.handleRowsPerPageChange}
        rowsPerPageOptions={[5, 10, 25]}
        totalCount={filteredItems.length}
      />

      {/* Filters Drawer */}
      <FilterDrawer
        open={filterDrawer.isOpen}
        onClose={filterDrawer.close}
        onApply={handleApplyFilters}
        onReset={handleResetFilters}
        title={t('common.filters')}
      >
        <Select
          name="status"
          label={t('common.status')}
          value={filters.status}
          onChange={(value) => updateFilter('status', value as 'active' | 'blocked' | 'all')}
          options={[
            { value: 'active', label: t('common.active') },
            { value: 'blocked', label: t('common.blocked') },
            { value: 'all', label: t('common.all') },
          ]}
        />
      </FilterDrawer>

      {/* Confirm Dialog */}
      <ConfirmDialog {...confirmDialog.dialogProps} />

      {/* Form Dialog */}
      <DictionaryFormDialog
        open={formDialogOpen}
        dictKey={dictKey}
        itemId={editingItemId}
        onClose={handleCloseFormDialog}
        onSave={handleSaveFormDialog}
      />
    </Box>
  );
};
