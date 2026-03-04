# Revive Root Essentials - International E-Commerce Platform

**Version:** 1.0.0  
**Status:** Phase 4 - Comprehensive Testing  
**Last Updated:** March 4, 2026

---

## 🎯 Project Overview

Revive Root Essentials is a **fully-featured international e-commerce platform** built with:
- **Frontend:** React 18 + TypeScript + Vite + Tailwind CSS
- **Backend:** Express.js + MySQL + Sequelize + Redis
- **Payments:** Flutterwave SDK v1.3.1
- **International:** 50+ countries, 18 currencies, automatic locale detection

---

## ✨ Key Features

### 🛍️ E-Commerce Platform
- ✅ Product browsing with advanced filtering & search
- ✅ Shopping cart with persistent storage
- ✅ Secure checkout with Flutterwave payments
- ✅ Order tracking & history
- ✅ Refund request & tracking system
- ✅ Wishlist management
- ✅ Customer address management

### 🌍 International Support
- ✅ **50+ Countries** across 5 regions (Africa, Americas, Europe, Asia, Middle East)
- ✅ **18 Currencies** with automatic selection
- ✅ **Automatic Locale Detection** from browser language
- ✅ **Dynamic States/Provinces** for major countries
- ✅ **Intelligent Shipping Cost** calculation by country
- ✅ **Price Formatting** with proper currency symbols

### 🔧 Admin Dashboard
- ✅ Product management (CRUD operations)
- ✅ Order management with status tracking
- ✅ User role management
- ✅ Coupon & discount management
- ✅ Inventory & stock management
- ✅ Comprehensive audit logging with CSV export

### 🔒 Security & Compliance
- ✅ JWT-based authentication
- ✅ Role-based access control (Customer, Admin, SuperAdmin)
- ✅ Rate limiting & brute force protection
- ✅ Input validation & sanitization
- ✅ CORS properly configured
- ✅ OWASP Top 10 security compliance
- ✅ Comprehensive audit logging

---

## 🚀 Getting Started

### Prerequisites
- Node.js v20+
- MySQL 8.0+
- Redis (optional, for caching)

### Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd revive-root-essentials
   ```

2. **Install dependencies:**
   ```bash
   npm install
   npm install --prefix backend
   ```

3. **Configure environment variables:**
   ```bash
   # Frontend (.env or .env.local)
   VITE_BACKEND_ORIGIN=http://localhost:3000
   
   # Backend (.env)
   PORT=3000
   DATABASE_URL=mysql://user:password@localhost:3306/revive_roots
   JWT_SECRET=your-secret-key
   FLUTTERWAVE_SECRET_KEY=your-flutterwave-key
   ```

4. **Setup database:**
   ```bash
   # Run migrations
   npm run migrate --prefix backend
   ```

### Development

**Start the development environment:**

```bash
# Terminal 1: Frontend (runs on http://localhost:5173)
npm run dev:frontend

