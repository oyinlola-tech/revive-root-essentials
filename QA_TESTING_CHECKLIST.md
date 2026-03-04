# QA Testing Checklist - Revive Root Essentials

**Test Date:** March 4, 2026  
**Version:** v1.0  
**Status:** Ready for Phase 4 Testing  
**Tester:** _______________  
**Pass/Fail:** _______________

---

## 📋 Pre-Testing Setup

### Environment Preparation
- [ ] Development server running: `npm run dev`
- [ ] Backend API server running
- [ ] MySQL database connected and seeded
- [ ] Redis server running
- [ ] Environment variables configured (.env file)
- [ ] Browser DevTools open (F12)
- [ ] Network tab monitored for API calls
- [ ] Console tab checked for errors

### Test Data Preparation
- [ ] Sample products created (10+ items)
- [ ] Sample users created (admin, superadmin, customer)
- [ ] Sample orders created (5+ items)
- [ ] Sample coupons created (5+ items)
- [ ] Sample addresses created (different countries)
- [ ] Test payment method configured (Flutterwave sandbox)

### Browser Configuration
- [ ] Chrome/Chromium version: _______________
- [ ] Firefox version: _______________
- [ ] Safari version: _______________
- [ ] Mobile browser (iOS/Android): _______________

---

## 🏠 Home Page & Navigation

### Page Load & Performance
- [ ] Home page loads in < 2 seconds
- [ ] No console errors on initial load
- [ ] All images load correctly
- [ ] Navigation menu items visible and clickable
- [ ] Hero section displays properly
- [ ] Product grid renders with images

### Navigation Menu
- [ ] Shop link navigates to product listing
- [ ] Cart icon shows current cart count
- [ ] Account menu dropdown works
- [ ] Wishlist link accessible
- [ ] Mobile hamburger menu works
- [ ] Menu items highlight on hover
- [ ] Search bar functional and focused properly

### Responsive Design (Home)
- [ ] Desktop (1920px): Optimal layout
- [ ] Tablet (768px): Content reformats properly
- [ ] Mobile (375px): Single column, readable text
- [ ] Images scale proportionally
- [ ] Buttons easily tappable (48px+)

---

## 🛍️ Product Browse & Detail Pages

### Product Listing Page (/shop)
- [ ] Products display in grid (4 columns on desktop)
- [ ] Product cards show: image, name, price, rating
- [ ] Price displays in correct currency (from locale)
- [ ] Page loads pagination controls at bottom
- [ ] 10-15 items per page displayed
- [ ] "Load More" or page numbers work
- [ ] Sorting dropdown visible (Price, Rating, Newest)
- [ ] Category filter visible and clickable
- [ ] Search box filters products in real-time
- [ ] "Add to Cart" button works on each card
- [ ] Heart icon toggles wishlist (authenticated users)

### Category Filtering
- [ ] All categories load from API
- [ ] Clicking category filters products
- [ ] Filtered results update pagination
- [ ] "Clear Filters" button appears when filters applied
- [ ] URL updates with category parameter (optional)
- [ ] Filter count shows correct number of products

### Sorting
- [ ] Sort by Price (Low to High) works
- [ ] Sort by Price (High to Low) works
- [ ] Sort by Newest works
- [ ] Sort by Rating (High to Low) works
- [ ] Sorting updates product order immediately
- [ ] Pagination resets to page 1 when sorting

### Product Detail Page (/shop/:id)
- [ ] Page loads with correct product data
- [ ] Product image displays full-size with zoom
- [ ] Product name, description, price visible
- [ ] Rating and review count shown
- [ ] Stock status shows ("In Stock" / "Out of Stock")
- [ ] Quantity selector works (increment/decrement)
- [ ] "Add to Cart" button functional
- [ ] Price shows in correct currency
- [ ] Related products section shows 4-6 items
- [ ] Reviews section displays (expandable)
- [ ] "Add Review" button present for logged-in users
- [ ] Back button returns to previous page

### Product Image Gallery
- [ ] Main image displays clearly
- [ ] Thumbnail images visible below
- [ ] Clicking thumbnail updates main image
- [ ] Image zoom works on hover/click
- [ ] All images load without broken links
- [ ] Images responsive on mobile

