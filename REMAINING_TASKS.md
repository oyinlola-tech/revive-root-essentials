# Work Breakdown Structure - Remaining Tasks

## Phase 3: Payment & Refunds (Estimated: 3 hours)

### 3.1 Create Refund Service ✓ Start Here
- [ ] Create `backend/services/refundService.js`
- [ ] Implement refund request creation
- [ ] Implement refund approval/rejection workflow
- [ ] Implement payment reversal to customer
- [ ] Implement email notifications on status change
- [ ] Implement refund status tracking
- [ ] Add refund history retrieval

### 3.2 Create Refund Controller
- [ ] Create `backend/controllers/refundController.js`
- [ ] Create refund request endpoint: `POST /api/refunds`
- [ ] Get refund requests endpoint: `GET /api/refunds`
- [ ] Get single refund endpoint: `GET /api/refunds/:id`
- [ ] Admin approve refund endpoint: `POST /api/admin/refunds/:id/approve`
- [ ] Admin reject refund endpoint: `POST /api/admin/refunds/:id/reject`
- [ ] Admin complete refund endpoint: `POST /api/admin/refunds/:id/complete`

### 3.3 Create Refund Routes
- [ ] Create `backend/routes/refundRoutes.js`
- [ ] Wire up all refund controller methods
- [ ] Add authentication middleware
- [ ] Add admin authorization where needed
- [ ] Add input validation

### 3.4 Update Order Controller
- [ ] Add refund creation on order cancellation
- [ ] Update order status workflow for refunds
- [ ] Add refund tracking to order detail response

### 3.5 Update Order Model
- [ ] Add `refundStatus` field to Order model
- [ ] Add migration if needed
- [ ] Add association with RefundRequest

### 3.6 Payment Failure Handling
- [ ] Update `paymentService.js` to handle failures
- [ ] Send failure notifications via `notificationService`
- [ ] Update order status on payment failure
- [ ] Log payment failures in audit logs

### 3.7 Webhook Improvements
- [ ] Add webhook retry logic (up to 3 attempts)
- [ ] Store webhook events in database for audit
- [ ] Add webhook event replay capability
- [ ] Improve webhook error handling

---

## Phase 4: Admin API Endpoints (Estimated: 4 hours)

### 4.1 Admin Dashboard Endpoint
- [ ] Create `backend/controllers/adminController.js`
- [ ] Create dashboard stats endpoint: `GET /api/admin/dashboard`
- [ ] Return:
  - Total revenue (today, week, month, year)
  - Total orders (by status)
  - Total users
  - Low stock products
  - Recent orders
  - Recent refunds
  - Failed payments

### 4.2 Admin Product Management
- [ ] Create product management endpoint: `POST /api/admin/products`
- [ ] Create product update endpoint: `PUT /api/admin/products/:id`
- [ ] Create product delete endpoint: `DELETE /api/admin/products/:id`
- [ ] Create bulk product upload: `POST /api/admin/products/bulk-import`
- [ ] Add featured product toggle: `PATCH /api/admin/products/:id/featured`
- [ ] Add stock update: `PATCH /api/admin/products/:id/stock`

### 4.3 Admin Order Management
- [ ] Create order list with filtering: `GET /api/admin/orders`
- [ ] Create order detail endpoint: `GET /api/admin/orders/:id`
- [ ] Create order status update: `PATCH /api/admin/orders/:id/status`
- [ ] Create order export (CSV): `GET /api/admin/orders/export`
- [ ] Create bulk status update: `POST /api/admin/orders/bulk-status`

### 4.4 Admin User Management
- [ ] Create user list endpoint: `GET /api/admin/users`
- [ ] Create user detail endpoint: `GET /api/admin/users/:id`
- [ ] Create user update endpoint: `PUT /api/admin/users/:id`
- [ ] Create user suspend endpoint: `POST /api/admin/users/:id/suspend`
- [ ] Create user delete endpoint: `DELETE /api/admin/users/:id`
- [ ] Create user login audit: `GET /api/admin/users/:id/login-history`

### 4.5 Admin Coupon Management
- [ ] Create coupon list endpoint: `GET /api/admin/coupons`
- [ ] Create coupon create endpoint: `POST /api/admin/coupons`
- [ ] Create coupon update endpoint: `PUT /api/admin/coupons/:id`
- [ ] Create coupon delete endpoint: `DELETE /api/admin/coupons/:id`
- [ ] Create coupon deactivate endpoint: `PATCH /api/admin/coupons/:id/deactivate`

### 4.6 Admin Inventory Management
- [ ] Create inventory list endpoint: `GET /api/admin/inventory`
- [ ] Create inventory create endpoint: `POST /api/admin/inventory`
- [ ] Create inventory update endpoint: `PUT /api/admin/inventory/:id`
- [ ] Create stock adjustment endpoint: `POST /api/admin/inventory/:id/adjust`
- [ ] Create reorder items endpoint: `GET /api/admin/inventory/reorder`

