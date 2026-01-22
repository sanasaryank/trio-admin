# Project Separation Summary

This document outlines the separation of the TRIO project into two distinct applications: **SuperAdmin** and **Ads Server**.

## Project Structure

### Location
- **Admin Project**: `c:\Users\user\Documents\trio_superadmin_new`
- **Ads Server Project**: `c:\Users\user\Documents\trio_ad_server`

## Trio SuperAdmin

### Purpose
Main administration panel for managing the TRIO restaurant management system.

### Features
1. **Restaurants Management**
   - View and manage all restaurants
   - Block/unblock restaurants
   - Edit restaurant details (full CRUD)
   - View audit logs
   - Access statistics
   - Check configuration errors
   - Generate QR codes

2. **Dictionaries**
   - Employees
   - Restaurant Types
   - Menu Types
   - Price Segments
   - Integration Types

3. **Statistics**
   - Staff actions tracking
   - Usage analytics
   - Error logging

### Included Components
- `/src/pages/auth` - Authentication pages
- `/src/pages/restaurants` - Full restaurant management
- `/src/pages/employees` - Employee management
- `/src/pages/dictionaries` - Dictionary management
- `/src/pages/statistics` - Statistics pages
- `/src/components/restaurants` - Restaurant-specific components (including RestaurantFormDialog, LocationPicker, ConnectionDataFields, RestaurantQRPage)
- `/src/components/employees` - Employee-specific components
- `/src/components/dictionaries` - Dictionary-specific components

### API Endpoints
- `authApi` - Authentication
- `employeesApi` - Employee management
- `restaurantsApi` - Restaurant management
- `dictionariesApi` - Dictionary data
- `auditApi` - Audit logging

### Mock Data
- `mockAuthApi`
- `mockEmployeesApi`
- `mockRestaurantsApi`
- `mockDictionariesApi`
- `mockAuditApi`

## Trio Ads Server

### Purpose
Advertisement management server for the TRIO restaurant system.

### Features
1. **Restaurants Management** (Limited)
   - View all restaurants
   - Block/unblock restaurants
   - View statistics
   - Configure campaign targeting
   - **Note**: Cannot edit, create, or view QR codes

2. **Dictionaries**
   - Ads Slots (Placements)
   - Schedules

3. **Advertisement**
   - Advertisers
   - Campaigns
   - Creatives

4. **Statistics**
   - Staff actions tracking
   - Usage analytics
   - Error logging

### Included Components
- `/src/pages/auth` - Authentication pages
- `/src/pages/restaurants` - Limited restaurant management (view, block, targeting)
- `/src/pages/dictionaries` - Dictionary management (ads-related only)
- `/src/pages/advertisement` - Advertisement management pages
- `/src/pages/statistics` - Statistics pages
- `/src/components/restaurants` - Restaurant-specific components (excluding edit forms)
- `/src/components/campaigns` - Campaign-specific components
- `/src/components/dictionaries` - Dictionary-specific components

### API Endpoints
- `authApi` - Authentication
- `restaurantsApi` - Restaurant management (read-only + block)
- `dictionariesApi` - Dictionary data (ads-related + fetches restaurant metadata from admin API)
- `auditApi` - Audit logging
- `advertisersApi` - Advertiser management
- `campaignsApi` - Campaign management
- `creativesApi` - Creative management
- `schedulesApi` - Schedule management

### Mock Data
- `mockAuthApi`
- `mockRestaurantsApi`
- `mockDictionariesApi`
- `mockAuditApi`
- `schedulesApiMock`
- `advertisers` (mock data)
- `campaigns` (mock data)
- `creatives` (mock data)

### Important Note
Restaurant metadata (types, menu types, price segments, etc.) should be retrieved via API from the main admin system, not managed directly in the ads server.

## Shared Components

Both projects share the following components and utilities:

### Common Components
- `/src/components/common` - Common UI components (ErrorBoundary, ProtectedRoute, LanguageSwitcher, AuditDrawer, ConfirmDialog)
- `/src/components/ui` - Reusable UI atoms and molecules

### Infrastructure
- `/src/config` - Environment configuration
- `/src/hooks` - Custom React hooks
- `/src/i18n` - Internationalization
- `/src/layouts` - Layout components (customized per project)
- `/src/store` - State management
- `/src/theme` - Theme configuration
- `/src/types` - TypeScript type definitions
- `/src/utils` - Utility functions

### Configuration Files
- `package.json` - Updated with project-specific names
- `tsconfig.json` - TypeScript configuration
- `vite.config.ts` - Vite configuration
- `eslint.config.js` - ESLint configuration

## Key Differences

| Feature | SuperAdmin | Ads Server |
|---------|------------|------------|
| Restaurant CRUD | ✓ Full | ✗ Read-only + Block |
| Restaurant QR Codes | ✓ | ✗ |
| Restaurant Configuration Errors | ✓ | ✗ |
| Employee Management | ✓ | ✗ |
| Restaurant Types Dictionary | ✓ | API only |
| Menu Types Dictionary | ✓ | API only |
| Price Segments Dictionary | ✓ | API only |
| Integration Types Dictionary | ✓ | API only |
| Placements Dictionary | ✗ | ✓ |
| Schedules Management | ✗ | ✓ |
| Advertisers Management | ✗ | ✓ |
| Campaigns Management | ✗ | ✓ |
| Creatives Management | ✗ | ✓ |
| Campaign Targeting | ✗ | ✓ |

## Navigation Menu

### SuperAdmin Menu
```
- Restaurants
- Dictionaries
  - Employees
  - Restaurant Types
  - Menu Types
  - Price Segments
  - Integration Types
- Statistics
  - Staff Actions
  - Usage
  - Error Log
```

### Ads Server Menu
```
- Restaurants
- Dictionaries
  - Ads Slots (Placements)
  - Schedules
- Advertisement
  - Advertisers
  - Campaigns
  - Creatives
- Statistics
  - Staff Actions
  - Usage
  - Error Log
```

## Getting Started

### Installation

For both projects:
```bash
cd [project_directory]
npm install
```

### Development

```bash
npm run dev
```

### Build

```bash
npm run build
```

## Next Steps

1. Review the restaurants list page in Ads Server to ensure only appropriate actions are available
2. Update API client configuration if the two projects need to communicate
3. Configure environment variables for each project (see `docs/ENVIRONMENT.md`)
4. Test all functionality in both projects
5. Update deployment configurations
6. Document any additional differences in behavior

## Migration Notes

- The original project is preserved in `c:\Users\user\Documents\trio_superadmin`
- All necessary files, including mock data and API clients, have been copied to both new projects
- The project structure remains consistent with reusable components and styles
- Each project has its own `package.json` with appropriate project names
