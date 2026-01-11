import { useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Box,
  Typography,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { ArrowBack as ArrowBackIcon, Add as AddIcon } from '@mui/icons-material';

// API
import { restaurantsApi } from '../../api/endpoints';

// Atoms
import Button from '../../components/ui/atoms/Button';
import Select from '../../components/ui/atoms/Select';
import Switch from '../../components/ui/atoms/Switch';

// Molecules
import DataTable, { type Column } from '../../components/ui/molecules/DataTable';
import Pagination from '../../components/ui/molecules/Pagination';
import FilterDrawer from '../../components/ui/molecules/FilterDrawer';
import FormField from '../../components/ui/molecules/FormField';
import ConfirmDialog from '../../components/ui/molecules/ConfirmDialog';
import StatusChip from '../../components/ui/molecules/StatusChip';

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

// Types
import type { QRCode } from '../../types';

type SortField = 'id' | 'qrText';
type StatusFilter = 'active' | 'blocked' | 'all';

interface QRFilters {
  status: StatusFilter;
}

const qrBatchSchema = z.object({
  quantity: z
    .number({ message: 'Количество обязательно' })
    .min(1, 'Минимум 1')
    .max(100, 'Максимум 100'),
});

type QRBatchFormData = z.infer<typeof qrBatchSchema>;

export const RestaurantQRPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Fetch restaurant data
  const {
    data: restaurant,
    loading: isLoadingRestaurant,
  } = useFetch(
    async () => {
      if (!id) return null;
      return await restaurantsApi.getById(Number(id));
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
      return await restaurantsApi.getQRCodes(Number(id));
    },
    [id]
  );

  // Filters
  const { filters, updateFilter, resetFilters, applyFilters } = useFilters<QRFilters>({
    status: 'active',
  });

  // Temporary filters for drawer
  const {
    filters: tempFilters,
    updateFilter: updateTempFilter,
    resetFilters: resetTempFilters,
  } = useFilters<QRFilters>({
    status: 'active',
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
    },
  });

  // Apply filters to QR codes
  const filteredQRCodes = useMemo(() => {
    return applyFilters(qrCodes || [], (qr, currentFilters) => {
      // Status filter
      if (currentFilters.status !== 'all') {
        const isBlocked = currentFilters.status === 'blocked';
        if (qr.blocked !== isBlocked) return false;
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
            compareValue = a.id - b.id;
            break;
          case 'qrText':
            compareValue = a.qrText.localeCompare(b.qrText);
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
        title: qr.blocked ? 'Разблокировать QR код?' : 'Заблокировать QR код?',
        message: `Вы уверены, что хотите ${
          qr.blocked ? 'разблокировать' : 'заблокировать'
        } QR код ${qr.qrText}?`,
        onConfirm: async () => {
          try {
            if (!id) return;
            await restaurantsApi.blockQR(Number(id), qr.id, !qr.blocked);
            await loadQRCodes();
          } catch (err) {
            logger.error('Error toggling QR block status', err as Error, { restaurantId: id, qrId: qr.id });
          }
        },
      });
    },
    [confirmDialog, id, loadQRCodes]
  );

  const handleBack = useCallback(() => {
    navigate('/restaurants');
  }, [navigate]);

  const handleOpenCreateDialog = useCallback(() => {
    reset({ quantity: 1 });
    toggleCreateDialog();
  }, [reset, toggleCreateDialog]);

  const handleCloseCreateDialog = useCallback(() => {
    toggleCreateDialog();
    reset({ quantity: 1 });
  }, [reset, toggleCreateDialog]);

  const handleCreateQRBatch = useCallback(
    async (data: QRBatchFormData) => {
      if (!id) return;

      try {
        await restaurantsApi.createQRBatch(Number(id), { count: data.quantity });
        await loadQRCodes();
        handleCloseCreateDialog();
        tableState.handlePageChange(0);
      } catch (err) {
        logger.error('Error creating QR codes', err as Error, { restaurantId: id, quantity: data.quantity });
      }
    },
    [id, loadQRCodes, handleCloseCreateDialog, tableState]
  );

  // Table columns
  const columns = useMemo<Column<QRCode>[]>(
    () => [
      {
        id: 'id',
        label: 'ID',
        sortable: true,
        width: 80,
      },
      {
        id: 'qrText',
        label: 'QR Text',
        sortable: true,
      },
      {
        id: 'tableNumber',
        label: 'Table Number',
        sortable: false,
        render: (qr) => qr.tableNumber || '-',
      },
      {
        id: 'status',
        label: 'Status',
        sortable: false,
        render: (qr) => (
          <StatusChip status={qr.blocked ? 'blocked' : 'active'} />
        ),
      },
      {
        id: 'actions',
        label: 'Actions',
        sortable: false,
        render: (qr) => (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'flex-end',
              alignItems: 'center',
            }}
          >
            <Switch
              checked={!qr.blocked}
              onChange={() => handleBlockToggle(qr)}
            />
          </Box>
        ),
      },
    ],
    [handleBlockToggle]
  );

  const isLoading = isLoadingRestaurant || isLoadingQRCodes;
  const error = fetchError?.message || null;
  const restaurantName = restaurant?.name || '';

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={handleBack}>
            Назад
          </Button>
          <Typography variant="h4">
            QR Коды - {restaurantName || `#${id}`}
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenCreateDialog}>
          Добавить QR коды
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => {}}>
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
        emptyMessage="Нет данных"
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
        title="Фильтры"
      >
        <Select
          name="status"
          label="Статус"
          value={tempFilters.status || 'active'}
          onChange={(value) => updateTempFilter('status', value as StatusFilter)}
          options={[
            { value: 'active', label: 'Активные' },
            { value: 'blocked', label: 'Заблокированные' },
            { value: 'all', label: 'Все' },
          ]}
        />
      </FilterDrawer>

      {/* Create QR Batch Dialog */}
      <Dialog
        open={createDialogOpen}
        onClose={handleCloseCreateDialog}
        aria-labelledby="create-qr-dialog-title"
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle id="create-qr-dialog-title">Создать QR коды</DialogTitle>
        <form onSubmit={handleSubmit(handleCreateQRBatch)}>
          <DialogContent>
            <FormField
              name="quantity"
              control={control}
              label="Количество"
              type="number"
              required
              disabled={isSubmitting}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseCreateDialog} variant="text" color="secondary">
              Отмена
            </Button>
            <Button
              type="submit"
              color="primary"
              variant="contained"
              loading={isSubmitting}
            >
              Создать
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Confirm Dialog */}
      <ConfirmDialog {...confirmDialog.dialogProps} />
    </Box>
  );
};
