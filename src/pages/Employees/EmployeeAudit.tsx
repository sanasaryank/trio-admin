import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Typography } from '@mui/material';
import { GridColDef } from '@mui/x-data-grid';
import { MainLayout } from '@/components/Layout/MainLayout';
import { DataTable } from '@/components/common/DataTable';
import { employeesAPI } from '@/api/mock';
import type { AuditEvent } from '@/types';
import { formatTimestamp } from '@/utils/dateFormat';

/**
 * Employee audit log page
 */
const EmployeeAudit = () => {
  const { id } = useParams<{ id: string }>();
  const [auditLog, setAuditLog] = useState<AuditEvent[]>([]);
  const [employeeName, setEmployeeName] = useState('');

  useEffect(() => {
    if (id) {
      const employee = employeesAPI.getById(Number(id));
      if (employee) {
        setEmployeeName(`${employee.firstName} ${employee.lastName}`);
      }
      const log = employeesAPI.getAuditLog(Number(id));
      setAuditLog(log);
    }
  }, [id]);

  const columns: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 70 },
    {
      field: 'timestamp',
      headerName: 'Время',
      width: 150,
      valueFormatter: (value) => formatTimestamp(value),
    },
    { field: 'actorName', headerName: 'Кто', width: 150 },
    { field: 'action', headerName: 'Действие', width: 120 },
    { field: 'entityLabel', headerName: 'Детали', flex: 1 },
  ];

  return (
    <MainLayout title={`Журнал действий: ${employeeName}`}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Журнал действий
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Сотрудник: {employeeName}
        </Typography>
      </Box>

      <DataTable rows={auditLog} columns={columns} />
    </MainLayout>
  );
};

export default EmployeeAudit;
