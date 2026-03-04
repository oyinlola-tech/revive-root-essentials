# Manual Testing Guide - Visual Walkthrough

**Version:** 1.0  
**Created:** March 4, 2026  
**Purpose:** Step-by-step visual guide for testing all pages and features

---

## 🚀 Getting Started

### Step 1: Start the Development Environment

**Terminal 1 (Frontend):**
```bash
cd /home/owl-sec/Desktop/revive-root-essentials
npm run dev:frontend
```

**Expected Output:**
```
  VITE v6.4.1  ready in 1745 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: http://10.0.2.15:5173/
```

**Terminal 2 (Backend):**
```bash
cd /home/owl-sec/Desktop/revive-root-essentials/backend
npm run dev
```

**Expected Output:**
```
Server running on port 3000
```

### Step 2: Open Browser
```
URL: http://localhost:5173
```

**Expected:** Home page loads with:
- Navigation header visible
- Hero section visible
- Product grid visible
- Footer visible

---

## 🧪 Test Session 1: Home Page & Navigation

### ✅ Test 1.1 - Page Load Performance
**Goal:** Verify home page loads in < 2 seconds

**Steps:**
1. Open DevTools (F12)
2. Go to Network tab
3. Refresh page (Ctrl+R)
4. Check "DOMContentLoaded" timing at bottom

**Expected:**
- DOMContentLoaded < 2000ms ✅
- All images load without errors ✅
- No red errors in Console tab ✅

**Document:**
- [ ] Load time: __________ ms
- [ ] No console errors: ☐ Yes ☐ No
- [ ] Images loaded: ☐ Yes ☐ No

---

### ✅ Test 1.2 - Navigation Menu
**Goal:** Verify all menu items work

**Steps:**
1. Look at top navigation bar
2. Click each menu item:
   - Shop
   - Cart
   - Wishlist
   - Account (if logged in)
   - About
   - Contact

**Expected:**
- Each link navigates to correct page ✅
- URL updates ✅
- Page content changes ✅

**Document:**
- [ ] Shop link works
- [ ] Cart link works
- [ ] Wishlist link works
- [ ] Account link works (requires login)
- [ ] About link works
- [ ] Contact link works

---

### ✅ Test 1.3 - Mobile Hamburger Menu
**Goal:** Verify mobile navigation works

**Steps:**
1. Open DevTools (F12)
2. Click responsive design mode (Ctrl+Shift+M)
3. Set to iPhone 12 (375x812)
4. Look for hamburger menu (☰)
5. Click hamburger menu
6. Click menu items

**Expected:**
- Hamburger menu visible on mobile ✅
- Menu opens/closes ✅
- Menu items clickable ✅
- Menu closes after selecting item ✅

**Document:**
- [ ] Hamburger menu visible
- [ ] Menu opens
- [ ] Menu items clickable
- [ ] Links navigate correctly

---

### ✅ Test 1.4 - Responsive Design
**Goal:** Verify layout changes at different breakpoints

**Steps:**
1. Keep responsive mode on
2. Test at these widths:
   - 375px (Mobile)
   - 768px (Tablet)
   - 1024px (Small Desktop)
   - 1920px (Large Desktop)
3. At each width, check:
   - Text readable
   - Buttons easily clickable
   - No horizontal scrolling
   - Images scale properly

**Document:**

**Mobile (375px):**
- [ ] Text readable
- [ ] Buttons tappable (48px+)
- [ ] No horizontal scroll
- [ ] Images scale

**Tablet (768px):**
- [ ] Two-column layout visible
- [ ] Navigation clear
- [ ] Content properly spaced

**Desktop (1920px):**
- [ ] Multi-column layout
- [ ] Sidebar if present
- [ ] No excessive whitespace

---

## 🛍️ Test Session 2: Product Browsing

### ✅ Test 2.1 - Product Grid Display
**Goal:** Verify products display correctly

