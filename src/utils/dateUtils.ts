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
