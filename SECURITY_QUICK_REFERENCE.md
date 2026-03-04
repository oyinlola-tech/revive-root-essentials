# Security Features Quick Reference Guide

## 🔐 Authentication & Authorization

### Enhanced Authentication Middleware

Located in: `backend/middlewares/authMiddlewareEnhanced.js`

```javascript
const {
  authenticate,           // Verify JWT + check blacklist + session
  authorize,             // Role-based access control
  checkBruteForce,       // Pre-login brute force check
  requireSuperadmin,     // Superadmin-only access
  requireAdmin,          // Admin+ access
  optionalAuth           // Optional authentication
} = require('../middlewares/authMiddlewareEnhanced');
```

### Usage Examples

```javascript
// Protect routes from unauthenticated access
router.get('/profile', authenticate, userController.getProfile);

// Check specific role
router.delete('/users/:id', authenticate, authorize('superadmin'), userController.deleteUser);

// Multiple allowed roles
router.get('/dashboard', authenticate, authorize('admin', 'superadmin'), adminController.getDashboard);

// Protect login from brute force
router.post('/login', checkBruteForce, authController.login);

// Superadmin-only operations
router.post('/system/backup', authenticate, requireSuperadmin, systemController.backup);

// Admin-only operations (admin or superadmin)
router.get('/admin/users', authenticate, requireAdmin, adminController.listUsers);

// Optional authentication (works with or without user)
router.get('/products', optionalAuth, productController.listProducts); // Uses user context if available
```

---

## 🛡️ Brute Force Protection

### How It Works

1. User attempts login
2. System checks if account is locked (after 5 failed attempts)
3. On login failure, attempt is recorded in Redis
4. After 5 failures, account locked for 15 minutes
5. On successful login, attempt counter reset
6. Admin can manually unlock accounts

### Implementation

The brute force protector is automatically initialized in `securityUtils.js`:

```javascript
const { bruteForceProtector } = require('../utils/securityUtils');

// In login route (already done in authController):
const isLocked = await bruteForceProtector.isLocked(email);
if (isLocked) {
  return next(new AppError('Account temporarily locked...', 429));
}

// On failed attempt (already done):
const result = await bruteForceProtector.recordFailedAttempt(email);
if (result.locked) {
  // Account is now locked
}

// On successful login (already done):
await bruteForceProtector.resetAttempts(email);
```

### Admin Unlock

```javascript
// Create endpoint to unlock accounts (admin-only)
router.post('/admin/users/:userId/unlock', authenticate, requireAdmin, async (req, res) => {
  const user = await User.findByPk(req.params.userId);
  await bruteForceProtector.clearLock(user.email);
  res.json({ message: 'Account unlocked' });
});
```

---

## 🚪 Token Blacklist & Logout

### How It Works

1. User logs in → gets JWT token
2. User logs out → token added to Redis blacklist
3. Token remains in blacklist for its expiry duration (7 days)
4. Any request with blacklisted token is rejected
5. On server restart, only active tokens in TTL are checked

### Implementation

The token blacklist is automatically initialized in `securityUtils.js`:

```javascript
const { tokenBlacklist } = require('../utils/securityUtils');

// In logout endpoint (already done in authController):
await tokenBlacklist.blacklistToken(req.token, expiryMs);

// Token checking (already done in authenticate middleware):
const isBlacklisted = await tokenBlacklist.isBlacklisted(token);
if (isBlacklisted) {
  return next(new AppError('Session expired...', 401));
}
```

---

## ✔️ Input Validation

### File Uploads

```javascript
const { validateFileUpload } = require('../validations/advancedValidation');

// Validate image upload (PNG, JPEG, GIF, WebP max 10MB)
router.post('/upload', validateFileUpload(), uploadController.upload);

// Custom validation
router.post('/upload-document', 
  validateFileUpload(['application/pdf', 'application/msword'], 5 * 1024 * 1024),
  uploadController.uploadDocument
);
```

### Coupon Validation

```javascript
const { createCouponValidation } = require('../validations/advancedValidation');

router.post('/admin/coupons', 
  authenticate, 
  requireAdmin,
  createCouponValidation,
  couponController.create
);

// Validates:
// - Code format (A-Z, 0-9, -, _)
// - Discount type (percentage or fixed)
// - Discount value (positive number)
// - Min/max amounts
// - Expiry date
```

### Inventory Validation

```javascript
const { createInventoryValidation } = require('../validations/advancedValidation');

router.post('/admin/inventory',
  authenticate,
  requireAdmin,
  createInventoryValidation,
  inventoryController.create
);
```

### Refund Validation

```javascript
const { createRefundValidation } = require('../validations/advancedValidation');

router.post('/refunds',
  authenticate,
  createRefundValidation,
  refundController.create
);

// Validates:
// - Order ID exists
// - Reason (10-500 chars)
// - Item IDs format
```

### Address Validation

```javascript
const { addressValidation } = require('../validations/advancedValidation');

router.post('/addresses',
  authenticate,
  addressValidation,
  userController.createAddress
);

// Validates complete address fields:
// - First name, Last name
// - Street, City, State, Country
// - Postal code
// - Phone number
```

---

## 📊 Audit Logging

### Basic Logging