**Steps:**
1. Click "Shop" in navigation
2. Wait for products to load
3. Check each product card shows:
   - Product image
   - Product name
   - Product price
   - Rating (if available)
   - Add to Cart button

**Expected:**
- 10-15 products visible ✅
- Grid layout (4 columns on desktop) ✅
- All images load ✅
- Prices display with currency symbol ✅

**Document:**
- [ ] Products visible: Count: _____
- [ ] Images loaded: ☐ Yes ☐ No
- [ ] Prices show currency: ☐ Yes ☐ No
- [ ] Buttons visible: ☐ Yes ☐ No

---

### ✅ Test 2.2 - Search/Filter Functionality
**Goal:** Verify search and category filters work

**Steps:**
1. Look for search box on product page
2. Type a product name (e.g., "shirt")
3. Press Enter or click search
4. Verify results filter in real-time
5. Try category dropdown if visible
6. Select a category
7. Verify products filter

**Expected:**
- Search filters products ✅
- Results update in real-time ✅
- Category filter works ✅
- No matching products show "no results" message ✅

**Document:**
- [ ] Search box visible
- [ ] Search filters work
- [ ] Category dropdown visible
- [ ] Category filter works
- [ ] "No results" message shows if none

---

### ✅ Test 2.3 - Sorting
**Goal:** Verify sorting options work

**Steps:**
1. Look for "Sort" dropdown on product page
2. Click dropdown
3. Try each option:
   - Price (Low to High)
   - Price (High to Low)
   - Newest
   - Rating (if available)
4. Verify product order changes

**Expected:**
- Dropdown visible ✅
- Each option works ✅
- Products reorder correctly ✅

**Document:**
- [ ] Sort dropdown visible
- [ ] Low to High works
- [ ] High to Low works
- [ ] Newest works
- [ ] Rating sort works

---

### ✅ Test 2.4 - Product Detail Page
**Goal:** Verify product details display correctly

**Steps:**
1. Click any product card
2. Check product detail page shows:
   - Product image (with zoom if available)
   - Product name
   - Product description
   - Price (with currency)
   - Rating and reviews
   - Stock status
   - Quantity selector
   - Add to Cart button
   - Add to Wishlist button
   - Related products section

**Expected:**
- All details visible ✅
- Image displays clearly ✅
- Quantity selector works ✅
- Buttons functional ✅

**Document:**
- [ ] Product image visible
- [ ] Name displayed
- [ ] Price shows correct currency
- [ ] Stock status visible
- [ ] Quantity selector works
- [ ] Add to Cart button works
- [ ] Related products shown

---

### ✅ Test 2.5 - Pagination
**Goal:** Verify pagination works correctly

**Steps:**
1. Go back to shop page
2. Look at bottom of product list
3. Check page numbers or "Load More" button
4. Click next page or "Load More"
5. Verify new products load
6. Click previous page if available
7. Verify products change

**Expected:**
- Pagination controls visible ✅
- Page changes work ✅
- Different products load ✅
- Current page highlighted ✅

**Document:**
- [ ] Pagination visible
- [ ] Next page works
- [ ] Previous page works
- [ ] Current page shows
- [ ] Products load correctly

---

## 🛒 Test Session 3: Shopping Cart

### ✅ Test 3.1 - Add Items to Cart
**Goal:** Verify items can be added to cart

**Steps:**
1. From product listing or detail page
2. Click "Add to Cart" button
3. Check cart icon in header
4. Verify cart count increased
5. Add another product
6. Verify cart count increased again

**Expected:**
- Add to Cart button clickable ✅
- Cart icon updates with count ✅
- No errors in console ✅
- Cart stores items ✅

**Document:**
- [ ] Items added successfully
- [ ] Cart count updates
- [ ] Multiple items tracked
- [ ] No errors shown

---

### ✅ Test 3.2 - View Cart
**Goal:** Verify cart page displays correctly

