# Trio Admin Panel

Админ-панель для управления сотрудниками, ресторанами и справочниками системы Trio.

## Технологический стек

- **Frontend Framework**: React 19 + TypeScript
- **Build Tool**: Vite 7
- **UI Library**: Material-UI (MUI) v7
- **Routing**: React Router v7
- **State Management**: Zustand
- **Forms**: React Hook Form + Zod
- **Maps**: Leaflet + React-Leaflet
- **Date Formatting**: date-fns

## Функциональность

### Реализованные модули

#### 1. Аутентификация
- Логин/логаут с серверными cookie (mock)
- Защита роутов
- Демо-учетные данные:
  - **Username**: `admin`
  - **Password**: `admin123`

#### 2. Сотрудники
- Список сотрудников с фильтрацией и сортировкой
- Создание и редактирование сотрудников
- Блокировка/разблокировка с подтверждением
- Просмотр журнала действий (audit log)
- Фильтры: поиск по имени, статус (Active/Blocked/All)

#### 3. Рестораны
- Список ресторанов с расширенными фильтрами
- Создание и редактирование ресторанов
- Интеграция с OpenStreetMap для выбора координат
- Управление QR кодами ресторана
- Блокировка/разблокировка
- Просмотр журнала действий
- Фильтры:
  - Поиск по ID/названию
  - Статус (Active/Blocked/All)
  - Страна, город, район
  - Тип ресторана, ценовой сегмент, тип меню, тип интеграции

#### 4. Справочники
Управление иерархическими справочниками:
- Типы ресторанов
- Ценовые сегменты
- Типы меню
- Типы интеграций
- Страны
- Города (с привязкой к странам)
- Районы (с привязкой к городам)

#### 5. QR Коды
- Просмотр QR кодов ресторана
- Массовое создание QR кодов (batch create)
- Блокировка/разблокировка отдельных QR кодов
- Отображение номера стола (из интеграции)

#### 6. Статистика (заглушка)
- Действия сотрудников
- Использование
- Журнал ошибок

## Mock API

Проект использует mock API с сохранением данных в `localStorage`:

### Особенности Mock API

1. **Персистентность**: все данные сохраняются между перезагрузками страницы
2. **Seed данные**: при первом запуске создаются тестовые записи
3. **Audit Log**: автоматическое логирование всех действий
4. **Реалистичные задержки**: имитация сетевых запросов

### Endpoints Mock API

#### Auth
- `POST /api/auth/login` - вход
- `GET /api/auth/me` - проверка сессии
- `POST /api/auth/logout` - выход

#### Employees
- `GET /api/employees` - список
- `POST /api/employees` - создание
- `GET /api/employees/:id` - получение по id
- `PUT /api/employees/:id` - обновление
- `PATCH /api/employees/:id/block` - блокировка

#### Restaurants
- `GET /api/restaurants` - список
- `POST /api/restaurants` - создание
- `GET /api/restaurants/:id` - получение по id
- `PUT /api/restaurants/:id` - обновление
- `PATCH /api/restaurants/:id/block` - блокировка
- `GET /api/restaurants/:id/qr` - список QR кодов
- `POST /api/restaurants/:id/qr/batch` - создание N QR кодов
- `PATCH /api/restaurants/:id/qr/:qrId/block` - блокировка QR

#### Dictionaries
- `GET /api/dictionaries/:dictKey` - список записей
- `POST /api/dictionaries/:dictKey` - создание
- `GET /api/dictionaries/:dictKey/:id` - получение по id
- `PUT /api/dictionaries/:dictKey/:id` - обновление
- `PATCH /api/dictionaries/:dictKey/:id/block` - блокировка

#### Audit
- `GET /api/audit` - журнал действий (с фильтрами)

## Установка и запуск

### Установка зависимостей

```bash
npm install
```

### Запуск в режиме разработки

```bash
npm run dev
```

Приложение будет доступно по адресу: http://localhost:5173

### Сборка для продакшена

```bash
npm run build
```

### Предварительный просмотр продакшен-сборки

```bash
npm run preview
```

## Структура проекта

