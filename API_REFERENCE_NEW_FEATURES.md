# API Reference - New Exports & Usage

## Security Utils (`backend/utils/securityUtils.js`)

### Classes

#### BruteForceProtector
```javascript
const { bruteForceProtector } = require('../utils/securityUtils');

// Methods:
await bruteForceProtector.recordFailedAttempt(email)      // Returns { locked, attempts, remaining }
await bruteForceProtector.isLocked(email)                 // Returns boolean
await bruteForceProtector.resetAttempts(email)            // Returns boolean
await bruteForceProtector.clearLock(email)                // Returns boolean
await bruteForceProtector.getAttempts(email)              // Returns number
```

#### TokenBlacklist
```javascript
const { tokenBlacklist } = require('../utils/securityUtils');

// Methods:
await tokenBlacklist.blacklistToken(token, expiresIn)     // Returns boolean
await tokenBlacklist.isBlacklisted(token)                 // Returns boolean
```

### Functions

```javascript
const {
  sanitizeInput,           // Clean user input
  escapeHtml,              // Escape HTML chars
  isValidEmail,            // Validate email format
  isValidPhone,            // Validate phone format
  isValidUrl,              // Validate URL format
  isValidFileUpload,       // Validate file (MIME + size)
  bruteForceProtector,     // Brute force protection
  tokenBlacklist,          // Token blacklist
  generateSecureToken,     // Generate random token
  hashPassword,            // Hash password (bcrypt)
  comparePassword,         // Compare password
  validateEmail,           // Old email validation
  timingSafeEqual,         // Timing-safe comparison
  generateCsrfToken,       // Generate CSRF token
  validateIp,              // Validate IP address
  generateRequestFingerprint // Generate device fingerprint
} = require('../utils/securityUtils');
```

---

## Auth Middleware Enhanced (`backend/middlewares/authMiddlewareEnhanced.js`)

```javascript
const {
  authenticate,           // (req, res, next) - Full auth check + blacklist
  authorize,              // (...roles) => (req, res, next) - RBAC
  checkBruteForce,        // (req, res, next) - Pre-login brute force check
  requireSuperadmin,      // (req, res, next) - Superadmin-only
  requireAdmin,           // (req, res, next) - Admin+ only
  optionalAuth            // (req, res, next) - Optional auth without blocking
} = require('../middlewares/authMiddlewareEnhanced');

// Usage in routes:
router.post('/login', checkBruteForce, authController.login);
router.get('/profile', authenticate, userController.profile);
router.delete('/users/:id', authenticate, requireSuperadmin, userController.delete);
router.get('/dashboard', authenticate, authorize('admin', 'superadmin'), adminController.dashboard);
```

---

## Validations (`backend/validations/advancedValidation.js`)

### Coupon Validations

```javascript
const {
  createCouponValidation,    // Array of validation rules
  updateCouponValidation,    // Array of validation rules
  applyCouponValidation      // Array of validation rules
} = require('../validations/advancedValidation');

// Usage:
router.post('/admin/coupons', authenticate, requireAdmin, createCouponValidation, couponController.create);
router.put('/admin/coupons/:id', authenticate, requireAdmin, updateCouponValidation, couponController.update);
router.post('/coupons/apply', applyCouponValidation, cartController.applyCoupon);
```

### Inventory Validations

```javascript
const {
  createInventoryValidation,  // Array of validation rules
  updateInventoryValidation,  // Array of validation rules
  adjustStockValidation       // Array of validation rules
} = require('../validations/advancedValidation');

// Usage:
router.post('/admin/inventory', authenticate, requireAdmin, createInventoryValidation, inventoryController.create);
router.post('/admin/inventory/:id/adjust', authenticate, requireAdmin, adjustStockValidation, inventoryController.adjust);
```

### Refund Validations

```javascript
const {
  createRefundValidation,     // Array of validation rules
  updateRefundValidation      // Array of validation rules
} = require('../validations/advancedValidation');

// Usage:
router.post('/refunds', authenticate, createRefundValidation, refundController.create);
router.patch('/admin/refunds/:id', authenticate, requireAdmin, updateRefundValidation, refundController.update);
```

### Audit Log Validations

```javascript
const {
  auditLogQueryValidation     // Array of validation rules
} = require('../validations/advancedValidation');

// Usage:
router.get('/admin/audit-logs', authenticate, requireAdmin, auditLogQueryValidation, auditController.list);
```

### Address Validations

```javascript
const {
  addressValidation           // Array of validation rules
} = require('../validations/advancedValidation');

// Usage:
router.post('/addresses', authenticate, addressValidation, userController.createAddress);
router.put('/addresses/:id', authenticate, addressValidation, userController.updateAddress);
```

