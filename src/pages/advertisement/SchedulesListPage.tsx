import { useState, useEffect, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Stack,
  Typography,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { Button, IconButton, Switch } from '../../components/ui/atoms';
import { FormField } from '../../components/ui/molecules';
import { useSnackbar } from 'notistack';
import { schedulesApi } from '../../api';
import type { Schedule, ScheduleFormData, DaySchedule } from '../../types';
import { z } from 'zod';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

const DAYS: Array<DaySchedule['day']> = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const createScheduleSchema = (t: (key: string) => string) =>
  z.object({
    name: z.string().min(1, t('schedules.validation.nameRequired')),
    color: z.string().regex(/^#[0-9A-F]{6}$/i, t('schedules.validation.colorInvalid')),
    weekSchedule: z.array(
      z.object({
        day: z.enum(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']),
        enabled: z.boolean(),
        startTime: z.string(),
        endTime: z.string(),
      })
    ),
    blocked: z.boolean(),
  });

type ScheduleFormValues = z.infer<ReturnType<typeof createScheduleSchema>>;

const calculateDuration = (startTime: string, endTime: string): string => {
  const [startHour, startMin] = startTime.split(':').map(Number);
  const [endHour, endMin] = endTime.split(':').map(Number);
  
  let totalMinutes = (endHour * 60 + endMin) - (startHour * 60 + startMin);
  if (totalMinutes < 0) {
    totalMinutes += 24 * 60; // Add 24 hours if end time is next day
  }
  
  const hours = Math.floor(totalMinutes / 60);
  return `${hours} hour${hours !== 1 ? 's' : ''}`;
};

const generateTimeOptions = (): string[] => {
  const options: string[] = [];
  for (let h = 0; h < 24; h++) {
    for (let m = 0; m < 60; m += 60) {
      options.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
    }
  }
  return options;
};

export default function SchedulesListPage() {
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null);

  const timeOptions = useMemo(() => generateTimeOptions(), []);

  const schema = createScheduleSchema(t);
  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { isSubmitting },
  } = useForm<ScheduleFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      color: '#000000',
      weekSchedule: DAYS.map((day) => ({
        day,
        enabled: true,
        startTime: '09:00',
        endTime: '17:00',
      })),
      blocked: false,
    },
  });

  const weekSchedule = watch('weekSchedule');

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await schedulesApi.list();
      setSchedules(data);
    } catch (error) {
      enqueueSnackbar(t('common.error.loadFailed'), { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenDialog = (schedule?: Schedule) => {
    if (schedule) {
      setEditingSchedule(schedule);
      reset({
        name: schedule.name,
        color: schedule.color,
        weekSchedule: schedule.weekSchedule,
        blocked: schedule.blocked,
      });
    } else {
      setEditingSchedule(null);
      reset({
        name: '',
        color: '#000000',
        weekSchedule: DAYS.map((day) => ({
          day,
          enabled: true,
          startTime: '09:00',
          endTime: '17:00',
        })),
        blocked: false,
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingSchedule(null);
    reset();
  };

  const handleFormSubmit = async (data: ScheduleFormValues) => {
    try {
      const formData: ScheduleFormData = {
        name: data.name,
        color: data.color,
        weekSchedule: data.weekSchedule,
        blocked: data.blocked,
      };

      if (editingSchedule) {
        await schedulesApi.update(editingSchedule.id, formData);
        enqueueSnackbar(t('common.success.updated'), { variant: 'success' });
      } else {
        await schedulesApi.create(formData);
        enqueueSnackbar(t('common.success.created'), { variant: 'success' });
      }

      handleCloseDialog();
      await loadData();
    } catch (error) {
      enqueueSnackbar(t('common.error.saveFailed'), { variant: 'error' });
    }
  };

  const handleBlock = useCallback(
    async (schedule: Schedule) => {
      try {
        await schedulesApi.block(schedule.id, !schedule.blocked);
        enqueueSnackbar(
          t(`common.success.${schedule.blocked ? 'unblocked' : 'blocked'}`),
          { variant: 'success' }
        );
        await loadData();
      } catch (error) {
        enqueueSnackbar(t('common.error.saveFailed'), { variant: 'error' });
      }
    },
    [t, enqueueSnackbar]
  );

  const activeSchedules = schedules.filter((s) => !s.blocked);

  return (
    <Box>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3,
        }}
      >
        <Typography variant="h4">{t('schedules.title')}</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          {t('schedules.addNew')}
        </Button>
      </Box>

      {loading ? (
        <Typography>{t('common.loading')}</Typography>
      ) : (
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }, gap: 3 }}>
          {activeSchedules.map((schedule) => (
            <Card
              key={schedule.id}
              sx={{
                height: '100%',
                border: '2px solid',
                borderColor: 'divider',
                borderRadius: 2,
              }}
            >
                <CardContent>
                  <Stack spacing={2}>
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        bgcolor: schedule.color,
                        color: '#fff',
                        borderRadius: 10,
                        py: 1,
                        px: 3,
                        width: 'fit-content',
                        mx: 'auto',
                        filter: 'contrast(1.2)',
                      }}
                    >
                      <Typography
                        variant="h6"
                        fontWeight="bold"
                        sx={{
                          color: '#fff',
                          textShadow: '0 1px 2px rgba(0,0,0,0.3)',
                        }}
                      >
                        {schedule.name}
                      </Typography>
                    </Box>

                    <Stack spacing={0.5}>
                      {schedule.weekSchedule.map((daySchedule) => (
                        <Box
                          key={daySchedule.day}
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                          }}
                        >
                          <Typography
                            variant="body2"
                            sx={{ minWidth: 40, fontWeight: 500 }}
                          >
                            {daySchedule.day}
                          </Typography>
                          {daySchedule.enabled ? (
                            <Box
                              sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                            >
                              <Box
                                sx={{
                                  width: 8,
                                  height: 8,
                                  borderRadius: '50%',
                                  bgcolor: schedule.color,
                                }}
                              />
                              <Typography variant="body2" color="text.secondary">
                                {daySchedule.startTime} - {daySchedule.endTime}
                              </Typography>
                            </Box>
                          ) : (
                            <Typography variant="body2" color="text.disabled">
                              {t('schedules.disabled')}
                            </Typography>
                          )}
                        </Box>
                      ))}
                    </Stack>

                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        pt: 1,
                        borderTop: '1px solid',
                        borderColor: 'divider',
                      }}
                    >
                      <IconButton
                        icon={<EditIcon />}
                        size="small"
                        onClick={() => handleOpenDialog(schedule)}
                        aria-label={t('common.edit')}
                      />
                      <Switch
                        checked={!schedule.blocked}
                        onChange={() => handleBlock(schedule)}
                      />
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            ))}
          </Box>
        )}

      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            height: '90vh',
            maxHeight: '90vh',
            display: 'flex',
            flexDirection: 'column',
          },
        }}
      >
        <DialogTitle sx={{ flexShrink: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">
            {editingSchedule ? t('schedules.editTitle') : t('schedules.addTitle')}
          </Typography>
          <IconButton
            icon={<CloseIcon />}
            size="small"
            onClick={handleCloseDialog}
            aria-label={t('common.close')}
          />
        </DialogTitle>
        <DialogContent
          sx={{
            pt: 0,
            pb: 0,
            flexGrow: 1,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <Box
            component="form"
            onSubmit={handleSubmit(handleFormSubmit)}
            sx={{
              flexGrow: 1,
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            }}
          >
            <Box sx={{ flexGrow: 1, overflow: 'auto', pb: 2, pt: 3, px: 3 }}>
              <Stack spacing={3}>
                <FormField
                  name="name"
                  control={control}
                  type="text"
                  label={t('schedules.fields.name')}
                  required
                />

                <Controller
                  name="color"
                  control={control}
                  render={({ field, fieldState: { error } }) => (
                    <Box>
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        {t('schedules.fields.color')}
                      </Typography>
                      <input
                        {...field}
                        type="color"
                        style={{
                          width: '100%',
                          height: '40px',
                          border: error ? '1px solid red' : '1px solid #ccc',
                          borderRadius: '4px',
                          cursor: 'pointer',
                        }}
                      />
                      {error && (
                        <Typography variant="caption" color="error" sx={{ mt: 0.5, display: 'block' }}>
                          {error.message}
                        </Typography>
                      )}
                    </Box>
                  )}
                />

                <Box>
                  <Typography variant="subtitle2" sx={{ mb: 2 }}>
                    {t('schedules.fields.weekSchedule')}
                  </Typography>
                  <Stack spacing={2}>
                    {DAYS.map((day, index) => (
                      <Box key={day}>
                        <Box
                          sx={{
                            display: 'grid',
                            gridTemplateColumns: 'auto 100px 100px 100px 100px',
                            alignItems: 'center',
                            gap: 2,
                            mb: 1,
                          }}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Controller
                              name={`weekSchedule.${index}.enabled`}
                              control={control}
                              render={({ field }) => (
                                <Switch
                                  checked={field.value}
                                  onChange={field.onChange}
                                />
                              )}
                            />
                            <Typography sx={{ minWidth: 100 }}>
                              {t(`schedules.days.${day.toLowerCase()}`)}
                            </Typography>
                          </Box>
                          {weekSchedule[index]?.enabled ? (
                            <>
                              <Controller
                                name={`weekSchedule.${index}.startTime`}
                                control={control}
                                render={({ field }) => (
                                  <select
                                    {...field}
                                    style={{
                                      width: '100%',
                                      padding: '8px',
                                      borderRadius: '4px',
                                      border: '1px solid #ccc',
                                      fontSize: '14px',
                                    }}
                                  >
                                    {timeOptions.map((time) => (
                                      <option key={time} value={time}>
                                        {time}
                                      </option>
                                    ))}
                                  </select>
                                )}
                              />
                              <Controller
                                name={`weekSchedule.${index}.endTime`}
                                control={control}
                                render={({ field }) => (
                                  <select
                                    {...field}
                                    style={{
                                      width: '100%',
                                      padding: '8px',
                                      borderRadius: '4px',
                                      border: '1px solid #ccc',
                                      fontSize: '14px',
                                    }}
                                  >
                                    {timeOptions.map((time) => (
                                      <option key={time} value={time}>
                                        {time}
                                      </option>
                                    ))}
                                  </select>
                                )}
                              />
                              <Typography
                                variant="body2"
                                sx={{
                                  bgcolor: 'action.hover',
                                  px: 2,
                                  py: 0.5,
                                  borderRadius: 10,
                                  textAlign: 'center',
                                }}
                              >
                                {calculateDuration(
                                  weekSchedule[index]?.startTime || '00:00',
                                  weekSchedule[index]?.endTime || '00:00'
                                )}
                              </Typography>
                            </>
                          ) : (
                            <Box sx={{ gridColumn: 'span 3' }} />
                          )}
                        </Box>
                      </Box>
                    ))}
                  </Stack>
                </Box>

                <FormField
                  name="blocked"
                  control={control}
                  type="checkbox"
                  label={t('schedules.fields.blocked')}
                />
              </Stack>
            </Box>
            <Box
              sx={{
                flexShrink: 0,
                px: 3,
                py: 2,
                borderTop: '1px solid',
                borderColor: 'divider',
                bgcolor: 'background.paper',
                display: 'flex',
                justifyContent: 'flex-end',
                gap: 2,
                position: 'sticky',
                bottom: 0,
              }}
            >
              <Button
                onClick={handleCloseDialog}
                variant="outlined"
                disabled={isSubmitting}
              >
                {t('common.cancel')}
              </Button>
              <Button type="submit" variant="contained" disabled={isSubmitting}>
                {editingSchedule ? t('common.save') : t('common.add')}
              </Button>
            </Box>
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  );
}