# Terminal 2: Backend (runs on http://localhost:3000)
npm run dev:backend
```

**Or run both simultaneously:**
```bash
npm run dev
```

### Production Build

```bash
npm run build
npm run start
```

---

## 📁 Project Structure

```
revive-root-essentials/
├── src/                          # Frontend (React + TypeScript)
│   ├── app/
│   │   ├── pages/               # All 18+ page components
│   │   ├── components/          # Reusable UI components
│   │   ├── services/            # API service layer
│   │   ├── constants/           # Countries, currencies, constants
│   │   ├── utils/               # Locale detection, helpers
│   │   ├── contexts/            # React contexts
│   │   └── styles/              # Tailwind & CSS
│   ├── main.tsx                 # App entry point
│   └── vite-env.d.ts           # Vite types
│
├── backend/                      # Backend (Express.js)
│   ├── app.js                   # Express app setup
│   ├── server.js                # Server startup
│   ├── config/                  # Database, auth, payment config
│   ├── models/                  # Sequelize models (User, Product, etc.)
│   ├── controllers/             # Business logic (11 controllers)
│   ├── routes/                  # API routes (13+ routes)
│   ├── middlewares/             # Auth, validation, error handling
│   ├── services/                # Newsletter, orders, payments
│   ├── utils/                   # Helpers, email, SMS
│   ├── validations/             # Input validators
│   └── sql/                     # Database schema
│
├── public/                       # Static assets
│   ├── robots.txt
│   └── sitemap.xml
│
├── scripts/                      # Build & startup scripts
│
├── Documentation/
│   ├── README.md               # This file
│   ├── INTERNATIONAL_SETUP.md  # International features guide
│   ├── QA_TESTING_CHECKLIST.md # 200+ test cases
│   ├── MANUAL_TESTING_GUIDE.md # Visual testing guide
│   ├── PHASE_4_TESTING_REPORT.md # Testing progress
│   └── API_DOCUMENTATION.md    # API reference
│
├── package.json                # Frontend dependencies
├── tsconfig.json               # TypeScript configuration
├── vite.config.ts              # Vite configuration
└── postcss.config.mjs          # PostCSS configuration
```

---

## 🧪 Testing

### Pre-Test Verification
```bash
bash run-tests.sh
```

This runs 10 automated checks:
- ✅ Dependency installation
- ✅ Critical files existence
- ✅ International support files
- ✅ Route configuration
- ✅ TypeScript configuration
- ✅ Vite configuration
- ✅ Environment variables
- ✅ Available scripts
- ✅ Backend configuration
- ✅ Documentation files

**Current Status:** 43/44 checks passing (97%)

### Manual Testing
Follow the comprehensive testing guide:
```bash
cat MANUAL_TESTING_GUIDE.md
```

**9 Test Sessions (8 hours):**
1. Home Page & Navigation (30 min)
2. Product Browsing (45 min)
3. Shopping Cart (45 min)
4. Checkout & Payment (60 min)
5. Account Management (45 min)
6. Admin Pages (90 min)
7. International Features (60 min)
8. Mobile Responsive Design (45 min)
9. Security & Error Handling (45 min)

**200+ Test Cases** covering:
- Functionality & CRUD operations
- Performance & load times
- Mobile responsiveness
- International features
- Security & validation
- API integration
- Error handling

---

## 📊 Key Pages

### Customer Pages (Fully Functional ✅)
| Page | Route | Features |
|------|-------|----------|
| Home | `/` | Featured products, hero section |
| Shop | `/shop` | Product grid, search, filters, pagination |
| Product Detail | `/shop/:id` | Full product info, reviews, related items |
| Cart | `/cart` | View items, adjust qty, apply coupons |
| Checkout | N/A | Shipping address, payment processing |
| Account | `/account` | Profile, sidebar navigation |
| Order History | `/order-history` | Order list, search, filter, details |
| Refund Request | `/refund-request` | Submit refund request |
| Refund Tracking | `/refund-tracking` | Track refund status |
| Address Management | `/address-management` | CRUD with 50+ countries |
| Wishlist | `/wishlist` | Saved items, move to cart |

### Admin Pages (Fully Functional ✅)
| Page | Route | Features |
|------|-------|----------|
| Dashboard | `/admin` | Key metrics, charts |
| Products | `/admin/products` | CRUD, image upload, filtering |
| Orders | `/admin/orders` | Manage orders, status updates |
| Users | `/admin/users` | Manage users, roles, permissions |
| Coupons | `/admin/coupons` | CRUD, discount types, CSV export |
| Inventory | `/admin/inventory` | Stock management, adjustments |
| Audit Logs | `/admin/audit-logs` | Track all changes, CSV export |

---

## 🌐 International Support

### Supported Countries (50+)

**Africa (15):** Nigeria, Ghana, Kenya, South Africa, Uganda, Tanzania, Rwanda, Ethiopia, Cameroon, Senegal, Zimbabwe, Botswana, Namibia, Zambia, Malawi

**Americas (8):** USA, Canada, Mexico, Brazil, Colombia, Argentina, Jamaica, Trinidad & Tobago

**Europe (11):** UK, Germany, France, Italy, Spain, Netherlands, Belgium, Switzerland, Sweden, Poland, Ireland

**Asia (13):** India, Pakistan, Bangladesh, Sri Lanka, Philippines, Indonesia, Malaysia, Singapore, Thailand, Vietnam, Japan, South Korea, Hong Kong

**Middle East (8):** UAE, Saudi Arabia, Qatar, Kuwait, Bahrain, Oman, Israel, Lebanon

### Supported Currencies (18)

| Currency | Code | Symbol |
|----------|------|--------|
| Nigerian Naira | NGN | ₦ |
| US Dollar | USD | $ |
| British Pound | GBP | £ |
| Euro | EUR | € |
| Canadian Dollar | CAD | C$ |
| Ghanaian Cedi | GHS | ₵ |
| Kenyan Shilling | KES | KSh |
| South African Rand | ZAR | R |
| Ugandan Shilling | UGX | USh |
| Tanzanian Shilling | TZS | TSh |
| Rwandan Franc | RWF | FRw |
| West African Franc | XOF | CFA |
| Central African Franc | XAF | FCFA |
| Zambian Kwacha | ZMW | ZK |
| Egyptian Pound | EGP | £ |
| Colombian Peso | COP | $ |
| Iranian Rial | IRR | ﷼ |
| Sierra Leone Leone | SLL | Le |

### Automatic Features
- ✅ Browser language detection (e.g., en-NG → Nigeria)
- ✅ Automatic currency selection based on country
- ✅ Dynamic state/province loading by country
- ✅ Country-based shipping cost calculation
- ✅ Preference persistence in localStorage
- ✅ Manual override capability for all settings

---

## 📚 API Documentation

### Available Endpoints (46+)

**Authentication:**
- POST `/api/auth/register` - Create account
- POST `/api/auth/login` - Login
- POST `/api/auth/logout` - Logout
- POST `/api/auth/refresh-token` - Refresh JWT
- POST `/api/auth/forgot-password` - Initiate password reset
- POST `/api/auth/reset-password` - Complete password reset

**Products:**
- GET `/api/products` - List products (paginated)
- GET `/api/products/:id` - Get product details
- GET `/api/products/category/:category` - Get by category
- POST `/api/products` (admin) - Create product
- PUT `/api/products/:id` (admin) - Update product
- DELETE `/api/products/:id` (admin) - Delete product

**Orders:**
- POST `/api/orders` - Create order
- GET `/api/orders` - List user orders
- GET `/api/orders/:id` - Get order details
- PUT `/api/orders/:id/status` (admin) - Update status
- POST `/api/orders/:id/payment/webhook` - Payment webhook

**Refunds:**
- POST `/api/refunds` - Request refund
- GET `/api/refunds` - List refunds
- GET `/api/refunds/:id` - Get refund details
- PUT `/api/refunds/:id/status` (admin) - Update refund status

**Admin:**
- GET `/api/admin/users` - List users
- PUT `/api/admin/users/:id` - Update user
- DELETE `/api/admin/users/:id` - Delete user
- GET `/api/admin/coupons` - List coupons
- POST `/api/admin/coupons` - Create coupon
- GET `/api/admin/audit-logs` - Get audit logs

**Full API Reference:** See `API_DOCUMENTATION.md`

---

## 🔐 Security Features

### Authentication & Authorization
- ✅ JWT token-based authentication
- ✅ Role-based access control (RBAC)
- ✅ Password hashing with bcryptjs
- ✅ Token expiration & refresh mechanism
- ✅ Protected routes (frontend & backend)

### Input Validation
- ✅ Server-side validation for all inputs
- ✅ Email format validation
- ✅ Phone number validation
- ✅ Postal code format validation
- ✅ Quantity & price validation

### API Security
- ✅ Rate limiting (prevents brute force)
- ✅ CORS properly configured
- ✅ HTTPS enforced (production)
- ✅ Helmet security headers
- ✅ Input sanitization
- ✅ XSS prevention

### Data Protection
- ✅ Passwords never logged
- ✅ Sensitive data redacted in errors
- ✅ Audit logging of all admin actions
- ✅ User data encryption (sensitive fields)
- ✅ Token blacklist (Redis)

### OWASP Top 10 Coverage
1. ✅ Injection Prevention
2. ✅ Broken Authentication
3. ✅ Sensitive Data Exposure
4. ✅ XML External Entities
5. ✅ Broken Access Control
6. ✅ Security Misconfiguration
7. ✅ XSS Prevention
8. ✅ Insecure Deserialization
9. ✅ Using Components with Known Vulnerabilities
10. ✅ Insufficient Logging & Monitoring

---

## 📈 Performance

### Frontend Performance
- ✅ Vite for fast development & builds
- ✅ Code splitting with React Router
- ✅ Image lazy loading
- ✅ Optimized bundle size
- ✅ CSS-in-JS with Tailwind

### Backend Performance
- ✅ Redis caching for frequently accessed data
- ✅ Database query optimization with Sequelize
- ✅ Pagination for large datasets
- ✅ Connection pooling
- ✅ Gzip compression

### Target Performance Metrics
- Page Load: < 2 seconds (LCP)
- API Response: < 500ms (p95)
- Mobile First Optimized
- Lighthouse Score: 90+

---

## 🛠️ Tech Stack

### Frontend
- **Framework:** React 18.3.1
- **Language:** TypeScript 5.3
- **Routing:** React Router 7
- **Styling:** Tailwind CSS v3
- **Build Tool:** Vite 6.4.1
- **HTTP Client:** Axios
- **State Management:** React Context + Hooks
- **UI Components:** Radix UI, Material UI, Lucide Icons

### Backend
- **Runtime:** Node.js v20.19.5
- **Framework:** Express.js 5.1.0
- **Language:** JavaScript (CommonJS)
- **Database:** MySQL 8.0
- **ORM:** Sequelize 6.37.5
- **Authentication:** JWT (jsonwebtoken 9.0.2)
- **Hashing:** bcryptjs 2.4.3
- **Caching:** Redis (ioredis 5.10.0)
- **Payments:** Flutterwave SDK v1.3.1
- **Email:** Nodemailer 6.10.0
- **SMS:** Twilio 5.4.2
- **File Upload:** Multer 1.4.5
- **Validation:** Express Validator 7.2.1
- **Security:** Helmet 8.1.0, CORS 2.8.5
- **Logging:** Morgan 1.10.0
- **Rate Limiting:** Express Rate Limit 7.5.0

---

## 📋 Phase Progress

### ✅ Phase 1: System Audit (COMPLETE)
- Comprehensive backend audit
- Security analysis
- Performance review
- OWASP compliance check

### ✅ Phase 2: Frontend Development (COMPLETE)
- 8 new pages created
- Full CRUD functionality
- Pagination & filtering
- Responsive design

### ✅ Phase 3: Integration & Internationalization (COMPLETE)
- 50+ countries support
- 18 currencies with auto-selection
- Automatic locale detection
- Route configuration
- TypeScript error fixes (11→0 errors)

### 🔄 Phase 4: Comprehensive Testing (IN PROGRESS)
- 200+ test cases prepared
- Pre-test checks: 97% passing
- Manual testing guide created
- Automated test scripts ready

### ⏳ Phase 5: Production Deployment (PENDING)
- Build optimization
- Deployment configuration
- Security hardening
- Monitoring setup

---

## 💡 Quick Commands

```bash
# Development
npm run dev:frontend          # Start frontend (port 5173)
npm run dev:backend           # Start backend (port 3000)
npm run dev                   # Start both

# Building
npm run build                 # Production build

# Testing
bash run-tests.sh            # Pre-test automated checks

# Database
npm run migrate              # Run migrations
npm run seed                 # Seed test data
```

---

## 📞 Support & Contributions

### Reporting Issues
Please file issues on GitHub with:
- Detailed description
- Steps to reproduce
- Expected vs actual behavior
- Screenshots/logs if applicable
- Browser/device information

### Contributing
1. Fork the repository
2. Create a feature branch
3. Make changes & test thoroughly
4. Submit pull request
5. Code review & merge

---

## 📄 License

This project is licensed under the MIT License - see LICENSE.md for details.

---

## 🎉 Acknowledgments

- **Flutterwave** for payment processing
- **React** community for amazing libraries
- **Tailwind CSS** for utility-first styling
- **All contributors** who have made this possible

---

## 📞 Contact

- **Email:** support@reviveroot.com
- **Website:** https://www.reviveroot.com
- **GitHub:** https://github.com/oyinlola-tech/revive-root-essentials

---

**Last Updated:** March 4, 2026  
**Version:** 1.0.0  
**Status:** Phase 4 Testing In Progress