**Steps:**
1. Click cart icon in header
2. Navigate to Cart page
3. Check cart shows:
   - All items added
   - Product images
   - Product names
   - Quantities
   - Individual prices
   - Subtotal
   - Tax
   - Shipping cost
   - Total price

**Expected:**
- All items visible ✅
- Correct quantities ✅
- Correct totals ✅
- All prices in correct currency ✅

**Document:**
- [ ] Items displayed: Count: _____
- [ ] Quantities correct: ☐ Yes ☐ No
- [ ] Prices with currency: ☐ Yes ☐ No
- [ ] Subtotal correct: ☐ Yes ☐ No
- [ ] Total correct: ☐ Yes ☐ No

---

### ✅ Test 3.3 - Adjust Quantities
**Goal:** Verify cart quantity adjustment works

**Steps:**
1. In cart, find quantity selector
2. Click "+" button to increase quantity
3. Check price updates
4. Click "-" button to decrease quantity
5. Check price updates again
6. Verify total recalculates

**Expected:**
- Quantity increases/decreases ✅
- Item price updates ✅
- Total recalculates ✅
- No errors shown ✅

**Document:**
- [ ] Quantity adjusts
- [ ] Prices update
- [ ] Total recalculates
- [ ] Updates immediate

---

### ✅ Test 3.4 - Remove Items
**Goal:** Verify items can be removed

**Steps:**
1. In cart, find "Remove" button for an item
2. Click "Remove"
3. Check item disappears from cart
4. Check cart count decreases
5. Verify total updates

**Expected:**
- Item removed from display ✅
- Cart count decreased ✅
- Total recalculated ✅
- No errors shown ✅

**Document:**
- [ ] Remove button works
- [ ] Item disappears
- [ ] Cart count updates
- [ ] Total updates

---

### ✅ Test 3.5 - Cart Persistence
**Goal:** Verify cart saves across sessions

**Steps:**
1. Add items to cart
2. Refresh page (F5)
3. Check items still in cart
4. Close browser completely
5. Reopen and navigate to site
6. Check if items still there (depends on implementation)

**Expected:**
- Items persist after refresh ✅
- Cart count maintained ✅

**Document:**
- [ ] Cart persists after refresh
- [ ] Items still there: ☐ Yes ☐ No
- [ ] Count correct: ☐ Yes ☐ No

---

## 💳 Test Session 4: Checkout & Payment

### ✅ Test 4.1 - Enter Shipping Address
**Goal:** Verify shipping address entry works

**Steps:**
1. In cart, click "Checkout" button
2. Look for shipping address form
3. Check form has fields for:
   - Full name
   - Email
   - Phone number
   - Country (dropdown with 50+ options)
   - State/Province (dynamic)
   - City
   - Postal code
   - Address line 1
   - Address line 2 (optional)
4. Try selecting different countries
5. Verify states update for each country

**Expected:**
- Form displays correctly ✅
- Country dropdown has 50+ options ✅
- States update when country changes ✅
- All fields optional/required marked ✅

**Document:**
- [ ] Form fields visible
- [ ] Country dropdown shows options
- [ ] Countries: _______ (count)
- [ ] States update dynamically
- [ ] Form validates required fields

---

### ✅ Test 4.2 - Verify Currency Updates
**Goal:** Verify currency updates based on country

**Steps:**
1. In checkout, check current currency (e.g., ₦ for Nigeria)
2. Change country in address form (e.g., to USA)
3. Check if currency symbol changes to $ (USD)
4. Try different countries:
   - Ghana (GHS - ₵)
   - UK (GBP - £)
   - Europe (EUR - €)
5. Verify prices update with new currency

**Expected:**
- Currency symbol visible ✅
- Currency changes with country ✅
- All prices update ✅
- Correct symbols for each currency ✅