```
src/
├── api/                    # API слой
│   ├── endpoints/          # API endpoints
│   └── mock/              # Mock API с localStorage
├── components/            # React компоненты
│   ├── ui/               # Переиспользуемые UI компоненты (NEW!)
│   │   ├── atoms/        # Базовые компоненты (Button, TextField, Select, etc.)
│   │   └── molecules/    # Составные компоненты (DataTable, Pagination, FilterDrawer, etc.)
│   ├── common/           # Общие компоненты приложения
│   ├── employees/        # Компоненты сотрудников
│   ├── restaurants/      # Компоненты ресторанов
│   └── dictionaries/     # Компоненты справочников
├── hooks/                # Custom React hooks (NEW!)
│   ├── useTableState     # Управление состоянием таблицы
│   ├── useFilters        # Управление фильтрами
│   ├── useFetch          # Загрузка данных
│   ├── useConfirmDialog  # Confirm диалоги
│   └── ...               # Другие hooks
├── pages/                # Страницы (роуты)
│   ├── auth/            # Страница логина
│   ├── employees/       # Страницы сотрудников
│   ├── restaurants/     # Страницы ресторанов
│   ├── dictionaries/    # Страницы справочников
│   └── statistics/      # Страницы статистики (заглушки)
├── layouts/             # Layout компоненты
├── store/               # Zustand store (auth)
├── types/               # TypeScript типы
├── utils/               # Утилиты
├── App.tsx             # Главный компонент приложения
└── main.tsx            # Точка входа
```

## Архитектура и Best Practices

### Переиспользуемые UI компоненты (Atomic Design)

Проект следует принципам **Atomic Design** с полностью переиспользуемыми компонентами:

#### Atoms (Базовые компоненты)
Находятся в `src/components/ui/atoms/`:
- **Button** - универсальная кнопка с loading state
- **TextField** - текстовое поле с валидацией
- **Select** - выпадающий список
- **Switch** - переключатель
- **Checkbox** - чекбокс
- **IconButton** - кнопка с иконкой и tooltip
- **Chip** - компактный элемент для тегов/статусов
- **Link** - ссылка с поддержкой external links

**Особенности:**
- Полная типизация TypeScript
- React.memo для оптимизации
- Все props опциональны с разумными defaults
- MUI компоненты как основа

#### Molecules (Составные компоненты)
Находятся в `src/components/ui/molecules/`:
- **DataTable** - универсальная таблица с сортировкой
- **Pagination** - пагинация с настройкой rows per page
- **FilterDrawer** - боковая панель фильтров
- **SearchField** - поле поиска с debounce
- **StatusChip** - отображение статусов
- **FormField** - обертка для полей формы с React Hook Form
- **LoadingOverlay** - overlay с индикатором загрузки
- **EmptyState** - пустое состояние
- **ActionMenu** - меню действий
- **ConfirmDialog** - диалог подтверждения

**Особенности:**
- Композиция из atoms
- useMemo и useCallback для оптимизации
- Generic типы для type safety
- Полная документация в JSDoc

### Custom Hooks

Вся бизнес-логика вынесена в переиспользуемые hooks (`src/hooks/`):

- **useTableState** - управление состоянием таблицы (сортировка, пагинация)
- **useFilters** - управление фильтрами с client-side применением
- **useFetch** - универсальный hook для API запросов
- **useConfirmDialog** - управление confirm диалогами
- **useFormSubmit** - обработка submit форм
- **useDrawer** - управление состоянием drawer
- **useToggle** - toggle булевых значений
- **useDebounce** - debounce значений
- **useLocalStorage** - работа с localStorage
- **useAuditLog** - загрузка audit events

**Преимущества:**
- Разделение логики и представления
- Переиспользование кода
- Легкое тестирование
- Type safety

### Оптимизация производительности

Проект использует все современные техники оптимизации React:

1. **React.memo** - все переиспользуемые компоненты обернуты в React.memo
2. **useCallback** - все обработчики событий мемоизированы
3. **useMemo** - все вычисляемые значения мемоизированы
4. **Lazy loading** - подготовлено для code splitting

### Принципы разработки

