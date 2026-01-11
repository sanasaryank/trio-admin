import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Typography } from '@mui/material';
import { GridColDef } from '@mui/x-data-grid';
import { MainLayout } from '@/components/Layout/MainLayout';
import { DataTable } from '@/components/common/DataTable';
import { restaurantsAPI } from '@/api/mock';
import type { AuditEvent } from '@/types';
import { formatTimestamp } from '@/utils/dateFormat';

/**
 * Restaurant audit log page
 */
const RestaurantAudit = () => {
  const { id } = useParams<{ id: string }>();
  const [auditLog, setAuditLog] = useState<AuditEvent[]>([]);
  const [restaurantName, setRestaurantName] = useState('');

  useEffect(() => {
    if (id) {
      const restaurant = restaurantsAPI.getById(Number(id));
      if (restaurant) {
        setRestaurantName(restaurant.name);
      }
      const log = restaurantsAPI.getAuditLog(Number(id));
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
    <MainLayout title={`Журнал действий: ${restaurantName}`}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Журнал действий
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Ресторан: {restaurantName}
        </Typography>
      </Box>

      <DataTable rows={auditLog} columns={columns} />
    </MainLayout>
  );
};

export default RestaurantAudit;
