# TRIO SuperAdmin

This is the main administration panel for the TRIO restaurant management system.

## Features

### Restaurants Management
- View and manage all restaurants
- Block/unblock restaurants
- Edit restaurant details
- View audit logs
- Access statistics
- Check configuration errors
- Generate QR codes

### Dictionaries
- **Employees**: Manage staff members
- **Restaurant Types**: Configure restaurant categories
- **Menu Types**: Manage menu categories
- **Price Segments**: Define price ranges
- **Integration Types**: Configure integration options

### Statistics
- Staff actions tracking
- Usage analytics
- Error logging and monitoring

## Getting Started

### Installation

```bash
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

## Project Structure

- `/src/pages/restaurants` - Restaurant management pages
- `/src/pages/employees` - Employee management pages
- `/src/pages/dictionaries` - Dictionary management pages
- `/src/pages/statistics` - Statistics and analytics pages
- `/src/components` - Reusable UI components
- `/src/api` - API client and endpoints
- `/src/hooks` - Custom React hooks
- `/src/i18n` - Internationalization configuration

## Environment Configuration

See `docs/ENVIRONMENT.md` for environment variables configuration.
