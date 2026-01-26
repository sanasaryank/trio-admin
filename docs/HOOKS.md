# Custom Hooks Documentation

Comprehensive guide to custom React hooks used in TRIO SuperAdmin.

## Table of Contents

- [useDebounce](#usedebounce)
- [useFetch](#usefetch)
- [useLocalStorage](#uselocalstorage)
- [useTableState](#usetablestate)
- [useFormSubmit](#useformsubmit)
- [useFilters](#usefilters)
- [useDrawer](#usedrawer)
- [useToggle](#usetoggle)
- [useConfirmDialog](#useconfirmdialog)
- [useAuditLog](#useauditlog)

---

## useDebounce

Delays updating a value until after a specified delay period has elapsed since the last change.

### Usage

```typescript
import { useDebounce } from '@hooks/useDebounce';

function SearchComponent() {
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  useEffect(() => {
    // API call only happens after 500ms of no typing
    if (debouncedSearchTerm) {
      fetchResults(debouncedSearchTerm);
    }
  }, [debouncedSearchTerm]);

  return (
    <input
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
    />
  );
}
```

### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `value` | `T` | Value to debounce |
| `delay` | `number` | Delay in milliseconds |

### Returns

`T` - Debounced value

### Use Cases

- Search input fields
- Auto-save functionality
- Resize event handlers
- Scroll event handlers

---

## useFetch

Handles data fetching with loading, error states, and automatic cancellation.

### Usage

```typescript
import { useFetch } from '@hooks/useFetch';
import { employeesApi } from '@api';

function EmployeesList() {
  const { data, loading, error, refetch } = useFetch(
    () => employeesApi.getAll(),
    [] // dependencies
  );

  if (loading) return <Loading />;
  if (error) return <Error message={error.message} />;
  if (!data) return null;

  return (
    <div>
      <button onClick={refetch}>Refresh</button>
      {data.map(emp => <div key={emp.id}>{emp.firstName}</div>)}
    </div>
  );
}
```

### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `fetchFn` | `() => Promise<T>` | Async function to fetch data |
| `deps` | `DependencyList` | Dependencies array (like useEffect) |

### Returns

```typescript
{
  data: T | null;          // Fetched data
  loading: boolean;        // Loading state
  error: Error | null;     // Error object if fetch failed
  refetch: () => Promise<void>; // Manual refetch function
}
```

### Features

- ✅ Automatic cancellation on deps change
- ✅ Prevents stale data overwrites
- ✅ Manual refetch capability
- ✅ Proper cleanup on unmount

### Use Cases

- Fetching data on component mount
- Refetching on dependency changes
- Manual data refresh

---

## useLocalStorage

Syncs state with browser localStorage with automatic persistence.

### Usage

```typescript
import { useLocalStorage } from '@hooks/useLocalStorage';

function ThemeSelector() {
  const [theme, setTheme] = useLocalStorage<'light' | 'dark'>('theme', 'light');

  return (
    <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
      Current theme: {theme}
    </button>
  );
}
```

### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `key` | `string` | localStorage key |
| `initialValue` | `T` | Default value if key doesn't exist |

### Returns

```typescript
[
  value: T,                          // Current value
  setValue: (value: T | ((prev: T) => T)) => void  // Setter function
]
```

### Features

- ✅ Automatic localStorage sync
- ✅ JSON serialization/deserialization
- ✅ Functional updates support
- ✅ SSR safe (checks for window)
- ✅ Error handling with logging
- ✅ Cross-tab synchronization

### Use Cases

- User preferences (theme, language)
- Form draft auto-save
- UI state persistence
- Cache management

---

## useTableState

Manages complex table state including pagination, sorting, and filtering.

### Usage

```typescript
import { useTableState } from '@hooks/useTableState';

function EmployeesTable() {
  const {
    page,
    rowsPerPage,
    sortField,
    sortDirection,
    handleChangePage,
    handleChangeRowsPerPage,
    handleSort,
    getSortedData
  } = useTableState({
    defaultSortField: 'firstName',
    defaultSortDirection: 'asc',
    defaultRowsPerPage: 25
  });

  const sortedEmployees = getSortedData(employees);

  return (
    <DataTable
      data={sortedEmployees}
      page={page}
      rowsPerPage={rowsPerPage}
      onPageChange={handleChangePage}
      onSort={handleSort}
      sortField={sortField}
      sortDirection={sortDirection}
    />
  );
}
```

### Parameters

```typescript
{
  defaultSortField?: string;
  defaultSortDirection?: 'asc' | 'desc';
  defaultRowsPerPage?: number;
}
```

### Returns

```typescript
{
  page: number;
  rowsPerPage: number;
  sortField: string | null;
  sortDirection: 'asc' | 'desc';
  handleChangePage: (newPage: number) => void;
  handleChangeRowsPerPage: (newRowsPerPage: number) => void;
  handleSort: (field: string) => void;
  getSortedData: <T>(data: T[]) => T[];
}
```

### Features

- ✅ Pagination management
- ✅ Multi-column sorting
- ✅ Sort direction toggling
- ✅ Nested field sorting support

### Use Cases

- Data tables
- Lists with pagination
- Sortable grids

---

## useFormSubmit

Handles form submission with loading state and error handling.

### Usage

```typescript
import { useFormSubmit } from '@hooks/useFormSubmit';
import { employeesApi } from '@api';

function EmployeeForm() {
  const { handleSubmit, isSubmitting, error } = useFormSubmit(
    async (data) => {
      await employeesApi.create(data);
      navigate('/employees');
    }
  );

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {error && <Alert severity="error">{error}</Alert>}
      {/* form fields */}
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Saving...' : 'Save'}
      </Button>
    </form>
  );
}
```

### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `submitFn` | `(data: T) => Promise<void>` | Async submit function |

### Returns

```typescript
{
  handleSubmit: (onSubmit: (data: T) => void) => (e: FormEvent) => Promise<void>;
  isSubmitting: boolean;
  error: string | null;
}
```

### Features

- ✅ Automatic loading state
- ✅ Error handling
- ✅ Form event prevention
- ✅ TypeScript support

---

## useFilters

Manages filter state for lists and tables.

### Usage

```typescript
import { useFilters } from '@hooks/useFilters';

function RestaurantsList() {
  const {
    filters,
    updateFilter,
    clearFilters,
    hasActiveFilters
  } = useFilters({
    search: '',
    blocked: 'all',
    cityId: null
  });

  const filteredRestaurants = restaurants.filter(r => {
    if (filters.search && !r.name.includes(filters.search)) return false;
    if (filters.blocked !== 'all' && r.blocked !== (filters.blocked === 'true')) return false;
    if (filters.cityId && r.cityId !== filters.cityId) return false;
    return true;
  });

  return (
    <>
      <FilterBar
        search={filters.search}
        onSearchChange={(value) => updateFilter('search', value)}
        blocked={filters.blocked}
        onBlockedChange={(value) => updateFilter('blocked', value)}
      />
      {hasActiveFilters && (
        <Button onClick={clearFilters}>Clear Filters</Button>
      )}
      <List items={filteredRestaurants} />
    </>
  );
}
```

### Parameters

```typescript
initialFilters: Record<string, any>
```

### Returns

```typescript
{
  filters: Record<string, any>;
  updateFilter: (key: string, value: any) => void;
  clearFilters: () => void;
  hasActiveFilters: boolean;
}
```

---

## useDrawer

Manages drawer/sidebar state with open/close functionality.

### Usage

```typescript
import { useDrawer } from '@hooks/useDrawer';

function AuditLogButton() {
  const { isOpen, open, close } = useDrawer();

  return (
    <>
      <Button onClick={open}>View Audit Log</Button>
      <Drawer open={isOpen} onClose={close}>
        <AuditLogContent />
      </Drawer>
    </>
  );
}
```

### Parameters

```typescript
initialState?: boolean  // default: false
```

### Returns

```typescript
{
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
}
```

---

## useToggle

Simple boolean state toggle.

### Usage

```typescript
import { useToggle } from '@hooks/useToggle';

function CollapsibleSection() {
  const [isExpanded, toggleExpanded] = useToggle(false);

  return (
    <div>
      <button onClick={toggleExpanded}>
        {isExpanded ? 'Collapse' : 'Expand'}
      </button>
      {isExpanded && <Content />}
    </div>
  );
}
```

### Parameters

```typescript
initialState?: boolean  // default: false
```

### Returns

```typescript
[
  state: boolean,
  toggle: () => void
]
```

---

## useConfirmDialog

Manages confirmation dialog state with promise-based API.

### Usage

```typescript
import { useConfirmDialog } from '@hooks/useConfirmDialog';

function DeleteButton({ employeeId }: { employeeId: string }) {
  const { confirm } = useConfirmDialog();

  const handleDelete = async () => {
    const confirmed = await confirm({
      title: 'Delete Employee',
      message: 'Are you sure you want to delete this employee?',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      severity: 'error'
    });

    if (confirmed) {
      await employeesApi.delete(employeeId);
    }
  };

  return <Button onClick={handleDelete}>Delete</Button>;
}
```

### Returns

```typescript
{
  confirm: (options: ConfirmOptions) => Promise<boolean>;
  ConfirmDialog: React.ComponentType; // Dialog component to render
}
```

### ConfirmOptions

```typescript
{
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  severity?: 'error' | 'warning' | 'info';
}
```

---

## useAuditLog

Fetches and manages audit log data for an entity.

### Usage

```typescript
import { useAuditLog } from '@hooks/useAuditLog';

function RestaurantAuditLog({ restaurantId }: { restaurantId: string }) {
  const { events, loading, error, refetch } = useAuditLog({
    entityType: 'restaurant',
    entityId: restaurantId,
    limit: 50
  });

  if (loading) return <Loading />;
  if (error) return <Error message={error.message} />;

  return (
    <div>
      <button onClick={refetch}>Refresh</button>
      {events.map(event => (
        <AuditEvent key={event.id} event={event} />
      ))}
    </div>
  );
}
```

### Parameters

```typescript
{
  entityType?: string;
  entityId?: string;
  actorId?: string;
  action?: string;
  startDate?: number;
  endDate?: number;
  limit?: number;
}
```

### Returns

```typescript
{
  events: AuditEvent[];
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}
```

---

## Best Practices

### Hook Composition

Combine hooks for complex functionality:

```typescript
function useRestaurantList() {
  const { data: restaurants, loading, error } = useFetch(
    () => restaurantsApi.getAll(),
    []
  );

  const { filters, updateFilter } = useFilters({
    search: '',
    blocked: 'all'
  });

  const debouncedSearch = useDebounce(filters.search, 300);

  const tableState = useTableState({
    defaultSortField: 'name',
    defaultRowsPerPage: 25
  });

  const filteredRestaurants = useMemo(() => {
    return restaurants?.filter(r => 
      r.name.includes(debouncedSearch) &&
      (filters.blocked === 'all' || r.blocked === (filters.blocked === 'true'))
    ) || [];
  }, [restaurants, debouncedSearch, filters.blocked]);

  const sortedRestaurants = tableState.getSortedData(filteredRestaurants);

  return {
    restaurants: sortedRestaurants,
    loading,
    error,
    filters,
    updateFilter,
    tableState
  };
}
```

### Performance Optimization

1. **Use dependencies correctly**
   ```typescript
   // Good - minimal dependencies
   const { data } = useFetch(() => api.get(id), [id]);
   
   // Bad - unnecessary dependencies
   const { data } = useFetch(() => api.get(id), [id, user, theme]);
   ```

2. **Memoize expensive operations**
   ```typescript
   const sortedData = useMemo(() => 
     tableState.getSortedData(data),
     [data, tableState.sortField, tableState.sortDirection]
   );
   ```

3. **Debounce user input**
   ```typescript
   const debouncedSearch = useDebounce(search, 300);
   ```

### Error Handling

Always handle errors from hooks:

```typescript
const { data, error, loading } = useFetch(fetchData, []);

if (error) {
  return <ErrorDisplay error={error} />;
}

if (loading) {
  return <LoadingSpinner />;
}

return <DataDisplay data={data} />;
```

### TypeScript

Use proper typing for hooks:

```typescript
// Good
const [theme, setTheme] = useLocalStorage<'light' | 'dark'>('theme', 'light');

// Bad
const [theme, setTheme] = useLocalStorage('theme', 'light'); // type is 'string'
```

---

**Last Updated:** January 26, 2026
