import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Button, IconButton, Chip } from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Block as BlockIcon,
  QrCode as QrCodeIcon,
} from '@mui/icons-material';
import { GridColDef } from '@mui/x-data-grid';
import { MainLayout } from '@/components/Layout/MainLayout';
import { FilterPanel } from '@/components/Layout/FilterPanel';
import { DataTable } from '@/components/common/DataTable';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { restaurantsAPI, dictionariesAPI } from '@/api/mock';
import type { Restaurant, FilterStatus } from '@/types';
import { formatTimestamp } from '@/utils/dateFormat';

/**
 * Restaurant list page
 */
const RestaurantList = () => {
  const navigate = useNavigate();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [blockDialog, setBlockDialog] = useState<{ open: boolean; restaurant: Restaurant | null }>({
    open: false,
    restaurant: null,
  });

  const loadRestaurants = () => {
    const allRestaurants = restaurantsAPI.getAll();
    let filtered = allRestaurants;

    if (filterStatus === 'active') {
      filtered = allRestaurants.filter((rest) => !rest.blocked);
    } else if (filterStatus === 'blocked') {
      filtered = allRestaurants.filter((rest) => rest.blocked);
    }

    setRestaurants(filtered);
  };

  useEffect(() => {
    loadRestaurants();
  }, [filterStatus]);

  const handleToggleBlock = (restaurant: Restaurant) => {
    setBlockDialog({ open: true, restaurant });
  };

  const confirmToggleBlock = () => {
    if (blockDialog.restaurant) {
      restaurantsAPI.toggleBlock(blockDialog.restaurant.id);
      loadRestaurants();
    }
    setBlockDialog({ open: false, restaurant: null });
  };

  const getCountryName = (countryId: number) => {
    const country = dictionariesAPI.getById('countries', countryId);
    return country?.name || '';
  };

  const getCityName = (cityId: number) => {
    const city = dictionariesAPI.getById('cities', cityId);
    return city?.name || '';
  };

  const columns: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'name', headerName: 'Название', width: 200 },
    {
      field: 'countryId',
      headerName: 'Страна',
      width: 120,
      valueGetter: (value) => getCountryName(value),
    },
    {
      field: 'cityId',
      headerName: 'Город',
      width: 150,
      valueGetter: (value) => getCityName(value),
    },
    { field: 'address', headerName: 'Адрес', width: 200 },
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
      field: 'actions',
      headerName: 'Действия',
      width: 150,
      sortable: false,
      renderCell: (params) => (
        <Box>
          <IconButton
            size="small"
            onClick={() => navigate(`/restaurants/${params.row.id}/edit`)}
            title="Редактировать"
          >
            <EditIcon fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            onClick={() => navigate(`/restaurants/${params.row.id}/qr`)}
            title="QR коды"
          >
            <QrCodeIcon fontSize="small" />
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
    <FilterPanel onApply={loadRestaurants} onReset={() => setFilterStatus('all')}>
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
    <MainLayout title="Рестораны" rightPanel={rightPanel}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Рестораны</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/restaurants/new')}
        >
          Добавить ресторан
        </Button>
      </Box>

      <DataTable rows={restaurants} columns={columns} />

      <ConfirmDialog
        open={blockDialog.open}
        onClose={() => setBlockDialog({ open: false, restaurant: null })}
        onConfirm={confirmToggleBlock}
        title={blockDialog.restaurant?.blocked ? 'Разблокировать ресторан?' : 'Заблокировать ресторан?'}
        message={
          blockDialog.restaurant
            ? `Вы уверены, что хотите ${
                blockDialog.restaurant.blocked ? 'разблокировать' : 'заблокировать'
              } ресторан ${blockDialog.restaurant.name}?`
            : ''
        }
      />
    </MainLayout>
  );
};

export default RestaurantList;
