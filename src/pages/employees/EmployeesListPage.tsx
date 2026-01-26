import { useMemo, useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSnackbar } from 'notistack';
import { Box, Typography, Alert } from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  History as HistoryIcon,
  FilterList as FilterListIcon,
} from '@mui/icons-material';
import { employeesApi } from '../../api/endpoints';
import { AuditDrawer } from '../../components/common/AuditDrawer';
import { EmployeeFormDialog } from '../../components/employees/EmployeeFormDialog';
import {
  DataTable,
  Pagination,
  FilterDrawer,
  ConfirmDialog,
  type Column,
} from '../../components/ui/molecules';
import { Button, Select, Switch, IconButton } from '../../components/ui/atoms';
import type { SelectOption } from '../../components/ui/atoms';
import {
  useTableState,
  useFilters,
  useConfirmDialog,
  useFetch,
  useDrawer,
} from '../../hooks';
import { logger } from '../../utils/logger';
import type { Employee, EmployeeFilters } from '../../types';

interface FormDialogState {
  open: boolean;
  employeeId?: string;
}

export const EmployeesListPage = () => {
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();

  // Form dialog state
  const [formDialog, setFormDialog] = useState<FormDialogState>({
    open: false,
    employeeId: undefined,
  });

  // Fetch employees data
  const {
    data: employees,
    loading: isLoading,
    error: fetchError,
    refetch: loadEmployees,
  } = useFetch<Employee[]>(async () => await employeesApi.list(), []);

  // Filters management
  const {
    filters,
    updateFilter,
    resetFilters,
    applyFilters,
  } = useFilters<EmployeeFilters>({
    search: '',
    status: 'active',
  });

  // Filter drawer state
  const filterDrawer = useDrawer();

  // Helper function to get full name
  const getFullName = useCallback((employee: Employee): string => {
    return `${employee.firstName} ${employee.lastName}`;
  }, []);

  // Apply filters to employees
  const filteredEmployees = useMemo(() => {
    if (!employees) return [];

    return applyFilters(employees, (employee, filters) => {
      // Status filter
      if (filters.status !== 'all') {
        const isBlocked = filters.status === 'blocked';
        if (employee.isBlocked !== isBlocked) return false;
      }

      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        if (!getFullName(employee).toLowerCase().includes(searchLower)) {
          return false;
        }
      }

      return true;
    });
  }, [employees, applyFilters, filters, getFullName]);

  // Table state with sorting and pagination
  const tableState = useTableState<Employee>({
    data: filteredEmployees,
    initialRowsPerPage: 10,
    defaultSortColumn: 'id',
    defaultSortDirection: 'asc',
  });

  // Confirm dialog for block/unblock
  const confirmDialog = useConfirmDialog();

  // Audit drawer state
  const auditDrawer = useDrawer();
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);

  // Handle block/unblock toggle
  const handleBlockToggle = useCallback(
    (employee: Employee) => {
      confirmDialog.open({
        title: employee.isBlocked
          ? t('employees.unblockConfirmTitle')
          : t('employees.blockConfirmTitle'),
        message: employee.isBlocked
          ? t('employees.unblockConfirmMessage', { name: getFullName(employee) })
          : t('employees.blockConfirmMessage', { name: getFullName(employee) }),
        confirmText: t('common.confirm'),
        cancelText: t('common.cancel'),
        onConfirm: async () => {
          try {
            await employeesApi.block(employee.id, !employee.isBlocked);
            await loadEmployees();
            enqueueSnackbar(t('common.updatedSuccessfully'), { variant: 'success' });
          } catch (err) {
            logger.error('Error toggling employee block status', err as Error, { employeeId: employee.id });
            enqueueSnackbar(t('common.error'), { variant: 'error' });
          }
        },
      });
    },
    [confirmDialog, getFullName, loadEmployees, t, enqueueSnackbar]
  );

  // Handle edit
  const handleEdit = useCallback(
    (id: string) => {
      setFormDialog({ open: true, employeeId: id });
    },
    []
  );

  // Handle audit view
  const handleViewAudit = useCallback(
    (employee: Employee) => {
      setSelectedEmployee(employee);
      auditDrawer.open();
    },
    [auditDrawer]
  );

  // Handle add employee
  const handleAddEmployee = useCallback(() => {
    setFormDialog({ open: true, employeeId: undefined });
  }, []);

  // Handle close form dialog
  const handleCloseFormDialog = useCallback(() => {
    setFormDialog({ open: false, employeeId: undefined });
    loadEmployees(); // Refresh list after closing dialog
  }, [loadEmployees]);

  // Handle filter apply
  const handleApplyFilters = useCallback(() => {
    filterDrawer.close();
  }, [filterDrawer]);

  // Handle filter reset
  const handleResetFilters = useCallback(() => {
    resetFilters();
    filterDrawer.close();
  }, [resetFilters, filterDrawer]);

  // Table columns configuration
  const columns = useMemo<Column<Employee>[]>(
    () => [
      {
        id: 'id',
        label: t('employees.id'),
        sortable: true,
        width: 100,
      },
      {
        id: 'fullName',
        label: t('employees.fullName'),
        sortable: true,
        render: (employee) => getFullName(employee),
      },
      {
        id: 'actions',
        label: t('common.actions'),
        width: 200,
        render: (employee) => (
          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
            <Switch
              checked={!employee.isBlocked}
              onChange={() => handleBlockToggle(employee)}
              color="primary"
            />
            <IconButton
              icon={<EditIcon />}
              onClick={() => handleEdit(employee.id)}
              tooltip={t('common.edit')}
              color="primary"
              size="small"
            />
            <IconButton
              icon={<HistoryIcon />}
              onClick={() => handleViewAudit(employee)}
              tooltip={t('restaurants.auditLog')}
              color="default"
              size="small"
            />
          </Box>
        ),
      },
    ],
    [getFullName, handleBlockToggle, handleEdit, handleViewAudit, t]
  );

  // Status options for filter
  const statusOptions = useMemo<SelectOption[]>(
    () => [
      { value: 'active', label: t('common.active') },
      { value: 'blocked', label: t('common.blocked') },
      { value: 'all', label: t('common.all') },
    ],
    [t]
  );

  return (
    <Box>
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3,
        }}
      >
        <Typography variant="h4">{t('employees.title')}</Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<FilterListIcon />}
            onClick={filterDrawer.open}
          >
            {t('common.filters')}
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAddEmployee}
          >
            {t('employees.add')}
          </Button>
        </Box>
      </Box>

      {/* Error Alert */}
      {fetchError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {fetchError.message}
        </Alert>
      )}

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={tableState.paginatedData}
        loading={isLoading}
        emptyMessage={t('common.noData')}
        onSort={(column) => tableState.handleSort(column as keyof Employee)}
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
        totalCount={filteredEmployees.length}
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
          onChange={(value) => updateFilter('status', value as typeof filters.status)}
          options={statusOptions}
          fullWidth
        />
      </FilterDrawer>

      {/* Confirm Dialog */}
      <ConfirmDialog {...confirmDialog.dialogProps} />

      {/* Audit Drawer */}
      {selectedEmployee && (
        <AuditDrawer
          open={auditDrawer.isOpen}
          entityType="employee"
          entityId={selectedEmployee.id}
          entityLabel={getFullName(selectedEmployee)}
          onClose={auditDrawer.close}
        />
      )}

      {/* Employee Form Dialog */}
      <EmployeeFormDialog
        open={formDialog.open}
        onClose={handleCloseFormDialog}
        employeeId={formDialog.employeeId}
      />
    </Box>
  );
};
