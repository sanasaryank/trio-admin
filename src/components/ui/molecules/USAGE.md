# Руководство по использованию Molecules

## Быстрый старт

### 1. Таблица данных с поиском и пагинацией

Полный пример реализации страницы со списком пользователей:

```tsx
import React, { useState, useCallback } from 'react';
import { Box, Stack } from '@mui/material';
import {
  DataTable,
  Pagination,
  SearchField,
  StatusChip,
  ActionMenu,
  EmptyState,
  LoadingOverlay,
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
  status: 'active' | 'blocked' | 'pending';
}

const UsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [sortColumn, setSortColumn] = useState<keyof User>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Определение колонок
  const columns: Column<User>[] = [
    {
      id: 'name',
      label: 'Имя',
      sortable: true,
      width: '30%'
    },
    {
      id: 'email',
      label: 'Email',
      sortable: true,
      width: '35%'
    },
    {
      id: 'status',
      label: 'Статус',
      width: '20%',
      render: (user) => <StatusChip status={user.status} />
    },
    {
      id: 'actions',
      label: 'Действия',
      width: '15%',
      render: (user) => (
        <ActionMenu
          items={[
            {
              label: 'Редактировать',
              icon: <EditIcon />,
              onClick: () => handleEdit(user),
            },
            {
              label: 'Удалить',
              icon: <DeleteIcon />,
              onClick: () => handleDelete(user),
              color: 'error',
            },
          ]}
        />
      ),
    },
  ];

  // Обработчики
  const handleEdit = (user: User) => {
    console.log('Редактирование:', user);
  };

  const handleDelete = (user: User) => {
    console.log('Удаление:', user);
  };

  const handleSort = (column: keyof User | string, direction: 'asc' | 'desc') => {
    setSortColumn(column as keyof User);
    setSortDirection(direction);
  };

  const handleAddUser = () => {
    console.log('Добавление пользователя');
  };

  // Пустое состояние
  if (users.length === 0 && !loading) {
    return (
      <EmptyState
        title="Нет пользователей"
        description="Добавьте первого пользователя"
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
    );
  }

  return (
    <Box p={3}>
      <Stack spacing={3}>
        {/* Панель управления */}
        <Box display="flex" gap={2}>
          <SearchField
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Поиск пользователей..."
          />
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAddUser}
          >
            Добавить
          </Button>
        </Box>

        {/* Таблица */}
        <DataTable
          columns={columns}
          data={users}
          loading={loading}
          onSort={handleSort}
          sortColumn={sortColumn}
          sortDirection={sortDirection}
          rowKey="id"
        />

        {/* Пагинация */}
        <Pagination
          page={page}
          totalPages={10}
          onPageChange={setPage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={setRowsPerPage}
        />
      </Stack>

      {/* Overlay загрузки */}
      <LoadingOverlay loading={loading} />
    </Box>
  );
};
```

### 2. Форма с фильтрами

Пример формы редактирования с drawer фильтров:

```tsx
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Stack } from '@mui/material';
import {
  FormField,
  FilterDrawer,
  LoadingOverlay,
} from '@/components/ui/molecules';
import { Button } from '@/components/ui/atoms';

const UserEditForm: React.FC = () => {
  const { control, handleSubmit } = useForm();
  const [filterOpen, setFilterOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (data: any) => {
    setSubmitting(true);
    try {
      // API запрос
      await saveUser(data);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack spacing={3}>
          <FormField
            name="name"
            control={control}
            label="Имя"
            type="text"
            required
          />

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
            required
          />

          <FormField
            name="isActive"
            control={control}
            label="Активен"
            type="switch"
          />

          <FormField
            name="receiveEmails"
            control={control}
            label="Получать уведомления"
            type="checkbox"
          />

          <FormField
            name="bio"
            control={control}
            label="О себе"
            type="text"
            multiline
            rows={4}
          />

          <Stack direction="row" spacing={2}>
            <Button type="submit" variant="contained">
              Сохранить
            </Button>
            <Button
              variant="outlined"
              onClick={() => setFilterOpen(true)}
            >
              Дополнительно
            </Button>
          </Stack>
        </Stack>
      </form>

      {/* Drawer с дополнительными настройками */}
      <FilterDrawer
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        onApply={() => {
          console.log('Применение фильтров');
          setFilterOpen(false);
        }}
        onReset={() => console.log('Сброс фильтров')}
        title="Дополнительные настройки"
      >
        <FormField
          name="department"
          control={control}
          label="Отдел"
          type="select"
          options={[
            { value: 'it', label: 'IT' },
            { value: 'hr', label: 'HR' },
            { value: 'sales', label: 'Продажи' },
          ]}
        />

        <FormField
          name="startDate"
          control={control}
          label="Дата начала работы"
          type="text"
        />
      </FilterDrawer>

      <LoadingOverlay
        loading={submitting}
        message="Сохранение данных..."
      />
    </>
  );
};
```

### 3. Кастомный рендеринг в таблице

Пример с различными типами данных в колонках:

```tsx
import React from 'react';
import { Avatar, Box, Typography } from '@mui/material';
import { DataTable, StatusChip, Column } from '@/components/ui/molecules';
import { Chip } from '@/components/ui/atoms';

interface Product {
  id: number;
  name: string;
  image: string;
  price: number;
  stock: number;
  status: 'available' | 'outofstock';
  tags: string[];
}

const ProductsTable: React.FC = () => {
  const columns: Column<Product>[] = [
    {
      id: 'image',
      label: 'Фото',
      width: '10%',
      render: (product) => (
        <Avatar src={product.image} alt={product.name} />
      ),
    },
    {
      id: 'name',
      label: 'Название',
      sortable: true,
      width: '30%',
    },
    {
      id: 'price',
      label: 'Цена',
      sortable: true,
      width: '15%',
      render: (product) => (
        <Typography fontWeight={600}>
          {product.price.toLocaleString('ru-RU')} ₽
        </Typography>
      ),
    },
    {
      id: 'stock',
      label: 'Остаток',
      sortable: true,
      width: '10%',
      render: (product) => (
        <Typography
          color={product.stock > 0 ? 'success.main' : 'error.main'}
        >
          {product.stock} шт
        </Typography>
      ),
    },
    {
      id: 'status',
      label: 'Статус',
      width: '15%',
      render: (product) => (
        <StatusChip
          status={product.status}
          label={product.status === 'available' ? 'В наличии' : 'Нет в наличии'}
        />
      ),
    },
    {
      id: 'tags',
      label: 'Теги',
      width: '20%',
      render: (product) => (
        <Box display="flex" gap={0.5} flexWrap="wrap">
          {product.tags.map((tag) => (
            <Chip key={tag} label={tag} size="small" />
          ))}
        </Box>
      ),
    },
  ];

  const products: Product[] = [
    // ... данные
  ];

  return (
    <DataTable
      columns={columns}
      data={products}
      rowKey="id"
    />
  );
};
```

## Советы и лучшие практики

### 1. Оптимизация производительности

```tsx
// ✅ ПРАВИЛЬНО: Мемоизация колонок и обработчиков
const columns = useMemo(() => [
  { id: 'name', label: 'Имя' },
  // ...
], []);

const handleSort = useCallback((column, direction) => {
  // ...
}, [dependencies]);

// ❌ НЕПРАВИЛЬНО: Создание новых объектов на каждый рендер
return (
  <DataTable
    columns={[{ id: 'name', label: 'Имя' }]} // Создается новый массив
    onSort={(col, dir) => handleSort(col, dir)} // Новая функция
  />
);
```

### 2. Типизация данных

```tsx
// ✅ ПРАВИЛЬНО: Строгая типизация
interface User {
  id: number;
  name: string;
  email: string;
}

const columns: Column<User>[] = [
  { id: 'name', label: 'Имя' },
  { id: 'email', label: 'Email' },
];

// ❌ НЕПРАВИЛЬНО: Без типов
const columns = [
  { id: 'name', label: 'Имя' },
];
```

### 3. Обработка ошибок

```tsx
const UserForm: React.FC = () => {
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (data: any) => {
    setSubmitting(true);
    setError(null);

    try {
      await saveUser(data);
    } catch (err) {
      setError('Ошибка при сохранении данных');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      {error && <Alert severity="error">{error}</Alert>}
      {/* Форма */}
      <LoadingOverlay loading={submitting} />
    </>
  );
};
```

### 4. Композиция компонентов

```tsx
// ✅ ПРАВИЛЬНО: Композиция маленьких компонентов
const UserRow = ({ user }: { user: User }) => (
  <Box display="flex" alignItems="center" gap={2}>
    <Avatar src={user.avatar} />
    <Typography>{user.name}</Typography>
    <StatusChip status={user.status} />
  </Box>
);

const columns: Column<User>[] = [
  {
    id: 'user',
    label: 'Пользователь',
    render: (user) => <UserRow user={user} />
  },
];
```

## Часто задаваемые вопросы

**Q: Как изменить цвет StatusChip для кастомного статуса?**

A: Передайте кастомный label и используйте стандартный Chip:

```tsx
import { Chip } from '@/components/ui/atoms';

<Chip label="Кастомный" color="primary" />
```

**Q: Как добавить вложенные поля в FormField?**

A: Используйте точечную нотацию:

```tsx
<FormField
  name="address.city"
  control={control}
  label="Город"
/>
```

**Q: Как кастомизировать пустое состояние таблицы?**

A: Используйте prop emptyMessage:

```tsx
<DataTable
  columns={columns}
  data={data}
  emptyMessage="Пользователи не найдены. Попробуйте изменить фильтры."
/>
```

**Q: Как добавить множественный выбор в Select?**

A: Используйте стандартный MUI Select напрямую или создайте новый компонент:

```tsx
import { Select as MuiSelect } from '@mui/material';

<MuiSelect
  multiple
  value={selectedValues}
  onChange={handleChange}
>
  {/* options */}
</MuiSelect>
```