---

## 🛒 Shopping Cart

### Cart Page (/cart)
- [ ] Cart page loads without errors
- [ ] All added items display with image, name, price
- [ ] Quantity can be updated per item
- [ ] "Remove" button deletes items from cart
- [ ] Price updates when quantity changes
- [ ] Subtotal calculated correctly
- [ ] Tax calculated correctly (if applicable)
- [ ] Shipping cost displays (based on country)
- [ ] Total price calculated accurately
- [ ] "Continue Shopping" button returns to shop
- [ ] "Checkout" button navigates to checkout
- [ ] Empty cart message shows when no items
- [ ] Cart persists after page refresh (localStorage)

### Cart Summary
- [ ] Item count matches number of products
- [ ] Subtotal = sum of all item prices
- [ ] Tax = subtotal × tax rate
- [ ] Shipping = appropriate for selected country
- [ ] Total = subtotal + tax + shipping
- [ ] Discount applied if coupon active
- [ ] All calculations correct with decimals

---

## ❤️ Wishlist

### Wishlist Page (/wishlist)
- [ ] Wishlist page accessible (if logged in)
- [ ] All wishlisted items display
- [ ] Each item shows: image, name, price
- [ ] "Move to Cart" button adds to cart
- [ ] "Remove from Wishlist" button removes item
- [ ] Empty wishlist message shown when no items
- [ ] Item count matches actual items
- [ ] Prices display in correct currency

### Wishlist Integration
- [ ] Heart icon on product cards shows wishlist status
- [ ] Clicking heart toggles item in/out of wishlist
- [ ] Wishlist updates in real-time
- [ ] Wishlist persists across sessions (if logged in)

---

## 👤 Account Management

### Account Page (/account)
- [ ] Page loads with user profile section
- [ ] User name and email display
- [ ] Sidebar navigation visible with options:
  - [ ] Order History
  - [ ] Refund Tracking
  - [ ] Address Management
  - [ ] Logout
- [ ] Profile picture displays (if set)
- [ ] Edit profile button functional
- [ ] Edit links work for password, email, phone

### Sidebar Navigation
- [ ] All sidebar links are clickable
- [ ] Active link highlighted
- [ ] Sidebar collapses on mobile
- [ ] Navigation persists when switching pages

---

## 📦 Order History

### Order History Page (/order-history)
- [ ] Page loads with user's orders list
- [ ] Orders sorted by date (newest first)
- [ ] Each order shows: order ID, date, status, total
- [ ] Order statuses display correctly:
  - [ ] Pending
  - [ ] Processing
  - [ ] Shipped
  - [ ] Delivered
  - [ ] Cancelled
- [ ] Pagination works if 10+ orders
- [ ] "View Details" button opens order details
- [ ] Search/filter by order ID works
- [ ] Filter by status works
- [ ] Empty state shown when no orders

### Order Detail Page (/order/:id)
- [ ] Order details load correctly
- [ ] Order ID, date, status display
- [ ] Customer info shows: name, email, phone
- [ ] Shipping address shows correctly
- [ ] All order items listed with: image, name, qty, price
- [ ] Subtotal, tax, shipping, total calculated correctly
- [ ] Tracking number visible (if shipped)
- [ ] Tracking link functional (if applicable)
- [ ] Timeline shows order status progression
- [ ] Payment method displays
- [ ] "Print Order" button functional
- [ ] "Request Refund" button visible (if eligible)

---

## 💰 Refund Management

### Refund Request Page (/refund-request)
- [ ] Page loads with order selection dropdown
- [ ] Can only select non-refunded orders
- [ ] Refund reason dropdown has 5+ options:
  - [ ] Defective Product
  - [ ] Not as Described
  - [ ] Wrong Item
  - [ ] Changed Mind
  - [ ] Other
- [ ] Additional notes field available
- [ ] File upload for evidence (optional)
- [ ] Submit button initiates refund request
- [ ] Confirmation message shows after submit
- [ ] Order status changes to "Refund Requested"

### Refund Tracking Page (/refund-tracking)
- [ ] All refund requests displayed
- [ ] Refund status filter works:
  - [ ] Pending
  - [ ] Approved
  - [ ] Rejected
  - [ ] Completed
