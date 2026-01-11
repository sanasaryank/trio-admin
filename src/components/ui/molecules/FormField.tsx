import { Controller, type Control } from 'react-hook-form';
import TextField from '../atoms/TextField';
import Select, { type SelectOption } from '../atoms/Select';
import Switch from '../atoms/Switch';
import Checkbox from '../atoms/Checkbox';

/**
 * Props для обертки полей формы с Controller
 */
export interface FormFieldProps {
  /** Имя поля в форме */
  name: string;
  /** Control из react-hook-form */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  control: Control<any>;
  /** Метка поля */
  label: string;
  /** Тип поля */
  type?: 'text' | 'password' | 'email' | 'number' | 'select' | 'switch' | 'checkbox';
  /** Обязательное поле */
  required?: boolean;
  /** Опции для select */
  options?: SelectOption[];
  /** Поле неактивно */
  disabled?: boolean;
  /** Placeholder */
  placeholder?: string;
  /** Многострочное поле (для text) */
  multiline?: boolean;
  /** Количество строк (для multiline) */
  rows?: number;
}

/**
 * Обертка для полей формы с Controller из react-hook-form
 *
 * @example
 * ```tsx
 * const { control, handleSubmit } = useForm();
 *
 * <FormField
 *   name="email"
 *   control={control}
 *   label="Email"
 *   type="email"
 *   required
 * />
 *
 * <FormField
 *   name="status"
 *   control={control}
 *   label="Статус"
 *   type="select"
 *   options={[
 *     { value: 'active', label: 'Активен' },
 *     { value: 'inactive', label: 'Неактивен' },
 *   ]}
 *   required
 * />
 *
 * <FormField
 *   name="isActive"
 *   control={control}
 *   label="Активен"
 *   type="switch"
 * />
 * ```
 */
const FormField = ({
  name,
  control,
  label,
  type = 'text',
  required = false,
  options = [],
  disabled = false,
  placeholder,
  multiline = false,
  rows,
}: FormFieldProps) => {
  return (
    <Controller
      name={name}
      control={control}
      rules={{
        required: required ? `${label} обязательно для заполнения` : false,
      }}
      render={({ field, fieldState: { error } }) => {
        switch (type) {
          case 'select':
            return (
              <Select
                name={field.name}
                label={label}
                value={field.value || ''}
                onChange={(value) => field.onChange(value)}
                options={options}
                error={!!error}
                helperText={error?.message}
                required={required}
                disabled={disabled}
                placeholder={placeholder}
              />
            );

          case 'switch':
            return (
              <Switch
                name={field.name}
                label={label}
                checked={field.value || false}
                onChange={(checked) => field.onChange(checked)}
                disabled={disabled}
              />
            );

          case 'checkbox':
            return (
              <Checkbox
                label={label}
                checked={field.value || false}
                onChange={(checked) => field.onChange(checked)}
                disabled={disabled}
              />
            );

          case 'text':
          case 'password':
          case 'email':
          case 'number':
          default:
            return (
              <TextField
                name={field.name}
                label={label}
                type={type}
                value={field.value || ''}
                onChange={field.onChange}
                onBlur={field.onBlur}
                error={!!error}
                helperText={error?.message}
                required={required}
                disabled={disabled}
                placeholder={placeholder}
                multiline={multiline}
                rows={rows}
              />
            );
        }
      }}
    />
  );
};

export default FormField;
