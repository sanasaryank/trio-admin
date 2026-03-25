import { useEffect, useState, useCallback } from 'react';
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Alert,
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { auditApi } from '../../api/endpoints';
import { useAppSnackbar } from '../../providers/AppSnackbarProvider';
import { getErrorMessage } from '../../api/errors';
import { formatTimestamp } from '../../utils/dateUtils';
import type { AuditEvent, AuditEntityType } from '../../types';

interface AuditDrawerProps {
  open: boolean;
  entityType: AuditEntityType;
  entityId: number | string | null;
  entityLabel: string;
  onClose: () => void;
}

export const AuditDrawer = ({
  open,
  entityType,
  entityId,
  entityLabel,
  onClose,
}: AuditDrawerProps) => {
  const [events, setEvents] = useState<AuditEvent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { showError } = useAppSnackbar();

  const loadAuditEvents = useCallback(async () => {
    if (!entityId) return;

    setIsLoading(true);

    try {
      const data = await auditApi.getEvents({
        entityType,
        entityId: entityId != null ? String(entityId) : undefined,
      });

      const sortedData = [...data].sort((a, b) => b.timestamp - a.timestamp);
      setEvents(sortedData);
    } catch (err) {
      showError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, [entityType, entityId, showError]);

  useEffect(() => {
    if (open && entityId) {
      loadAuditEvents();
    }
  }, [open, entityId, loadAuditEvents]);

  const getActionLabel = (action: string): string => {
    const labels: Record<string, string> = {
      create: 'Создание',
      update: 'Обновление',
      block: 'Блокировка',
      unblock: 'Разблокировка',
      login: 'Вход',
      logout: 'Выход',
      batch_create_qr: 'Массовое создание QR-кодов',
    };
    return labels[action] || action;
  };

  const formatDetails = (event: AuditEvent): string => {
    if (!event.metadata) return '-';

    const parts: string[] = [];
    const metadata = event.metadata;

    if (metadata.name) parts.push(`Название: ${metadata.name}`);
    if (metadata.firstName) parts.push(`Имя: ${metadata.firstName}`);
    if (metadata.lastName) parts.push(`Фамилия: ${metadata.lastName}`);
    if (metadata.blocked !== undefined) {
      parts.push(`Статус: ${metadata.blocked ? 'Заблокирован' : 'Активен'}`);
    }
    if (metadata.cityId) parts.push(`ID города: ${metadata.cityId}`);
    if (metadata.adminEmail) parts.push(`Email: ${metadata.adminEmail}`);
    if (metadata.count) parts.push(`Количество: ${metadata.count}`);
    if (metadata.qrText) parts.push(`QR текст: ${metadata.qrText}`);

    return parts.length > 0 ? parts.join(', ') : '-';
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: { xs: '100%', sm: 600 },
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
        },
      }}
    >
      <Box sx={{ flexShrink: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Typography variant="h6">Журнал действий: {entityLabel}</Typography>
        <IconButton onClick={onClose} aria-label="close">
          <CloseIcon />
        </IconButton>
      </Box>

      <Box sx={{ flexGrow: 1, overflow: 'auto', p: 2 }}>
        {isLoading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        )}

        {!isLoading && events.length === 0 && (
          <Alert severity="info">Нет записей в журнале</Alert>
        )}

        {!isLoading && events.length > 0 && (
          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Время</TableCell>
                  <TableCell>Пользователь</TableCell>
                  <TableCell>Действие</TableCell>
                  <TableCell>Детали</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {events.map((event) => (
                  <TableRow key={event.id}>
                    <TableCell sx={{ whiteSpace: 'nowrap' }}>
                      {formatTimestamp(event.timestamp)}
                    </TableCell>
                    <TableCell>{event.actorName}</TableCell>
                    <TableCell>{getActionLabel(event.action)}</TableCell>
                    <TableCell>{formatDetails(event)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Box>
    </Drawer>
  );
};
