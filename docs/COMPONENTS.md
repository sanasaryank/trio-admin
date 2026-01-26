# Component Library Documentation

Complete guide to the TRIO SuperAdmin component library built on atomic design principles.

## Table of Contents

- [Overview](#overview)
- [Atoms](#atoms)
- [Molecules](#molecules)
- [Design System](#design-system)
- [Usage Guidelines](#usage-guidelines)

---

## Overview

The component library follows the **Atomic Design** methodology:

- **Atoms** - Basic building blocks (Button, TextField, Checkbox)
- **Molecules** - Combinations of atoms (FormField, Pagination, DataTable)
- **Organisms** - Complex components (Forms, Lists)
- **Templates** - Page layouts
- **Pages** - Complete views

### Import Paths

```typescript
// Atoms
import { Button, TextField, Select } from '@components/ui/atoms';

// Molecules
import { DataTable, FormField, Pagination } from '@components/ui/molecules';

// Specific imports
import { Button } from '@components/ui/atoms/Button';
import { DataTable } from '@components/ui/molecules/DataTable';
```

---

## Atoms

### Button

Enhanced Material-UI Button with consistent styling.

**Import:**
```typescript
import { Button } from '@components/ui/atoms/Button';
```

**Props:**
```typescript
interface ButtonProps extends MuiButtonProps {
  variant?: 'contained' | 'outlined' | 'text';
  color?: 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success';
  size?: 'small' | 'medium' | 'large';
  loading?: boolean;
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
}
```

**Usage:**
```typescript
// Primary button
<Button variant="contained" color="primary">
  Save
</Button>

// With loading state
<Button variant="contained" loading={isSubmitting}>
  Submit
</Button>

// With icon
<Button variant="outlined" startIcon={<AddIcon />}>
  Add Employee
</Button>

// Danger button
<Button variant="contained" color="error">
  Delete
</Button>
```

---

### TextField

Enhanced text input with validation support.

**Import:**
```typescript
import { TextField } from '@components/ui/atoms/TextField';
```

**Props:**
```typescript
interface TextFieldProps extends MuiTextFieldProps {
  label: string;
  error?: boolean;
  helperText?: string;
  required?: boolean;
  fullWidth?: boolean;
  multiline?: boolean;
  rows?: number;
  type?: 'text' | 'password' | 'email' | 'number' | 'url';
}
```

**Usage:**
```typescript
// Basic text field
<TextField
  label="First Name"
  value={firstName}
  onChange={(e) => setFirstName(e.target.value)}
  required
/>

// With error
<TextField
  label="Email"
  type="email"
  error={!!errors.email}
  helperText={errors.email}
  value={email}
  onChange={(e) => setEmail(e.target.value)}
/>

// Multiline
<TextField
  label="Description"
  multiline
  rows={4}
  value={description}
  onChange={(e) => setDescription(e.target.value)}
/>
```

---

### Select

Dropdown selection component.

**Import:**
```typescript
import { Select } from '@components/ui/atoms/Select';
```

**Props:**
```typescript
interface SelectProps {
  label: string;
  value: string | string[];
  onChange: (value: string | string[]) => void;
  options: Array<{ value: string; label: string }>;
  multiple?: boolean;
  required?: boolean;
  error?: boolean;
  helperText?: string;
  fullWidth?: boolean;
}
```

**Usage:**
```typescript
// Single select
<Select
  label="City"
  value={cityId}
  onChange={setCityId}
  options={cities.map(c => ({ value: c.id, label: c.name }))}
  required
/>

// Multi-select
<Select
  label="Restaurant Types"
  value={typeIds}
  onChange={setTypeIds}
  options={types.map(t => ({ value: t.id, label: t.name }))}
  multiple
/>
```

---

### Checkbox

Checkbox input with label.

**Import:**
```typescript
import { Checkbox } from '@components/ui/atoms/Checkbox';
```

**Usage:**
```typescript
<Checkbox
  label="Blocked"
  checked={blocked}
  onChange={(e) => setBlocked(e.target.checked)}
/>
```

---

### Switch

Toggle switch component.

**Import:**
```typescript
import { Switch } from '@components/ui/atoms/Switch';
```

**Usage:**
```typescript
<Switch
  label="Enable Feature"
  checked={enabled}
  onChange={(e) => setEnabled(e.target.checked)}
/>
```

---

### RadioGroup

Radio button group.

**Import:**
```typescript
import { RadioGroup } from '@components/ui/atoms/RadioGroup';
```

**Usage:**
```typescript
<RadioGroup
  label="Status"
  value={status}
  onChange={setStatus}
  options={[
    { value: 'all', label: 'All' },
    { value: 'active', label: 'Active' },
    { value: 'blocked', label: 'Blocked' }
  ]}
/>
```

---

### Autocomplete

Searchable dropdown with autocomplete.

**Import:**
```typescript
import { Autocomplete } from '@components/ui/atoms/Autocomplete';
```

**Usage:**
```typescript
<Autocomplete
  label="Select City"
  options={cities}
  getOptionLabel={(city) => city.name}
  value={selectedCity}
  onChange={(e, newValue) => setSelectedCity(newValue)}
/>
```

---

### Chip

Small label or tag component.

**Import:**
```typescript
import { Chip } from '@components/ui/atoms/Chip';
```

**Usage:**
```typescript
<Chip label="Active" color="success" />
<Chip label="Blocked" color="error" />
<Chip label="Pending" color="warning" />
```

---

### Link

Navigation link component.

**Import:**
```typescript
import { Link } from '@components/ui/atoms/Link';
```

**Usage:**
```typescript
<Link to="/employees">View Employees</Link>
<Link to={`/restaurants/${id}/edit`}>Edit</Link>
```

---

### IconButton

Button displaying only an icon.

**Import:**
```typescript
import { IconButton } from '@components/ui/atoms/IconButton';
```

**Usage:**
```typescript
<IconButton onClick={handleEdit} title="Edit">
  <EditIcon />
</IconButton>

<IconButton onClick={handleDelete} color="error" title="Delete">
  <DeleteIcon />
</IconButton>
```

---

## Molecules

### DataTable

Full-featured data table with sorting, pagination, and actions.

**Import:**
```typescript
import { DataTable } from '@components/ui/molecules/DataTable';
```

**Props:**
```typescript
interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  page?: number;
  rowsPerPage?: number;
  totalCount?: number;
  onPageChange?: (page: number) => void;
  onRowsPerPageChange?: (rowsPerPage: number) => void;
  onSort?: (field: string) => void;
  sortField?: string;
  sortDirection?: 'asc' | 'desc';
  onRowClick?: (row: T) => void;
  getRowId?: (row: T) => string;
  emptyMessage?: string;
}

interface Column<T> {
  field: keyof T | string;
  header: string;
  sortable?: boolean;
  render?: (row: T) => React.ReactNode;
  align?: 'left' | 'center' | 'right';
  width?: string | number;
}
```

**Usage:**
```typescript
const columns: Column<Employee>[] = [
  {
    field: 'firstName',
    header: 'First Name',
    sortable: true
  },
  {
    field: 'lastName',
    header: 'Last Name',
    sortable: true
  },
  {
    field: 'username',
    header: 'Username',
    sortable: true
  },
  {
    field: 'blocked',
    header: 'Status',
    render: (row) => (
      <Chip
        label={row.blocked ? 'Blocked' : 'Active'}
        color={row.blocked ? 'error' : 'success'}
      />
    ),
    align: 'center'
  },
  {
    field: 'actions',
    header: 'Actions',
    render: (row) => (
      <Box>
        <IconButton onClick={() => handleEdit(row.id)}>
          <EditIcon />
        </IconButton>
        <IconButton onClick={() => handleDelete(row.id)}>
          <DeleteIcon />
        </IconButton>
      </Box>
    ),
    align: 'right'
  }
];

<DataTable
  columns={columns}
  data={employees}
  loading={loading}
  page={page}
  rowsPerPage={rowsPerPage}
  onPageChange={handlePageChange}
  onSort={handleSort}
  sortField={sortField}
  sortDirection={sortDirection}
  emptyMessage="No employees found"
/>
```

---

### FormField

Wrapper for form inputs with consistent layout.

**Import:**
```typescript
import { FormField } from '@components/ui/molecules/FormField';
```

**Usage:**
```typescript
<FormField
  label="First Name"
  required
  error={errors.firstName}
>
  <TextField
    value={firstName}
    onChange={(e) => setFirstName(e.target.value)}
  />
</FormField>
```

---

### Pagination

Pagination controls for lists and tables.

**Import:**
```typescript
import { Pagination } from '@components/ui/molecules/Pagination';
```

**Props:**
```typescript
interface PaginationProps {
  page: number;
  rowsPerPage: number;
  totalCount: number;
  onPageChange: (page: number) => void;
  onRowsPerPageChange: (rowsPerPage: number) => void;
  rowsPerPageOptions?: number[];
}
```

**Usage:**
```typescript
<Pagination
  page={page}
  rowsPerPage={rowsPerPage}
  totalCount={totalEmployees}
  onPageChange={setPage}
  onRowsPerPageChange={setRowsPerPage}
  rowsPerPageOptions={[10, 25, 50, 100]}
/>
```

---

### EmptyState

Display message when no data is available.

**Import:**
```typescript
import { EmptyState } from '@components/ui/molecules/EmptyState';
```

**Usage:**
```typescript
<EmptyState
  icon={<InboxIcon />}
  title="No employees found"
  message="Get started by creating your first employee."
  action={
    <Button onClick={handleCreate}>
      Add Employee
    </Button>
  }
/>
```

---

### LoadingOverlay

Full-screen or container loading indicator.

**Import:**
```typescript
import { LoadingOverlay } from '@components/ui/molecules/LoadingOverlay';
```

**Usage:**
```typescript
<Box position="relative">
  <LoadingOverlay visible={isLoading} />
  <Content />
</Box>
```

---

### ActionMenu

Dropdown menu for row actions.

**Import:**
```typescript
import { ActionMenu } from '@components/ui/molecules/ActionMenu';
```

**Usage:**
```typescript
<ActionMenu
  actions={[
    {
      label: 'Edit',
      icon: <EditIcon />,
      onClick: () => handleEdit(row.id)
    },
    {
      label: 'View Audit Log',
      icon: <HistoryIcon />,
      onClick: () => handleViewAudit(row.id)
    },
    { divider: true },
    {
      label: 'Delete',
      icon: <DeleteIcon />,
      onClick: () => handleDelete(row.id),
      color: 'error'
    }
  ]}
/>
```

---

### ConfirmDialog

Confirmation dialog for destructive actions.

**Import:**
```typescript
import { ConfirmDialog } from '@components/ui/molecules/ConfirmDialog';
```

**Usage:**
```typescript
const [confirmOpen, setConfirmOpen] = useState(false);

<>
  <Button onClick={() => setConfirmOpen(true)}>
    Delete
  </Button>

  <ConfirmDialog
    open={confirmOpen}
    onClose={() => setConfirmOpen(false)}
    onConfirm={handleConfirmedDelete}
    title="Delete Employee"
    message="Are you sure you want to delete this employee? This action cannot be undone."
    confirmText="Delete"
    cancelText="Cancel"
    severity="error"
  />
</>
```

---

### FilterDrawer

Sidebar drawer for filters.

**Import:**
```typescript
import { FilterDrawer } from '@components/ui/molecules/FilterDrawer';
```

**Usage:**
```typescript
<FilterDrawer
  open={filtersOpen}
  onClose={() => setFiltersOpen(false)}
  onApply={handleApplyFilters}
  onClear={handleClearFilters}
>
  <TextField
    label="Search"
    value={filters.search}
    onChange={(e) => updateFilter('search', e.target.value)}
  />
  <Select
    label="Status"
    value={filters.status}
    onChange={(value) => updateFilter('status', value)}
    options={statusOptions}
  />
</FilterDrawer>
```

---

## Design System

### Colors

```typescript
// Primary
primary.main: '#1976d2'
primary.light: '#42a5f5'
primary.dark: '#1565c0'

// Secondary
secondary.main: '#dc004e'
secondary.light: '#f73378'
secondary.dark: '#9a0036'

// Error
error.main: '#d32f2f'

// Warning
warning.main: '#ed6c02'

// Success
success.main: '#2e7d32'

// Info
info.main: '#0288d1'
```

### Typography

```typescript
// Headings
h1: { fontSize: '2.5rem', fontWeight: 700 }
h2: { fontSize: '2rem', fontWeight: 700 }
h3: { fontSize: '1.75rem', fontWeight: 600 }
h4: { fontSize: '1.5rem', fontWeight: 600 }
h5: { fontSize: '1.25rem', fontWeight: 600 }
h6: { fontSize: '1rem', fontWeight: 600 }

// Body
body1: { fontSize: '1rem' }
body2: { fontSize: '0.875rem' }

// Button
button: { fontSize: '0.875rem', fontWeight: 600, textTransform: 'none' }
```

### Spacing

```typescript
// Using 8px base unit
theme.spacing(1)  // 8px
theme.spacing(2)  // 16px
theme.spacing(3)  // 24px
theme.spacing(4)  // 32px
```

### Breakpoints

```typescript
xs: 0px
sm: 600px
md: 900px
lg: 1200px
xl: 1536px
```

---

## Usage Guidelines

### Form Layout

```typescript
<Box component="form" onSubmit={handleSubmit}>
  <Grid container spacing={3}>
    <Grid item xs={12} md={6}>
      <TextField
        label="First Name"
        value={firstName}
        onChange={(e) => setFirstName(e.target.value)}
        required
        fullWidth
      />
    </Grid>
    
    <Grid item xs={12} md={6}>
      <TextField
        label="Last Name"
        value={lastName}
        onChange={(e) => setLastName(e.target.value)}
        required
        fullWidth
      />
    </Grid>

    <Grid item xs={12}>
      <Select
        label="City"
        value={cityId}
        onChange={setCityId}
        options={cities}
        required
        fullWidth
      />
    </Grid>

    <Grid item xs={12}>
      <Box display="flex" gap={2} justifyContent="flex-end">
        <Button variant="outlined" onClick={handleCancel}>
          Cancel
        </Button>
        <Button variant="contained" type="submit">
          Save
        </Button>
      </Box>
    </Grid>
  </Grid>
</Box>
```

### List Page Layout

```typescript
<Box>
  {/* Header */}
  <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
    <Typography variant="h4">Employees</Typography>
    <Button
      variant="contained"
      startIcon={<AddIcon />}
      onClick={handleCreate}
    >
      Add Employee
    </Button>
  </Box>

  {/* Filters */}
  <Box mb={3}>
    <TextField
      label="Search"
      value={search}
      onChange={(e) => setSearch(e.target.value)}
      fullWidth
    />
  </Box>

  {/* Table */}
  <DataTable
    columns={columns}
    data={employees}
    loading={loading}
    {...tableProps}
  />
</Box>
```

### Responsive Design

```typescript
// Stack on mobile, row on desktop
<Box
  display="flex"
  flexDirection={{ xs: 'column', md: 'row' }}
  gap={2}
>
  <Box flex={1}>Content 1</Box>
  <Box flex={1}>Content 2</Box>
</Box>

// Hide on mobile
<Box display={{ xs: 'none', md: 'block' }}>
  Desktop only content
</Box>

// Different sizes
<Grid container spacing={2}>
  <Grid item xs={12} sm={6} md={4}>
    Item
  </Grid>
</Grid>
```

### Accessibility

```typescript
// Always provide labels
<TextField label="Email" aria-label="Email address" />

// Use semantic HTML
<Button component="a" href="/help">Help</Button>

// Keyboard navigation
<IconButton title="Edit" aria-label="Edit employee">
  <EditIcon />
</IconButton>

// Focus management
const inputRef = useRef<HTMLInputElement>(null);
useEffect(() => {
  inputRef.current?.focus();
}, []);
```

---

**Last Updated:** January 26, 2026