**Document:**
- [ ] Nigeria shows ₦
- [ ] USA shows $
- [ ] Ghana shows ₵
- [ ] UK shows £
- [ ] EUR shows €
- [ ] Prices recalculate

---

### ✅ Test 4.3 - Apply Coupon
**Goal:** Verify coupon application works

**Steps:**
1. On checkout page, find coupon input
2. Enter test coupon code (if available)
3. Click "Apply" button
4. Check if discount applies
5. Verify total updates
6. Try invalid coupon
7. Check error message

**Expected:**
- Coupon field visible ✅
- Valid coupon shows discount ✅
- Total updated ✅
- Invalid coupon shows error ✅

**Document:**
- [ ] Coupon field visible
- [ ] Valid coupon works
- [ ] Discount applied: _____%
- [ ] Total updated
- [ ] Invalid coupon shows error

---

### ✅ Test 4.4 - Complete Payment
**Goal:** Verify payment processing works

**Steps:**
1. Complete checkout form
2. Click "Place Order" or "Pay Now"
3. Wait for payment gateway (Flutterwave)
4. Use test card details:
   - Card: 4111111111111111
   - CVV: 123
   - Expiry: 12/25
5. Complete payment
6. Check for order confirmation

**Expected:**
- Payment page opens ✅
- Test payment processes ✅
- Confirmation page shows ✅
- Order number displayed ✅

**Document:**
- [ ] Payment gateway opens
- [ ] Test payment successful
- [ ] Confirmation page displays
- [ ] Order number: _____________

---

## 👤 Test Session 5: Account Management

### ✅ Test 5.1 - Login/Signup
**Goal:** Verify authentication works

**Steps:**
1. Click account icon in header
2. Click "Login" if not logged in
3. Enter test credentials:
   - Email: test@example.com
   - Password: testpassword123
4. Click "Login"
5. Check if logged in (page redirects to home)
6. Check if account menu shows username

**Expected:**
- Login form displays ✅
- Valid login succeeds ✅
- Invalid login shows error ✅
- Account menu updates ✅

**Document:**
- [ ] Login form visible
- [ ] Valid login works
- [ ] User name shows
- [ ] Logout button visible

---

### ✅ Test 5.2 - Account Page
**Goal:** Verify account page displays correctly

**Steps:**
1. Click Account in navigation
2. Check page shows:
   - User profile section
   - Sidebar with navigation items:
     - Order History
     - Refund Tracking
     - Address Management
     - Logout
   - User information (name, email)

**Expected:**
- Account page loads ✅
- User info displays ✅
- Sidebar visible ✅
- All sidebar links work ✅

**Document:**
- [ ] Account page loads
- [ ] User info shows
- [ ] Sidebar visible
- [ ] Links clickable

---

### ✅ Test 5.3 - Order History
**Goal:** Verify order history displays

**Steps:**
1. From Account page, click "Order History"
2. Check page shows:
   - List of all orders
   - Order ID
   - Order date
   - Order status
   - Order total
   - View details button
3. Click "View Details" on an order
4. Check order details page shows:
   - All order items
   - Shipping address
   - Order total
   - Tracking info (if shipped)

**Expected:**
- Orders listed ✅
- Each order shows key info ✅
- Details page accessible ✅
- All info accurate ✅

**Document:**
- [ ] Orders displayed
- [ ] Count: _________
- [ ] Details page works
- [ ] Tracking shows (if shipped)

---

### ✅ Test 5.4 - Refund Tracking
**Goal:** Verify refund tracking works

**Steps:**
1. From Account page, click "Refund Tracking"
2. Check page shows:
   - List of refund requests
   - Refund status filter
   - Expandable timeline for each refund
3. Click status filter
4. Try filtering by:
   - Pending
   - Approved
   - Completed
5. Expand a refund to see timeline

**Expected:**
- Refunds listed ✅
- Filter dropdown works ✅
- Timeline expandable ✅
- Statuses accurate ✅

