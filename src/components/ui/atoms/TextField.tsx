import React, { useState } from 'react';
import { 
  TextField as MuiTextField, 
  IconButton, 
  InputAdornment,
  type InputProps as MuiInputProps,
  type SxProps,
  type Theme 
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';

/**
 * Props для универсального текстового поля
 */
interface TextFieldProps {
  /** Имя поля */
  name: string;
  /** Метка поля */
  label: string;
  /** Тип поля */
  type?: 'text' | 'password' | 'email' | 'number' | 'url';
  /** Placeholder */
  placeholder?: string;
  /** Значение поля */
  value?: string | number;
  /** Обработчик изменения */
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  /** Обработчик потери фокуса */
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
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
  /** Многострочное поле */
  multiline?: boolean;
  /** Количество строк для многострочного поля */
  rows?: number;
  /** Дополнительные props для Input */
  InputProps?: Partial<MuiInputProps>;
  /** Дополнительные стили */
  sx?: SxProps<Theme>;
  /** Атрибут autocomplete */
  autoComplete?: string;
}

/**
 * Универсальное текстовое поле
 *
 * @example
 * ```tsx
 * <TextField
 *   name="email"
 *   label="Email"
 *   type="email"
 *   value={email}
 *   onChange={handleChange}
 *   error={!!errors.email}
 *   helperText={errors.email}
 *   required
 *   fullWidth
 * />
 * ```
 */
const TextField: React.FC<TextFieldProps> = React.memo(({
  name,
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  onBlur,
  error = false,
  helperText,
  required = false,
  disabled = false,
  fullWidth = true,
  multiline = false,
  rows,
  InputProps,
  sx,
  autoComplete,
}) => {
  const [showPassword, setShowPassword] = useState(false);

  const handleTogglePassword = () => {
    setShowPassword(!showPassword);
  };

  const isPasswordField = type === 'password';
  const inputType = isPasswordField && showPassword ? 'text' : type;

  const endAdornment = isPasswordField ? (
    <InputAdornment position="end">
      <IconButton
        onClick={handleTogglePassword}
        edge="end"
        aria-label={showPassword ? 'Hide password' : 'Show password'}
      >
        {showPassword ? <VisibilityOff /> : <Visibility />}
      </IconButton>
    </InputAdornment>
  ) : undefined;

  return (
    <MuiTextField
      name={name}
      label={label}
      type={inputType}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      onBlur={onBlur}
      error={error}
      helperText={helperText}
      required={required}
      disabled={disabled}
      fullWidth={fullWidth}
      multiline={multiline}
      rows={rows}
      autoComplete={autoComplete}
      InputProps={{
        ...InputProps,
        endAdornment: endAdornment || InputProps?.endAdornment,
      }}
      variant="outlined"
      sx={{
        '& input:-webkit-autofill': {
          WebkitBoxShadow: '0 0 0 100px transparent inset !important',
          WebkitTextFillColor: 'inherit !important',
          transition: 'background-color 5000s ease-in-out 0s',
        },
        '& input:-webkit-autofill:hover': {
          WebkitBoxShadow: '0 0 0 100px transparent inset !important',
        },
        '& input:-webkit-autofill:focus': {
          WebkitBoxShadow: '0 0 0 100px transparent inset !important',
        },
        '& input:-webkit-autofill:active': {
          WebkitBoxShadow: '0 0 0 100px transparent inset !important',
        },
        ...sx,
      }}
    />
  );
});

TextField.displayName = 'TextField';

export default TextField;