### File Upload Middleware

```javascript
const {
  validateFileUpload,         // (allowedMimes, maxSize) => middleware function
  fileUploadValidation        // Array (empty, validation in middleware)
} = require('../validations/advancedValidation');

// Usage:
router.post('/upload', 
  validateFileUpload(['image/jpeg', 'image/png'], 5 * 1024 * 1024),
  uploadController.upload
);

// Default usage (images only, 10MB max):
router.post('/products/:id/image', 
  validateFileUpload(),
  productController.uploadImage
);
```

---

## Models (`backend/models/`)

### Coupon Model

```javascript
const { Coupon } = require('../models');

// Fields:
Coupon.findAll({ where: { isActive: true, expiresAt: { [Op.gt]: new Date() } } });

// Attributes:
{
  id,                 // UUID
  code,               // String (unique, uppercase)
  description,        // Text
  discountType,       // ENUM: 'percentage' | 'fixed'
  discountValue,      // Decimal
  maxDiscount,        // Decimal (optional)
  minOrderAmount,     // Decimal (optional)
  maxUses,            // Integer (optional)
  maxUsesPerUser,     // Integer (optional)
  currentUses,        // Integer (default: 0)
  expiresAt,          // Date
  isActive,           // Boolean
  createdBy,          // UUID (User.id)
  createdAt,          // Timestamp
  updatedAt           // Timestamp
}

// Associations:
coupon.getCreator() // User who created the coupon
```

### Inventory Model

```javascript
const { Inventory } = require('../models');

// Fields:
const inventory = await Inventory.findOne({ where: { productId } });

// Attributes:
{
  id,                 // UUID
  productId,          // UUID (Product.id)
  sku,                // String (unique, optional)
  quantity,           // Integer (total stock)
  reservedQuantity,   // Integer (reserved for orders)
  warehouseLocation,  // String (optional)
  reorderLevel,       // Integer (optional)
  reorderQuantity,    // Integer (optional)
  lastStockCheck,     // Date (optional)
  notes,              // Text (optional)
  createdAt,          // Timestamp
  updatedAt           // Timestamp
}

// Computed:
available = quantity - reservedQuantity

// Associations:
inventory.getProduct() // Associated Product
```

### AuditLog Model

```javascript
const { AuditLog } = require('../models');

// Attributes:
{
  id,                 // UUID
  userId,             // UUID (User.id, nullable)
  action,             // String: 'CREATE', 'UPDATE', 'DELETE', etc.
  resourceType,       // String: 'Product', 'Order', 'User', etc.
  resourceId,         // String (nullable)
  changes,            // JSON: { field: { before, after } }
  ipAddress,          // String (IPv4/IPv6, optional)
  userAgent,          // Text (optional)
  status,             // ENUM: 'success' | 'failure'
  statusCode,         // Integer (HTTP status, optional)
  errorMessage,       // Text (optional)
  metadata,           // JSON (optional)
  createdAt,          // Timestamp (readonly)
  updatedAt           // Timestamp (always = createdAt)
}

// Associations:
auditLog.getUser() // User who performed action

// Indexes (recommended):
// - (userId, createdAt)
// - (resourceType, resourceId)
// - (action)
```

### RefundRequest Model

```javascript
const { RefundRequest } = require('../models');

// Attributes:
{
  id,                 // UUID
  orderId,            // UUID (Order.id)
  userId,             // UUID (User.id)
  reason,             // Text (required)
  itemIds,            // JSON array (optional, for partial refunds)
  requestedAmount,    // Decimal
  approvedAmount,     // Decimal (optional)
  status,             // ENUM: 'pending' | 'approved' | 'rejected' | 'completed'
  adminNotes,         // Text (optional)
  processedBy,        // UUID (User.id, admin who processed)
  processedAt,        // Date (optional)
  attachments,        // JSON array (file URLs)
  createdAt,          // Timestamp
  updatedAt           // Timestamp
}

// Associations:
refundRequest.getOrder()      // Associated Order
refundRequest.getUser()       // User who requested refund
refundRequest.getProcessor()  // Admin who processed refund
```

---

## Services

### Coupon Service (`backend/services/couponService.js`)

```javascript
const couponService = require('../services/couponService');

// Methods:
await couponService.applyCoupon(code, orderTotal, userId)
// Returns: { couponId, code, discountAmount, originalAmount, finalAmount }

await couponService.validateCoupon(code)
// Returns: { valid: boolean, reason?: string, coupon?: {...} }

await couponService.useCoupon(couponId)
// Returns: Coupon object with updated currentUses

await couponService.getActiveCoupons()
// Returns: Array of active coupon objects
```