**Document:**
- [ ] Refunds display
- [ ] Filter dropdown works
- [ ] Filtering works
- [ ] Timeline expands

---

### ✅ Test 5.5 - Address Management
**Goal:** Verify address management works

**Steps:**
1. From Account page, click "Address Management"
2. Check page shows:
   - Existing addresses (if any)
   - "Add New Address" button
   - Edit/Delete buttons for each address
3. Click "Add New Address"
4. Fill in form:
   - Full name
   - Phone
   - Country (select from 50+ dropdown)
   - State (should update based on country)
   - City
   - Address
5. Try different countries and verify states update
6. Click Save
7. Verify address appears in list
8. Try Edit and Delete

**Expected:**
- Addresses list displays ✅
- Add form works ✅
- 50+ countries available ✅
- States update dynamically ✅
- Save creates address ✅
- Edit/Delete work ✅

**Document:**
- [ ] Address list shows
- [ ] Add form works
- [ ] Countries: 50+ ☐ Yes ☐ No
- [ ] States dynamic ☐ Yes ☐ No
- [ ] Save works
- [ ] Edit works
- [ ] Delete works

---

## 🔧 Test Session 6: Admin Pages

### ✅ Test 6.1 - Admin Access
**Goal:** Verify only admins can access admin pages

**Steps:**
1. While logged in as regular customer, try to access:
   - http://localhost:5173/admin
   - http://localhost:5173/admin/products
2. Check if:
   - Access denied/redirected, OR
   - Pages not visible in navigation
3. Logout
4. Try accessing admin pages while logged out
5. Should be redirected to login

**Expected:**
- Regular users cannot access admin ✅
- Logged out users cannot access admin ✅
- Only admin/superadmin can access ✅

**Document:**
- [ ] Customer cannot access admin
- [ ] Logged-out cannot access
- [ ] Login required
- [ ] Proper role check

---

### ✅ Test 6.2 - Admin Products Page
**Goal:** Verify product management works

**Steps:**
1. Log in as admin
2. Navigate to /admin/products
3. Check page shows:
   - Products table with columns:
     - ID
     - Name
     - Category
     - Price
     - Stock
     - Actions (Edit/Delete)
   - Search box
   - Category filter
   - Pagination
   - "Add Product" button
4. Try each feature:
   - Search by product name
   - Filter by category
   - Paginate through products
   - Click "Add Product"
   - Fill form and submit
   - Click Edit on a product
   - Click Delete on a product

**Expected:**
- All features work ✅
- Data displays correctly ✅
- CRUD operations functional ✅

**Document:**
- [ ] Table displays
- [ ] Search works
- [ ] Filter works
- [ ] Pagination works
- [ ] Add Product form opens
- [ ] Add/Edit/Delete work

---

### ✅ Test 6.3 - Admin Orders Page
**Goal:** Verify order management works

**Steps:**
1. Navigate to /admin/orders
2. Check page shows:
   - Orders table
   - Search by order ID
   - Filter by status
   - Filter by payment status
   - Expand row to see items
   - Update status dropdown
3. Try changing an order's status
4. Verify status updates

**Expected:**
- Orders display ✅
- Filtering works ✅
- Status update works ✅
- Changes persist ✅

**Document:**
- [ ] Orders display
- [ ] Search works
- [ ] Filters work
- [ ] Status update works
- [ ] Persists correctly

---

### ✅ Test 6.4 - Admin Users Page
**Goal:** Verify user management works

**Steps:**
1. Navigate to /admin/users
2. Check page shows:
   - Users table
   - Search by name/email
   - Filter by role
   - Filter by status
   - Edit button
   - Delete button
3. Try updating a user's role
4. Try updating status
5. Try deleting a user (should show confirmation)

**Expected:**
- Users display ✅
- Filtering works ✅
- Role update works ✅
- Delete confirmation shows ✅

