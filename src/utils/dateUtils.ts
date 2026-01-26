import { format, fromUnixTime } from 'date-fns';

/**
 * Форматирует Unix timestamp (в секундах) в читаемый формат
 * Согласно ТЗ: для "ресторанных" timestamp значение считается уже локализованным,
 * отображать как UTC без смещения
 * @param timestamp - Unix timestamp в секундах
 * @returns строка в формате DD.MM.YYYY HH:mm
 */
export const formatTimestamp = (timestamp: number): string => {
  try {
    const date = fromUnixTime(timestamp);
    return format(date, 'dd.MM.yyyy HH:mm');
  } catch (error) {
    return '';
  }
};

/**
 * Получает текущий Unix timestamp в секундах
 */
export const getCurrentTimestamp = (): number => {
  return Math.floor(Date.now() / 1000);
};

/**
 * Форматирует Unix timestamp (в секундах) в короткий формат даты
 * @param timestamp - Unix timestamp в секундах
 * @returns строка в формате DD.MM.YYYY
 */
export const formatDate = (timestamp: number): string => {
  try {
    const date = fromUnixTime(timestamp);
    return format(date, 'dd.MM.yyyy');
  } catch (error) {
    return '';
  }
};

/**
 * Converts Unix timestamp (seconds) to date input value (YYYY-MM-DD)
 * @param timestamp - Unix timestamp in seconds
 * @returns string in format YYYY-MM-DD for HTML date input
 */
export const timestampToDateInput = (timestamp: number): string => {
  try {
    const date = fromUnixTime(timestamp);
    return format(date, 'yyyy-MM-dd');
  } catch (error) {
    return '';
  }
};

/**
 * Converts date input value (YYYY-MM-DD) to Unix timestamp (seconds)
 * @param dateString - Date string in format YYYY-MM-DD
 * @returns Unix timestamp in seconds
 */
export const dateInputToTimestamp = (dateString: string): number => {
  try {
    const date = new Date(dateString);
    return Math.floor(date.getTime() / 1000);
  } catch (error) {
    return 0;
  }
};
