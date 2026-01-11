import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Button, IconButton, Chip } from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Block as BlockIcon } from '@mui/icons-material';
import { GridColDef } from '@mui/x-data-grid';
import { MainLayout } from '@/components/Layout/MainLayout';
import { FilterPanel } from '@/components/Layout/FilterPanel';
import { DataTable } from '@/components/common/DataTable';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { employeesAPI } from '@/api/mock';
import type { Employee, FilterStatus } from '@/types';
import { formatTimestamp } from '@/utils/dateFormat';

/**
 * Employee list page with filters
 */
const EmployeeList = () => {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [blockDialog, setBlockDialog] = useState<{ open: boolean; employee: Employee | null }>({
    open: false,
    employee: null,
  });

  const loadEmployees = () => {
    const allEmployees = employeesAPI.getAll();
    let filtered = allEmployees;

    if (filterStatus === 'active') {
      filtered = allEmployees.filter((emp) => !emp.blocked);
    } else if (filterStatus === 'blocked') {
      filtered = allEmployees.filter((emp) => emp.blocked);
    }

    setEmployees(filtered);
  };

  useEffect(() => {
    loadEmployees();
  }, [filterStatus]);

  const handleToggleBlock = (employee: Employee) => {
    setBlockDialog({ open: true, employee });
  };

  const confirmToggleBlock = () => {
    if (blockDialog.employee) {
      employeesAPI.toggleBlock(blockDialog.employee.id);
      loadEmployees();
    }
    setBlockDialog({ open: false, employee: null });
  };

  const columns: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'firstName', headerName: 'Имя', width: 150 },
    { field: 'lastName', headerName: 'Фамилия', width: 150 },
    {
      field: 'blocked',
      headerName: 'Статус',
      width: 120,
      renderCell: (params) => (
        <Chip
          label={params.value ? 'Заблокирован' : 'Активен'}
          color={params.value ? 'error' : 'success'}
          size="small"
        />
      ),
    },
    {
      field: 'createdAt',
      headerName: 'Создан',
      width: 150,
      valueFormatter: (value) => formatTimestamp(value),
    },
    {
      field: 'updatedAt',
      headerName: 'Обновлён',
      width: 150,
      valueFormatter: (value) => formatTimestamp(value),
    },
    {
      field: 'actions',
      headerName: 'Действия',
      width: 120,
      sortable: false,
      renderCell: (params) => (
        <Box>
          <IconButton
            size="small"
            onClick={() => navigate(`/employees/${params.row.id}/edit`)}
            title="Редактировать"
          >
            <EditIcon fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            onClick={() => handleToggleBlock(params.row)}
            title={params.row.blocked ? 'Разблокировать' : 'Заблокировать'}
          >
            <BlockIcon fontSize="small" />
          </IconButton>
        </Box>
      ),
    },
  ];

  const rightPanel = (
    <FilterPanel onApply={loadEmployees} onReset={() => setFilterStatus('all')}>
      <Typography variant="subtitle2">Статус</Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        <Button
          variant={filterStatus === 'all' ? 'contained' : 'outlined'}
          onClick={() => setFilterStatus('all')}
        >
          Все
        </Button>
        <Button
          variant={filterStatus === 'active' ? 'contained' : 'outlined'}
          onClick={() => setFilterStatus('active')}
        >
          Активные
        </Button>
        <Button
          variant={filterStatus === 'blocked' ? 'contained' : 'outlined'}
          onClick={() => setFilterStatus('blocked')}
        >
          Заблокированные
        </Button>
      </Box>
    </FilterPanel>
  );

  return (
    <MainLayout title="Сотрудники" rightPanel={rightPanel}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Сотрудники</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/employees/new')}
        >
          Добавить сотрудника
        </Button>
      </Box>

      <DataTable rows={employees} columns={columns} />

      <ConfirmDialog
        open={blockDialog.open}
        onClose={() => setBlockDialog({ open: false, employee: null })}
        onConfirm={confirmToggleBlock}
        title={blockDialog.employee?.blocked ? 'Разблокировать сотрудника?' : 'Заблокировать сотрудника?'}
        message={
          blockDialog.employee
            ? `Вы уверены, что хотите ${
                blockDialog.employee.blocked ? 'разблокировать' : 'заблокировать'
              } сотрудника ${blockDialog.employee.firstName} ${blockDialog.employee.lastName}?`
            : ''
        }
      />
    </MainLayout>
  );
};

export default EmployeeList;