**Document:**
- [ ] Users display
- [ ] Search works
- [ ] Filters work
- [ ] Role update works
- [ ] Delete confirmation shows

---

### ✅ Test 6.5 - Admin Coupons Page
**Goal:** Verify coupon management works

**Steps:**
1. Navigate to /admin/coupons
2. Check page shows:
   - Coupons table
   - "Add Coupon" button
   - Edit/Delete buttons
   - CSV export button
3. Click "Add Coupon"
4. Fill form with:
   - Code: TEST10
   - Discount: 10
   - Type: Percentage or Fixed
   - Expiry date
   - Min order value (optional)
5. Save coupon
6. Try editing coupon
7. Try deleting coupon
8. Try CSV export

**Expected:**
- Coupons display ✅
- Add form works ✅
- Edit works ✅
- Delete works ✅
- CSV export downloads file ✅

**Document:**
- [ ] Coupons display
- [ ] Add form works
- [ ] Edit works
- [ ] Delete works
- [ ] CSV export works

---

### ✅ Test 6.6 - Admin Inventory Page
**Goal:** Verify inventory management works

**Steps:**
1. Navigate to /admin/inventory
2. Check page shows:
   - Inventory table with:
     - SKU
     - Product name
     - Current stock
     - Available stock
   - Filter by status
   - Adjust stock button
3. Click "Adjust Stock"
4. Fill form:
   - Quantity
   - Reason
   - Notes
5. Submit
6. Verify stock updates
7. Try CSV export

**Expected:**
- Inventory displays ✅
- Adjust stock works ✅
- Stock updates ✅
- Changes persist ✅
- CSV export works ✅

**Document:**
- [ ] Inventory displays
- [ ] Adjust stock form opens
- [ ] Stock updates
- [ ] CSV export works

---

### ✅ Test 6.7 - Admin Audit Logs Page
**Goal:** Verify audit logging works

**Steps:**
1. Navigate to /admin/audit-logs
2. Check page shows:
   - Audit logs table with:
     - Date/Time
     - User email
     - Action (Create, Update, Delete)
     - Resource (Product, Order, etc.)
     - Before/After values
     - IP address
     - Status
   - Search by user
   - Filter by action
   - Filter by resource
   - Expand to see changes
   - CSV export button
3. Expand a log entry to see before/after
4. Try filtering
5. Try CSV export

**Expected:**
- Logs display ✅
- Search/filter works ✅
- Changes visible ✅
- CSV export works ✅

**Document:**
- [ ] Logs display
- [ ] Search works
- [ ] Filters work
- [ ] Changes visible
- [ ] CSV export works

---

## 🌍 Test Session 7: International Features

### ✅ Test 7.1 - Locale Detection
**Goal:** Verify browser locale detection works

**Steps:**
1. Open browser DevTools (F12)
2. Settings → Language
3. Change browser language to:
   - English (Nigeria)
   - English (US)
   - English (UK)
4. For each language, check:
   - Currency symbol changes
   - Prices update
   - Country auto-selects
5. Open DevTools Console
6. Type: `localStorage.getItem('userCountry')`
7. Verify country is saved

**Expected:**
- Locale detection works ✅
- Currency updates ✅
- Country saved to localStorage ✅

**Document:**
- [ ] Nigeria locale: Currency ₦
- [ ] USA locale: Currency $
- [ ] UK locale: Currency £
- [ ] localStorage saves country

---

### ✅ Test 7.2 - Manual Country Override
**Goal:** Verify manual country selection works

**Steps:**
1. Go to Address Management
2. Open country dropdown
3. Count countries (should be 50+)
4. Select a different country
5. Check if currency updates
6. Check if it saved to localStorage

**Expected:**
- 50+ countries available ✅
- Currency updates immediately ✅
- Preference saves ✅

**Document:**
- [ ] Countries visible: Count _____
- [ ] Currency updates
- [ ] Preference persists