- [ ] Each refund shows: order ID, status, date requested, amount
- [ ] Expandable details show timeline
- [ ] Timeline shows all status updates with dates
- [ ] Refund amount displays correctly
- [ ] Estimated refund date visible
- [ ] Search by order ID works
- [ ] Empty state when no refunds

---

## 🌍 International Features

### Locale Detection
- [ ] On first visit, locale detected from browser
- [ ] Browser language → country mapping works:
  - [ ] en-NG → Nigeria
  - [ ] en-US → USA
  - [ ] en-GB → UK
  - [ ] en-GH → Ghana
  - [ ] fr-FR → France
  - [ ] es-ES → Spain
- [ ] Detected country saved to localStorage
- [ ] Currency auto-selected matches country
- [ ] Fallback to Nigeria if detection fails

### Currency Display
- [ ] All prices display with correct currency symbol
- [ ] Nigeria (NGN): ₦ symbol
- [ ] USA (USD): $ symbol
- [ ] UK (GBP): £ symbol
- [ ] Europe (EUR): € symbol
- [ ] Proper number formatting (e.g., ₦5,000.00)
- [ ] Decimal places correct (2 for most, 0 for JPY)
- [ ] Currency updates when locale changes

### Country Selection
- [ ] Address form has country dropdown
- [ ] 50+ countries available in list
- [ ] Countries organized by region:
  - [ ] Africa
  - [ ] Americas
  - [ ] Europe
  - [ ] Asia
  - [ ] Middle East
- [ ] Typing filters country list (autocomplete)
- [ ] Selecting country shows relevant states
- [ ] State/province dropdown populates correctly

### Address Management (/address-management)
- [ ] Page loads with existing addresses (if any)
- [ ] Each address shows full details
- [ ] "Add New Address" button opens form
- [ ] Address form includes:
  - [ ] Full Name
  - [ ] Phone Number
  - [ ] Country (50+ options)
  - [ ] State/Province (dynamic)
  - [ ] City
  - [ ] Postal Code
  - [ ] Address Line 1
  - [ ] Address Line 2 (optional)
- [ ] Form validates all required fields
- [ ] Save address button functional
- [ ] Edit address button works
- [ ] Delete address button with confirmation
- [ ] Set as default address toggle
- [ ] Can't delete default address
- [ ] Multiple addresses supported
- [ ] Each address shows "Edit" and "Delete" buttons

### Shipping Country Detection
- [ ] Shipping cost updates based on address country
- [ ] International shipping calculated correctly
- [ ] Domestic shipping (Nigeria) lower than international
- [ ] Shipping time estimate shows (if applicable)

---

## 🛡️ Authentication & Authorization

### Login/Register
- [ ] Login page loads without errors
- [ ] Email field validates format
- [ ] Password field masks input
- [ ] "Remember me" checkbox functional
- [ ] Login button submits form
- [ ] Error messages clear for invalid credentials
- [ ] Successful login redirects to home
- [ ] JWT token stored in localStorage/cookies
- [ ] Register link navigates to sign up
- [ ] Sign up form validates inputs
- [ ] Password confirmation matches
- [ ] Existing email shows error
- [ ] Successful registration creates user

### Access Control
- [ ] Non-logged-in users see public pages only
- [ ] Cart/wishlist require login before checkout
- [ ] Account page requires login
- [ ] Admin pages require admin/superadmin role
- [ ] Unauthorized access redirects to login
- [ ] Expired tokens trigger re-login
- [ ] Logout clears session and tokens
- [ ] Back button doesn't return to protected pages

---

## 🔧 Admin Panel

### Admin Dashboard (/admin)
- [ ] Admin-only pages blocked for non-admins
- [ ] Dashboard loads without errors
- [ ] Key metrics display:
  - [ ] Total revenue (this month)
  - [ ] Total orders
  - [ ] Total customers
  - [ ] Total products
- [ ] Charts/graphs render correctly
- [ ] Sidebar navigation visible with:
  - [ ] Products
  - [ ] Orders
  - [ ] Users
  - [ ] Coupons
  - [ ] Inventory
  - [ ] Audit Logs
- [ ] All sidebar links functional

