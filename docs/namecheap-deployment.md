# Namecheap Deployment

This project can be deployed on Namecheap with:

- frontend: `https://revive-root-essentials.telente.site`
- backend: `https://api.revive-root-essentials.telente.site`

## Target layout

- `revive-root-essentials.telente.site` serves the built Vite frontend from static files.
- `api.revive-root-essentials.telente.site` runs the Node.js backend from `backend/server.js`.

## 1. Create the subdomains in cPanel

Create these two subdomains in cPanel:

- `revive-root-essentials.telente.site`
- `api.revive-root-essentials.telente.site`

Use separate document roots for them.

Suggested directories:

- frontend document root: `~/revive-root-essentials-frontend`
- backend app root: `~/revive-root-essentials`

## 2. Frontend environment

Create `frontend-env/.env.production` from the template:

```bash
cp frontend-env/.env.production.example frontend-env/.env.production
```

Required values:

```env
VITE_API_URL=https://api.revive-root-essentials.telente.site/api
VITE_BACKEND_ORIGIN=https://api.revive-root-essentials.telente.site
VITE_SITE_URL=https://revive-root-essentials.telente.site
VITE_OAUTH_CALLBACK_URI=https://revive-root-essentials.telente.site/auth/oauth-callback
VITE_APPLE_REDIRECT_URI=https://revive-root-essentials.telente.site/auth/oauth-callback
```

Build the frontend:

```bash
npm ci
npm run build
```

Upload the contents of `dist/` to the frontend document root for `revive-root-essentials.telente.site`.

## 3. Backend environment

Configure `backend/.env` with production values.

The hostname-related settings should be:

```env
NODE_ENV=production
PORT=3000
TRUST_PROXY=true
CORS_ORIGIN=https://revive-root-essentials.telente.site
FRONTEND_URL=https://revive-root-essentials.telente.site
SERVE_FRONTEND_FROM_BACKEND=false
```

Also fill in the real values for:

- MySQL credentials
- JWT secrets
- Flutterwave keys
- email credentials
- Twilio credentials if used

## 4. Create the Node.js app in Namecheap cPanel

In cPanel:

1. Open `Setup Node.js App`.
2. Create a new application.
3. Use:
   - Node.js version: `20.x` if available, otherwise the latest LTS available in your panel
   - Application mode: `Production`
   - Application root: the repo directory
   - Application URL: `api.revive-root-essentials.telente.site`
   - Application startup file: `backend/server.js`
4. Save the app.

Then open the app dashboard, enter the virtual environment command shown there, and install dependencies:

```bash
npm ci
cd backend && npm ci
```

Restart the Node.js app from cPanel after installs or env changes.

## 5. Database

Create the MySQL database and user in cPanel, then set:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=your_db_username
DB_PASSWORD=your_db_password
DB_NAME=revive_roots
```

The backend already runs `sequelize.sync()`, so it will create missing tables on startup.

## 6. SSL

Enable SSL for both subdomains in cPanel:

- `revive-root-essentials.telente.site`
- `api.revive-root-essentials.telente.site`

If AutoSSL does not attach automatically, run it manually from `SSL/TLS Status`.

## 7. Verification

Verify these URLs after deployment:

- frontend: `https://revive-root-essentials.telente.site`
- backend health: `https://api.revive-root-essentials.telente.site/health`
- backend version: `https://api.revive-root-essentials.telente.site/api/version`

## Notes

- The backend is now configured to serve the frontend only when `SERVE_FRONTEND_FROM_BACKEND=true`.
- For your split-domain setup, keep `SERVE_FRONTEND_FROM_BACKEND=false`.
- If your Namecheap plan does not expose `Setup Node.js App`, that plan cannot run this backend directly; use a Namecheap VPS or another Node-capable host for the API.
