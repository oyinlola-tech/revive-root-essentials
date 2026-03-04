# Frontend Implementation Plan

## Customer Pages to Create

### 1. Order Management Pages
- **OrderHistory.tsx** - List all user orders with pagination, filtering, and search
- **OrderDetail.tsx** - Show single order details with items, status, shipping info
- **Invoice.tsx** - Display and allow download of order invoice

### 2. Refund Pages
- **RefundRequest.tsx** - Form to request refund with reason and attachments
- **RefundTracking.tsx** - View refund status and history

### 3. Account Management
- **AddressManagement.tsx** - Add/edit/delete shipping addresses
- (Account.tsx - already exists, may need update)

## Admin Pages to Create

### 1. Dashboard & Analytics
- **AdminProducts.tsx** - Product CRUD interface
- **AdminOrders.tsx** - Order management and status updates
- **AdminUsers.tsx** - User management and role assignment
- **AdminCoupons.tsx** - Create/manage discount coupons
- **AdminInventory.tsx** - Stock management and reorder alerts
- **AdminAuditLogs.tsx** - View audit trail for compliance

### 2. Updates to Existing
- **AdminDashboard.tsx** - Update to use new analytics API

## API Service Extensions (services/api.ts)

### Customer APIs
- getOrders() - Fetch user orders
- getOrder(id) - Fetch single order
- downloadInvoice(orderId) - Download invoice PDF
- createRefund() - Submit refund request
- getRefunds() - Fetch refund requests
- getAddresses() - Fetch saved addresses
- addAddress() - Add new address
- updateAddress() - Edit address
- deleteAddress() - Remove address

### Admin APIs
- getAllOrders() - Admin: all orders
- updateOrderStatus() - Admin: change order status
- getAllUsers() - Admin: all users
- updateUser() - Admin: update user role/status
- getDashboard() - Admin: dashboard stats
- getAnalytics() - Admin: detailed analytics
- getStats() - Admin: summary stats

### Coupon APIs
- getCoupons() - Customer: active coupons
- applyCoupon() - Apply code at checkout
- validateCoupon() - Pre-validate code
- createCoupon() - Admin: create coupon
- getAllCoupons() - Admin: list all coupons
- updateCoupon() - Admin: edit coupon
- deleteCoupon() - Admin: delete coupon

### Inventory APIs
- getInventory() - Admin: stock levels
- adjustInventory() - Admin: change stock
- getReorderItems() - Admin: low stock alerts

### Audit APIs
- getAuditLogs() - Admin: view audit trail
- exportAuditLogs() - Admin: export as CSV

## Components to Create/Update

### Forms
- RefundRequestForm.tsx
- CouponForm.tsx (admin)
- AddressForm.tsx
- InventoryAdjustForm.tsx (admin)
- UserRoleForm.tsx (admin)

### Lists
- OrderList.tsx
- RefundList.tsx
- UserList.tsx (admin)
- CouponList.tsx (admin)
- InventoryList.tsx (admin)
- AuditLogList.tsx (admin)

### Shared Components
- OrderCard.tsx
- RefundStatusBadge.tsx
- InventoryAlert.tsx
- AdminLayout.tsx (if missing)
- DataTable.tsx (reusable table)

## State Management Needs

Consider adding:
- OrderStore - Zustand/Context for orders
- RefundStore - For refund requests
- AdminStore - For admin features
- CouponStore - For coupons
- InventoryStore - For stock levels

## Routing Updates (routes.tsx)

Add routes:
- `/orders` - Order history
- `/orders/:id` - Order detail
- `/invoices/:id` - Invoice view
- `/refunds` - Refund list
- `/refunds/new` - Request refund
- `/addresses` - Address management
- `/admin/products` - Product management
- `/admin/orders` - Order management
- `/admin/users` - User management
- `/admin/coupons` - Coupon management
- `/admin/inventory` - Inventory management
- `/admin/audit-logs` - Audit logs

## Priority Order

1. **P0 (Critical)** - Core customer features
   - OrderHistory, OrderDetail, Invoice
   - RefundRequest, RefundTracking
   - AddressManagement

2. **P1 (High)** - Admin essentials
   - AdminProducts, AdminOrders
   - AdminCoupons, AdminInventory
   - AdminUsers

3. **P2 (Medium)** - Polish
   - AdminAuditLogs
   - AdminDashboard update
   - Forms and components

4. **P3 (Nice-to-have)**
   - Advanced filtering
   - Bulk operations
   - Export features