### 4.7 Admin Category Management
- [ ] Create category list endpoint: `GET /api/admin/categories`
- [ ] Create category create endpoint: `POST /api/admin/categories`
- [ ] Create category update endpoint: `PUT /api/admin/categories/:id`
- [ ] Create category delete endpoint: `DELETE /api/admin/categories/:id`

### 4.8 Admin Newsletter Management
- [ ] Create subscriber list endpoint: `GET /api/admin/newsletter/subscribers`
- [ ] Create campaign create endpoint: `POST /api/admin/newsletter/campaigns`
- [ ] Create campaign list endpoint: `GET /api/admin/newsletter/campaigns`
- [ ] Create campaign send endpoint: `POST /api/admin/newsletter/campaigns/:id/send`

### 4.9 Admin Audit Logging
- [ ] Create audit log list endpoint: `GET /api/admin/audit-logs`
- [ ] Add comprehensive filtering (action, user, resource, date range)
- [ ] Add CSV export for audit logs
- [ ] Add audit log retention policy

### 4.10 Admin Routes File
- [ ] Create `backend/routes/adminRoutes.js`
- [ ] Wire up all admin endpoints
- [ ] Add `requireAdmin` middleware to all
- [ ] Add input validations

---

## Phase 5: Frontend Admin Dashboard (Estimated: 6 hours)

### 5.1 Admin Layout & Navigation
- [ ] Create admin layout wrapper
- [ ] Create sidebar navigation
- [ ] Create top navigation bar
- [ ] Add admin-only menu items
- [ ] Add breadcrumb navigation
- [ ] Add user menu (logout, profile)

### 5.2 Admin Dashboard Page
- [ ] Create main dashboard page
- [ ] Display dashboard stats cards:
  - Total revenue (by period)
  - Orders count by status
  - Users count
  - Recent activity
- [ ] Create revenue chart
- [ ] Create orders chart by status
- [ ] Create recent orders table
- [ ] Create recent refunds table

### 5.3 Product Management Page
- [ ] Create product list page with pagination
- [ ] Create product creation form
- [ ] Create product edit form
- [ ] Create product delete confirmation
- [ ] Create bulk import form
- [ ] Create featured product toggle
- [ ] Add search and filters
- [ ] Add export to CSV

### 5.4 Order Management Page
- [ ] Create order list with status filter
- [ ] Create order detail view
- [ ] Create order status update UI
- [ ] Create refund button
- [ ] Create order timeline/history
- [ ] Add search by order number
- [ ] Add date range filter
- [ ] Add export to CSV

### 5.5 User Management Page
- [ ] Create user list page
- [ ] Create user detail view
- [ ] Create user edit form
- [ ] Create suspend/unsuspend user
- [ ] Create user delete confirmation
- [ ] Add search by name/email
- [ ] Add user status indicator
- [ ] Add login history view

### 5.6 Coupon Management Page
- [ ] Create coupon list page
- [ ] Create coupon creation form
- [ ] Create coupon edit form
- [ ] Create coupon deactivate button
- [ ] Show coupon usage statistics
- [ ] Add validation feedback
- [ ] Add expiry date indicator

### 5.7 Inventory Management Page
- [ ] Create inventory list page
- [ ] Create inventory edit form
- [ ] Create stock adjustment modal
- [ ] Show low stock alerts
- [ ] Create reorder list view
- [ ] Add search by SKU/product
- [ ] Show warehouse locations

### 5.8 Analytics/Reports Page
- [ ] Create revenue report
- [ ] Create sales by category chart
- [ ] Create top products chart
- [ ] Create customer acquisition chart
- [ ] Create date range selector
- [ ] Create export to PDF
- [ ] Create export to CSV

### 5.9 Audit Logs Page
- [ ] Create audit log list page
- [ ] Add filters (action, user, resource, date)
- [ ] Create log detail view
- [ ] Show before/after changes
- [ ] Add search functionality
- [ ] Add CSV export

### 5.10 Settings Page
- [ ] Create admin settings form
- [ ] Store settings preferences
- [ ] Add shipping fee settings
- [ ] Add notification settings
- [ ] Add email template settings

---

## Phase 6: Customer Pages (Estimated: 4 hours)

### 6.1 Order History Page
- [ ] Create orders list page
- [ ] Show order cards with status
- [ ] Add filters (status, date range)
- [ ] Add search by order number
- [ ] Add pagination
- [ ] Show total count
- [ ] Add sort options

### 6.2 Order Detail Page
- [ ] Create order detail view
- [ ] Show order summary
- [ ] Show items list
- [ ] Show payment details
- [ ] Show shipping address
- [ ] Show tracking number
- [ ] Show order timeline
- [ ] Show refund status if applicable

