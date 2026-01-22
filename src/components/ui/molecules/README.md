# Molecules - Библиотека переиспользуемых UI компонентов

Molecules - это композитные компоненты, построенные из atoms, которые представляют собой самостоятельные функциональные блоки UI.

## Особенности

- ✅ Полная типизация с TypeScript
- ✅ Оптимизация с React.memo, useCallback, useMemo
- ✅ Основаны на Material-UI компонентах
- ✅ JSDoc документация и примеры использования
- ✅ Поддержка всех требуемых функций

## Компоненты

### DataTable

Универсальная таблица данных с сортировкой, loading state и empty state.

```tsx
import { DataTable, Column } from '@/components/ui/molecules';

const columns: Column<User>[] = [
  { id: 'name', label: 'Имя', sortable: true },
  { id: 'email', label: 'Email', sortable: true },
  {
    id: 'status',
    label: 'Статус',
    render: (user) => <StatusChip status={user.status} />
  },
];

<DataTable
  columns={columns}
  data={users}
  loading={isLoading}
  onSort={handleSort}
  sortColumn={sortBy}
  sortDirection={sortDirection}
  onRowClick={handleRowClick}
  rowKey="id"
/>
```

### Pagination

Универсальная пагинация с настройкой количества элементов на странице.

```tsx
import { Pagination } from '@/components/ui/molecules';

<Pagination
  page={currentPage}
  totalPages={totalPages}
  onPageChange={setCurrentPage}
  rowsPerPage={pageSize}
  onRowsPerPageChange={setPageSize}
  rowsPerPageOptions={[10, 25, 50, 100]}
  totalCount={totalCount}
/>
```

### FilterDrawer

Drawer с фильтрами и кнопками действий.

```tsx
import { FilterDrawer } from '@/components/ui/molecules';

<FilterDrawer
  open={isFilterOpen}
  onClose={handleCloseFilter}
  onApply={handleApplyFilters}
  onReset={handleResetFilters}
  title="Фильтры"
>
  <TextField
    name="search"
    label="Поиск"
    value={filters.search}
    onChange={handleFilterChange}
  />
  <Select
    name="status"
    label="Статус"
    value={filters.status}
    onChange={(value) => handleFilterChange('status', value)}
    options={statusOptions}
  />
</FilterDrawer>
```

### SearchField

Поле поиска с debounce для оптимизации запросов.

```tsx
import { SearchField } from '@/components/ui/molecules';

<SearchField
  value={searchQuery}
  onChange={setSearchQuery}
  placeholder="Поиск пользователей..."
  debounceMs={500}
  fullWidth
/>
```

### StatusChip

Chip для отображения статуса с автоматическим маппингом на цвета.

```tsx
import { StatusChip } from '@/components/ui/molecules';

<StatusChip status="active" />
<StatusChip status="blocked" />
<StatusChip status="pending" />
<StatusChip status="custom" label="Кастомный статус" />
```

**Поддерживаемые статусы:**
- `active` - Активен (зеленый)
- `blocked` - Заблокирован (красный)
- `pending` - Ожидание (желтый)
- `inactive` - Неактивен (серый)
- `draft` - Черновик (синий)
- `published` - Опубликовано (зеленый)
- `archived` - Архивировано (серый)

### FormField

Обертка для полей формы с интеграцией react-hook-form.

```tsx
import { FormField } from '@/components/ui/molecules';
import { useForm } from 'react-hook-form';

const { control, handleSubmit } = useForm();

<FormField
  name="email"
  control={control}
  label="Email"
  type="email"
  required
/>

<FormField
  name="status"
  control={control}
  label="Статус"
  type="select"
  options={[
    { value: 'active', label: 'Активен' },
    { value: 'inactive', label: 'Неактивен' },
  ]}
  required
/>

<FormField
  name="isActive"
  control={control}
  label="Активен"
  type="switch"
/>
```

**Поддерживаемые типы:**
- `text` - Текстовое поле
- `password` - Поле пароля
- `email` - Email поле
- `number` - Числовое поле
- `select` - Выпадающий список
- `switch` - Переключатель
- `checkbox` - Чекбокс

### LoadingOverlay

Overlay с индикатором загрузки для блокировки UI.

```tsx
import { LoadingOverlay } from '@/components/ui/molecules';

<LoadingOverlay
  loading={isSubmitting}
  message="Сохранение данных..."
/>
```

### EmptyState

Компонент для отображения пустого состояния.

```tsx
import { EmptyState } from '@/components/ui/molecules';
import { Button } from '@/components/ui/atoms';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import AddIcon from '@mui/icons-material/Add';

<EmptyState
  icon={<PersonAddIcon sx={{ fontSize: 60 }} />}
  title="Нет пользователей"
  description="Начните с добавления первого пользователя в систему"
  action={
    <Button
      variant="contained"
      startIcon={<AddIcon />}
      onClick={handleAddUser}
    >
      Добавить пользователя
    </Button>
  }
/>
```

### ActionMenu

Меню действий с иконками и цветовой индикацией.

```tsx
import { ActionMenu } from '@/components/ui/molecules';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ArchiveIcon from '@mui/icons-material/Archive';

<ActionMenu
  items={[
    {
      label: 'Редактировать',
      icon: <EditIcon />,
      onClick: handleEdit,
    },
    {
      label: 'Удалить',
      icon: <DeleteIcon />,
      onClick: handleDelete,
      color: 'error',
    },
    {
      label: 'Архивировать',
      icon: <ArchiveIcon />,
      onClick: handleArchive,
      disabled: true,
    },
  ]}
/>
```

## Импорт

```tsx
// Импорт отдельных компонентов
import { DataTable, Pagination, SearchField } from '@/components/ui/molecules';

// Импорт типов
import type { Column, PaginationProps } from '@/components/ui/molecules';
```

## Оптимизация

Все компоненты оптимизированы для производительности:

1. **React.memo** - предотвращает ненужные ре-рендеры
2. **useCallback** - мемоизация функций-обработчиков
3. **useMemo** - мемоизация вычисляемых значений
4. **Debounce** - в SearchField для оптимизации запросов

## Зависимости

- React 18+
- Material-UI (@mui/material)
- React Hook Form (для FormField)
- TypeScript 4.5+

## Структура

```
molecules/
├── ActionMenu.tsx      # Меню действий
├── DataTable.tsx       # Универсальная таблица
├── EmptyState.tsx      # Пустое состояние
├── FilterDrawer.tsx    # Drawer с фильтрами
├── FormField.tsx       # Обертка для полей формы
├── LoadingOverlay.tsx  # Overlay загрузки
├── Pagination.tsx      # Пагинация
├── SearchField.tsx     # Поле поиска с debounce
├── StatusChip.tsx      # Chip статуса
└── index.ts           # Экспорты
```
