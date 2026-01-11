import { useMemo } from 'react';
import type { Control } from 'react-hook-form';
import { Divider, Typography, Grid } from '@mui/material';
import { useTranslation } from 'react-i18next';
import FormField from '../ui/molecules/FormField';
import Checkbox from '../ui/atoms/Checkbox';

/**
 * Props для компонента ConnectionDataFields
 */
interface ConnectionDataFieldsProps {
  /** Control из react-hook-form */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  control: Control<any>;
  /** Режим редактирования */
  isEditMode: boolean;
  /** Значение чекбокса "Сменить пароль" */
  changePassword: boolean;
  /** Обработчик изменения чекбокса "Сменить пароль" */
  onChangePasswordToggle: (value: boolean) => void;
  /** Поля заблокированы */
  disabled?: boolean;
}

/**
 * Компонент для управления полями данных подключения к ресторану
 * Включает хост, порт, имя пользователя и пароль
 * В режиме редактирования добавляет чекбокс для смены пароля
 */
export const ConnectionDataFields: React.FC<ConnectionDataFieldsProps> = ({
  control,
  isEditMode,
  changePassword,
  onChangePasswordToggle,
  disabled = false,
}) => {
  const { t } = useTranslation();

  /**
   * Определяем, обязателен ли пароль
   * В режиме создания - всегда обязателен
   * В режиме редактирования - обязателен только если чекбокс "Сменить пароль" включен
   */
  const isPasswordRequired = useMemo(() => {
    return !isEditMode || changePassword;
  }, [isEditMode, changePassword]);

  /**
   * Плейсхолдер для поля пароля
   */
  const passwordPlaceholder = useMemo(() => {
    if (isEditMode && !changePassword) {
      return t('connectionData.passwordPlaceholder');
    }
    return '';
  }, [isEditMode, changePassword, t]);

  return (
    <>
      <Divider sx={{ my: 3 }} />

      <Typography variant="h6" gutterBottom>
        {t('connectionData.title')}
      </Typography>

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 8 }}>
          <FormField
            name="connectionData.host"
            control={control}
            label={t('connectionData.host')}
            type="text"
            required
            disabled={disabled}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 4 }}>
          <FormField
            name="connectionData.port"
            control={control}
            label={t('connectionData.port')}
            type="number"
            required
            disabled={disabled}
          />
        </Grid>

        <Grid size={12}>
          <FormField
            name="connectionData.username"
            control={control}
            label={t('connectionData.username')}
            type="text"
            required
            disabled={disabled}
          />
        </Grid>

        {isEditMode && (
          <Grid size={12}>
            <Checkbox
              checked={changePassword}
              onChange={onChangePasswordToggle}
              label={t('connectionData.changePassword')}
              disabled={disabled}
            />
          </Grid>
        )}

        <Grid size={12}>
          <FormField
            name="connectionData.password"
            control={control}
            label={t('connectionData.password')}
            type="password"
            required={isPasswordRequired}
            disabled={disabled || (isEditMode && !changePassword)}
          placeholder={passwordPlaceholder}
        />
      </Grid>
    </Grid>
  </>
);
};