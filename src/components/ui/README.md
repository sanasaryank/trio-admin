# UI Components Library

Библиотека переиспользуемых UI компонентов, построенная на принципах Atomic Design.

## Структура

```
ui/
├── atoms/          # Базовые строительные блоки
│   ├── Button.tsx
│   ├── TextField.tsx
│   ├── Select.tsx
│   ├── Switch.tsx
│   ├── Checkbox.tsx
│   ├── IconButton.tsx
│   ├── Chip.tsx
│   ├── Link.tsx
│   └── index.ts
│
├── molecules/      # Композитные функциональные компоненты
│   ├── DataTable.tsx
│   ├── Pagination.tsx
│   ├── FilterDrawer.tsx
│   ├── SearchField.tsx
│   ├── StatusChip.tsx
│   ├── FormField.tsx
│   ├── LoadingOverlay.tsx
│   ├── EmptyState.tsx
│   ├── ActionMenu.tsx
│   ├── example.tsx
│   └── index.ts
│
└── index.ts        # Главный файл экспорта
```

## Принципы

### Atomic Design

Библиотека следует принципам Atomic Design:

1. **Atoms (Атомы)** - минимальные неделимые компоненты
   - Button, TextField, Select и т.д.
   - Прямые обертки над MUI компонентами
   - Базовая функциональность и типизация

2. **Molecules (Молекулы)** - композитные компоненты
   - DataTable, SearchField, StatusChip и т.д.
   - Состоят из atoms
   - Самостоятельные функциональные блоки

3. **Organisms (Организмы)** - сложные композиции (планируется)
   - UserTable, LoginForm и т.д.
   - Состоят из molecules и atoms
   - Специфичные для бизнес-логики

## Особенности

### TypeScript

Все компоненты полностью типизированы:

```tsx
interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  // ...
}
```

### Оптимизация производительности

- **React.memo** - для предотвращения ненужных ре-рендеров
- **useCallback** - для мемоизации функций-обработчиков
- **useMemo** - для мемоизации вычисляемых значений
- **Debounce** - для оптимизации частых операций

### Material-UI

Все компоненты построены на MUI:
- Консистентный дизайн
- Темизация
- Доступность (a11y)
- Адаптивность

### JSDoc документация

Каждый компонент имеет:
- Описание назначения
- Примеры использования
- Описание props
- TypeScript типы

## Импорт

### Импорт из корня библиотеки

```tsx
import {
  // Atoms
  Button,
  TextField,
  Select,

  // Molecules
  DataTable,
  SearchField,
  StatusChip,
} from '@/components/ui';
```

### Импорт из категории

```tsx
import { Button, TextField } from '@/components/ui/atoms';
import { DataTable, SearchField } from '@/components/ui/molecules';
```

### Импорт типов

```tsx
import type {
  SelectOption,
  Column,
  DataTableProps,
} from '@/components/ui';
```

## Примеры использования

### Простая форма

```tsx
import { Button, TextField, Select } from '@/components/ui/atoms';

const SimpleForm = () => {
  return (
    <form>
      <TextField
        name="name"
        label="Имя"
        required
        fullWidth
      />
      <Select
        name="role"
        label="Роль"
        value={role}
        onChange={setRole}
        options={roleOptions}
        required
      />
      <Button type="submit" variant="contained">
        Сохранить
      </Button>
    </form>
  );
};
```

### Таблица с данными

```tsx
import { DataTable, SearchField, Pagination } from '@/components/ui/molecules';

const UsersTable = () => {
  const columns = [
    { id: 'name', label: 'Имя', sortable: true },
    { id: 'email', label: 'Email', sortable: true },
    {
      id: 'status',
      label: 'Статус',
      render: (user) => <StatusChip status={user.status} />
    },
  ];

  return (
    <>
      <SearchField
        value={search}
        onChange={setSearch}
        placeholder="Поиск..."
      />

      <DataTable
        columns={columns}
        data={users}
        loading={isLoading}
        onSort={handleSort}
        rowKey="id"
      />

      <Pagination
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
        rowsPerPage={pageSize}
        onRowsPerPageChange={setPageSize}
      />
    </>
  );
};
```

### Форма с react-hook-form

```tsx
import { FormField } from '@/components/ui/molecules';
import { useForm } from 'react-hook-form';

const UserForm = () => {
  const { control, handleSubmit } = useForm();

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <FormField
        name="email"
        control={control}
        label="Email"
        type="email"
        required
      />
      <FormField
        name="role"
        control={control}
        label="Роль"
        type="select"
        options={roleOptions}
        required
      />
      <FormField
        name="isActive"
        control={control}
        label="Активен"
        type="switch"
      />
    </form>
  );
};
```

## Зависимости

- React 18+
- Material-UI (@mui/material)
- React Hook Form (для FormField)
- TypeScript 4.5+

## Разработка

### Добавление нового компонента

1. Определите категорию (atoms/molecules/organisms)
2. Создайте файл с типизацией и JSDoc
3. Добавьте React.memo для оптимизации
4. Используйте useCallback/useMemo где необходимо
5. Добавьте экспорт в index.ts
6. Обновите документацию

### Лучшие практики

- Всегда используйте TypeScript типы
- Добавляйте JSDoc с примерами
- Используйте React.memo для предотвращения ре-рендеров
- Мемоизируйте функции и объекты
- Следуйте naming conventions MUI
- Проверяйте доступность (a11y)

## Лицензия

MIT
