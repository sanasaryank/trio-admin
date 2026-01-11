# Molecules - Быстрый старт

Краткое руководство по началу работы с библиотекой molecules.

## 🚀 Установка

Компоненты уже готовы к использованию! Убедитесь, что у вас установлены зависимости:

```bash
npm install @mui/material @mui/icons-material react-hook-form
```

## 📦 Импорт

```typescript
import {
  DataTable,
  Pagination,
  SearchField,
  StatusChip,
  FormField,
  FilterDrawer,
  LoadingOverlay,
  EmptyState,
  ActionMenu,
} from '@/components/ui/molecules';
```

## 💡 Базовые примеры

### 1. Таблица данных

```typescript
import { DataTable, Column } from '@/components/ui/molecules';

interface User {
  id: number;
  name: string;
  email: string;
}

const columns: Column<User>[] = [
  { id: 'name', label: 'Имя', sortable: true },
  { id: 'email', label: 'Email', sortable: true },
];

function UsersTable() {
  const [users, setUsers] = useState<User[]>([]);

  return (
    <DataTable
      columns={columns}
      data={users}
      rowKey="id"
    />
  );
}
```

### 2. Поиск

```typescript
import { SearchField } from '@/components/ui/molecules';

function SearchUsers() {
  const [search, setSearch] = useState('');

  return (
    <SearchField
      value={search}
      onChange={setSearch}
      placeholder="Поиск..."
    />
  );
}
```

### 3. Пагинация

```typescript
import { Pagination } from '@/components/ui/molecules';

function UsersPagination() {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  return (
    <Pagination
      page={page}
      totalPages={10}
      onPageChange={setPage}
      rowsPerPage={rowsPerPage}
      onRowsPerPageChange={setRowsPerPage}
    />
  );
}
```

### 4. Статус

```typescript
import { StatusChip } from '@/components/ui/molecules';

function UserStatus({ status }: { status: string }) {
  return <StatusChip status={status} />;
}

// Использование:
// <UserStatus status="active" />    // Зеленый
// <UserStatus status="blocked" />   // Красный
// <UserStatus status="pending" />   // Желтый
```

### 5. Форма

```typescript
import { FormField } from '@/components/ui/molecules';
import { useForm } from 'react-hook-form';

function UserForm() {
  const { control, handleSubmit } = useForm();

  const onSubmit = (data: any) => {
    console.log(data);
  };

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
        options={[
          { value: 'admin', label: 'Администратор' },
          { value: 'user', label: 'Пользователь' },
        ]}
      />

      <button type="submit">Сохранить</button>
    </form>
  );
}
```

### 6. Меню действий

```typescript
import { ActionMenu } from '@/components/ui/molecules';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

function UserActions() {
  return (
    <ActionMenu
      items={[
        {
          label: 'Редактировать',
          icon: <EditIcon />,
          onClick: () => console.log('Edit'),
        },
        {
          label: 'Удалить',
          icon: <DeleteIcon />,
          onClick: () => console.log('Delete'),
          color: 'error',
        },
      ]}
    />
  );
}
```

### 7. Пустое состояние

```typescript
import { EmptyState } from '@/components/ui/molecules';
import { Button } from '@/components/ui/atoms';
import AddIcon from '@mui/icons-material/Add';

function NoUsers() {
  return (
    <EmptyState
      title="Нет пользователей"
      description="Добавьте первого пользователя"
      action={
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => console.log('Add user')}
        >
          Добавить
        </Button>
      }
    />
  );
}
```

### 8. Загрузка

```typescript
import { LoadingOverlay } from '@/components/ui/molecules';

function SaveData() {
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await saveData();
    setSaving(false);
  };

  return (
    <>
      <button onClick={handleSave}>Сохранить</button>
      <LoadingOverlay loading={saving} message="Сохранение..." />
    </>
  );
}
```

### 9. Фильтры