✅ **DRY (Don't Repeat Yourself)** - нет дублирования компонентов
✅ **Single Responsibility** - каждый компонент/hook делает одну вещь
✅ **Composition over Inheritance** - композиция компонентов
✅ **Type Safety** - полная типизация TypeScript
✅ **Performance First** - оптимизация через мемоизацию
✅ **Reusability** - все компоненты переиспользуемы

## Особенности реализации

### Форматирование дат
Все временные поля хранятся как Unix timestamp (в секундах). Для отображения используется функция `formatTimestamp` из `src/utils/dateUtils.ts`, которая форматирует даты в формате `DD.MM.YYYY HH:mm`.

### Блокировка сущностей
- Все сущности поддерживают `blocked` статус
- Операции блокировки требуют подтверждения через dialog
- По умолчанию в списках отображаются только активные записи
- Фильтр статуса: Active (default) / Blocked / All

### Пароли в форме ресторана
В режиме редактирования:
- Поле пароля пустое по умолчанию
- Checkbox "Сменить пароль" управляет редактированием пароля
- Если checkbox выключен - пароль не отправляется в API
- Если checkbox включен - пароль становится обязательным

### Иерархия справочников
- **Country → City → District**
- При выборе страны фильтруется список городов
- При выборе города фильтруется список районов
- Каскадная очистка зависимых полей

### Карта (Leaflet)
- Использует OpenStreetMap tiles
- Маркер можно перетаскивать (drag)
- Клик по карте устанавливает маркер
- Координаты отображаются под картой
- Default координаты: Москва (55.751244, 37.618423)

### Журнал действий (Audit)
Логируются следующие события:
- login/logout
- create/update сущностей
- block/unblock сущностей
- batch_create_qr
- изменения справочников

## MVP Критерии приёмки

✅ Работает логин и защита роутов
✅ Сотрудники: список/создание/редактирование/блокировка + аудит
✅ Рестораны: список/создание/редактирование/блокировка + QR + аудит
✅ Справочники: все секции + иерархия Country→City→District
✅ Все сортировки (кроме "Действия") работают
✅ Фильтры работают на клиенте, default "Активные"
✅ Временные поля отображаются корректно (UTC без сдвига)
✅ Карта OSM+Leaflet позволяет выбрать координаты ресторана
✅ Все данные переживают обновление страницы (localStorage)

## Примеры использования

### Использование переиспользуемых компонентов

```typescript
import { Button, TextField, Select } from '@/components/ui/atoms';
import { DataTable, FilterDrawer, FormField } from '@/components/ui/molecules';
import { useTableState, useFilters, useFetch } from '@/hooks';

// Atoms
<Button variant="contained" color="primary" loading={isSubmitting}>
  Сохранить
</Button>

<TextField
  name="email"
  label="Email"
  type="email"
  error={!!errors.email}
  helperText={errors.email}
/>

<Select
  name="status"
  label="Статус"
  value={status}
  onChange={setStatus}
  options={statusOptions}
/>

// Molecules
<DataTable
  columns={columns}
  data={paginatedData}
  sortColumn={sortColumn}
  sortDirection={sortDirection}
  onSort={handleSort}
  rowKey="id"
/>

// Hooks
const { paginatedData, handleSort, handlePageChange } = useTableState({
  data: filteredData,
  initialRowsPerPage: 10,
});

const { filters, updateFilter, resetFilters, applyFilters } = useFilters({
  search: '',
  status: 'active',
});

const { data, loading, error, refetch } = useFetch(() => employeesApi.list());
```

### Создание формы с React Hook Form

```typescript
import { FormField } from '@/components/ui/molecules';
import { Button } from '@/components/ui/atoms';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

const schema = z.object({
  name: z.string().min(1, 'Обязательное поле'),
  email: z.string().email('Некорректный email'),
  status: z.enum(['active', 'inactive']),
});

function MyForm() {
  const { control, handleSubmit } = useForm({
    resolver: zodResolver(schema),
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <FormField control={control} name="name" label="Имя" required />
      <FormField control={control} name="email" label="Email" type="email" required />
      <FormField control={control} name="status" label="Статус" type="select" options={statusOptions} />
      <Button type="submit" variant="contained">Сохранить</Button>
    </form>
  );
}
```

## Дальнейшее развитие

### Для интеграции с реальным бэкендом

1. Заменить mock API в `src/api/endpoints/*.ts` на реальные HTTP запросы
2. Обновить `authStore` для работы с реальными cookie
3. Добавить обработку реальных ошибок API
4. Реализовать серверную пагинацию и сортировку
5. Добавить загрузку изображений для ресторанов

### Возможные улучшения

- Добавить экспорт данных (CSV, Excel)
- Реализовать функционал статистики
- Добавить дашборд с метриками
- Реализовать права доступа (roles)
- Добавить темную тему
- Оптимизировать bundle size (code splitting)

## Лицензия

MIT
