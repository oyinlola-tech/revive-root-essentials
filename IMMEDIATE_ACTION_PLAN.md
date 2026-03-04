# 🎯 IMMEDIATE ACTION PLAN
**Priority Order: Fix → Build → Test → Deploy**

---

## PHASE 1: FRONTEND IMPORT FIXES (15 minutes) 🔴 URGENT

### Task 1.1: Fix OrderHistory.tsx
**File:** `/src/app/pages/OrderHistory.tsx`

**Required Changes:**
```
Change 1: Import statement
   OLD: import { useNavigate } from "react-router-dom";
   NEW: import { useNavigate } from "react-router";

Change 2: API method
   OLD: const order = await getOrder(orderId);
   NEW: const order = await getOrderById(orderId);
```

**How to verify:**
- Open in browser at `/orders`
- Console should have no errors
- Page should load orders list

---

### Task 1.2: Fix OrderDetail.tsx
**File:** `/src/app/pages/OrderDetail.tsx`

**Required Changes:**
```
Change 1: Import statement
   OLD: import { useNavigate } from "react-router-dom";
   NEW: import { useNavigate } from "react-router";

Change 2: API method
   OLD: const order = await getOrder(orderId);
   NEW: const order = await getOrderById(orderId);
```

**How to verify:**
- Open in browser at `/orders/:id`
- Should load order details
- No console errors

---

### Task 1.3: Fix RefundRequest.tsx
**File:** `/src/app/pages/RefundRequest.tsx`

**Required Changes:**
```
Verify: URLSearchParams usage
   Check: const params = new URLSearchParams(location.search);
   Should work correctly without changes

Verify: getOrderById import/usage
   Check: const order = await getOrderById(orderId);
   Should be correct already
```

**How to verify:**
- Open in browser at `/refunds/new`
- Should load refund form
- No console errors

---

## PHASE 2: CREATE REMAINING FRONTEND PAGES (4-5 hours) 🔴 URGENT

### Template for Each Page

All 8 remaining pages should follow this structure:

```typescript
// 1. Import React & dependencies
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';

// 2. Import API service
import * as api from '../services/api';

// 3. Define interfaces
interface PageProps {
  // ...
}

// 4. Define component
export default function PageName() {
  // State
  // Effects
  // Event handlers
  // Render
}

// 5. Export component
```

---

### Task 2.1: Create RefundTracking.tsx
**Purpose:** View refund request status and history  
**Location:** `/src/app/pages/RefundTracking.tsx`
**Time:** 1 hour

**Features Needed:**
- List all refund requests for current user
- Show status (pending, approved, rejected, completed)
- Display timeline of status changes
- Show refund amount and order details
- Display rejection reason if applicable
- Link to original order

**API Methods:**
- `api.getRefunds(limit, offset, status)` - Get user's refunds
- `api.getRefund(refundId)` - Get specific refund details

**UI Components:**
- Refund status badge (pending/approved/rejected/completed)
- Timeline view for status changes
- Refund details card
- Pagination controls

---

### Task 2.2: Create AddressManagement.tsx
**Purpose:** Manage shipping and billing addresses  
**Location:** `/src/app/pages/AddressManagement.tsx`
**Time:** 1 hour

**Features Needed:**
- List all saved addresses
- Add new address form
- Edit existing address
- Delete address
- Set default shipping address
- Set default billing address
- Form validation

**API Methods:**
- Create these if not existing:
  - `api.getAddresses()` - Get all addresses
  - `api.createAddress(data)` - Add new address
  - `api.updateAddress(id, data)` - Edit address
  - `api.deleteAddress(id)` - Delete address
  - `api.setDefaultAddress(id, type)` - Set default

**UI Components:**
- Address form with validation
- Address list with edit/delete actions
- Default indicator badge
- Confirmation dialog for delete

---

### Task 2.3: Create AdminProducts.tsx
**Purpose:** Admin product management interface  
**Location:** `/src/app/pages/admin/AdminProducts.tsx`
**Time:** 1.5 hours

**Features Needed:**
- List all products (paginated)
- Create new product form
- Edit product details
- Delete product
- Bulk actions (edit, delete)
- Filter by category
- Filter by stock status
- Search by name/SKU

**API Methods:**
- `api.getAdminProducts()` - List all products
- `api.createAdminProduct(data)` - Create product
- `api.updateAdminProduct(id, data)` - Update product
- `api.deleteAdminProduct(id)` - Delete product
- Bulk methods (if available)

**UI Components:**
- Product table with pagination
- Product form (create/edit modal)
- Filter controls
- Search bar
- Bulk action toolbar
- Confirmation dialogs

---

### Task 2.4: Create AdminOrders.tsx
**Purpose:** Admin order management interface  
**Location:** `/src/app/pages/admin/AdminOrders.tsx`
**Time:** 1.5 hours

