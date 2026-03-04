# Revive Roots Essentials - API Documentation

## Base URL
- **Development:** `http://localhost:3000/api`
- **Production:** `https://api.reviverootsessentials.com/api`

## Authentication
All protected endpoints require a Bearer token in the Authorization header:
```
Authorization: Bearer <token>
```

## Response Format
All API responses follow this format:
```json
{
  "data": {},
  "error": false,
  "message": "Success"
}
```

---

## Authentication Endpoints

### POST /auth/register
Register a new user account.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePassword123!",
  "acceptedTerms": true,
  "acceptedMarketing": false,
  "acceptedNewsletter": false
}
```

**Response:** 
```json
{
  "token": "jwt_token",
  "refreshToken": "refresh_token",
  "user": {
    "id": "uuid",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user"
  }
}
```

### POST /auth/login
Login with email and password.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "SecurePassword123!"
}
```

**Response:** Same as register

### POST /auth/send-otp
Send OTP for verification.

**Request Body:**
```json
{
  "email": "john@example.com",
  "type": "registration"
}
```

### POST /auth/verify-otp
Verify OTP code.

**Request Body:**
```json
{
  "identifier": "john@example.com",
  "otp": "123456"
}
```

### POST /auth/oauth/google
Login with Google OAuth token.

**Request Body:**
```json
{
  "idToken": "google_id_token",
  "acceptedTerms": true
}
```

### POST /auth/oauth/apple
Login with Apple OAuth token.

**Request Body:**
```json
{
  "idToken": "apple_id_token",
  "acceptedTerms": true
}
```

### POST /auth/refresh-token
Refresh access token.

**Request Body:**
```json
{
  "refreshToken": "refresh_token"
}
```

### GET /auth/me
Get current user profile (Protected).

### POST /auth/logout
Logout user (Protected).

### POST /auth/change-password
Change user password (Protected).

**Request Body:**
```json
{
  "currentPassword": "OldPassword123!",
  "newPassword": "NewPassword123!"
}
```

### POST /auth/reset-password
Initiate password reset.

**Request Body:**
```json
{
  "email": "john@example.com"
}
```

---

## Product Endpoints

### GET /products
Get all products with pagination and filtering.

**Query Parameters:**
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 12, max: 50)
- `search` - Search by product name
- `minPrice` - Filter by minimum price
- `maxPrice` - Filter by maximum price
- `category` - Filter by category (comma-separated)
- `sort` - Sort by: `name`, `price-asc`, `price-desc`, `newest`, `ranked`

**Response:**
```json
{
  "products": [...],
  "total": 100,
  "page": 1,
  "limit": 12
}
```

### GET /products/featured
Get featured products.

### GET /products/bestsellers
Get bestselling products.

### GET /products/:id
Get product by ID.

### GET /products/slug/:slug
Get product by slug.

### GET /products/resolve/:identifier
Resolve product by ID or slug.

### POST /products
Create new product (Admin only).

**Request Body:**
```json
{
  "name": "Product Name",
  "description": "Description",
  "price": 9999,
  "imageUrl": "https://...",
  "categoryId": "uuid",
  "ingredients": ["Ingredient 1"],
  "benefits": ["Benefit 1"],
  "howToUse": "Instructions",
  "size": "100ml",
  "stock": 50,
  "isFeatured": false
}
```

### PUT /products/:id
Update product (Admin only).

### DELETE /products/:id
Delete product (Admin only).

---

## Category Endpoints

### GET /categories
Get all categories (cached).

### POST /categories
Create category (Admin only).

**Request Body:**
```json
{
  "name": "Category Name",
  "description": "Description"
}
```

### PUT /categories/:id
Update category (Admin only).

### DELETE /categories/:id
Delete category (Admin only).

---

## Cart Endpoints

### GET /cart
Get user's cart (Protected).

### POST /cart
Add item to cart (Protected).

**Request Body:**
```json
{
  "productId": "uuid",
  "quantity": 1
}
```

### PUT /cart/:itemId
Update cart item quantity (Protected).

**Request Body:**
```json
{
  "quantity": 2
}
```

### DELETE /cart/:itemId
Remove item from cart (Protected).

### DELETE /cart
Clear entire cart (Protected).

---

## Order Endpoints

### GET /orders
Get user's orders (Protected).

### GET /orders/:id
Get specific order (Protected).

### POST /orders
Create new order (Protected).

**Request Body:**
```json
{
  "items": [
    {
      "productId": "uuid",
      "quantity": 1
    }
  ],
  "shippingAddress": {
    "country": "Nigeria",
    "state": "Lagos",
    "city": "Lekki",
    "line1": "123 Main Street",
    "postalCode": "100001"
  },
  "paymentMethod": "card",
  "currency": "NGN"
}
```

**Response:**
```json
{
  "orderId": "uuid",
  "orderNumber": "ORD-xxx",
  "total": 25000,
  "status": "pending",
  "paymentUrl": "https://flutterwave-checkout-url"
}
```

### POST /orders/:id/verify-payment
Verify order payment (Protected).

**Request Body:**
```json
{
  "transactionId": "flutterwave_transaction_id",
  "reference": "order_reference"
}
```

