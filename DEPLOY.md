# Static build and nginx deployment

Channel builds produce a static Vite export in `dist/`.

## Build commands

```bash
bun run build:dev
bun run build:stage
bun run build:prod
```

Each command selects its matching `.env.<channel>` file exactly and sets Vite's
mode automatically. Other Vite build arguments are forwarded:

```bash
bun run build:stage --minify=false
```

Do not pass `--mode`; the wrapper rejects conflicting mode arguments.

## Optional ZIP artifact

Packaging is opt-in:

```bash
bun run build:dev --zip
bun run build:stage --zip
bun run build:prod --zip
```

The wrapper consumes `--zip`, builds `dist/`, and creates
`<VERSION>_trio_superadmin_<channel>.zip`. The contents of `dist/` are placed
directly at the ZIP root. `VERSION`, not `package.json`, supplies the release
version.

## Hosts and nginx

| Channel | Host | Document base |
| --- | --- | --- |
| Development | `dev.admin.trio.am` | `/` |
| Stage | `stage.admin.trio.am` | `/` |
| Production | `admin.trio.am` | `/` |

Each host serves the contents of `dist/` at its root. A minimal SPA
configuration is:

```nginx
server {
  listen 443 ssl;
  server_name admin.trio.am;
  root /var/www/trio-admin/dist;
  index index.html;

  location / {
    try_files $uri $uri/ /index.html;
  }

  location /assets/ {
    expires 1y;
    add_header Cache-Control "public, immutable";
  }
}
```

Use the corresponding `server_name` and deployment directory for development
and stage. The `/index.html` fallback lets React Router handle non-file routes.

Preview a completed build with:

```bash
bun run preview
```
