import { useCallback, type ReactNode, Component, type ErrorInfo } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  Paper,
  Skeleton,
  Box,
  Typography,
} from '@mui/material';

/**
 * Error boundary for table cells
 */
class CellErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): { hasError: boolean } {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('Cell rendering error:', error, errorInfo);
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return <span>-</span>;
    }
    return this.props.children;
  }
}

/**
 * Определение колонки таблицы
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface Column<T extends Record<string, any> = Record<string, any>> {
  /** ID колонки (ключ объекта или строка) */
  id: keyof T | string;
  /** Отображаемое название колонки */
  label: string;
  /** Поддержка сортировки */
  sortable?: boolean;
  /** Кастомная функция рендера ячейки */
  render?: (row: T) => ReactNode;
  /** Ширина колонки */
  width?: string | number;
}

/**
 * Props для универсальной таблицы данных
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface DataTableProps<T extends Record<string, any> = Record<string, any>> {
  /** Определения колонок */
  columns: Column<T>[];
  /** Данные таблицы */
  data: T[];
  /** Состояние загрузки */
  loading?: boolean;
  /** Сообщение при отсутствии данных */
  emptyMessage?: string;
  /** Обработчик сортировки */
  onSort?: (column: keyof T | string, direction: 'asc' | 'desc') => void;
  /** Текущая колонка сортировки */
  sortColumn?: keyof T | string;
  /** Направление сортировки */
  sortDirection?: 'asc' | 'desc';
  /** Обработчик клика по строке */
  onRowClick?: (row: T) => void;
  /** Ключ для идентификации строки */
  rowKey: keyof T;
}

/**
 * Универсальная таблица данных
 *
 * @example
 * ```tsx
 * const columns: Column<User>[] = [
 *   { id: 'name', label: 'Имя', sortable: true },
 *   { id: 'email', label: 'Email', sortable: true },
 *   {
 *     id: 'status',
 *     label: 'Статус',
 *     render: (user) => <StatusChip status={user.status} />
 *   },
 * ];
 *
 * <DataTable
 *   columns={columns}
 *   data={users}
 *   loading={isLoading}
 *   onSort={handleSort}
 *   sortColumn={sortBy}
 *   sortDirection={sortDirection}
 *   onRowClick={handleRowClick}
 *   rowKey="id"
 * />
 * ```
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function DataTable<T extends Record<string, any>>({
  columns,
  data,
  loading = false,
  emptyMessage = 'Нет данных для отображения',
  onSort,
  sortColumn,
  sortDirection = 'asc',
  onRowClick,
  rowKey,
}: DataTableProps<T>) {
  /**
   * Обработчик клика по заголовку колонки для сортировки
   */
  const handleSort = useCallback(
    (column: keyof T | string) => {
      if (!onSort) return;

      const newDirection =
        sortColumn === column && sortDirection === 'asc' ? 'desc' : 'asc';
      onSort(column, newDirection);
    },
    [onSort, sortColumn, sortDirection]
  );

  /**
   * Обработчик клика по строке
   */
  const handleRowClick = useCallback(
    (row: T) => {
      if (onRowClick) {
        onRowClick(row);
      }
    },
    [onRowClick]
  );

  /**
   * Safe cell render - ensures no objects are rendered directly
   */
  const renderCellContent = (column: Column<T>, row: T): string | number | ReactNode => {
    try {
      if (column.render) {
        const result = column.render(row);
        // Ensure the result is safe to render
        if (result === null || result === undefined) {
          return <span></span>;
        }
        // Check if it's a plain object (not a React element)
        if (typeof result === 'object') {
          // React elements have $$typeof symbol
          const isReactElement = result && typeof result === 'object' && '$$typeof' in result;
          if (!isReactElement) {
            console.error('Column render returned non-React object:', result);
            return <span>{String(JSON.stringify(result))}</span>;
          }
        }
        return result;
      }

      const value = row[column.id as keyof T];
      if (value === null || value === undefined) return <span></span>;
      if (typeof value === 'object') return <span>{String(JSON.stringify(value))}</span>;
      return <span>{String(value)}</span>;
    } catch (error) {
      console.error('Error rendering cell:', error, { column: column.id, row });
      return <span>-</span>;
    }
  };

  /**
   * Рендер скелетона загрузки
   */
  const renderSkeleton = () => (
    <>
      {[...Array(5)].map((_, index) => (
        <TableRow key={index}>
          {columns.map((column) => (
            <TableCell key={String(column.id)}>
              <Skeleton variant="text" />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  );

  /**
   * Рендер пустого состояния
   */
  const renderEmpty = () => (
    <TableRow>
      <TableCell colSpan={columns.length} align="center">
        <Box py={4}>
          <Typography variant="body1" color="text.secondary">
            {emptyMessage}
          </Typography>
        </Box>
      </TableCell>
    </TableRow>
  );

  /**
   * Рендер данных таблицы
   */
  const renderData = () =>
    data.map((row) => (
      <TableRow
        key={String(row[rowKey])}
        hover={!!onRowClick}
        onClick={() => handleRowClick(row)}
        sx={{
          cursor: onRowClick ? 'pointer' : 'default',
        }}
      >
        {columns.map((column) => (
          <TableCell
            key={String(column.id)}
            style={{ width: column.width }}
          >
            <CellErrorBoundary>
              {renderCellContent(column, row)}
            </CellErrorBoundary>
          </TableCell>
        ))}
      </TableRow>
    ));

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            {columns.map((column) => (
              <TableCell
                key={String(column.id)}
                style={{ width: column.width }}
              >
                {column.sortable && onSort ? (
                  <TableSortLabel
                    active={sortColumn === column.id}
                    direction={
                      sortColumn === column.id ? sortDirection : 'asc'
                    }
                    onClick={() => handleSort(column.id)}
                  >
                    {column.label}
                  </TableSortLabel>
                ) : (
                  column.label
                )}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {loading
            ? renderSkeleton()
            : data.length === 0
            ? renderEmpty()
            : renderData()}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

export default DataTable;