**Features Needed:**
- List all orders (paginated)
- Filter by status (pending, processing, shipped, delivered, cancelled)
- Filter by payment status (pending, paid, failed, refunded)
- View order details
- Update order status
- Update payment status
- Download invoice
- View customer details

**API Methods:**
- `api.adminGetOrders(limit, offset, status)` - List all orders
- `api.adminUpdateOrderStatus(id, status)` - Update status
- `api.getOrderById(id)` - Get order details (if not in admin API)

**UI Components:**
- Order table with pagination
- Status filter dropdowns
- Order detail modal
- Status update form
- Timeline view
- Customer info card

---

### Task 2.5: Create AdminUsers.tsx
**Purpose:** Admin user management interface  
**Location:** `/src/app/pages/admin/AdminUsers.tsx`
**Time:** 1.5 hours

**Features Needed:**
- List all users (paginated)
- Filter by role (customer, admin, superadmin)
- Filter by status (active, inactive, suspended)
- View user details
- Update user role
- Update user status
- View user's orders and activity
- Search by email/name

**API Methods:**
- `api.adminGetUsers(limit, offset, role)` - List all users
- `api.adminGetUser(id)` - Get user details
- `api.adminUpdateUser(id, data)` - Update user

**UI Components:**
- User table with pagination
- Role and status filter dropdowns
- User detail modal
- Role/status update form
- Activity timeline
- Search bar

---

### Task 2.6: Create AdminCoupons.tsx
**Purpose:** Admin coupon management interface  
**Location:** `/src/app/pages/admin/AdminCoupons.tsx`
**Time:** 1 hour

**Features Needed:**
- List all coupons (paginated)
- Create new coupon form
- Edit coupon details
- Delete coupon
- View usage statistics
- Filter by active/expired
- Search by code
- Show discount type (percentage/fixed)
- Show usage limits

**API Methods:**
- `api.adminGetCoupons(limit, offset)` - List coupons
- `api.adminCreateCoupon(data)` - Create coupon
- `api.adminUpdateCoupon(id, data)` - Update coupon
- `api.adminDeleteCoupon(id)` - Delete coupon

**UI Components:**
- Coupon table with pagination
- Coupon form (create/edit modal)
- Discount type selector
- Date picker for expiration
- Usage limit input
- Confirmation dialogs

---

### Task 2.7: Create AdminInventory.tsx
**Purpose:** Admin inventory/stock management interface  
**Location:** `/src/app/pages/admin/AdminInventory.tsx`
**Time:** 1.5 hours

**Features Needed:**
- List all inventory (paginated)
- Show current stock, reserved, available
- Adjust stock (add/subtract with reason)
- Set reorder levels
- View low stock alerts
- View inventory history
- Search by product name/SKU
- Filter by stock status (low, critical, normal)

**API Methods:**
- `api.adminGetInventory(limit, offset)` - List inventory
- `api.adminAdjustInventory(id, quantity, reason)` - Adjust stock
- `api.adminGetReorderItems()` - Get low stock items

**UI Components:**
- Inventory table with pagination
- Stock adjustment modal
- Adjustment reason form
- Reorder level input
- Low stock alerts
- Filter and search controls
- History timeline

---

### Task 2.8: Create AdminAuditLogs.tsx
**Purpose:** Admin audit log viewer for compliance  
**Location:** `/src/app/pages/admin/AdminAuditLogs.tsx`
**Time:** 1 hour

**Features Needed:**
- List all audit logs (paginated)
- Filter by action type
- Filter by resource type
- Filter by user
- Filter by date range
- View log details with full change history
- Show field-level changes (old → new)
- Show user IP and user agent
- Export to CSV
- Search by description

**API Methods:**
- `api.adminGetAuditLogs(limit, offset, action)` - List logs
- `api.adminExportAuditLogs()` - Export as CSV

**UI Components:**
- Audit log table with pagination
- Filter controls (action, resource, user, date)
- Log detail modal showing all fields
- Change history view (before/after)
- Search bar
- Export button
- IP/User Agent info display

---

## PHASE 3: UPDATE FRONTEND ROUTES (30 minutes) 🔴 URGENT

### Task 3.1: Update src/app/routes.tsx

**Add New Route Definitions:**

