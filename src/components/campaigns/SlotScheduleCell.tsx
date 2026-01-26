import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Typography,
} from '@mui/material';
import { Schedule as ScheduleIcon, Close as CloseIcon } from '@mui/icons-material';
import { Switch, Button } from '../ui/atoms';
import type { Schedule } from '../../types';

interface SlotScheduleCellProps {
  restaurantId: number;
  slotId: number;
  enabled: boolean;
  selectedSchedules: number[];
  schedules: Schedule[];
  onToggle: (restaurantId: number, slotId: number, enabled: boolean) => void;
  onSchedulesChange: (restaurantId: number, slotId: number, scheduleIds: number[]) => void;
  disabled?: boolean;
}

export const SlotScheduleCell = ({
  restaurantId,
  slotId,
  enabled,
  selectedSchedules,
  schedules,
  onToggle,
  onSchedulesChange,
  disabled = false,
}: SlotScheduleCellProps) => {
  const { t } = useTranslation();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [tempSelectedSchedules, setTempSelectedSchedules] = useState<number[]>(selectedSchedules);

  const handleToggle = () => {
    onToggle(restaurantId, slotId, !enabled);
  };

  const handleOpenDialog = () => {
    setTempSelectedSchedules(selectedSchedules);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
  };

  const handleSave = () => {
    onSchedulesChange(restaurantId, slotId, tempSelectedSchedules);
    setDialogOpen(false);
  };

  const handleScheduleToggle = (scheduleId: number) => {
    setTempSelectedSchedules((prev) =>
      prev.includes(scheduleId)
        ? prev.filter((id) => id !== scheduleId)
        : [...prev, scheduleId]
    );
  };

  const selectedCount = selectedSchedules.length;
  const activeSchedules = schedules.filter((s) => !s.blocked);

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <Switch
        checked={enabled}
        onChange={handleToggle}
        disabled={disabled}
      />
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        <IconButton
          size="small"
          onClick={handleOpenDialog}
          disabled={disabled || !enabled}
          aria-label={t('campaigns.targeting.selectSchedules')}
        >
          <ScheduleIcon fontSize="small" />
        </IconButton>
        {enabled && selectedCount > 0 && (
          <Typography variant="caption" color="text.secondary">
            ({selectedCount})
          </Typography>
        )}
      </Box>

      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">
            {t('campaigns.targeting.selectSchedules')}
          </Typography>
          <IconButton size="small" onClick={handleCloseDialog}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <FormGroup>
            {activeSchedules.length > 0 ? (
              activeSchedules.map((schedule) => (
                <FormControlLabel
                  key={schedule.id}
                  control={
                    <Checkbox
                      checked={tempSelectedSchedules.includes(schedule.id)}
                      onChange={() => handleScheduleToggle(schedule.id)}
                    />
                  }
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box
                        sx={{
                          width: 16,
                          height: 16,
                          borderRadius: '50%',
                          bgcolor: schedule.color,
                        }}
                      />
                      <Typography>{schedule.name}</Typography>
                    </Box>
                  }
                />
              ))
            ) : (
              <Typography color="text.secondary">
                {t('campaigns.targeting.noSchedules')}
              </Typography>
            )}
          </FormGroup>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleCloseDialog} variant="outlined">
            {t('common.cancel')}
          </Button>
          <Button onClick={handleSave} variant="contained">
            {t('common.save')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
