# Revive Roots Essentials

Revive Roots Essentials is a full-stack ecommerce platform for premium hair and skincare products.

## Stack

- Frontend: React, Vite, Tailwind CSS
- Backend: Node.js, Express, Sequelize
- Database: MySQL
- Auth: JWT + refresh flow
- Payments: Flutterwave
- Email: NodeMailer templates for transactional and marketing emails

## Current Capabilities

- Product catalog, categories, featured products, and inventory support
- Cart, wishlist, checkout, and order history
- Currency-aware pricing and shipping fee quoting
- Admin panels for products, orders, contacts, shipping fees, inventory, users, coupons, and audit logs
- Contact form persistence with admin alerts
- Order lifecycle emails:
  - Order placed confirmation
  - Payment receipt on successful payment
  - Payment failed receipt on failed payment attempts
  - Order status updates
  - Refund updates
- Weekly marketing/newsletter template support

## Repository Structure

```text
.
|-- backend/              # API server, business logic, models, services
|-- src/                  # Frontend application source
|-- public/               # Static assets
|-- docs/                 # Deployment and project docs
|-- frontend-env/         # Frontend env examples/templates
|-- scripts/              # Helper scripts (deployment checks, run scripts)
|-- .env.example
|-- .env.production.example
`-- README.md
```

## Local Development

1. Install root dependencies:

```bash
npm ci
```

2. Install backend dependencies:

```bash
cd backend
npm ci
cd ..
```

3. Configure environment files:

```bash
cp .env.example .env
cp backend/.env.example backend/.env
cp frontend-env/.env.example frontend-env/.env
```

4. Start frontend + backend:

```bash
npm run dev
```

5. Build frontend for production:

```bash
npm run build
```

## Scripts

Root:

- `npm run dev` - run frontend and backend together
- `npm run dev:frontend` - run Vite frontend
- `npm run dev:backend` - run backend server
- `npm run build` - production frontend build
- `npm run check:deployment` - deployment/CORS checks

Backend (`backend/package.json`):

- `npm run dev` - backend with nodemon
- `npm start` - backend in production mode

## Environment

Frontend environment (Vite):

- `frontend-env/.env` for local
- `frontend-env/.env.production` for production

Backend environment:

- `backend/.env` for local
- `backend/.env.production` (or host panel vars) for production

Important production backend variables:

- `FRONTEND_URL`
- `CORS_ORIGIN`
- `SERVE_FRONTEND_FROM_BACKEND=false` (for split frontend/backend deployment)
- Payment credentials (`FLW_*`)
- SMTP credentials (`SMTP_*`)

## Namecheap Deployment (Split Setup)

Example:

- Frontend: `https://revive-root-essentials.telente.site`
- Backend: `https://revive-api.telente.site`

Set:

- Frontend API URL to backend API origin
- Backend `FRONTEND_URL=https://revive-root-essentials.telente.site`
- Backend `CORS_ORIGIN=https://revive-root-essentials.telente.site`

Detailed steps: [docs/namecheap-deployment.md](docs/namecheap-deployment.md)

## Notes on Email Flows

The backend sends transactional and admin emails for:

- Authentication and account events
- Contact submissions (admin recipients)
- Order placement and admin order alerts
- Payment success receipts
- Payment failure receipts
- Refund and refund-status updates
- Newsletter campaigns

Recipients for admin alerts are users with `admin` or `superadmin` roles.

## Security and Governance

- Security policy: [SECURITY.md](SECURITY.md)
- Contributing guide: [CONTRIBUTING.md](CONTRIBUTING.md)
- Code of conduct: [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md)
- Support: [SUPPORT.md](SUPPORT.md)

## License

This project is licensed under a Proprietary Commercial License.
See [LICENSE.md](LICENSE.md) for terms and restrictions.
