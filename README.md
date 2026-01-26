# TRIO SuperAdmin

> Enterprise-grade administration panel for the TRIO restaurant management system

[![React](https://img.shields.io/badge/React-19.2.0-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9.3-blue.svg)](https://www.typescriptlang.org/)
[![Material-UI](https://img.shields.io/badge/MUI-7.3.7-blue.svg)](https://mui.com/)
[![Vite](https://img.shields.io/badge/Vite-7.3.1-purple.svg)](https://vitejs.dev/)

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Architecture](#architecture)
- [API Documentation](#api-documentation)
- [Development Guide](#development-guide)
- [Testing](#testing)
- [Deployment](#deployment)

## 🎯 Overview

TRIO SuperAdmin is a comprehensive administration platform for managing restaurants, employees, dictionaries, and analytics within the TRIO ecosystem. Built with modern React and TypeScript, it provides a robust, type-safe, and user-friendly interface for system administrators.

### Key Capabilities

- **Multi-Restaurant Management** - Centralized control over multiple restaurant locations
- **Employee Administration** - User management with role-based access control
- **Dictionary System** - Dynamic configuration of restaurant types, menu types, and more
- **Real-time Analytics** - Monitor system usage, errors, and staff actions
- **QR Code Generation** - Create and manage QR codes for restaurant tables
- **Audit Logging** - Comprehensive activity tracking for compliance and security
- **Internationalization** - Support for Armenian, Russian, and English languages
- **Responsive Design** - Optimized for desktop and tablet devices

## ✨ Features

### 🏪 Restaurant Management
- View and search all restaurants with advanced filtering
- Create, edit, and delete restaurant profiles
- Configure integration settings and connection data
- Block/unblock restaurants
- Generate QR codes for tables
- View restaurant activity status
- Access detailed audit logs per restaurant

### 👥 Employee Management
- Manage staff members across all restaurants
- Create and update employee profiles
- Block/unblock employee accounts
- Password management with secure updates
- Track employee activity

### 📚 Dictionary Management
- **Restaurant Types** - Fast food, fine dining, café, etc.
- **Menu Types** - Breakfast, lunch, dinner, drinks
- **Price Segments** - Budget, mid-range, premium
- **Integration Types** - POS system integrations
- **Placements** - Ad placement configurations
- **Locations** - Countries, cities, districts hierarchy

### 📊 Statistics & Analytics
- Real-time dashboard with key metrics
- Staff action tracking
- Error monitoring and logging
- Usage analytics
- Audit event history

### 🔐 Security Features
- HttpOnly cookie-based authentication
- Automatic session management
- Protected routes with authentication guards
- Audit logging for all critical actions
- Hash-based optimistic locking for data integrity

## 🛠️ Tech Stack

### Core Technologies
- **React 19.2** - UI library with latest features
- **TypeScript 5.9** - Type-safe development
- **Vite 7.3** - Lightning-fast build tool
- **Material-UI 7.3** - Comprehensive component library

### State Management
- **Zustand** - Lightweight state management
- **React Hook Form** - Performant form handling
- **Zod** - Schema validation

### Internationalization
- **i18next** - Translation framework
- **react-i18next** - React bindings
- Support for 3 languages (hy, ru, en)

### UI Components
- **Custom Design System** - Atomic design pattern
- **Material-UI** - Base component library
- **Notistack** - Toast notifications
- **Leaflet** - Interactive maps
- **QRCode.react** - QR code generation

### Development Tools
- **ESLint** - Code linting
- **Vitest** - Unit testing
- **Testing Library** - Component testing
- **TypeScript ESLint** - TypeScript-specific linting

## 🚀 Getting Started

### Prerequisites

- **Node.js** >= 18.0.0
- **npm** >= 9.0.0 or **yarn** >= 1.22.0
- Modern web browser (Chrome, Firefox, Safari, Edge)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd trio_superadmin_new
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment**
   ```bash
   # Copy example environment file
   cp .env.example .env.development
   
   # Edit environment variables as needed
   nano .env.development
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Open browser**
   Navigate to `http://localhost:5173`

### Quick Start Commands

```bash
# Development
npm run dev              # Start dev server with hot reload

# Building
npm run build            # Production build
npm run preview          # Preview production build

# Code Quality
npm run lint             # Run ESLint

# Testing
npm run test             # Run tests
npm run test:ui          # Run tests with UI
npm run test:coverage    # Run tests with coverage
```

## 📁 Project Structure

```
trio_superadmin_new/
├── src/
│   ├── api/                    # API client and endpoints
│   │   ├── client.ts           # Base API client with retry logic
│   │   ├── endpoints/          # API endpoint definitions
│   │   │   ├── auth.ts         # Authentication endpoints
│   │   │   ├── employees.ts    # Employee endpoints
│   │   │   ├── restaurants.ts  # Restaurant endpoints
│   │   │   ├── dictionaries.ts # Dictionary endpoints
│   │   │   └── audit.ts        # Audit log endpoints
│   │   └── real/               # Real API implementations
│   │       ├── client.ts       # Real API client with cookies
│   │       ├── auth.ts         # Auth implementation
│   │       └── ...
│   │
│   ├── components/             # React components
│   │   ├── common/             # Common shared components
│   │   │   ├── ErrorBoundary.tsx
│   │   │   ├── ProtectedRoute.tsx
│   │   │   └── LanguageSwitcher.tsx
│   │   ├── employees/          # Employee-specific components
│   │   ├── restaurants/        # Restaurant-specific components
│   │   ├── dictionaries/       # Dictionary-specific components
│   │   └── ui/                 # Design system components
│   │       ├── atoms/          # Basic UI elements
│   │       └── molecules/      # Composite components
│   │
│   ├── config/                 # Configuration files
│   │   └── env.ts              # Environment variable parsing
│   │
│   ├── hooks/                  # Custom React hooks
│   │   ├── useDebounce.ts      # Debounce hook
│   │   ├── useFetch.ts         # Data fetching hook
│   │   ├── useLocalStorage.ts  # LocalStorage hook
│   │   ├── useTableState.ts    # Table state management
│   │   └── ...
│   │
│   ├── i18n/                   # Internationalization
│   │   ├── config.ts           # i18next configuration
│   │   └── locales/            # Translation files
│   │       ├── en.json         # English
│   │       ├── hy.json         # Armenian
│   │       └── ru.json         # Russian
│   │
│   ├── layouts/                # Page layouts
│   │   └── MainLayout.tsx      # Main app layout
│   │
│   ├── pages/                  # Page components
│   │   ├── auth/               # Authentication pages
│   │   ├── employees/          # Employee pages
│   │   ├── restaurants/        # Restaurant pages
│   │   ├── dictionaries/       # Dictionary pages
│   │   └── statistics/         # Statistics pages
│   │
│   ├── store/                  # State management
│   │   └── authStore.ts        # Authentication store
│   │
│   ├── theme/                  # MUI theme configuration
│   │   └── index.ts            # Theme definition
│   │
│   ├── types/                  # TypeScript type definitions
│   │   └── index.ts            # Global types
│   │
│   ├── utils/                  # Utility functions
│   │   ├── logger.ts           # Logging utility
│   │   ├── dateUtils.ts        # Date formatting
│   │   └── ...
│   │
│   ├── App.tsx                 # Root component
│   ├── main.tsx                # Application entry point
│   └── index.css               # Global styles
│
├── docs/                       # Documentation
│   ├── API.md                  # API documentation
│   ├── COMPONENTS.md           # Component library guide
│   ├── HOOKS.md                # Custom hooks documentation
│   └── ENVIRONMENT.md          # Environment variables guide
│
├── public/                     # Static assets
│
├── .env.example                # Environment template
├── .env.development            # Development config
├── API_DOCUMENTATION.md        # API reference
├── eslint.config.js            # ESLint configuration
├── index.html                  # HTML template
├── package.json                # Dependencies
├── tsconfig.json               # TypeScript config
├── tsconfig.app.json           # App TypeScript config
├── tsconfig.node.json          # Node TypeScript config
└── vite.config.ts              # Vite configuration
```

## 🏗️ Architecture

### Design Patterns

**1. Atomic Design**
Components are organized using atomic design methodology:
- **Atoms** - Basic UI elements (Button, TextField, Checkbox)
- **Molecules** - Composite components (DataTable, FormField, Pagination)
- **Organisms** - Complex components (forms, lists)
- **Templates** - Page layouts
- **Pages** - Complete views

**2. Container/Presentational Pattern**
- Pages act as containers managing state and logic
- Components focus on presentation and reusability

**3. Custom Hooks Pattern**
Encapsulate reusable logic in custom hooks:
- `useFetch` - Data fetching with cancellation
- `useTableState` - Table state management
- `useFormSubmit` - Form submission handling
- `useDebounce` - Input debouncing

**4. Repository Pattern**
API layer abstracts data access:
- `api/endpoints/` - API interfaces
- `api/real/` - Real implementations

### State Management

**Zustand Store (Global State)**
- Authentication state
- User session
- Global UI state

**Component State (Local State)**
- Form inputs
- UI toggles
- Local data

**Server State**
- API responses cached in components
- Invalidation on mutations
- Optimistic updates with hash checking

### Authentication Flow

```
1. User submits login form
   ↓
2. POST /admin/auth/login with Basic Auth
   ↓
3. Server validates and sets HttpOnly cookie "admin_token"
   ↓
4. Response: {username, firstName, lastName}
   ↓
5. Store user in Zustand
   ↓
6. Redirect to dashboard
   ↓
7. All subsequent requests include cookie automatically
   ↓
8. On page load, call GET /admin/auth/me to restore session
```

### Data Flow

```
Component → Hook → API Endpoint → Real API Client → Server
    ↑                                                      ↓
    └──────────── Response ←──────────────────────────────┘
```

### Error Handling

**1. API Level**
- Request/response interceptors
- Automatic retry for network errors
- 401 redirects to login
- Error logging

**2. Component Level**
- Error boundaries for crash recovery
- Try-catch in async functions
- User-friendly error messages
- Toast notifications

**3. Form Level**
- Zod schema validation
- Real-time field validation
- Server error display

## 📖 API Documentation

See [docs/API.md](./docs/API.md) for complete API reference.

### Authentication

**Cookie-Based Authentication**
- Server sets `admin_token` HttpOnly cookie on login
- Cookie automatically included in all requests via `credentials: 'include'`
- No manual token management required

### Base URL
```
Development: https://dev.getmenu.am
Production: https://api.getmenu.am
```

### Key Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/admin/auth/login` | POST | Login with Basic Auth |
| `/admin/auth/me` | GET | Get current user |
| `/admin/auth/logout` | POST | Logout and clear cookie |
| `/admin/employees` | GET | List employees |
| `/admin/employees` | POST | Create employee |
| `/admin/employees/{id}` | PUT | Update employee |
| `/admin/restaurants` | GET | List restaurants |
| `/admin/restaurants` | POST | Create restaurant |
| `/admin/dictionaries/{key}` | GET | Get dictionary items |
| `/admin/audit` | GET | Get audit logs |

### Request/Response Format

All API requests and responses use JSON format:

```typescript
// Request Headers
{
  'Content-Type': 'application/json'
  // Cookie automatically included
}

// Success Response
{
  "data": { ... }
}

// Error Response
{
  "error": {
    "message": "Error description",
    "code": "ERROR_CODE"
  }
}
```

## 💻 Development Guide

### Code Style

**TypeScript**
- Use strict mode
- Explicit return types for functions
- Avoid `any` type
- Use interfaces for objects, types for unions

**React**
- Functional components only
- Hooks for state and side effects
- Props destructuring
- Named exports for components

**File Naming**
- PascalCase for components: `EmployeeList.tsx`
- camelCase for utilities: `dateUtils.ts`
- kebab-case for CSS: `employee-list.css`

### Component Development

**Example Component Structure**
```typescript
import { useState } from 'react';
import { Box, Typography } from '@mui/material';
import { Button } from '@components/ui/atoms/Button';
import type { Employee } from '@types';

interface EmployeeCardProps {
  employee: Employee;
  onEdit: (id: string) => void;
}

export const EmployeeCard = ({ employee, onEdit }: EmployeeCardProps) => {
  const [isHovered, setIsHovered] = useState(false);

  const handleEdit = () => {
    onEdit(employee.id);
  };

  return (
    <Box
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Typography variant="h6">{employee.firstName}</Typography>
      {isHovered && (
        <Button onClick={handleEdit}>Edit</Button>
      )}
    </Box>
  );
};
```

### Custom Hook Development

**Example Custom Hook**
```typescript
import { useState, useEffect } from 'react';

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}
```

### Adding New Pages

1. **Create page component** in `src/pages/`
2. **Add route** in `App.tsx`
3. **Add navigation** in `MainLayout.tsx`
4. **Add translations** in `i18n/locales/`
5. **Create API endpoints** if needed
6. **Add types** in `src/types/`

### Environment Variables

See [docs/ENVIRONMENT.md](./docs/ENVIRONMENT.md) for detailed configuration guide.

### Debugging

**Browser DevTools**
```typescript
// Enable debug mode in .env
VITE_DEBUG_MODE=true
VITE_LOG_LEVEL=debug
```

**React DevTools**
- Install React DevTools browser extension
- Inspect component hierarchy
- View props and state

**Network Debugging**
- Use browser Network tab
- Check request/response headers
- Verify cookie is sent

## 🧪 Testing

### Running Tests

```bash
# Run all tests
npm run test

# Run with UI
npm run test:ui

# Run with coverage
npm run test:coverage

# Run specific test file
npm run test -- useDebounce.test.ts

# Watch mode
npm run test -- --watch
```

### Writing Tests

**Component Test Example**
```typescript
import { render, screen } from '@testing-library/react';
import { EmployeeCard } from './EmployeeCard';

describe('EmployeeCard', () => {
  it('renders employee name', () => {
    const employee = {
      id: '1',
      firstName: 'John',
      lastName: 'Doe',
      username: 'john'
    };

    render(<EmployeeCard employee={employee} onEdit={() => {}} />);
    
    expect(screen.getByText('John')).toBeInTheDocument();
  });
});
```

**Hook Test Example**
```typescript
import { renderHook } from '@testing-library/react';
import { useDebounce } from './useDebounce';

describe('useDebounce', () => {
  it('debounces value changes', async () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'hello', delay: 500 } }
    );

    expect(result.current).toBe('hello');

    rerender({ value: 'world', delay: 500 });
    expect(result.current).toBe('hello'); // Still old value

    await new Promise(resolve => setTimeout(resolve, 600));
    expect(result.current).toBe('world'); // Updated
  });
});
```

## 🚀 Deployment

### Production Build

```bash
# Build for production
npm run build

# Preview production build locally
npm run preview
```

### Build Output

```
dist/
├── assets/
│   ├── index-[hash].js
│   ├── index-[hash].css
│   └── ...
└── index.html
```

### Environment Configuration

**Production .env**
```env
VITE_APP_MODE=production
VITE_API_BASE_URL=https://api.getmenu.am
VITE_USE_MOCK_API=false
VITE_DEBUG_MODE=false
VITE_LOG_LEVEL=error
```

### Deployment Platforms

**Vercel**
```bash
npm install -g vercel
vercel --prod
```

**Netlify**
```bash
npm install -g netlify-cli
netlify deploy --prod
```

**Docker**
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
CMD ["npm", "run", "preview"]
```

### Performance Optimization

- **Code splitting** - Lazy loading with React.lazy()
- **Tree shaking** - Automatic with Vite
- **Minification** - Enabled in production
- **Compression** - Enable gzip/brotli on server
- **CDN** - Serve static assets from CDN
- **Caching** - Set proper cache headers

---

**Built with ❤️ by the TRIO team**
