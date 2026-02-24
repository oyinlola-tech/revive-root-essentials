# Revive Roots Essentials - E-commerce Frontend

A complete e-commerce frontend application for skincare products with role-based authentication and OTP support.

## Features

### Authentication
- Email/Password login
- OTP-based authentication (Email & Phone)
- User registration with OTP verification
- Protected routes
- JWT token management

### User Roles
- **User**: Browse products, manage cart, place orders, view profile
- **Admin**: Manage products, view/update orders, access analytics
- **Superadmin**: Full access including user management and role assignment

### E-commerce Features
- Product catalog with filtering and search
- Product detail pages with reviews
- Shopping cart management
- Order management
- User dashboard
- Admin/Superadmin dashboards

## Project Structure

```
/src
  /app
    /components
      /ui              # Reusable UI components
      Header.tsx       # Main navigation header
      Footer.tsx       # Site footer
    /contexts
      AuthContext.tsx  # Authentication state management
      CartContext.tsx  # Shopping cart state management
    /pages
      /auth
        Login.tsx           # Email/password login
        Register.tsx        # User registration
        OTPLogin.tsx        # OTP-based login
        VerifyOTP.tsx       # OTP verification
      /dashboard
        SuperadminDashboard.tsx  # Superadmin panel
        AdminDashboard.tsx       # Admin panel
        UserDashboard.tsx        # User profile/orders
      Home.tsx          # Homepage
      Shop.tsx          # Product listing
      ProductDetail.tsx # Single product page
      Cart.tsx          # Shopping cart
    /services
      api.ts           # All API endpoint definitions
    routes.tsx         # Route configuration
    App.tsx           # Main app component
```

## API Integration

All API endpoints are defined in `/src/app/services/api.ts`. The application is ready to connect to your Node.js backend.

### Backend URL Configuration
Set your backend URL in an environment variable:
```
REACT_APP_API_URL=http://localhost:3000/api
```

### API Service Usage Example
```typescript
import { productAPI } from './services/api';

// Get all products
const products = await productAPI.getAllProducts({ page: 1, limit: 12 });

// Add to cart
await cartAPI.addToCart({ productId: '123', quantity: 1 });
```

## Authentication Flow

### Email/Password Login
1. User enters email and password
2. Frontend calls `POST /auth/login`
3. Backend returns JWT token and user data
4. Token is stored in localStorage
5. User is redirected to homepage

### OTP Login
1. User enters email or phone number
2. Frontend calls `POST /auth/send-otp`
3. Backend sends OTP to user
4. User enters 6-digit OTP
5. Frontend calls `POST /auth/verify-otp`
6. Backend validates OTP and returns JWT token
7. User is logged in

### Registration with OTP
1. User fills registration form
2. Frontend calls `POST /auth/register`
3. Backend creates account and sends OTP
4. User verifies OTP
5. Account is activated

## Role-Based Access

### Protected Routes
Routes are protected using the `ProtectedRoute` component:
```typescript
<ProtectedRoute allowedRoles={['admin', 'superadmin']}>
  <AdminDashboard />
</ProtectedRoute>
```

### Dashboard Routing
The `/dashboard` route automatically redirects based on user role:
- Superadmin → Superadmin Dashboard
- Admin → Admin Dashboard
- User → User Dashboard

## API Endpoints Summary

### Authentication
- `POST /auth/register` - Register user
- `POST /auth/login` - Login
- `POST /auth/send-otp` - Send OTP
- `POST /auth/verify-otp` - Verify OTP
- `GET /auth/me` - Get current user
- `POST /auth/logout` - Logout

### Products
- `GET /products` - Get all products (with filters)
- `GET /products/:id` - Get product details
- `POST /products` - Create product (Admin/Superadmin)
- `PUT /products/:id` - Update product (Admin/Superadmin)
- `DELETE /products/:id` - Delete product (Admin/Superadmin)

### Cart
- `GET /cart` - Get user's cart
- `POST /cart` - Add to cart
- `PUT /cart/:itemId` - Update quantity
- `DELETE /cart/:itemId` - Remove item

### Orders
- `GET /orders` - Get user's orders
- `GET /orders/all` - Get all orders (Admin/Superadmin)
- `POST /orders` - Create order
- `PUT /orders/:id/status` - Update order status (Admin/Superadmin)

### User Management (Superadmin)
- `GET /users` - Get all users
- `PUT /users/:id/role` - Update user role
- `DELETE /users/:id` - Delete user

### Analytics (Admin/Superadmin)
- `GET /analytics/dashboard` - Dashboard stats
- `GET /analytics/sales` - Sales data
- `GET /analytics/products` - Product analytics

See `/API_DOCUMENTATION.md` for complete API documentation.

## Component Usage

### useAuth Hook
```typescript
import { useAuth } from './contexts/AuthContext';

function MyComponent() {
  const { user, isAuthenticated, login, logout } = useAuth();
  
  return <div>Welcome {user?.name}</div>;
}
```

### useCart Hook
```typescript
import { useCart } from './contexts/CartContext';

function MyComponent() {
  const { items, itemCount, total, addToCart } = useCart();
  
  return <div>Cart has {itemCount} items</div>;
}
```

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## Environment Variables

Create a `.env` file:
```
REACT_APP_API_URL=http://localhost:3000/api
```

## Notes for Backend Development

1. All API calls expect JSON responses
2. Authentication uses JWT tokens in Authorization header
3. Error responses should include a `message` field
4. Pagination uses `page` and `limit` query parameters
5. Role-based access control should validate user roles on the backend

## Mock Data

The frontend includes mock data for demonstration purposes. Once your backend is ready, the application will automatically use real API data.

## UI Components

The project uses shadcn/ui components with Tailwind CSS v4. All UI components are in `/src/app/components/ui/`.

## Deployment Checklist

- [ ] Update `REACT_APP_API_URL` to production backend URL
- [ ] Ensure all API endpoints are implemented
- [ ] Test OTP delivery (email/SMS)
- [ ] Configure CORS on backend
- [ ] Set up proper error handling
- [ ] Implement rate limiting for OTP endpoints
- [ ] Add email/SMS templates
- [ ] Configure payment gateway (if needed)