### Admin Products (/admin/products)
- [ ] Products table loads with API data
- [ ] Pagination works (10-15 per page)
- [ ] Each row shows: ID, Name, Category, Price, Stock, Actions
- [ ] Search by product name works
- [ ] Filter by category works
- [ ] Sort by price works
- [ ] "Add Product" button opens form
- [ ] Product form includes:
  - [ ] Name
  - [ ] Description
  - [ ] Category
  - [ ] Price
  - [ ] Stock
  - [ ] Image upload
  - [ ] Meta description (SEO)
- [ ] Form validates required fields
- [ ] Image preview displays
- [ ] Edit button updates product
- [ ] Delete button removes product with confirmation
- [ ] Success message shows after save
- [ ] Error messages display validation errors

### Admin Orders (/admin/orders)
- [ ] Orders table loads with all orders
- [ ] Pagination works
- [ ] Each row shows: Order ID, Customer, Date, Status, Total
- [ ] Search by order ID works
- [ ] Filter by status works (Pending, Processing, Shipped, Delivered)
- [ ] Filter by payment status works (Paid, Pending, Failed)
- [ ] Sort by date works
- [ ] Expand row shows order items
- [ ] Update status dropdown changes order status
- [ ] Status change updates order and shows confirmation
- [ ] View button opens full order details
- [ ] Shipping tracking number can be added
- [ ] Refund requests visible for eligible orders

### Admin Users (/admin/users)
- [ ] Users table loads with all users
- [ ] Pagination works
- [ ] Each row shows: User ID, Name, Email, Role, Status
- [ ] Search by name/email works
- [ ] Filter by role works (Customer, Admin, SuperAdmin)
- [ ] Filter by status works (Active, Inactive, Suspended)
- [ ] Edit button opens user details
- [ ] Can change user role (role dropdown)
- [ ] Can change user status (status dropdown)
- [ ] Save changes updates user
- [ ] Delete button removes user with confirmation
- [ ] User cannot delete themselves
- [ ] View user orders button navigates to orders
- [ ] Last login date visible
- [ ] User creation date visible

### Admin Coupons (/admin/coupons)
- [ ] Coupons table loads with all coupons
- [ ] Pagination works
- [ ] Each row shows: Code, Discount, Type, Expires, Usage
- [ ] Search by coupon code works
- [ ] Filter by status works (Active, Expired, Disabled)
- [ ] "Add Coupon" button opens form
- [ ] Coupon form includes:
  - [ ] Code (auto-generated or manual)
  - [ ] Discount value
  - [ ] Discount type (Percentage, Fixed)
  - [ ] Max usage count
  - [ ] Expiration date
  - [ ] Min order value (optional)
  - [ ] Max discount cap (if percentage)
- [ ] Validation: percentage 0-100, fixed > 0
- [ ] Edit button updates coupon
- [ ] Delete button removes coupon with confirmation
- [ ] Enable/disable toggle works
- [ ] Usage count shows correct number
- [ ] CSV export button works
- [ ] Exported file contains all coupon data

### Admin Inventory (/admin/inventory)
- [ ] Inventory table loads with all products
- [ ] Pagination works
- [ ] Each row shows: SKU, Product, Current Stock, Reserved, Available
- [ ] Search by product name/SKU works
- [ ] Filter by status works (In Stock, Low Stock, Out of Stock)
- [ ] Low stock warning visible (stock < reorder level)
- [ ] Adjust stock button opens modal
- [ ] Stock adjustment includes:
  - [ ] Reason (restock, damage, etc.)
  - [ ] Quantity
  - [ ] Notes
- [ ] Stock update reflects immediately
- [ ] Adjustment history viewable
- [ ] Reorder level can be set
- [ ] Reorder alert triggers at low level
- [ ] CSV export works
- [ ] Batch adjustment available (if supported)

