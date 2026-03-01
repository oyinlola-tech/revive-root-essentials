# Contributing to Revive Roots Essentials

## Proprietary Software Notice

**Revive Roots Essentials** is proprietary, commercial software. This contribution guide applies **ONLY** to authorized team members and licensees who have executed a written commercial agreement with the owner.

**This software is NOT open-source, NOT free, and NOT licensed for public contributions or reuse.**

**Owner and Author:** Oluwayemi Oyinlola Michael
**Portfolio:** https://oyinlola.site

---

## Who Can Contribute?

Contributions are accepted **ONLY** from:

- Authorized team members with signed commercial agreements
- Licensed partners with explicit written permission
- The project owner and designated maintainers

Public contributions and pull requests from the community are **NOT accepted**.

If you believe you should have contributing rights, contact the owner through the portfolio for commercial licensing and partnership discussions.

---

## Development Environment Setup

### Prerequisites

- Node.js 18+ (recommended LTS)
- npm 9+
- MySQL 8+
- Git

### Initial Setup

1. Clone the authorized repository:
   ```bash
   git clone <authorized-repo-url>
   cd revive-roots-essentials
   ```

2. Install frontend dependencies:
   ```bash
   npm install
   ```

3. Install backend dependencies:
   ```bash
   cd backend
   npm install
   cd ..
   ```

4. Configure environment variables:
   ```bash
   # Frontend environment
   cp .env.example .env

   # Backend environment
   cp backend/.env.example backend/.env
   ```

5. Update `.env` files with actual credentials (do NOT commit these)

6. Start development servers:
   ```bash
   # Terminal 1: Frontend
   npm run dev

   # Terminal 2: Backend
   cd backend && npm start
   ```

Default URLs:
- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:3000`
- Health endpoint: `http://localhost:3000/health`

---

## Development Workflow

### Branch Management

Create branches with descriptive names for your work:

```bash
git checkout -b feature/feature-name
git checkout -b fix/bug-fix-name
git checkout -b refactor/component-name
```

Branch naming conventions:
- `feature/` - New features
- `fix/` - Bug fixes
- `refactor/` - Code improvements
- `docs/` - Documentation updates
- `test/` - Test additions

### Code Standards

- **TypeScript**: Use strict typing for all code
- **Component Structure**: Keep components modular and single-responsibility
- **Styling**: Use Tailwind CSS and Radix UI components
- **State Management**: Use React Context and hooks appropriately
- **API Layer**: Use the abstraction in `src/app/services/api.ts`
- **Error Handling**: Centralized error handling in middleware and UI
- **Security**: Never log sensitive data; validate all inputs at system boundaries

### Commit Messages

Use conventional commit format:

```
type(scope): subject

body

footer
```

Types: `feat`, `fix`, `docs`, `refactor`, `test`, `chore`

Examples:
```
feat(auth): add OTP verification flow

Implement OTP sending and verification for user authentication.
- Add OTP generation service
- Add verification endpoint
- Add frontend OTP form component

Closes #42
```

```
fix(products): correct price display on product cards

- Fixed currency formatting
- Added proper number localization

Fixes #89
```

Guidelines:
- Use imperative mood ("add" not "added")
- Limit first line to 50 characters
- Reference issues using `Closes #123` or `Fixes #456`
- Include meaningful details in body

### Code Review Process

1. Create a pull request with a comprehensive description
2. Self-review your changes first
3. Link related issues and reference ticket numbers
4. Describe testing performed
5. Request review from designated maintainers
6. Address feedback respectfully and promptly
7. Ensure all CI checks pass
8. Obtain approval before merging

### Testing Requirements

Before submitting:

1. Test all changes in development environment
2. Verify no regressions in existing functionality
3. Test responsive behavior for UI changes
4. Run the build process:
   ```bash
   npm run build
   ```

5. Validate environment variable handling
6. Test error cases and edge conditions

---

## Project Architecture & Structure

```
revive-roots-essentials/
├── src/                           # Frontend application
│   ├── app/
│   │   ├── components/            # Reusable React components
│   │   ├── pages/                 # Page-level components (route views)
│   │   ├── contexts/              # React Context providers (if used)
│   │   ├── services/              # API clients and service functions
│   │   ├── utils/                 # Utility functions and helpers
│   │   ├── constants/             # App-wide constants
│   │   ├── data/                  # Static data and fixtures
│   │   ├── App.tsx                # Root component
│   │   └── routes.tsx             # Route configuration
│   ├── assets/                    # Images, logos, media files
│   └── styles/                    # Global stylesheets
│
├── backend/                       # Express API server
│   ├── config/                    # Database and app config
│   ├── controllers/               # Route handlers
│   ├── middlewares/               # Express middlewares
│   ├── models/                    # Sequelize ORM models
│   ├── routes/                    # API route definitions
│   ├── app.js                     # Express app setup
│   └── server.js                  # Server entry point
│
├── public/                        # Static public assets
├── dist/                          # Build output (generated)
├── package.json                   # Frontend dependencies
└── README.md
```

