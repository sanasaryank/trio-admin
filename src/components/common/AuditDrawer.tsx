import { useEffect, useState } from 'react';
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
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open && entityId) {
      loadAuditEvents();
    }
  }, [open, entityType, entityId]);

  const loadAuditEvents = async () => {
    if (!entityId) return;

    setIsLoading(true);
    setError(null);

    try {
      const data = await auditApi.getEvents({
        entityType,
        entityId,
      });

      // Sort by timestamp (newest first)
      const sortedData = [...data].sort((a, b) => b.timestamp - a.timestamp);
      setEvents(sortedData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка загрузки данных');
    } finally {
      setIsLoading(false);
    }
  };

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

    // Common fields
    if (metadata.name) {
      parts.push(`Название: ${metadata.name}`);
    }
    if (metadata.firstName) {
      parts.push(`Имя: ${metadata.firstName}`);
    }
    if (metadata.lastName) {
      parts.push(`Фамилия: ${metadata.lastName}`);
    }
    if (metadata.blocked !== undefined) {
      parts.push(`Статус: ${metadata.blocked ? 'Заблокирован' : 'Активен'}`);
    }

    // Restaurant-specific fields
    if (metadata.cityId) {
      parts.push(`ID города: ${metadata.cityId}`);
    }
    if (metadata.adminEmail) {
      parts.push(`Email: ${metadata.adminEmail}`);
    }

    // QR-specific fields
    if (metadata.count) {
      parts.push(`Количество: ${metadata.count}`);
    }
    if (metadata.qrText) {
      parts.push(`QR текст: ${metadata.qrText}`);
    }

    return parts.length > 0 ? parts.join(', ') : '-';
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: { width: { xs: '100%', sm: 600 } },
      }}
    >
      <Box sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h6">
            Журнал действий: {entityLabel}
          </Typography>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>

        {isLoading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {!isLoading && !error && events.length === 0 && (
          <Alert severity="info">
            Нет записей в журнале
          </Alert>
        )}

        {!isLoading && !error && events.length > 0 && (
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