### Admin Audit Logs (/admin/audit-logs)
- [ ] Audit logs table loads with all logs
- [ ] Pagination works
- [ ] Each row shows: Date, User, Action, Resource, Status
- [ ] Search by user email works
- [ ] Filter by action works (Create, Update, Delete, View)
- [ ] Filter by resource works (Product, Order, User, etc.)
- [ ] Filter by date range works
- [ ] Expand row shows before/after changes
- [ ] IP address visible
- [ ] User agent visible
- [ ] Status shows success/failure
- [ ] Export to CSV button works
- [ ] Exported file contains:
  - [ ] Timestamp
  - [ ] User
  - [ ] Action
  - [ ] Resource
  - [ ] Before/After values
  - [ ] IP address
  - [ ] Status

---

## 💳 Checkout & Payment

### Checkout Process
- [ ] Checkout page loads from cart
- [ ] Shipping address selection/input
- [ ] Billing address same as shipping toggle
- [ ] Coupon code input field
- [ ] Coupon validation and discount applied
- [ ] Shipping method selection (if multiple)
- [ ] Shipping cost updates based on address
- [ ] Order summary shows all items
- [ ] Total price calculated correctly

### Payment Processing
- [ ] Flutterwave payment modal opens
- [ ] Payment options display (Card, Bank Transfer, etc.)
- [ ] Test card transaction completes
- [ ] Success redirects to order confirmation
- [ ] Order created in database
- [ ] Email confirmation sent to user
- [ ] Failed payment shows error message
- [ ] Payment timeout handled gracefully

### Order Confirmation
- [ ] Confirmation page displays order details
- [ ] Order number generated
- [ ] Customer receives confirmation email
- [ ] Print order option functional
- [ ] Continue shopping button returns to shop

---

## 📧 Email & Notifications

### Email Verification
- [ ] Welcome email sent on sign up
- [ ] Order confirmation email sent
- [ ] Shipment notification email sent
- [ ] Refund approval email sent
- [ ] Emails contain correct order/refund details
- [ ] Email unsubscribe link functional
- [ ] Transactional emails in HTML format

### Notification Types
- [ ] Order status update notifications
- [ ] Refund status notifications
- [ ] Low stock alerts (admin)
- [ ] Out of stock alerts (customer)
- [ ] Promotional emails (if subscribed)

---

## 🔒 Security Testing

### Input Validation
- [ ] All forms validate required fields
- [ ] Email format validation works
- [ ] Phone number format validation works
- [ ] Postal code format validation works
- [ ] Password strength validation works
- [ ] XSS attempt blocked (test `<script>alert('xss')</script>`)
- [ ] SQL injection attempt blocked
- [ ] CSRF tokens present on forms

### Authentication Security
- [ ] Passwords hashed (never plaintext in logs)
- [ ] JWT tokens have expiration
- [ ] Expired tokens trigger re-login
- [ ] Token refresh works
- [ ] Brute force protection active (5 attempts → locked 15 min)
- [ ] Admin actions require confirmation
- [ ] Sensitive data (passwords) not logged

### API Security
- [ ] All API calls use HTTPS (in production)
- [ ] CORS headers configured correctly
- [ ] Rate limiting active (prevent DDoS)
- [ ] API requires authentication for protected endpoints
- [ ] API returns 403 for unauthorized access
- [ ] Sensitive data redacted in error messages

### Data Privacy
- [ ] Customer data not exposed in browser console
- [ ] API responses don't contain unnecessary data
- [ ] User passwords never sent back
- [ ] Credit card data not stored (Flutterwave handles)
- [ ] Audit logs capture all sensitive operations

---

## ⚡ Performance Testing

### Page Load Times
- [ ] Home page: < 2 seconds (LCP)
- [ ] Product listing: < 3 seconds
- [ ] Product detail: < 2 seconds
- [ ] Cart page: < 1 second
- [ ] Admin dashboard: < 2 seconds
- [ ] Admin data tables: < 2 seconds (first load)

### API Response Times
- [ ] GET /products: < 500ms
- [ ] GET /orders: < 500ms
- [ ] POST /orders: < 1s
- [ ] POST /refund-request: < 1s
- [ ] GET /audit-logs: < 500ms (with pagination)

### Memory & Browser Usage
- [ ] No memory leaks (DevTools heap snapshot)
- [ ] Page switching doesn't accumulate memory
- [ ] Large lists (100+ items) load without slowdown
- [ ] Image lazy loading works (images off-screen)

### Database Queries
- [ ] No N+1 query problems
- [ ] Indexes optimized for common queries
- [ ] Query times < 100ms for typical queries

