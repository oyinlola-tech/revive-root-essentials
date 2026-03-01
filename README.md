# Revive Roots Essentials

Revive Roots Essentials is a full-stack, production-oriented e-commerce application built for premium skincare and wellness operations. It combines a React + Vite frontend and a Node.js + Express + MySQL backend with role-based access control, OTP-capable authentication flows, product and order management, contact/newsletter capture, and analytics endpoints.

This project is commercial software. It is not free software, not open-source software, and not licensed for public reuse without written permission and a paid license agreement from the owner.

Owner and Author: Oluwayemi Oyinlola Michael  
Portfolio: https://oyinlola.site

## Table of Contents

1. Product Overview
2. Core Capabilities
3. Architecture
4. Technology Stack
5. Repository Layout
6. Local Development Setup
7. Environment Variables
8. Running Frontend and Backend
9. Authentication and Authorization Model
10. API Surface Overview
11. Data and Domain Model Overview
12. Security Controls in the Current Build
13. Deployment Guidance
14. Operations and Maintenance
15. Troubleshooting
16. Commercial Licensing and Usage Terms
17. Support and Contact
18. Disclaimer

## 1. Product Overview

Revive Roots Essentials is designed for teams that need a flexible storefront plus administrative operations in one codebase. The platform supports:

- Public storefront browsing and product discovery.
- Registered customer account and cart workflows.
- OTP and credential-based authentication paths.
- Back-office roles for product, order, and user operations.
- Business analytics and customer engagement endpoints.

The implementation is split into:

- Frontend app (`/src`) served by Vite.
- Backend API (`/backend`) served by Express.
- MySQL persistence via Sequelize model definitions.

## 2. Core Capabilities

- Account registration/login with verification flow support.
- Role-based access (`user`, `admin`, `superadmin` patterns).
- Product catalog CRUD and product listing retrieval.
- Category management endpoints.
- Cart and order lifecycle endpoints.
- Product reviews.
- Contact and newsletter subscription handling.
- Basic analytics endpoints for administrative insight.
- WhatsApp quick-contact integration in frontend config.

## 3. Architecture

The system follows a decoupled SPA + REST API architecture:

- Frontend: React SPA with component-driven views, route-level pages, context providers for app state, and API service abstraction.
- Backend: Express REST service with layered routing/controller/model responsibilities.
- Storage: MySQL database through Sequelize models.
- Integrations: SMTP, Twilio, and Flutterwave payment configuration via environment variables.

## 4. Technology Stack

Frontend:

- React 18
- Vite 6
- React Router
- MUI + Radix UI primitives
- Axios

Backend:

- Node.js + Express 5
- Sequelize ORM
- MySQL (`mysql2`)
- JWT authentication
- `helmet`, `cors`, `compression`, `cookie-parser`
- `express-validator`

Developer Tooling:

- npm
- nodemon (declared in dependencies/dev tooling)
- Jest and Supertest packages present for test extension

## 5. Repository Layout

```text
.
|-- src/                        # Frontend application source
|   |-- app/
|   |   |-- components/
|   |   |-- contexts/
|   |   |-- pages/
|   |   |-- services/
|   |   |-- routes.tsx
|   |   `-- App.tsx
|-- backend/                    # Backend API service
|   |-- config/
|   |-- controllers/
|   |-- middlewares/
|   |-- models/
|   |-- routes/
|   |-- app.js
|   `-- server.js
|-- .env.example                # Frontend env template
|-- backend/.env.example        # Backend env template
|-- package.json                # Frontend package configuration
`-- README.md
```

## 6. Local Development Setup

Prerequisites:

- Node.js 18+ (recommended LTS)
- npm 9+
- MySQL 8+

Install dependencies:

```bash
npm install
cd backend
npm install
```

Create environment files:

```bash
# From project root
cp .env.example .env

# In backend folder
cd backend
cp .env.example .env
```

Update the new `.env` files with actual values before startup.

Optional manual schema bootstrap:

```bash
mysql -u <db_user> -p < backend/sql/schema.sql
```

## 7. Environment Variables

Frontend (`/.env`):

- `VITE_API_URL` (example: `http://localhost:3000/api`)
- `VITE_SITE_NAME`
- `VITE_SITE_URL`
- `VITE_WHATSAPP_NUMBER`
- `VITE_WHATSAPP_MESSAGE`

Backend (`/backend/.env`):

Core:

- `NODE_ENV`
- `PORT`
- `APP_NAME`
- `SUPPORT_EMAIL`

Database:

- `DB_HOST`
- `DB_PORT`
- `DB_USER`
- `DB_PASSWORD`
- `DB_NAME`

Auth:

- `JWT_SECRET`
- `JWT_EXPIRES_IN`
- `JWT_REFRESH_SECRET`
- `JWT_REFRESH_EXPIRES_IN`

Cross-origin/client:

- `CORS_ORIGIN`
- `FRONTEND_URL`

Payments/integrations:

- `FLW_PUBLIC_KEY`
- `FLW_SECRET_KEY`
- `FLW_BASE_URL`
- `EMAIL_HOST`
- `EMAIL_PORT`
- `EMAIL_USER`
- `EMAIL_PASS`
- `TWILIO_ACCOUNT_SID`
- `TWILIO_AUTH_TOKEN`
- `TWILIO_PHONE_NUMBER`

## 8. Running Frontend and Backend

Frontend (from repo root):

```bash
npm run dev
```

Backend (from `/backend`):

```bash
npm start
```

Default local URLs:

- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:3000`
- Health endpoint: `http://localhost:3000/health`

## 9. Authentication and Authorization Model

The platform supports multiple auth paths and role-gated operations:

- Credential and OTP-capable login flow patterns.
- JWT-based authorization strategy in backend middleware.
- Route-level guards for protected actions.
- Role middleware for privileged endpoints.

Typical role boundaries:

- `user`: storefront, cart, personal profile/order interactions.
- `admin`: operational product/order workflows and limited management.
- `superadmin`: highest-privilege role, including user/role management patterns.

## 10. API Surface Overview

Main backend route groups mounted under `/api`:

- `/auth`
- `/users`
- `/products`
- `/categories`
- `/cart`
- `/orders`
- `/reviews`
- `/analytics`
- `/contact`
- `/newsletter`

Operational endpoints:

- `GET /health` for service health.
- Static uploads served at `/uploads`.

For endpoint contracts, inspect route files in `/backend/routes` and corresponding controllers in `/backend/controllers`.

## 11. Data and Domain Model Overview

Model set currently includes:

- User
- Product
- Category
- Order
- OrderItem
- CartItem
- Review
- Otp
- Contact
- Newsletter

The model index and associations live under `/backend/models`.

## 12. Security Controls in the Current Build

Security-relevant middleware and defaults include:

- `helmet()` for secure HTTP headers.
- CORS allowlist validation using configured origins.
- Request body size cap (`express.json({ limit: '10kb' })`).
- Structured request logging via `morgan`.
- Centralized error handling middleware.

Security-sensitive environment recommendations:

- Use strong random JWT secrets with high entropy.
- Rotate credentials regularly.
- Never commit `.env` with production secrets.
- Use HTTPS in production and terminate TLS at a trusted edge.

See `SECURITY.md` for coordinated disclosure policy.

## 13. Deployment Guidance

Minimum production guidance:

- Deploy frontend and backend as separate services.
- Restrict backend CORS to trusted production domains only.
- Set `NODE_ENV=production`.
- Use managed MySQL with restricted network ACLs.
- Store secrets in a secure secret manager, not plain files.
- Add monitoring for uptime, logs, and error alerts.
- Configure backups and tested restore procedures.

## 14. Operations and Maintenance

Recommended operational practices:

- Add CI checks for linting, tests, and dependency audit.
- Maintain migration/seed discipline for schema evolution.
- Track API versioning strategy before external integrations scale.
- Create role and permission change logs for admin actions.
- Schedule regular security review and dependency updates.

## 15. Troubleshooting

API unreachable from frontend:

- Verify `VITE_API_URL` and backend `PORT`.
- Check backend process is running and `/health` responds `200`.

CORS blocked requests:

- Confirm frontend origin is included in backend `CORS_ORIGIN`.
- Remove whitespace issues in comma-separated origins.

Database connection errors:

- Validate MySQL host/port/credentials and schema existence.

OTP/email/SMS issues:

- Check SMTP/Twilio credentials and sender permissions.

## 16. Commercial Licensing and Usage Terms

This software is proprietary and commercial.

- No free-use grant is provided.
- No open-source license is granted.
- Copying, redistribution, sublicensing, resale, reverse engineering, or derivative commercialization is prohibited without explicit written permission and a paid license.
- Production use requires an executed commercial agreement with the owner.

See `LIENCE.md` for full legal terms used in this repository.

## 17. Support and Contact

Owner: Oluwayemi Oyinlola Michael  
Portfolio: https://oyinlola.site

For commercial licensing, custom feature work, deployment support, or maintenance engagements, contact through the portfolio channel and include:

- Company or project name
- Intended deployment scope
- Required timeline
- Expected user volume

## 18. Disclaimer

This repository is provided to authorized users for evaluation, integration, and licensed deployment under written agreement only. All rights remain reserved by the owner unless explicitly granted in a signed contract.