---

### ✅ Test 7.3 - States/Provinces Dynamic Update
**Goal:** Verify states update based on country

**Steps:**
1. In address form, select country
2. Check if states dropdown updates
3. Try different countries:
   - Nigeria (should show 36 states)
   - USA (should show 50 states)
   - Canada (should show provinces)
   - UK (should show 4 countries)
4. For each country, verify correct states appear

**Expected:**
- States load when country selected ✅
- Different countries have correct states ✅
- Nigeria: 36 states ✅
- USA: 50 states ✅
- Canada: provinces ✅

**Document:**
- [ ] Nigeria: States load (36)
- [ ] USA: States load (50)
- [ ] Canada: Provinces load
- [ ] UK: Countries load

---

### ✅ Test 7.4 - Currency Formatting
**Goal:** Verify prices format correctly for each currency

**Steps:**
1. Go to Shop page
2. For each product, check price format
3. Select different countries and verify:
   - Nigeria: ₦5,000.00
   - USA: $99.99
   - UK: £49.99
   - EUR: €29,99 (comma in EU)
4. Check decimal places:
   - Most currencies: 2 decimals
   - Japanese Yen: 0 decimals

**Expected:**
- Correct symbols ✅
- Correct separators (comma vs period) ✅
- Correct decimal places ✅

**Document:**
- [ ] Nigerian format correct
- [ ] US format correct
- [ ] UK format correct
- [ ] EU format correct (comma decimal)

---

### ✅ Test 7.5 - Shipping Cost by Country
**Goal:** Verify shipping updates based on country

**Steps:**
1. Go to Cart
2. Go to Checkout
3. Check shipping cost (e.g., domestic)
4. Change country to international
5. Check if shipping cost increases
6. Try different countries
7. Verify domestic vs international pricing

**Expected:**
- Domestic shipping lower ✅
- International shipping higher ✅
- Updates when country changes ✅

**Document:**
- [ ] Nigeria domestic: ₦ _____
- [ ] USA international: $ _____
- [ ] Updates when country changes

---

## 📱 Test Session 8: Mobile Responsive Design

### ✅ Test 8.1 - Mobile (375px - iPhone 12)
**Goal:** Verify all pages work on mobile

**Steps:**
1. Open DevTools (F12)
2. Click responsive design mode (Ctrl+Shift+M)
3. Set to iPhone 12 (375x812)
4. For each page below, check:
   - Text is readable (no tiny fonts)
   - Buttons easily tappable (48px+)
   - No horizontal scrolling needed
   - Images scale properly
   - Modals fit on screen
5. Pages to test:
   - Home
   - Shop
   - Product Detail
   - Cart
   - Account
   - Order History
   - Address Management

**Expected:**
- All pages readable ✅
- No horizontal scroll ✅
- All buttons tappable ✅
- Images responsive ✅

**Document:**
- [ ] Home: Readable ☐ Yes ☐ No
- [ ] Shop: Grid responsive ☐ Yes ☐ No
- [ ] Product: Images scale ☐ Yes ☐ No
- [ ] Cart: Content fits ☐ Yes ☐ No
- [ ] Account: Sidebar collapses ☐ Yes ☐ No
- [ ] Address: Form single column ☐ Yes ☐ No

---

### ✅ Test 8.2 - Tablet (768px - iPad)
**Goal:** Verify tablet layout

**Steps:**
1. In responsive mode, set to iPad (768x1024)
2. Check layout adapts to 2 columns where appropriate
3. Verify sidebar visible or accessible
4. Check all admin pages work on tablet

**Expected:**
- Two-column layout ✅
- Navigation clear ✅
- Content properly spaced ✅

**Document:**
- [ ] Home: Two-column
- [ ] Shop: Grid layout good
- [ ] Admin: Sidebar visible

---

### ✅ Test 8.3 - Desktop (1920px)
**Goal:** Verify full desktop experience

