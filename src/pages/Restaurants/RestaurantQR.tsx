import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material';
import { Add as AddIcon, Block as BlockIcon } from '@mui/icons-material';
import { GridColDef } from '@mui/x-data-grid';
import { MainLayout } from '@/components/Layout/MainLayout';
import { DataTable } from '@/components/common/DataTable';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { restaurantsAPI } from '@/api/mock';
import type { RestaurantQR } from '@/types';
import { formatTimestamp } from '@/utils/dateFormat';

/**
 * Restaurant QR codes management page
 */
const RestaurantQR = () => {
  const { id } = useParams<{ id: string }>();
  const [qrCodes, setQrCodes] = useState<RestaurantQR[]>([]);
  const [restaurantName, setRestaurantName] = useState('');
  const [addDialog, setAddDialog] = useState(false);
  const [qrCount, setQrCount] = useState(1);
  const [blockDialog, setBlockDialog] = useState<{ open: boolean; qr: RestaurantQR | null }>({
    open: false,
    qr: null,
  });

  const loadQRCodes = () => {
    if (id) {
      const restaurant = restaurantsAPI.getById(Number(id));
      if (restaurant) {
        setRestaurantName(restaurant.name);
      }
      const codes = restaurantsAPI.getQRCodes(Number(id));
      setQrCodes(codes);
    }
  };

  useEffect(() => {
    loadQRCodes();
  }, [id]);

  const handleAddQRCodes = () => {
    if (id && qrCount > 0) {
      restaurantsAPI.createQRCodes(Number(id), qrCount);
      loadQRCodes();
      setAddDialog(false);
      setQrCount(1);
    }
  };

  const handleToggleBlock = (qr: RestaurantQR) => {
    setBlockDialog({ open: true, qr });
  };

  const confirmToggleBlock = () => {
    if (blockDialog.qr) {
      restaurantsAPI.toggleQRBlock(blockDialog.qr.id);
      loadQRCodes();
    }
    setBlockDialog({ open: false, qr: null });
  };

  const columns: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'qrCode', headerName: 'QR код', width: 250 },
    { field: 'tableNumber', headerName: 'Номер стола', width: 120 },
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
      field: 'actions',
      headerName: 'Действия',
      width: 100,
      sortable: false,
      renderCell: (params) => (
        <IconButton
          size="small"
          onClick={() => handleToggleBlock(params.row)}
          title={params.row.blocked ? 'Разблокировать' : 'Заблокировать'}
        >
          <BlockIcon fontSize="small" />
        </IconButton>
      ),
    },
  ];

  return (
    <MainLayout title={`QR коды: ${restaurantName}`}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Box>
          <Typography variant="h4" gutterBottom>
            QR коды
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Ресторан: {restaurantName}
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setAddDialog(true)}>
          Добавить QR коды
        </Button>
      </Box>

      <DataTable rows={qrCodes} columns={columns} />

      {/* Add QR Dialog */}
      <Dialog open={addDialog} onClose={() => setAddDialog(false)}>
        <DialogTitle>Добавить QR коды</DialogTitle>
        <DialogContent>
          <TextField
            label="Количество"
            type="number"
            fullWidth
            margin="normal"
            value={qrCount}
            onChange={(e) => setQrCount(Number(e.target.value))}
            inputProps={{ min: 1, max: 100 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddDialog(false)}>Отмена</Button>
          <Button onClick={handleAddQRCodes} variant="contained">
            Создать
          </Button>
        </DialogActions>
      </Dialog>

      {/* Block Confirmation Dialog */}
      <ConfirmDialog
        open={blockDialog.open}
        onClose={() => setBlockDialog({ open: false, qr: null })}
        onConfirm={confirmToggleBlock}
        title={blockDialog.qr?.blocked ? 'Разблокировать QR код?' : 'Заблокировать QR код?'}
        message={
          blockDialog.qr
            ? `Вы уверены, что хотите ${blockDialog.qr.blocked ? 'разблокировать' : 'заблокировать'} QR код ${
                blockDialog.qr.qrCode
              }?`
            : ''
        }
      />
    </MainLayout>
  );
};

export default RestaurantQR;
