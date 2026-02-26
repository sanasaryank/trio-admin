# Static build & nginx deployment

This app is built as a **static export** (HTML, JS, CSS, assets) into the `out/` folder for serving with **nginx only** (no Node server).

## Build

- **`npm run build`** — Production build; base path from `.env.production` (default `/`).
- **`npm run build:dev`** — Build for `/dev` subpath (uses `.env.dev`).
- **`npm run build:stage`** — Build for `/stage` subpath (uses `.env.stage`).
- **`npm run build:prod`** — Build for root (uses `.env.prod`).

Output is always in **`out/`**: `index.html`, `assets/*.js`, `assets/*.css`, and static assets. All URLs respect the base path (e.g. `/dev/` or `/`).

## Base path (VITE_BASE_PATH)

Set in env files or when running the build:

- **Root:** `VITE_BASE_PATH=/` or empty (e.g. `https://example.com`).
- **Subpath:** `VITE_BASE_PATH=/dev/` or `/stage/` (e.g. `https://example.com/dev`).

The React app and Vite use this for asset and route URLs so the app works at any of these URLs.

## Zip artifact (optional)

After building, create a zip for deployment:

```bash
npm run zip:dev    # -> dev-0.0.0.zip (version from package.json)
npm run zip:stage  # -> stage-0.0.0.zip
npm run zip:prod   # -> prod-0.0.0.zip
```

## Run the out folder with nginx locally

**Option A — Docker (recommended)**

1. Build the app: `npm run build`
2. Run: `npm run serve:nginx`
3. Open http://localhost:8080

This runs nginx in a container, mounts `out/` and uses the project’s `nginx.conf` (SPA fallback).

**Option B — Manual Docker**

```bash
# From project root (Windows PowerShell use ${PWD} instead of $(pwd) if needed)
docker run --rm -v "$(pwd)/out:/usr/share/nginx/html:ro" -v "$(pwd)/nginx.conf:/etc/nginx/conf.d/default.conf:ro" -p 8080:80 nginx:alpine
```

**Option C — nginx installed on the machine (no Docker)**

1. **Build** the app: `npm run build` (so the `out/` folder exists).

2. **Set the path** in `nginx-local.conf`: edit the `root` line and set it to the **full path** to your `out` folder:
   - **Windows:** e.g. `root C:/Users/YourUser/Documents/Projects/trio-admin/out;` (use forward slashes).
   - **Linux/macOS:** e.g. `root /home/you/projects/trio-admin/out;`

3. **Tell nginx to use this config:**
   - **Windows (e.g. `C:\nginx`):** Open `conf/nginx.conf`, add inside `http { ... }`:  
     `include "C:/Users/YourUser/Documents/Projects/trio-admin/nginx-local.conf";`
   - **Linux:** e.g. `sudo cp nginx-local.conf /etc/nginx/sites-available/trio-admin` then  
     `sudo ln -s /etc/nginx/sites-available/trio-admin /etc/nginx/sites-enabled/`  
     and ensure the config has the correct `root` path.  
     Or add `include /path/to/trio-admin/nginx-local.conf;` inside `http { }` in `/etc/nginx/nginx.conf`.

4. **Reload nginx:**
   - **Windows:** `nginx -s reload` (from nginx install dir) or restart the nginx service.
   - **Linux:** `sudo nginx -t && sudo systemctl reload nginx`

5. Open **http://localhost:8080** (or the port you set in `listen` in `nginx-local.conf`).

---

## Serving with nginx (production)

1. **Copy** the contents of `out/` (or the unzipped build) to the directory nginx will serve (e.g. `/var/www/app` or a subpath).

2. **Root deployment** (app at `https://example.com`):

```nginx
server {
  listen 443 ssl;
  server_name example.com;
  root /var/www/app;
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

3. **Subpath deployment** (e.g. app at `https://example.com/dev`):

```nginx
server {
  listen 443 ssl;
  server_name example.com;
  root /var/www;

  location /dev {
    alias /var/www/dev;   # or /var/www/app if you put the build inside a "dev" folder
    try_files $uri $uri/ /dev/index.html;
    index index.html;
  }

  location /dev/assets/ {
    alias /var/www/dev/assets/;
    expires 1y;
    add_header Cache-Control "public, immutable";
  }
}
```

If you deploy the **contents** of `out/` into `/var/www/dev/` (so that `index.html` is at `/var/www/dev/index.html`), then:

```nginx
location /dev/ {
  alias /var/www/dev/;
  try_files $uri $uri/ /dev/index.html;
}
```

**Important:** `try_files ... /index.html` (or `/dev/index.html`) is the **SPA fallback**: any non-file request (e.g. `/dev`, `/dev/restaurants`) serves `index.html` so the React router can handle the route. No Node server is required.