### Inventory Service (`backend/services/inventoryService.js`)

```javascript
const inventoryService = require('../services/inventoryService');

// Methods:
await inventoryService.getInventory(productId)
// Returns: { id, productId, sku, quantity, available, reserved, ... }

await inventoryService.hasStock(productId, quantity)
// Returns: boolean

await inventoryService.reserveStock(productId, quantity)
// Returns: Inventory object with reservedQuantity incremented

await inventoryService.releaseStock(productId, quantity)
// Returns: Inventory object with reservedQuantity decremented

await inventoryService.deductStock(productId, quantity, reason)
// Returns: Inventory object with quantity and reservedQuantity decremented

await inventoryService.addStock(productId, quantity, reason)
// Returns: Inventory object with quantity incremented

await inventoryService.getReorderItems()
// Returns: Array of items below reorder level
```

### Audit Service (`backend/services/auditService.js`)

```javascript
const auditService = require('../services/auditService');

// Methods:
await auditService.log(userId, action, resourceType, resourceId, options)
// Returns: AuditLog object

await auditService.logRequest(req, action, resourceType, resourceId, options)
// Returns: AuditLog object (auto-extracts IP and user agent)

await auditService.getLogs(filters)
// Returns: { logs, total, page, limit }
// Filters: { action, userId, resourceType, startDate, endDate, limit, offset }

await auditService.getResourceLogs(resourceType, resourceId)
// Returns: Array of AuditLog objects

await auditService.getUserLogs(userId, limit)
// Returns: Array of AuditLog objects

await auditService.getRecentActions(limit)
// Returns: Array of recent AuditLog objects

auditService.buildChangesObject(oldData, newData)
// Returns: { field: { before, after }, ... } or null
```

---

## Model Associations

```javascript
// User <-> Coupon
user.getCoupons()              // Coupons created by user
coupon.getCreator()            // User who created coupon

// User <-> AuditLog
user.getAuditLogs()            // All actions by user
auditLog.getUser()             // User who performed action

// Order <-> RefundRequest
order.getRefundRequests()      // All refund requests for order
refundRequest.getOrder()       // Associated order

// User <-> RefundRequest (requester)
user.getRefundRequests()       // Refunds requested by user
refundRequest.getUser()        // User who requested refund

// User <-> RefundRequest (processor)
user.getProcessedRefunds()     // Refunds processed by user (admin)
refundRequest.getProcessor()   // Admin who processed refund

// Product <-> Inventory
product.getInventory()         // Inventory for product
inventory.getProduct()         // Product for inventory
```

---

## Usage Examples

### Complete Login Flow with Brute Force

```javascript
const { checkBruteForce } = require('../middlewares/authMiddlewareEnhanced');
const { bruteForceProtector } = require('../utils/securityUtils');

router.post('/auth/login', checkBruteForce, async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });
    
    if (!user || !(await user.comparePassword(password))) {
      const result = await bruteForceProtector.recordFailedAttempt(email);
      if (result.locked) {
        return res.status(429).json({ error: 'Account locked' });
      }
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Success - reset attempts
    await bruteForceProtector.resetAttempts(email);
    
    // Generate tokens...
    res.json({ token, refreshToken, user });
  } catch (error) {
    next(error);
  }
});
```

### Complete Audit Logging Example

```javascript
const auditService = require('../services/auditService');

// Update a product (admin action)
router.put('/admin/products/:id', authenticate, requireAdmin, async (req, res, next) => {
  try {
    const oldProduct = await Product.findByPk(req.params.id);
    const updatedProduct = await oldProduct.update(req.body);
    
    // Log the change
    const changes = auditService.buildChangesObject(oldProduct, updatedProduct);
    await auditService.logRequest(req, 'UPDATE', 'Product', req.params.id, {
      statusCode: 200,
      changes
    });
    
    res.json(updatedProduct);
  } catch (error) {
    // Log failure
    await auditService.logRequest(req, 'UPDATE', 'Product', req.params.id, {
      status: 'failure',
      statusCode: error.statusCode || 500,
      errorMessage: error.message
    });
    next(error);
  }
});
```

---

## Error Handling with AppError

All functions throw `AppError` which are handled by global error middleware:

```javascript
const AppError = require('../utils/AppError');

throw new AppError('Custom error message', 400); // Bad Request
throw new AppError('Unauthorized', 401);         // Unauthorized
throw new AppError('Forbidden', 403);            // Forbidden
throw new AppError('Not Found', 404);            // Not Found
throw new AppError('Too Many Requests', 429);    // Rate Limited
throw new AppError('Server Error', 500);         // Internal Server Error
```

---

**Document Version**: 1.0  
**Last Updated**: March 4, 2026