### GET /orders/all
Get all orders (Admin only).

### PUT /orders/:id/status
Update order status (Admin only).

**Request Body:**
```json
{
  "status": "shipped"
}
```

### POST /orders/:id/refund
Refund order (Admin only).

### DELETE /orders/:id
Cancel order (Protected).

---

## Wishlist Endpoints

### GET /wishlist
Get user's wishlist (Protected).

### POST /wishlist
Add product to wishlist (Protected).

**Request Body:**
```json
{
  "productId": "uuid"
}
```

### DELETE /wishlist/:productId
Remove from wishlist (Protected).

### DELETE /wishlist
Clear wishlist (Protected).

---

## Review Endpoints

### GET /reviews/product/:productId
Get product reviews.

### POST /reviews
Create review (Protected).

**Request Body:**
```json
{
  "productId": "uuid",
  "rating": 5,
  "comment": "Great product!"
}
```

### PUT /reviews/:id
Update review (Protected).

### DELETE /reviews/:id
Delete review (Protected).

---

## Contact Endpoints

### POST /contact
Submit contact form (Rate limited).

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "subject": "Inquiry",
  "message": "I have a question..."
}
```

---

## Newsletter Endpoints

### POST /newsletter/subscribe
Subscribe to newsletter.

**Request Body:**
```json
{
  "email": "john@example.com"
}
```

### GET /newsletter/unsubscribe
Unsubscribe from newsletter.

**Query Parameters:**
- `token` - Unsubscribe token

---

## Shipping Endpoints

### GET /shipping-fees
Get shipping fees by country/state.

**Query Parameters:**
- `country` - Country name
- `state` - State/Province name

---

## User Endpoints

### GET /users/:id
Get user by ID (Protected/Admin).

### PUT /users/:id
Update user profile (Protected).

**Request Body:**
```json
{
  "name": "New Name",
  "phone": "+234...",
  "acceptedMarketing": true,
  "acceptedNewsletter": false
}
```

### DELETE /users/me/account
Delete own account (Protected).

### GET /users
Get all users (Admin only).

### POST /users/admin-account
Create admin account (Superadmin only).

### DELETE /users/:id
Delete user (Superadmin only).

### PUT /users/:id/role
Update user role (Superadmin only).

**Request Body:**
```json
{
  "role": "admin"
}
```

---

## Analytics Endpoints

### GET /analytics/dashboard
Get dashboard statistics (Admin only).

### GET /analytics/sales
Get sales data (Admin only).

**Query Parameters:**
- `startDate` - Start date (ISO string)
- `endDate` - End date (ISO string)

---

## Error Responses

All errors follow this format:
```json
{
  "error": true,
  "message": "Error description"
}
```

## Status Codes

- **200** - OK
- **201** - Created
- **204** - No Content
- **400** - Bad Request
- **401** - Unauthorized
- **403** - Forbidden
- **404** - Not Found
- **429** - Too Many Requests
- **500** - Internal Server Error

## Rate Limiting

- **Global:** 300 requests per 15 minutes
- **Authentication:** 30 requests per 15 minutes
- **Contact:**10 requests per hour
- **Newsletter:** 10 requests per hour
- **Orders:** 10 requests per minute

## Security Headers

The API returns the following security headers:
- `X-Content-Type-Options`: nosniff
- `X-Frame-Options`: DENY
- `X-XSS-Protection`: 1; mode=block
- `Content-Security-Policy`: Configured
- `Referrer-Policy`: strict-origin-when-cross-origin
- `Strict-Transport-Security`: Configured (production)

## Flutterwave Payment Integration

### Payment Methods
- Card (Visa, Mastercard, Verve)
- USSD
- Bank Transfer

### Callback URL
After payment, users are redirected to:
```
/orders/:orderId?transaction_id=<flutterwave_id>&tx_ref=<order_number>
```

### Webhook
Flutterwave webhook endpoint:
```
POST /api/orders/flutterwave/webhook
```

Header verification:
```
verif-hash: sha512 hash of request body + FLW_WEBHOOK_SECRET_HASH
```

---

## Caching

The following endpoints use Redis caching:
- **GET /products/featured** (24 hours)
- **GET /categories** (7 days)
- **GET /products** (1 hour)
- **Product details** (24 hours)

Cache is automatically invalidated on create/update/delete operations.

---

## Environment Variables

### Backend (.env)
```
NODE_ENV=production
PORT=3000
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=password
DB_NAME=revive_roots

JWT_SECRET=your_secret_key
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=refresh_secret
JWT_REFRESH_EXPIRES_IN=30d

FLW_PUBLIC_KEY=your_flutterwave_public_key
FLW_SECRET_KEY=your_flutterwave_secret_key
FLW_BASE_URL=https://api.flutterwave.com/v3
FLW_WEBHOOK_SECRET_HASH=your_webhook_secret

REDIS_URL=redis://localhost:6379

EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_password

TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
TWILIO_PHONE_NUMBER=+1234567890

CORS_ORIGIN=https://yourdomain.com
FRONTEND_URL=https://yourdomain.com
```

---

## Support

For API help, contact: support@reviverootsessentials.com