### 6.3 Invoice/Receipt Page
- [ ] Create invoice view
- [ ] Create PDF download
- [ ] Show itemized list
- [ ] Show discounts applied
- [ ] Show tax breakdown
- [ ] Show payment method
- [ ] Add print functionality

### 6.4 Refund Request Page
- [ ] Create refund request form
- [ ] Allow reason input
- [ ] Allow item selection (partial refund)
- [ ] Allow file attachments
- [ ] Show refund policies
- [ ] Show refund status after submission
- [ ] Show refund history

### 6.5 Shipping Tracking
- [ ] Create tracking page
- [ ] Show tracking number input
- [ ] Show shipment status
- [ ] Show estimated delivery
- [ ] Show tracking timeline
- [ ] Add carrier link

### 6.6 Address Management
- [ ] Create address list page
- [ ] Create address add form
- [ ] Create address edit form
- [ ] Create address delete button
- [ ] Set default address
- [ ] Show address validation feedback

### 6.7 Returns & Exchanges
- [ ] Create return request form
- [ ] Allow return reason selection
- [ ] Show return shipping info
- [ ] Track return status
- [ ] Show refund timeline

---

## Phase 7: Frontend API Integration & Fixes (Estimated: 5 hours)

### 7.1 API Service Layer
- [ ] Create centralized API service
- [ ] Add request interceptors
- [ ] Add response interceptors
- [ ] Add error handling globally
- [ ] Add retry logic for failed requests
- [ ] Add timeout handling
- [ ] Add loading state management

### 7.2 Authentication Integration
- [ ] Store tokens securely (HTTP-only cookies or localStorage)
- [ ] Auto-refresh tokens before expiry
- [ ] Redirect to login on 401
- [ ] Clear tokens on logout
- [ ] Persist auth state

### 7.3 Form Validations
- [ ] Add client-side validation to all forms
- [ ] Show validation errors to users
- [ ] Disable submit until valid
- [ ] Show field error icons
- [ ] Real-time validation feedback

### 7.4 Error Handling
- [ ] Create error boundary component
- [ ] Show user-friendly error messages
- [ ] Log errors to console in dev
- [ ] Show toast notifications for errors
- [ ] Handle network errors gracefully
- [ ] Handle timeout errors

### 7.5 Loading States
- [ ] Add loading spinners to data fetches
- [ ] Disable buttons while loading
- [ ] Show skeleton loaders
- [ ] Add loading state to forms
- [ ] Prevent double-submission

### 7.6 State Management
- [ ] Set up Zustand or Redux store
- [ ] Store user state
- [ ] Store cart state
- [ ] Store auth state
- [ ] Store notifications
- [ ] Persist state to localStorage

### 7.7 Page-Specific Fixes
- [ ] Verify Home page API calls
- [ ] Verify Shop page filtering
- [ ] Verify Product Detail page
- [ ] Verify Cart operations
- [ ] Verify Checkout flow
- [ ] Verify Auth pages
- [ ] Verify Account page
- [ ] Verify Wishlist page

---

## Phase 8: Testing & Polish (Estimated: 4 hours)

### 8.1 Backend Testing
- [ ] Add unit tests for services
- [ ] Add integration tests for APIs
- [ ] Test all auth flows
- [ ] Test role-based access
- [ ] Test validations
- [ ] Test error handling
- [ ] Aim for > 80% coverage

### 8.2 Frontend Testing
- [ ] Add component tests
- [ ] Add integration tests
- [ ] Test user workflows
- [ ] Test error scenarios
- [ ] Test loading states
- [ ] Aim for > 80% coverage

### 8.3 Performance Optimization
- [ ] Code splitting
- [ ] Lazy loading components
- [ ] Image optimization
- [ ] Database query optimization
- [ ] Cache optimization
- [ ] Reduce bundle size

### 8.4 Documentation
- [ ] Update API documentation
- [ ] Create user guide
- [ ] Create admin guide
- [ ] Create deployment guide
- [ ] Document configuration
- [ ] Create troubleshooting guide

### 8.5 Final Polish
- [ ] Fix console errors/warnings
- [ ] Check accessibility (a11y)
- [ ] Test on mobile devices
- [ ] Test on different browsers
- [ ] Performance profiling
- [ ] SEO optimization

---

## Summary

| Phase | Task | Effort | Priority |
|-------|------|--------|----------|
| 3 | Payment & Refunds | 3h | 🔴 Critical |
| 4 | Admin APIs | 4h | 🔴 Critical |
| 5 | Admin UI | 6h | 🟠 High |
| 6 | Customer Pages | 4h | 🟠 High |
| 7 | API Integration | 5h | 🟠 High |
| 8 | Testing & Polish | 4h | 🟡 Medium |
| **TOTAL** | | **26h** | |

**Estimated Calendar Time** (with breaks, debugging, etc.): 2-3 weeks for one developer

---

**Last Updated**: March 4, 2026  
**Document Version**: 1.0
