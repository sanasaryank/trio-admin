# Environment Configuration Guide

## Overview

This project uses environment variables for configuration management. Variables are prefixed with `VITE_` to be accessible in the client-side code.

## Environment Files

- **`.env.example`** - Template file with all available variables (committed to git)
- **`.env.development`** - Development configuration (committed to git)
- **`.env.production`** - Production configuration (committed to git)
- **`.env`** - Local overrides (NOT committed to git)
- **`.env.local`** - Local overrides with higher priority (NOT committed to git)

## Available Variables

### Application Settings
- `VITE_APP_MODE` - Application mode (`development` | `production`)
- `VITE_APP_NAME` - Application name
- `VITE_APP_VERSION` - Application version

### API Configuration
- `VITE_API_BASE_URL` - Backend API base URL
- `VITE_API_TIMEOUT` - API request timeout in milliseconds
- `VITE_USE_MOCK_API` - Use mock API instead of real backend (`true` | `false`)

### Feature Flags
- `VITE_ENABLE_AUDIT_LOG` - Enable audit logging feature
- `VITE_ENABLE_QR_GENERATION` - Enable QR code generation

### Debug Settings
- `VITE_DEBUG_MODE` - Enable debug mode with console logs
- `VITE_LOG_LEVEL` - Logging level (`debug` | `info` | `warn` | `error`)

### Map Configuration
- `VITE_MAP_DEFAULT_CENTER_LAT` - Default map center latitude
- `VITE_MAP_DEFAULT_CENTER_LNG` - Default map center longitude
- `VITE_MAP_DEFAULT_ZOOM` - Default map zoom level

### Session Settings
- `VITE_SESSION_TIMEOUT` - Session timeout in milliseconds
- `VITE_TOKEN_REFRESH_INTERVAL` - Token refresh interval in milliseconds

## Usage in Code

Import the `env` object from the config:

```typescript
import { env } from '@config/env';

// Use environment variables
console.log(env.apiBaseUrl);
console.log(env.debugMode);
console.log(env.mapDefaultCenter);
```

Or use the utility functions:

```typescript
import { isDevelopment, isProduction } from '@config/env';

if (isDevelopment) {
  console.log('Running in development mode');
}
```

## Path Aliases

The following path aliases are configured for cleaner imports:

- `@/*` → `./src/*`
- `@components/*` → `./src/components/*`
- `@hooks/*` → `./src/hooks/*`
- `@api/*` → `./src/api/*`
- `@types/*` → `./src/types/*`
- `@utils/*` → `./src/utils/*`
- `@config/*` → `./src/config/*`
- `@assets/*` → `./src/assets/*`

Example usage:

```typescript
// Instead of:
import { Button } from '../../../components/ui/atoms/Button';

// Use:
import { Button } from '@components/ui/atoms/Button';
```

## Development Setup

1. Copy `.env.example` to `.env.development` (already done)
2. Modify values if needed for your local environment
3. Run the development server:
   ```bash
   npm run dev
   ```

## Production Build

1. Ensure `.env.production` has correct production values
2. Build the application:
   ```bash
   npm run build
   ```
3. The build will use variables from `.env.production`

## Local Overrides

Create a `.env` or `.env.local` file to override any variable locally without affecting the committed configuration files:

```bash
# .env.local
VITE_API_BASE_URL=http://localhost:8080/api
VITE_DEBUG_MODE=true
```

**Note:** These files are ignored by git and won't be committed.

## Vite Configuration

The `vite.config.ts` is configured with:

- **Path aliases** for cleaner imports
- **Manual chunk splitting** for better caching
- **Optimized dependencies** for faster dev server
- **Environment variable prefix** (`VITE_`)

## TypeScript Configuration

Path aliases are configured in both:
- `vite.config.ts` (for Vite bundler)
- `tsconfig.json` (for TypeScript compiler)

This ensures IntelliSense and type checking work correctly with path aliases.

## Best Practices

1. ✅ Never commit sensitive data (API keys, passwords) to `.env.example` or environment files
2. ✅ Use `.env.local` for sensitive local-only values
3. ✅ All environment variables must start with `VITE_` prefix
4. ✅ Use the `env` object from `@config/env` instead of `import.meta.env` directly
5. ✅ Add new variables to `.env.example` with documentation
6. ✅ Keep production values secure and separate from development

## Troubleshooting

### Environment variables not updating

1. Stop the dev server (`Ctrl+C`)
2. Restart: `npm run dev`
3. Vite requires restart to pick up environment variable changes

### TypeScript errors with path aliases

1. Ensure both `vite.config.ts` and `tsconfig.json` have matching path configurations
2. Restart TypeScript server in VS Code: `Ctrl+Shift+P` → "TypeScript: Restart TS Server"

### Import paths not resolving

1. Check that the path alias is defined in both configs
2. Ensure you're using the correct prefix (e.g., `@/` not `@`)
3. Restart dev server and TypeScript server