```typescript
// Customer Routes
{
  path: '/refunds',
  element: <RefundTracking />,
  requiresAuth: true,
}
{
  path: '/refunds/new/:orderId',
  element: <RefundRequest />,
  requiresAuth: true,
}
{
  path: '/addresses',
  element: <AddressManagement />,
  requiresAuth: true,
}

// Admin Routes (all require admin role)
{
  path: '/admin/products',
  element: <AdminProducts />,
  requiresAuth: true,
  requiresAdmin: true,
}
{
  path: '/admin/orders',
  element: <AdminOrders />,
  requiresAuth: true,
  requiresAdmin: true,
}
{
  path: '/admin/users',
  element: <AdminUsers />,
  requiresAuth: true,
  requiresAdmin: true,
}
{
  path: '/admin/coupons',
  element: <AdminCoupons />,
  requiresAuth: true,
  requiresAdmin: true,
}
{
  path: '/admin/inventory',
  element: <AdminInventory />,
  requiresAuth: true,
  requiresAdmin: true,
}
{
  path: '/admin/audit-logs',
  element: <AdminAuditLogs />,
  requiresAuth: true,
  requiresAdmin: true,
}
```

### Task 3.2: Update Navigation Links

**Add to Sidebar/Menu:**
```
Customer Menu:
├─ Orders → /orders
├─ Refunds → /refunds
├─ Addresses → /addresses
└─ Account → /account

Admin Menu (visible only if admin):
├─ Dashboard → /admin
├─ Products → /admin/products
├─ Orders → /admin/orders
├─ Users → /admin/users
├─ Coupons → /admin/coupons
├─ Inventory → /admin/inventory
└─ Audit Logs → /admin/audit-logs
```

### Task 3.3: Test Navigation

**Checklist:**
- [ ] Click each route in sidebar/menu
- [ ] Page should load correctly
- [ ] No console errors
- [ ] Admin routes only visible when logged in as admin
- [ ] Customer routes only visible when authenticated

---

## PHASE 4: TESTING (2-3 hours) 🟠 IMPORTANT

### Task 4.1: Frontend Testing (1 hour)

**Test All Pages Load:**
- [ ] `/orders` - OrderHistory loads, displays orders
- [ ] `/orders/:id` - OrderDetail loads, shows details
- [ ] `/refunds` - RefundTracking loads
- [ ] `/refunds/new/:orderId` - RefundRequest form loads
- [ ] `/addresses` - AddressManagement loads
- [ ] `/admin/products` - AdminProducts loads (admin only)
- [ ] `/admin/orders` - AdminOrders loads (admin only)
- [ ] `/admin/users` - AdminUsers loads (admin only)
- [ ] `/admin/coupons` - AdminCoupons loads (admin only)
- [ ] `/admin/inventory` - AdminInventory loads (admin only)
- [ ] `/admin/audit-logs` - AdminAuditLogs loads (admin only)

**Test Page Functionality:**
- [ ] Load data from API
- [ ] Display data correctly
- [ ] Pagination works
- [ ] Filtering works
- [ ] Sorting works
- [ ] Forms submit
- [ ] Error messages display
- [ ] Loading spinners show/hide

**Test Security:**
- [ ] Customer pages require authentication
- [ ] Admin pages require admin role
- [ ] Cannot access admin pages as customer
- [ ] Proper error messages on unauthorized access

---

### Task 4.2: Backend API Testing (1 hour)

**Test All 46 Endpoints:**

**Refund Endpoints (8):**
```bash
✅ POST /api/refunds - Create refund request
✅ GET /api/refunds - Get user's refunds
✅ GET /api/refunds/:id - Get specific refund
✅ PATCH /api/admin/refunds/:id/approve - Admin approve
✅ PATCH /api/admin/refunds/:id/reject - Admin reject
✅ PATCH /api/admin/refunds/:id/complete - Admin complete
✅ GET /api/admin/refunds - Admin list all
✅ GET /api/admin/refunds/stats - Admin stats
```

**Coupon Endpoints (9):**
```bash
✅ GET /api/coupons - Get active coupons
✅ POST /api/coupons/apply - Apply coupon
✅ POST /api/coupons/validate - Validate coupon
✅ POST /api/admin/coupons - Create coupon (admin)
✅ GET /api/admin/coupons - List coupons (admin)
✅ GET /api/admin/coupons/:id - Get coupon (admin)
✅ PUT /api/admin/coupons/:id - Update coupon (admin)
✅ DELETE /api/admin/coupons/:id - Delete coupon (admin)
✅ GET /api/admin/coupons/stats - Stats (admin)
```

**Inventory Endpoints (10):**
```bash
✅ GET /api/admin/inventory - List inventory (admin)
✅ POST /api/admin/inventory/:id/adjust - Adjust stock (admin)
✅ POST /api/admin/inventory/:id/reserve - Reserve stock (admin)
✅ POST /api/admin/inventory/:id/release - Release reservation (admin)
✅ GET /api/admin/inventory/reorder/items - Low stock (admin)
✅ GET /api/admin/inventory/stats - Stats (admin)
✅ POST /api/admin/inventory - Create inventory (admin)
✅ PUT /api/admin/inventory/:id - Update inventory (admin)
✅ DELETE /api/admin/inventory/:id - Delete inventory (admin)
✅ GET /api/admin/inventory/:id - Get specific (admin)
```

