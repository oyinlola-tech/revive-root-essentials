# Revive Roots Essentials

Revive Roots Essentials is a full-stack ecommerce platform with:

- React + Vite frontend
- Node.js + Express backend
- MySQL (Sequelize ORM)
- Flutterwave payment integration

## Tech Stack

- Frontend: React, Vite, Tailwind CSS
- Backend: Node.js, Express, Sequelize
- Database: MySQL
- Auth: JWT + refresh token flow
- Payments: Flutterwave

## Project Structure

```text
.
├── backend/              # API server and business logic
├── src/                  # Frontend application source
├── public/               # Static frontend assets
├── frontend-env/         # Vite frontend env files
├── .env.production.example
├── .env.example
└── LICENSE.md
```

## Local Setup

1. Install dependencies:
```bash
npm ci
cd backend && npm ci && cd ..
```

2. Configure backend env:
```bash
cp backend/.env.example backend/.env
```

3. Configure frontend env:
```bash
cp frontend-env/.env.example frontend-env/.env
```

4. Run development:
```bash
npm run dev
```

5. Build production frontend bundle:
```bash
npm run build
```

## Environment Files

- Backend variables: `backend/.env`
- Frontend variables for Vite: `frontend-env/.env`

## Namecheap Deployment

For a split deployment with:

- frontend: `https://revive-root-essentials.telente.site`
- backend: `https://revive-api.telente.site`

use:

- `frontend-env/.env.production.example` as the frontend template
- `backend/.env` or `.env.production.example` with:
  - `FRONTEND_URL=https://revive-root-essentials.telente.site`
  - `CORS_ORIGIN=https://revive-root-essentials.telente.site`
  - `SERVE_FRONTEND_FROM_BACKEND=false`

See [`docs/namecheap-deployment.md`](docs/namecheap-deployment.md) for the full setup steps.

Do not commit secrets. See [`.gitignore`](.gitignore).

## Security

- Report vulnerabilities privately. See [`SECURITY.md`](SECURITY.md).
- Follow secure deployment guidance and secret management in your infrastructure.

## Contributing

Read [`CONTRIBUTING.md`](CONTRIBUTING.md) and [`CODE_OF_CONDUCT.md`](CODE_OF_CONDUCT.md) before submitting any changes.

## Support

For support, enterprise requests, or deployment help, see [`SUPPORT.md`](SUPPORT.md).

## License

This project is licensed under a **Proprietary Commercial License**.  
No open-source license is granted.

By using this software, you agree to the terms in [`LICENSE.md`](LICENSE.md), including but not limited to:

- ownership retained by the Licensor
- no free/default production use
- no redistribution/resale without written authorization
- commercial use only under signed agreement

If you need licensing rights, contact the owner listed in [`LICENSE.md`](LICENSE.md).
