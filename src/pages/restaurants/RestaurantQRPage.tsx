import { useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Typography,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { ArrowBack as ArrowBackIcon, Add as AddIcon, FilterList as FilterListIcon } from '@mui/icons-material';
import { QRCodeCanvas } from 'qrcode.react';

// API
import { restaurantsApi } from '../../api/endpoints';

// Atoms
import Button from '../../components/ui/atoms/Button';
import Select from '../../components/ui/atoms/Select';
import Switch from '../../components/ui/atoms/Switch';
import Chip from '../../components/ui/atoms/Chip';

// Molecules
import DataTable, { type Column } from '../../components/ui/molecules/DataTable';
import Pagination from '../../components/ui/molecules/Pagination';
import FilterDrawer from '../../components/ui/molecules/FilterDrawer';
import FormField from '../../components/ui/molecules/FormField';
import ConfirmDialog from '../../components/ui/molecules/ConfirmDialog';

// Hooks
import {
  useTableState,
  useFilters,
  useConfirmDialog,
  useFetch,
  useDrawer,
  useToggle,
} from '../../hooks';
import { logger } from '../../utils/logger';
import { getDisplayName } from '../../utils/dictionaryUtils';

// Types
import type { QRCode } from '../../types';

type SortField = 'id' | 'assigned' | 'type';
type StatusFilter = 'active' | 'blocked' | 'all';
type AssignedFilter = 'assigned' | 'unassigned' | 'all';
type TypeFilter = 'Static' | 'Dynamic' | 'all';

interface QRFilters {
  status: StatusFilter;
  assigned: AssignedFilter;
  type: TypeFilter;
}

const createQRBatchSchema = (t: (key: string) => string) => z.object({
  quantity: z
    .number({ message: t('validation.quantityRequired') })
    .min(1, t('validation.quantityMin'))
    .max(100, t('validation.quantityMax')),
  type: z.enum(['Static', 'Dynamic'], { message: t('validation.typeRequired') }),
});

type QRBatchFormData = z.infer<ReturnType<typeof createQRBatchSchema>>;

export const RestaurantQRPage = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Create schema with translations
  const qrBatchSchema = useMemo(() => createQRBatchSchema(t), [t]);

  // Fetch restaurant data
  const {
    data: restaurant,
    loading: isLoadingRestaurant,
  } = useFetch(
    async () => {
      if (!id) return null;
      try {
        return await restaurantsApi.getById(id);
      } catch (error) {
        console.error('Error loading restaurant:', error);
        return null;
      }
    },
    [id]
  );

  // Fetch QR codes
  const {
    data: qrCodes = [],
    loading: isLoadingQRCodes,
    error: fetchError,
    refetch: loadQRCodes,
  } = useFetch<QRCode[]>(
    async () => {
      if (!id) return [];
      try {
        return await restaurantsApi.getQRCodes(id);
      } catch (error) {
        console.error('Error loading QR codes:', error);
        return [];
      }
    },
    [id]
  );

  // Filters
  const { filters, updateFilter, resetFilters, applyFilters } = useFilters<QRFilters>({
    status: 'active',
    assigned: 'all',
    type: 'all',
  });

  // Temporary filters for drawer
  const {
    filters: tempFilters,
    updateFilter: updateTempFilter,
    resetFilters: resetTempFilters,
  } = useFilters<QRFilters>({
    status: 'active',
    assigned: 'all',
    type: 'all',
  });

  // Filter drawer
  const filterDrawer = useDrawer();

  // Create dialog
  const [createDialogOpen, toggleCreateDialog] = useToggle(false);

  // Confirm dialog
  const confirmDialog = useConfirmDialog();

  // Form for creating QR batch
  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<QRBatchFormData>({
    resolver: zodResolver(qrBatchSchema),
    defaultValues: {
      quantity: 1,
      type: 'Static',
    },
  });

  // Apply filters to QR codes
  const filteredQRCodes = useMemo(() => {
    return applyFilters(qrCodes || [], (qr, currentFilters) => {
      // Status filter
      if (currentFilters.status !== 'all') {
        const isBlocked = currentFilters.status === 'blocked';
        if (qr.isBlocked !== isBlocked) return false;
      }
      
      // Assigned filter
      if (currentFilters.assigned !== 'all') {
        const isAssigned = Boolean(qr.hallId && qr.tableId);
        const shouldBeAssigned = currentFilters.assigned === 'assigned';
        if (isAssigned !== shouldBeAssigned) return false;
      }
      
      // Type filter
      if (currentFilters.type !== 'all') {
        if (qr.type !== currentFilters.type) return false;
      }
      
      return true;
    });
  }, [qrCodes, applyFilters, filters]);

  // Table state with sorting and pagination
  const tableState = useTableState<QRCode>({
    data: filteredQRCodes || [],
    initialRowsPerPage: 10,
    defaultSortColumn: 'id' as keyof QRCode,
    defaultSortDirection: 'asc',
  });

  // Custom sorting for QR codes
  const sortedAndPaginatedData = useMemo(() => {
    let sorted = [...filteredQRCodes];

    if (tableState.sortColumn) {
      sorted.sort((a, b) => {
        let compareValue = 0;
        const sortField = tableState.sortColumn as SortField;

        switch (sortField) {
          case 'id':
            const aId = a.id || '';
            const bId = b.id || '';
            compareValue = aId.localeCompare(bId);
            break;
          case 'assigned':
            const aAssigned = Boolean(a.hallId && a.tableId) ? 1 : 0;
            const bAssigned = Boolean(b.hallId && b.tableId) ? 1 : 0;
            compareValue = aAssigned - bAssigned;
            break;
          case 'type':
            const aType = a.type || 'Static';
            const bType = b.type || 'Static';
            compareValue = aType.localeCompare(bType);
            break;
        }

        return tableState.sortDirection === 'asc' ? compareValue : -compareValue;
      });
    }

    const start = tableState.page * tableState.rowsPerPage;
    return sorted.slice(start, start + tableState.rowsPerPage);
  }, [
    filteredQRCodes,
    tableState.sortColumn,
    tableState.sortDirection,
    tableState.page,
    tableState.rowsPerPage,
  ]);

  // Handlers
  const handleApplyFilters = useCallback(() => {
    Object.keys(tempFilters).forEach((key) => {
      updateFilter(key as keyof QRFilters, tempFilters[key as keyof QRFilters]);
    });
    tableState.handlePageChange(0);
    filterDrawer.close();
  }, [tempFilters, updateFilter, tableState, filterDrawer]);

  const handleResetFilters = useCallback(() => {
    resetFilters();
    resetTempFilters();
    tableState.handlePageChange(0);
    filterDrawer.close();
  }, [resetFilters, resetTempFilters, tableState, filterDrawer]);

  const handleBlockToggle = useCallback(
    (qr: QRCode) => {
      confirmDialog.open({
        title: qr.isBlocked ? t('restaurants.unblockQRTitle') : t('restaurants.blockQRTitle'),
        message: qr.isBlocked
          ? t('restaurants.unblockQRMessage', { qrText: qr.qrText })
          : t('restaurants.blockQRMessage', { qrText: qr.qrText }),
        confirmText: t('common.confirm'),
        cancelText: t('common.cancel'),
        onConfirm: async () => {
          try {
            if (!id) return;
            await restaurantsApi.blockQR(id, qr.id, !qr.isBlocked);
            await loadQRCodes();
          } catch (err) {
            logger.error('Error toggling QR block status', err as Error, { restaurantId: id, qrId: qr.id });
          }
        },
      });
    },
    [confirmDialog, id, loadQRCodes]
  );

  const handleOpenCreateDialog = useCallback(() => {
    reset({ quantity: 1, type: 'Static' });
    toggleCreateDialog();
  }, [reset, toggleCreateDialog]);

  const handleCloseCreateDialog = useCallback(() => {
    toggleCreateDialog();
    reset({ quantity: 1, type: 'Static' });
  }, [reset, toggleCreateDialog]);

  const handleCreateQRBatch = useCallback(
    async (data: QRBatchFormData) => {
      if (!id) return;

      try {
        await restaurantsApi.createQRBatch(id, { count: data.quantity, type: data.type });
        await loadQRCodes();
        handleCloseCreateDialog();
        tableState.handlePageChange(0);
      } catch (err) {
        logger.error('Error creating QR codes', err as Error, { restaurantId: id, quantity: data.quantity });
        alert(t('common.error') + ': ' + (err as Error).message);
      }
    },
    [id, loadQRCodes, handleCloseCreateDialog, tableState, t]
  );

  const handleTypeChange = useCallback(
    (qr: QRCode, newType: 'Static' | 'Dynamic') => {
      confirmDialog.open({
        title: t('restaurants.changeQRTypeTitle'),
        message: t('restaurants.changeQRTypeMessage', { qrText: qr.qrText, type: newType }),
        confirmText: t('common.confirm'),
        cancelText: t('common.cancel'),
        onConfirm: async () => {
          try {
            if (!id) return;
            await restaurantsApi.updateQRType(id, qr.id, newType);
            await loadQRCodes();
          } catch (err) {
            logger.error('Error changing QR type', err as Error, { restaurantId: id, qrId: qr.id });
            alert(t('common.error') + ': ' + (err as Error).message);
          }
        },
      });
    },
    [confirmDialog, id, loadQRCodes, t]
  );

  const handleBack = useCallback(() => {
    navigate('/restaurants');
  }, [navigate]);

  // Table columns
  const columns = useMemo<Column<QRCode>[]>(
    () => [
      {
        id: 'qrCode',
        label: t('restaurants.qrCode'),
        sortable: false,
        width: 100,
        render: (qr) => {
          try {
            return (
              <Box sx={{ p: 1 }}>
                <QRCodeCanvas
                  value={qr?.qrText || 'N/A'}
                  size={80}
                  level="M"
                  includeMargin={false}
                />
              </Box>
            );
          } catch (err) {
            console.error('Error rendering QR code:', err);
            return <span>-</span>;
          }
        },
      },
      {
        id: 'id',
        label: 'ID',
        sortable: true,
        render: (qr) => {
          try {
            const id = qr?.id;
            if (typeof id === 'object') return <span>{JSON.stringify(id)}</span>;
            return <span>{id || '-'}</span>;
          } catch (err) {
            console.error('Error rendering ID:', err);
            return <span>-</span>;
          }
        },
      },
      {
        id: 'assigned',
        label: t('restaurants.assigned'),
        sortable: true,
        render: (qr) => {
          try {
            const isAssigned = Boolean(qr?.hallId && qr?.tableId);
            return (
              <Chip
                label={isAssigned ? t('common.yes') : t('common.no')}
                color={isAssigned ? 'success' : 'default'}
                size="small"
              />
            );
          } catch (err) {
            console.error('Error rendering assigned status:', err);
            return <span>-</span>;
          }
        },
      },
      {
        id: 'type',
        label: t('restaurants.type'),
        sortable: true,
        render: (qr) => {
          try {
            return (
              <Select
                name={`qr-type-${qr?.id || 'unknown'}`}
                label=""
                value={qr?.type || 'Static'}
                onChange={(value) => handleTypeChange(qr, value as 'Static' | 'Dynamic')}
                options={[
                  { value: 'Static', label: t('restaurants.static') },
                  { value: 'Dynamic', label: t('restaurants.dynamic') },
                ]}
              />
            );
          } catch (err) {
            console.error('Error rendering type:', err);
            return <span>-</span>;
          }
        },
      },
      {
        id: 'actions',
        label: t('common.actions'),
        sortable: false,
        render: (qr) => {
          try {
            return (
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  alignItems: 'center',
                }}
              >
                <Switch
                  checked={!qr?.isBlocked}
                  onChange={() => handleBlockToggle(qr)}
                />
              </Box>
            );
          } catch (err) {
            console.error('Error rendering actions:', err);
            return <span>-</span>;
          }
        },
      },
    ],
    [handleBlockToggle, handleTypeChange, t]
  );

  const isLoading = isLoadingRestaurant || isLoadingQRCodes;
  const error = fetchError?.message || null;
  const restaurantName = restaurant?.name 
    ? (typeof restaurant.name === 'string' ? restaurant.name : getDisplayName(restaurant.name))
    : '';

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={handleBack}>
            {t('common.back')}
          </Button>
          <Typography variant="h4">
            {t('restaurants.qrCodesTitle', { name: restaurantName || `#${id}` })}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button variant="outlined" startIcon={<FilterListIcon />} onClick={filterDrawer.open}>
            {t('common.filters')}
          </Button>
          <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenCreateDialog}>
            {t('restaurants.addQRCodes')}
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <DataTable
        columns={columns}
        data={sortedAndPaginatedData}
        loading={isLoading}
        onSort={(column) => tableState.handleSort(column as keyof QRCode)}
        sortColumn={tableState.sortColumn ?? undefined}
        sortDirection={tableState.sortDirection}
        rowKey="id"
        emptyMessage={t('common.noData')}
      />

      <Pagination
        page={tableState.page}
        totalPages={tableState.totalPages}
        onPageChange={tableState.handlePageChange}
        rowsPerPage={tableState.rowsPerPage}
        onRowsPerPageChange={tableState.handleRowsPerPageChange}
        rowsPerPageOptions={[5, 10, 25, 50]}
        totalCount={filteredQRCodes.length}
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
          value={tempFilters.status || 'active'}
          onChange={(value) => updateTempFilter('status', value as StatusFilter)}
          options={[
            { value: 'active', label: t('common.active') },
            { value: 'blocked', label: t('common.blocked') },
            { value: 'all', label: t('common.all') },
          ]}
        />
        <Box sx={{ mt: 2 }}>
          <Select
            name="assigned"
            label={t('restaurants.assigned')}
            value={tempFilters.assigned || 'all'}
            onChange={(value) => updateTempFilter('assigned', value as AssignedFilter)}
            options={[
              { value: 'assigned', label: t('restaurants.assignedFilter') },
              { value: 'unassigned', label: t('restaurants.unassignedFilter') },
              { value: 'all', label: t('common.all') },
            ]}
          />
        </Box>
        <Box sx={{ mt: 2 }}>
          <Select
            name="type"
            label={t('restaurants.type')}
            value={tempFilters.type || 'all'}
            onChange={(value) => updateTempFilter('type', value as TypeFilter)}
            options={[
              { value: 'Static', label: t('restaurants.static') },
              { value: 'Dynamic', label: t('restaurants.dynamic') },
              { value: 'all', label: t('common.all') },
            ]}
          />
        </Box>
      </FilterDrawer>

      {/* Create QR Batch Dialog */}
      <Dialog
        open={createDialogOpen}
        onClose={handleCloseCreateDialog}
        aria-labelledby="create-qr-dialog-title"
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle id="create-qr-dialog-title">{t('restaurants.createQRCodes')}</DialogTitle>
        <form onSubmit={handleSubmit(handleCreateQRBatch)}>
          <DialogContent>
            <FormField
              name="quantity"
              control={control}
              label={t('restaurants.quantity')}
              type="number"
              required
              disabled={isSubmitting}
            />
            <Box sx={{ mt: 2 }}>
              <FormField
                name="type"
                control={control}
                label={t('restaurants.type')}
                type="select"
                required
                disabled={isSubmitting}
                options={[
                  { value: 'Static', label: t('restaurants.static') },
                  { value: 'Dynamic', label: t('restaurants.dynamic') },
                ]}
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseCreateDialog} variant="text" color="secondary">
              {t('common.cancel')}
            </Button>
            <Button
              type="submit"
              color="primary"
              variant="contained"
              loading={isSubmitting}
            >
              {t('common.create')}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Confirm Dialog */}
      <ConfirmDialog {...confirmDialog.dialogProps} />
    </Box>
  );
};
