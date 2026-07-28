# Environment configuration

All browser-visible settings use the `VITE_` prefix.

## Environment files

- `.env` contains shared defaults for ordinary local development.
- `.env.local` is developer-owned and ignored. Create it from
  `.env.local.example`.
- `.env.dev`, `.env.stage`, and `.env.prod` are the complete, committed channel
  selections used by exact local commands and channel builds.
- Matching `.example` files document each committed selection.

The exact channel commands deliberately discard inherited `VITE_*` variables
and disable Vite's normal environment-file merging. This prevents `.env.local`,
`.env`, and stale shell variables from changing a channel build.

## URLs

| Channel | Frontend origin | API base |
| --- | --- | --- |
| Development | `https://dev.admin.trio.am` | `https://dev.api.trio.am` |
| Stage | `https://stage.admin.trio.am` | `https://stage.api.trio.am` |
| Production | `https://admin.trio.am` | `https://api.trio.am` |

All frontends are hosted at `/`, so `VITE_BASE_PATH=/` in every channel.
Upstream API URLs do not have an `/api` suffix.

Ordinary local development uses `VITE_API_BASE_URL=/api` in the browser. Vite
proxies that same-origin prefix to `VITE_API_PROXY_TARGET` and strips `/api`
before forwarding. For example, `/api/restaurants` is forwarded to
`https://dev.api.trio.am/restaurants`.

`VITE_X_ORIGIN` identifies the matching frontend origin and is sent by the API
client when configured.

## Commands

```bash
cp .env.local.example .env.local
bun run local

bun run local:dev
bun run local:stage
bun run local:prod
```

`bun run local` uses Vite's normal local loading, including `.env.local`.
The three channel commands use exactly their named `.env.<channel>` file.

## Available variables

- `VITE_APP_MODE`, `VITE_APP_NAME`, `VITE_APP_VERSION`
- `VITE_BASE_PATH`
- `VITE_API_BASE_URL`, `VITE_API_PROXY_TARGET`, `VITE_X_ORIGIN`
- `VITE_API_TIMEOUT`
- `VITE_ENABLE_AUDIT_LOG`, `VITE_ENABLE_QR_GENERATION`
- `VITE_DEBUG_MODE`, `VITE_LOG_LEVEL`
- `VITE_MAP_DEFAULT_CENTER_LAT`, `VITE_MAP_DEFAULT_CENTER_LNG`,
  `VITE_MAP_DEFAULT_ZOOM`
- `VITE_SESSION_TIMEOUT`, `VITE_TOKEN_REFRESH_INTERVAL`

Restart the local server after changing an environment file.
