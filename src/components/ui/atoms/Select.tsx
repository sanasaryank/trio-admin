import React from 'react';
import {
  FormControl,
  InputLabel,
  Select as MuiSelect,
  MenuItem,
  FormHelperText,
} from '@mui/material';

/**
 * Опция для Select
 */
export interface SelectOption {
  /** Значение опции */
  value: string | number;
  /** Отображаемый текст */
  label: string;
  /** Опция неактивна */
  disabled?: boolean;
}

/**
 * Props для универсального Select
 */
interface SelectProps {
  /** Имя поля */
  name: string;
  /** Метка поля */
  label: string;
  /** Выбранное значение */
  value: string | number;
  /** Обработчик изменения */
  onChange: (value: string | number) => void;
  /** Список опций */
  options: SelectOption[];
  /** Есть ошибка */
  error?: boolean;
  /** Текст подсказки/ошибки */
  helperText?: string;
  /** Обязательное поле */
  required?: boolean;
  /** Поле неактивно */
  disabled?: boolean;
  /** Поле занимает всю ширину */
  fullWidth?: boolean;
  /** Placeholder */
  placeholder?: string;
}

/**
 * Универсальный Select
 *
 * @example
 * ```tsx
 * <Select
 *   name="status"
 *   label="Статус"
 *   value={status}
 *   onChange={setStatus}
 *   options={[
 *     { value: 'active', label: 'Активен' },
 *     { value: 'inactive', label: 'Неактивен' },
 *   ]}
 *   required
 *   fullWidth
 * />
 * ```
 */
const Select: React.FC<SelectProps> = React.memo(({
  name,
  label,
  value,
  onChange,
  options,
  error = false,
  helperText,
  required = false,
  disabled = false,
  fullWidth = true,
  placeholder,
}) => {
  const labelId = `${name}-label`;

  return (
    <FormControl
      fullWidth={fullWidth}
      error={error}
      required={required}
      disabled={disabled}
      variant="outlined"
    >
      <InputLabel id={labelId}>{label}</InputLabel>
      <MuiSelect
        labelId={labelId}
        name={name}
        value={value}
        label={label}
        onChange={(e) => onChange(e.target.value)}
        displayEmpty={!!placeholder}
      >
        {placeholder && (
          <MenuItem value="" disabled>
            {placeholder}
          </MenuItem>
        )}
        {options.map((option) => (
          <MenuItem
            key={option.value}
            value={option.value}
            disabled={option.disabled}
          >
            {option.label}
          </MenuItem>
        ))}
      </MuiSelect>
      {helperText && <FormHelperText>{helperText}</FormHelperText>}
    </FormControl>
  );
});

Select.displayName = 'Select';

export default Select;