```typescript
import { FilterDrawer } from '@/components/ui/molecules';
import { TextField } from '@/components/ui/atoms';

function Filters() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button onClick={() => setOpen(true)}>Фильтры</button>

      <FilterDrawer
        open={open}
        onClose={() => setOpen(false)}
        onApply={() => console.log('Apply')}
        onReset={() => console.log('Reset')}
      >
        <TextField name="search" label="Поиск" />
        {/* Другие фильтры */}
      </FilterDrawer>
    </>
  );
}
```

## 🎯 Полный пример

Страница со списком пользователей:

```typescript
import React, { useState } from 'react';
import { Box, Stack } from '@mui/material';
import {
  DataTable,
  Pagination,
  SearchField,
  StatusChip,
  ActionMenu,
  Column,
} from '@/components/ui/molecules';
import { Button } from '@/components/ui/atoms';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

interface User {
  id: number;
  name: string;
  email: string;
  status: 'active' | 'blocked';
}

function UsersPage() {
  const [users] = useState<User[]>([
    { id: 1, name: 'Иван', email: 'ivan@mail.ru', status: 'active' },
    { id: 2, name: 'Петр', email: 'petr@mail.ru', status: 'blocked' },
  ]);

  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const columns: Column<User>[] = [
    { id: 'name', label: 'Имя', sortable: true },
    { id: 'email', label: 'Email', sortable: true },
    {
      id: 'status',
      label: 'Статус',
      render: (user) => <StatusChip status={user.status} />,
    },
    {
      id: 'actions',
      label: 'Действия',
      render: (user) => (
        <ActionMenu
          items={[
            {
              label: 'Редактировать',
              icon: <EditIcon />,
              onClick: () => console.log('Edit', user),
            },
            {
              label: 'Удалить',
              icon: <DeleteIcon />,
              onClick: () => console.log('Delete', user),
              color: 'error',
            },
          ]}
        />
      ),
    },
  ];

  return (
    <Box p={3}>
      <Stack spacing={3}>
        <Box display="flex" gap={2}>
          <SearchField
            value={search}
            onChange={setSearch}
            placeholder="Поиск пользователей..."
          />
          <Button variant="contained" startIcon={<AddIcon />}>
            Добавить
          </Button>
        </Box>

        <DataTable columns={columns} data={users} rowKey="id" />

        <Pagination
          page={page}
          totalPages={5}
          onPageChange={setPage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={setRowsPerPage}
        />
      </Stack>
    </Box>
  );
}

export default UsersPage;
```

## 📚 Дополнительно

- **Полная документация**: См. `README.md`
- **Подробные примеры**: См. `USAGE.md`
- **Справочник API**: См. `COMPONENTS.md`
- **Рабочий пример**: См. `example.tsx`

## 🔗 TypeScript

Все компоненты полностью типизированы:

```typescript
// Автоматическая типизация
const columns: Column<User>[] = [
  { id: 'name', label: 'Имя' }, // id автоматически типизируется как keyof User
];

// Экспорт типов
import type {
  Column,
  DataTableProps,
  PaginationProps,
  MenuItemConfig
} from '@/components/ui/molecules';
```

## ⚡ Оптимизация

Все компоненты оптимизированы:

- ✅ React.memo
- ✅ useCallback
- ✅ useMemo
- ✅ Debounce (SearchField)

## 🎨 Кастомизация

Все компоненты поддерживают темизацию MUI:

```typescript
import { ThemeProvider, createTheme } from '@mui/material';

const theme = createTheme({
  palette: {
    primary: { main: '#1976d2' },
    success: { main: '#47BE7D' },
    error: { main: '#d32f2f' },
  },
});

<ThemeProvider theme={theme}>
  <App />
</ThemeProvider>
```

## 🆘 Помощь

Если что-то не работает:

1. Проверьте установку зависимостей
2. Убедитесь в правильности импортов
3. Проверьте типы данных
4. См. примеры в `example.tsx`
5. См. полную документацию

## ✅ Готово!

Теперь вы можете использовать все компоненты в вашем проекте!