---

## 📱 Responsive Design Testing

### Mobile (iPhone 12, 375px)
- [ ] All pages readable without horizontal scroll
- [ ] Navigation accessible (hamburger menu)
- [ ] Buttons easily tappable (48px+ height)
- [ ] Forms single-column layout
- [ ] Tables scroll horizontally
- [ ] Images scale properly
- [ ] Font sizes readable
- [ ] Modal dialogs fit screen

### Tablet (iPad, 768px)
- [ ] Two-column layout where appropriate
- [ ] Navigation visible and functional
- [ ] Admin tables show 3-4 columns
- [ ] Forms comfortably laid out
- [ ] Charts/graphs readable
- [ ] Touch targets appropriately sized

### Desktop (1920px)
- [ ] Multi-column layout optimized
- [ ] Sidebar visible and functional
- [ ] Tables show all columns
- [ ] No excessive whitespace
- [ ] Hover states functional

---

## 🌐 Browser Compatibility

### Chrome/Chromium
- [ ] Latest version tested
- [ ] Forms function correctly
- [ ] Styling renders as expected
- [ ] Payment processing works
- [ ] LocalStorage functional

### Firefox
- [ ] Latest version tested
- [ ] Layout renders correctly
- [ ] All animations smooth
- [ ] API calls functional

### Safari
- [ ] Latest version tested (macOS)
- [ ] iOS Safari tested (iPhone/iPad)
- [ ] Styling consistent
- [ ] Touch interactions work

### Edge
- [ ] Latest version tested
- [ ] Full functionality confirmed

---

## 🐛 Bug Reporting Template

### For Each Bug Found:

**Bug ID:** _______________  
**Severity:** Critical / High / Medium / Low  
**Component:** _______________ (e.g., Admin Products, Checkout)  
**Browser:** _______________ (Chrome 120, Safari 17.2)  
**Device:** Desktop / Tablet / Mobile  

**Steps to Reproduce:**
1. 
2. 
3. 

**Expected Result:**


**Actual Result:**


**Screenshots/Logs:** (attach if applicable)

**Notes:**

---

## ✅ Final Sign-Off

### QA Team Sign-Off
- [ ] All critical tests passed
- [ ] All high-priority tests passed
- [ ] All medium-priority tests passed
- [ ] Low-priority issues documented
- [ ] No blocking issues remain
- [ ] Performance acceptable
- [ ] Security measures verified
- [ ] Responsive design confirmed
- [ ] Cross-browser compatibility confirmed

### Ready for Deployment
- [ ] QA Lead: _______________ Date: _______________
- [ ] Product Manager: _______________ Date: _______________
- [ ] Development Lead: _______________ Date: _______________

---

## 📝 Test Execution Notes

### Day 1 - Functionality Testing
Date: _______________  
Tester: _______________  
Notes: 

### Day 2 - Security & Performance
Date: _______________  
Tester: _______________  
Notes: 

### Day 3 - Mobile & Browser Testing
Date: _______________  
Tester: _______________  
Notes: 

### Day 4 - Final Verification
Date: _______________  
Tester: _______________  
Notes: 

---

## 📊 Test Summary

| Category | Passed | Failed | Blocked | Total |
|----------|--------|--------|---------|-------|
| Home & Navigation | | | | |
| Product Browse | | | | |
| Shopping Cart | | | | |
| Checkout & Payment | | | | |
| Authentication | | | | |
| Account Management | | | | |
| Order Management | | | | |
| Refund Management | | | | |
| International Features | | | | |
| Admin Products | | | | |
| Admin Orders | | | | |
| Admin Users | | | | |
| Admin Coupons | | | | |
| Admin Inventory | | | | |
| Admin Audit Logs | | | | |
| Security | | | | |
| Performance | | | | |
| Mobile Responsive | | | | |
| Browser Compatibility | | | | |
| **TOTAL** | | | | |

**Overall Result:** ☐ PASS ☐ FAIL ☐ CONDITIONAL PASS

**Pass Rate:** _____% (Passed / Total × 100)

---

**Document Created:** March 4, 2026  
**Version:** 1.0  
**Last Updated:** _______________