**Admin Endpoints (10):**
```bash
✅ GET /api/admin/dashboard - Dashboard overview
✅ GET /api/admin/analytics - Analytics with trends
✅ GET /api/admin/stats - Summary stats
✅ GET /api/admin/users - List users (paginated)
✅ GET /api/admin/users/:id - Get user details
✅ PATCH /api/admin/users/:id - Update user
✅ GET /api/admin/orders - List orders (paginated)
✅ PATCH /api/admin/orders/:id/status - Update order status
✅ POST /api/admin/products/bulk-update - Bulk update products
✅ POST /api/admin/products/bulk-delete - Bulk delete products
```

**Audit Endpoints (7):**
```bash
✅ GET /api/admin/audit-logs - List audit logs
✅ GET /api/admin/audit-logs/:id - Get specific log
✅ GET /api/admin/audit-logs/stats - Statistics
✅ GET /api/admin/audit-logs/recent - Recent logs
✅ GET /api/admin/audit-logs/summary/by-action - Action summary
✅ GET /api/admin/audit-logs/export/csv - CSV export
✅ GET /api/admin/audit-logs/resource/:type/:id - Resource history
```

**How to Test:**
1. Use Postman collection (see TESTING_GUIDE.md)
2. Or use curl commands (see QUICK_REFERENCE_CARD.md)
3. Verify response status codes
4. Verify response data format
5. Test error cases (missing auth, invalid IDs, etc.)

---

### Task 4.3: Flutterwave Integration Testing (30 min)

**Test Payment Flow:**
- [ ] Initiate payment with valid credentials
- [ ] Verify transaction ID generated
- [ ] Verify payment link works
- [ ] Verify webhook processing (use webhook.site for testing)
- [ ] Verify transaction verification
- [ ] Verify refund processing

**Test Edge Cases:**
- [ ] Invalid amount
- [ ] Missing email
- [ ] Network timeout
- [ ] Webhook signature validation

---

### Task 4.4: Redis Testing (30 min)

**Test Brute Force Protection:**
- [ ] 5 failed login attempts = account locked
- [ ] Cannot login while locked
- [ ] Unlock after 15 minutes
- [ ] Correct password works before locked

**Test Token Blacklist:**
- [ ] Login and get token
- [ ] Logout and blacklist token
- [ ] Cannot use blacklisted token
- [ ] New login gives new token

**Test Rate Limiting:**
- [ ] Global limit works (300 per 15 min)
- [ ] Auth limit works (30 per 15 min)
- [ ] Contact limit works (5 per hour)
- [ ] Get 429 when limit exceeded

---

## PHASE 5: DEPLOYMENT (When Ready) 🟢 PRODUCTION

### Pre-Deployment Checklist:
- [ ] All 11 frontend pages created
- [ ] All routes updated
- [ ] All tests passing
- [ ] No console errors
- [ ] Performance acceptable
- [ ] Security audit passed
- [ ] Database migrations run
- [ ] Environment variables set
- [ ] Backups created
- [ ] Rollback plan ready

### Deployment Steps:
1. Run database migrations
2. Clear Redis cache
3. Deploy backend (health check)
4. Deploy frontend (verify routes)
5. Run smoke tests
6. Monitor logs for errors
7. Alert team when ready

---

## EXECUTION PRIORITY

**Today (Recommended Timeline):**

```
09:00 - 09:15: Phase 1 (Import fixes)        [15 min]
09:15 - 14:00: Phase 2 (Create 8 pages)      [4.75 hours]
14:00 - 14:30: Phase 3 (Update routes)       [30 min]
14:30 - 17:00: Phase 4 (Testing)             [2.5 hours]

Total: ~8 hours of focused development
```

**If running in parallel:**
- Frontend Dev A: Create pages 1-4 (2.5 hrs)
- Frontend Dev B: Create pages 5-8 (2.5 hrs)
- Both: Fix imports & update routes (45 min)
- QA: Start testing while devs finish

**Total with 2 devs: ~4 hours**

---

## SUCCESS CRITERIA

**Phase 1: ✅ All imports fixed, pages load without errors**
**Phase 2: ✅ All 8 pages created with working forms**
**Phase 3: ✅ All routes accessible, navigation works**
**Phase 4: ✅ All tests passing, no errors**
**Phase 5: ✅ Live in production, monitoring active**

---

**Report Generated:** March 4, 2026  
**Status:** Ready for immediate execution  
**Estimated Completion:** 8-10 hours  
**Next Step:** Start Phase 1 (Import Fixes) NOW ➜
