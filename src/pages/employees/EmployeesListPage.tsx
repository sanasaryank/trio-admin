import { useMemo, useCallback, useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppSnackbar } from '../../providers/AppSnackbarProvider';
import { Box, Typography } from '@mui/material';
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
  useBlockToggle,
} from '../../hooks';
import { getStatusFilterOptions } from '../../utils/filterUtils';
import type { Employee, EmployeeFilters } from '../../types';
import type { EmployeeFormHandle } from '../employees/EmployeeFormPage';

interface FormDialogState {
  open: boolean;
  employeeId?: string;
}

export const EmployeesListPage = () => {
  const { t } = useTranslation();
  const { showError, showSuccess } = useAppSnackbar();

  // Form dialog state
  const [formDialog, setFormDialog] = useState<FormDialogState>({
    open: false,
    employeeId: undefined,
  });
  const formRef = useRef<EmployeeFormHandle | null>(null);
  const [isFormSubmitting, setIsFormSubmitting] = useState(false);

  // Fetch employees data
  const {
    data: employees,
    loading: isLoading,
    error: fetchError,
    refetch: loadEmployees,
  } = useFetch<Employee[]>(async () => await employeesApi.list(), []);

  useEffect(() => {
    if (fetchError) showError(fetchError.message);
  }, [fetchError, showError]);

  // Filters management
  const { filters, updateFilter, resetFilters, applyFilters } = useFilters<EmployeeFilters>(
    {
      search: '',
      status: 'active',
    },
    'employees'
  );

  // Temporary filters for drawer
  const {
    filters: tempFilters,
    updateFilter: updateTempFilter,
    resetFilters: resetTempFilters,
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
    persistenceKey: 'employees',
  });

  // Confirm dialog for block/unblock
  const confirmDialog = useConfirmDialog();

  // Audit drawer state
  const auditDrawer = useDrawer();
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);

  // Handle block/unblock toggle using reusable hook
  const handleBlockToggle = useBlockToggle({
    confirmDialog,
    blockApi: (id, isBlocked) => employeesApi.block(id, isBlocked),
    onSuccess: async () => {
      await loadEmployees();
      showSuccess(t('common.updatedSuccessfully'));
    },
    getItemName: getFullName,
    translationKeys: {
      blockTitle: 'employees.blockConfirmTitle',
      unblockTitle: 'employees.unblockConfirmTitle',
      blockMessage: 'employees.blockConfirmMessage',
      unblockMessage: 'employees.unblockConfirmMessage',
    },
    logContext: 'EmployeesListPage',
  });

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
    Object.keys(tempFilters).forEach((key) => {
      updateFilter(key as keyof EmployeeFilters, tempFilters[key as keyof EmployeeFilters]);
    });
    tableState.handlePageChange(0);
    filterDrawer.close();
  }, [tempFilters, updateFilter, tableState, filterDrawer]);

  // Handle filter reset
  const handleResetFilters = useCallback(() => {
    resetFilters();
    resetTempFilters();
    tableState.handlePageChange(0);
    filterDrawer.close();
  }, [resetFilters, resetTempFilters, tableState, filterDrawer]);

  // Sync temp filters when drawer opens
  useEffect(() => {
    if (filterDrawer.isOpen) {
      Object.keys(filters).forEach((key) => {
        updateTempFilter(key as keyof EmployeeFilters, filters[key as keyof EmployeeFilters]);
      });
    }
  }, [filterDrawer.isOpen, filters, updateTempFilter]);

  // Table columns configuration
  const columns = useMemo<Column<Employee>[]>(
    () => [
      {
        id: 'id',
        label: t('employees.id'),
        sortable: false,
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
          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
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
    () => getStatusFilterOptions(t),
    [t]
  );

  return (
    <Box>
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', sm: 'center' },
          mb: 3,
          gap: 2,
        }}
      >
        <Typography variant="h4" sx={{ wordBreak: 'break-word' }}>
          {t('employees.title')}
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', width: { xs: '100%', sm: 'auto' } }}>
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
          value={tempFilters.status}
          onChange={(value) => updateTempFilter('status', value as typeof filters.status)}
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
        formRef={formRef}
        isSubmitting={isFormSubmitting}
        onSubmittingChange={setIsFormSubmitting}
      />
    </Box>
  );
};