---

## Technology Stack Reference

**Frontend:**
- React 18 - UI framework
- Vite 6 - Build tool
- TypeScript - Type safety
- React Router 7 - Client-side routing
- Tailwind CSS 4 - Styling
- Radix UI - Headless component primitives
- Material-UI 7 - Pre-built components
- Axios - HTTP client
- React Hook Form - Form state management
- Recharts - Data visualization
- Lucide React - Icon library

**Backend:**
- Node.js + Express 5 - Web framework
- Sequelize - ORM for database abstraction
- MySQL 8 - Relational database
- JWT - Authentication tokens
- Helmet - Security headers
- CORS - Cross-origin resource sharing
- Express Validator - Input validation
- Bcrypt - Password hashing
- Nodemon - Development auto-reload
- Jest/Supertest - Testing frameworks

---

## Key API Routes

Inspect route files in `/backend/routes/` for full endpoint contracts:

- `/api/auth` - Authentication (login, register, OTP)
- `/api/users` - User management
- `/api/products` - Product catalog CRUD
- `/api/categories` - Category management
- `/api/cart` - Shopping cart operations
- `/api/orders` - Order lifecycle
- `/api/reviews` - Product reviews
- `/api/analytics` - Business analytics
- `/api/contact` - Contact form submissions
- `/api/newsletter` - Newsletter subscriptions
- `/health` - Service health check
- `/uploads` - Image/file serving

---

## Security & Confidentiality

**Critical Requirements:**

1. **Never commit secrets** - Use `.env` files, gitignore them
2. **Protect intellectual property** - This is proprietary code
3. **Secure credentials** - Rotate JWT secrets, database passwords regularly
4. **HTTPS in production** - Always use TLS/SSL
5. **Confidentiality** - Do not share code, architecture, or technical details outside authorized team
6. **No reverse engineering** - Do not attempt to circumvent licensing or security controls

---

## Environment Variables

### Frontend (`.env`)

```
VITE_API_URL=http://localhost:3000/api
VITE_SITE_NAME=Revive Roots Essentials
VITE_SITE_URL=http://localhost:5173
VITE_WHATSAPP_NUMBER=<phone_number>
VITE_WHATSAPP_MESSAGE=<message>
```

### Backend (`backend/.env`)

```
NODE_ENV=development
PORT=3000
APP_NAME=Revive Roots Essentials
SUPPORT_EMAIL=support@example.com

# Database
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=<password>
DB_NAME=revive_roots

# JWT
JWT_SECRET=<random_high_entropy_string>
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=<different_random_string>
JWT_REFRESH_EXPIRES_IN=30d

# CORS & Frontend
CORS_ORIGIN=http://localhost:5173
FRONTEND_URL=http://localhost:5173

# Payment (Flutterwave)
FLW_PUBLIC_KEY=<key>
FLW_SECRET_KEY=<key>
FLW_BASE_URL=https://api.flutterwave.com

# Email (SMTP)
EMAIL_HOST=<smtp_host>
EMAIL_PORT=587
EMAIL_USER=<email>
EMAIL_PASS=<password>

# SMS (Twilio)
TWILIO_ACCOUNT_SID=<sid>
TWILIO_AUTH_TOKEN=<token>
TWILIO_PHONE_NUMBER=<number>
```

---

## Common Tasks

### Running the Development Server
```bash
npm run dev                    # Frontend
cd backend && npm start        # Backend
```

### Building for Production
```bash
npm run build
```

### Running Database Migrations
```bash
cd backend
npx sequelize-cli db:migrate
npx sequelize-cli db:seed:all
```

### Checking API Health
```bash
curl http://localhost:3000/health
```

---

## Intellectual Property & Licensing

By contributing to this project, you acknowledge and agree:

- All contributions become the exclusive property of the project owner
- You have the right to contribute the code/work you submit
- You assign all rights in your contributions to the owner
- The software remains proprietary and commercial
- No open-source licensing applies
- Redistribution or sublicensing contributions is prohibited

---

## Support & Escalation

For:
- Technical questions → Contact designated technical lead
- Access issues → Verify your license agreement
- Security concerns → Follow SECURITY.md disclosure process
- Licensing/partnership → Contact the owner's portfolio

**Owner Contact:** https://oyinlola.site

---

## Disclaimer

- This project is provided to authorized licensees only
- All unauthorized access, use, or distribution is prohibited
- Violations of this agreement may result in legal action
- Full commercial license terms see `LICENSE.md`

---

Thank you for your authorized contribution to Revive Roots Essentials.
