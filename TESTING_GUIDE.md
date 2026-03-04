# QUICK START GUIDE - Testing Backend APIs

## Prerequisites
- Backend running on http://localhost:3000
- Frontend running on http://localhost:5173
- PostgreSQL database running
- Redis running (for brute force & caching)

---

## How to Test Each API

### 1. Test Refund APIs

**Create a Refund Request (Authenticated - Customer)**
```bash
curl -X POST http://localhost:3000/api/refunds \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "orderId": "order-uuid-here",
    "reason": "defective_product",
    "requestedAmount": 100
  }'
```

**Get All Refunds (Authenticated - Customer)**
```bash
curl -X GET "http://localhost:3000/api/refunds?limit=10&offset=0" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Approve Refund (Admin Only)**
```bash
curl -X PATCH http://localhost:3000/api/admin/refunds/:id/approve \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -d '{
    "approvedAmount": 100,
    "notes": "Approved"
  }'
```

**Complete Refund (Admin Only)**
```bash
curl -X PATCH http://localhost:3000/api/admin/refunds/:id/complete \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -d '{
    "transactionRef": "refund-ref-123"
  }'
```

---

### 2. Test Coupon APIs

**Get Active Coupons (Public)**
```bash
curl -X GET http://localhost:3000/api/coupons
```

**Apply Coupon Code (Customer)**
```bash
curl -X POST http://localhost:3000/api/coupons/apply \
  -H "Content-Type: application/json" \
  -d '{
    "code": "SAVE10",
    "orderTotal": 100
  }'
```

**Create Coupon (Admin Only)**
```bash
curl -X POST http://localhost:3000/api/admin/coupons \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -d '{
    "code": "SAVE10",
    "discountType": "percentage",
    "discountValue": 10,
    "maxUses": 100,
    "minOrderAmount": 50,
    "expiresAt": "2026-12-31T23:59:59Z"
  }'
```

---

### 3. Test Inventory APIs

**Get All Inventory (Admin Only)**
```bash
curl -X GET "http://localhost:3000/api/admin/inventory?limit=20&offset=0" \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

**Adjust Inventory (Admin Only)**
```bash
curl -X POST http://localhost:3000/api/admin/inventory/product-uuid/adjust \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -d '{
    "quantity": 50,
    "reason": "Restock from supplier"
  }'
```

**Get Reorder Items (Admin Only)**
```bash
curl -X GET http://localhost:3000/api/admin/inventory/reorder/items \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

---

### 4. Test Admin Dashboard APIs

**Get Dashboard Stats (Admin Only)**
```bash
curl -X GET http://localhost:3000/api/admin/dashboard \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

**Get Analytics (Admin Only)**
```bash
curl -X GET "http://localhost:3000/api/admin/analytics?period=week" \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

**Get All Users (Admin Only)**
```bash
curl -X GET "http://localhost:3000/api/admin/users?limit=20&offset=0" \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

**Update User Role (Admin Only)**
```bash
curl -X PATCH http://localhost:3000/api/admin/users/user-uuid \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -d '{
    "role": "admin"
  }'
```

---

### 5. Test Audit Log APIs

**Get Audit Logs (Admin Only)**
```bash
curl -X GET "http://localhost:3000/api/admin/audit-logs?limit=50&offset=0" \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

**Export Audit Logs as CSV (Admin Only)**
```bash
curl -X GET http://localhost:3000/api/admin/audit-logs/export/csv \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -o audit-logs.csv
```

**Get User Activity Logs (Admin Only)**
```bash
curl -X GET http://localhost:3000/api/admin/audit-logs/user/user-uuid \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

---

## Testing with Postman

1. **Create Environment Variables:**
   ```
   base_url = http://localhost:3000
   token = YOUR_JWT_TOKEN
   admin_token = ADMIN_JWT_TOKEN
   ```