**Steps:**
1. Close responsive mode
2. Maximize browser window
3. Check that layout uses full width
4. Check no excessive whitespace
5. Sidebar visible if present
6. All content accessible

**Expected:**
- Full-width layout ✅
- No excessive whitespace ✅
- Professional appearance ✅

**Document:**
- [ ] Layout full-width
- [ ] No wasted space
- [ ] Professional look

---

## 🔐 Test Session 9: Security & Error Handling

### ✅ Test 9.1 - Form Validation
**Goal:** Verify form validation works

**Steps:**
1. Try to submit forms without required fields:
   - Login form (empty email)
   - Signup form (empty password)
   - Address form (empty country)
2. Check error messages appear
3. Try invalid email format
4. Try mismatched passwords
5. Check error feedback

**Expected:**
- Required fields blocked ✅
- Invalid format rejected ✅
- Clear error messages ✅

**Document:**
- [ ] Required field validation works
- [ ] Email format validates
- [ ] Password validation works
- [ ] Error messages clear

---

### ✅ Test 9.2 - Authentication Protection
**Goal:** Verify protected pages require login

**Steps:**
1. Logout (if logged in)
2. Try to access:
   - /account
   - /order-history
   - /admin/products
   - /admin/orders
3. Check if redirected to login
4. Login
5. Verify can now access pages

**Expected:**
- Non-logged-in users redirected ✅
- Admin pages require admin role ✅
- Login gives access ✅

**Document:**
- [ ] Account requires login
- [ ] Admin pages require login
- [ ] Role check works

---

### ✅ Test 9.3 - API Error Handling
**Goal:** Verify errors display gracefully

**Steps:**
1. With browser dev tools Network tab open
2. Try actions that might fail:
   - Delete a product
   - Update an order
   - Add a coupon with invalid data
3. Check if errors show user-friendly messages
4. Check console for actual errors
5. Verify app doesn't crash

**Expected:**
- No JavaScript errors ✅
- User-friendly error messages ✅
- App remains functional ✅

**Document:**
- [ ] Errors handled gracefully
- [ ] User messages clear
- [ ] App doesn't crash
- [ ] No console errors

---

### ✅ Test 9.4 - Data Persistence
**Goal:** Verify data saves correctly

**Steps:**
1. Create a new product (as admin)
2. Refresh page
3. Verify product still there
4. Create a new coupon
5. Refresh page
6. Verify coupon still there
7. Add address
8. Refresh page
9. Verify address still there

**Expected:**
- Data persists ✅
- No data loss on refresh ✅
- Database updates correctly ✅

**Document:**
- [ ] Products persist
- [ ] Coupons persist
- [ ] Addresses persist
- [ ] Data accurate

---

## 📋 Summary & Sign-Off

### Test Completion Checklist

**Session 1 - Home & Navigation:**
- [ ] All tests passed

**Session 2 - Products:**
- [ ] All tests passed

**Session 3 - Shopping Cart:**
- [ ] All tests passed

**Session 4 - Checkout:**
- [ ] All tests passed

**Session 5 - Account:**
- [ ] All tests passed

**Session 6 - Admin Pages:**
- [ ] All tests passed

**Session 7 - International:**
- [ ] All tests passed

**Session 8 - Mobile:**
- [ ] All tests passed

**Session 9 - Security:**
- [ ] All tests passed

---

### Issues Found

| Issue # | Severity | Component | Description | Status |
|---------|----------|-----------|-------------|--------|
| | | | | |
| | | | | |
| | | | | |

---

### Sign-Off

**QA Lead:** _________________ Date: _______  
**Product Manager:** _________________ Date: _______  
**Dev Lead:** _________________ Date: _______

**Overall Result:** ☐ PASS ☐ FAIL ☐ CONDITIONAL PASS

---

**Testing Document Version:** 1.0  
**Last Updated:** March 4, 2026