```javascript
const auditService = require('../services/auditService');

// Log a simple action
await auditService.log(
  userId,
  'CREATE',
  'Product',
  productId,
  { ipAddress: req.ip }
);
```

### Log with Changes

```javascript
const auditService = require('../services/auditService');

// Log update with before/after values
const changes = auditService.buildChangesObject(oldProduct, newProduct);

await auditService.log(
  userId,
  'UPDATE',
  'Product',
  productId,
  {
    ipAddress: req.ip,
    changes,
    statusCode: 200
  }
);
```

### Log from Request

```javascript
// Simplest approach - extracts IP and user agent automatically
await auditService.logRequest(
  req,
  'DELETE',
  'User',
  userId,
  { statusCode: 204 }
);
```

### Query Audit Logs

```javascript
// Get all logs
const logs = await auditService.getLogs({
  limit: 50,
  offset: 0
});

// Get logs for specific action
const productLogs = await auditService.getLogs({
  action: 'CREATE',
  resourceType: 'Product',
  limit: 20
});

// Get logs by date range
const logs = await auditService.getLogs({
  startDate: new Date('2026-03-01'),
  endDate: new Date('2026-03-31'),
  limit: 100
});

// Get logs for specific user
const userActions = await auditService.getUserLogs(userId, 50);

// Get logs for specific resource
const changes = await auditService.getResourceLogs('Product', productId);
```

### Create Admin Audit Endpoint

```javascript
// Get audit logs (admin-only)
router.get('/admin/audit-logs', authenticate, requireAdmin, async (req, res) => {
  const filters = {
    action: req.query.action,
    userId: req.query.userId,
    resourceType: req.query.resourceType,
    startDate: req.query.startDate ? new Date(req.query.startDate) : null,
    endDate: req.query.endDate ? new Date(req.query.endDate) : null,
    limit: Math.min(parseInt(req.query.limit) || 50, 200),
    offset: parseInt(req.query.offset) || 0,
  };

  const result = await auditService.getLogs(filters);
  res.json(result);
});
```

---

## 🏪 Inventory Management

### Check Stock

```javascript
const inventoryService = require('../services/inventoryService');

// Quick check
const hasStock = await inventoryService.hasStock(productId, quantity);

if (!hasStock) {
  return next(new AppError('Out of stock', 400));
}
```

### Reserve Stock for Order

```javascript
// When order is placed
const inventory = await inventoryService.reserveStock(productId, quantity);
// Reserved quantity is incremented, but total quantity unchanged
```

### Deduct Stock on Confirmation

```javascript
// When payment confirmed
await inventoryService.deductStock(productId, quantity, 'payment_confirmed');
// Total quantity decreased, reserved quantity decreased
```

### Release Stock on Cancellation

```javascript
// When order cancelled
await inventoryService.releaseStock(productId, quantity);
// Reserved quantity decreased, total unchanged
```

### Get Low Stock Items

```javascript
const reorderItems = await inventoryService.getReorderItems();
// Returns products where quantity <= reorder_level
```

---

## 🎫 Coupon Management

### Apply Coupon

```javascript
const couponService = require('../services/couponService');

// In order creation controller
const discount = await couponService.applyCoupon('SAVE10', orderTotal, userId);

const finalAmount = discount.finalAmount; // Already discounted

// On success, increment usage
await couponService.useCoupon(discount.couponId);
```

### Validate Coupon (before order)

```javascript
const validation = await couponService.validateCoupon('SAVE10');

if (!validation.valid) {
  return res.json({
    valid: false,
    message: validation.reason
  });
}

// Show discount info to user
res.json({
  valid: true,
  discount: validation.coupon.discountValue,
  minAmount: validation.coupon.minOrderAmount
});
```

### Get Active Coupons (for display)

```javascript
// Show available coupons on shop page
const activeCoupons = await couponService.getActiveCoupons();
res.json(activeCoupons);
```

---

## 🚨 Error Handling

All security validations throw `AppError` which are caught by the global error handler.

```javascript
// Automatic 400 response
throw new AppError('Invalid coupon code', 400);

// Automatic 401 response
throw new AppError('Unauthorized access', 401);

// Automatic 403 response
throw new AppError('Forbidden', 403);

// Automatic 429 response
throw new AppError('Too many requests', 429);
```

---

## 🔄 Integration Checklist

- [ ] Update login route to use `checkBruteForce`
- [ ] Update protected routes to use `authenticate` + `authorize`
- [ ] Create admin endpoints with `requireAdmin`
- [ ] Add audit logging to all admin operations
- [ ] Add file upload validation to image endpoints
- [ ] Add inventory checks before confirming orders
- [ ] Add coupon validation and application
- [ ] Create admin audit log endpoint
- [ ] Create admin unlock account endpoint
- [ ] Create refund request endpoints

---

## 📞 Support

For questions about these security features, refer to:
- Security utils: `backend/utils/securityUtils.js`
- Auth middleware: `backend/middlewares/authMiddlewareEnhanced.js`
- Validations: `backend/validations/advancedValidation.js`
- Services: `backend/services/couponService.js`, `inventoryService.js`, `auditService.js`
- Models: `backend/models/` (Coupon.js, Inventory.js, AuditLog.js, RefundRequest.js)

---

**Last Updated**: March 4, 2026  
**Version**: 1.0