2. **Import Collections:** Create folders in Postman:
   - Refunds
   - Coupons
   - Inventory
   - Admin
   - Audit Logs

3. **Use Bearer Token Auth:**
   ```
   Authorization: Bearer {{token}}
   ```

---

## Testing Frontend Pages

### 1. Order History
```
Visit: http://localhost:5173/orders
Expects: GET /api/orders (paginated list)
Actions: View details, download invoice, request refund
```

### 2. Order Detail
```
Visit: http://localhost:5173/orders/:orderId
Expects: GET /api/orders/:id
Actions: Download invoice, request refund
```

### 3. Refund Request
```
Visit: http://localhost:5173/refunds/new?orderId=xxx
Expects: GET /api/orders/:id, POST /api/refunds
Actions: Submit refund form
```

### 4. Admin Dashboard
```
Visit: http://localhost:5173/admin/dashboard
Expects: GET /api/admin/dashboard, /api/admin/analytics
Shows: Stats, recent orders, key metrics
```

---

## Common Issues & Solutions

### Issue: "Unauthorized" on Admin Endpoints
**Solution:** Make sure you're using ADMIN_TOKEN, not regular user token
```bash
# Check token claims:
# Decode JWT at jwt.io to verify role = "admin" or "superadmin"
```

### Issue: "Brute force lock - too many attempts"
**Solution:** Wait 15 minutes or clear Redis:
```bash
redis-cli DEL brute_force_*
```

### Issue: CORS errors when calling API from frontend
**Solution:** Check CORS_ORIGIN in .env matches frontend URL
```bash
CORS_ORIGIN=http://localhost:5173
```

### Issue: 404 on new endpoints
**Solution:** Verify app.js routes are imported and mounted
```bash
grep -n "refundRoutes\|couponRoutes\|adminRoutes" backend/app.js
```

---

## Performance Testing

### Load Test with Artillery
```bash
npm install -g artillery

artillery run load-test.yml
```

Sample load-test.yml:
```yaml
config:
  target: "http://localhost:3000"
  phases:
    - duration: 60
      arrivalRate: 10
      
scenarios:
  - name: "Get Coupons"
    flow:
      - get:
          url: "/api/coupons"
      
  - name: "Apply Coupon"
    flow:
      - post:
          url: "/api/coupons/apply"
          json:
            code: "SAVE10"
            orderTotal: 100
```

---

## Database Verification

### Check Refund Data
```sql
SELECT * FROM "RefundRequests" ORDER BY "createdAt" DESC LIMIT 10;
```

### Check Coupon Data
```sql
SELECT * FROM "Coupons" WHERE "isActive" = true;
```

### Check Audit Logs
```sql
SELECT * FROM "AuditLogs" ORDER BY "createdAt" DESC LIMIT 20;
```

### Check Inventory
```sql
SELECT * FROM "Inventories" WHERE quantity <= "reorderLevel";
```

---

## Deployment Checklist

- [ ] All environment variables set
- [ ] Database migrations run
- [ ] Redis server running
- [ ] Backend server running
- [ ] Frontend built and deployed
- [ ] CORS origins configured
- [ ] SSL certificates valid
- [ ] Rate limits configured
- [ ] Monitoring/logging set up
- [ ] Backups configured
- [ ] Load testing passed
- [ ] Security audit passed

---

## Support & Debugging

### Enable Debug Logging
```bash
NODE_ENV=development npm run dev
```

### View Backend Logs
```bash
tail -f logs/app.log
```

### View Database Queries
```bash
# In sequelize config, set logging to console
```

### Test Email/SMS Services
```bash
# Check backend/utils/emailService.js
# Check backend/utils/smsService.js
```

---

## Key Contacts

- Backend Errors: Check backend/utils/Logger.js output
- Frontend Errors: Check browser console (F12)
- Database Issues: Check PostgreSQL logs
- Redis Issues: Check Redis server status
- API Issues: Use Postman to isolate
