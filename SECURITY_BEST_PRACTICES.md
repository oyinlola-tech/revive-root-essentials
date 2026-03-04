# Security Best Practices and Enterprise Guidelines

## Table of Contents
1. [Backend Security](#backend-security)
2. [Frontend Security](#frontend-security)
3. [Data Protection](#data-protection)
4. [Authentication & Authorization](#authentication--authorization)
5. [Payment Security](#payment-security)
6. [Infrastructure Security](#infrastructure-security)
7. [Monitoring & Logging](#monitoring--logging)
8. [Deployment Checklist](#deployment-checklist)

---

## Backend Security

### 1. Input Validation & Sanitization

**Implemented:**
- Express-validator for all POST/PUT/PATCH requests
- SQL injection prevention through parameterized queries (Sequelize)
- XSS prevention through input sanitization
- Rate limiting on sensitive endpoints

**Best Practices:**
```javascript
// Always validate user input
const { sanitizeInput, validateEmail } = require('./utils/securityUtils');

// Sanitize strings to remove potential XSS
const cleanInput = sanitizeInput(userInput);

// Validate email format
const validEmail = validateEmail(userInput);
```

### 2. Authentication & Sessions

**Implemented:**
- JWT-based authentication
- Refresh token rotation
- Session invalidation on logout
- Token expiration (7 days for access, 30 days for refresh)

**Best Practices:**
```javascript
// Store sessionId in JWT to prevent token reuse
const token = jwt.sign(
  { id: user.id, sessionId: user.currentSessionId },
  JWT_SECRET,
  { expiresIn: JWT_EXPIRES_IN }
);

// Invalidate all tokens on logout
user.currentSessionId = null;
await user.save();
```

### 3. Authorization & Role-Based Access Control

**Implemented:**
- Role-based middleware (user, admin, superadmin)
- Resource ownership verification
- Admin-only operations

**Roles:**
- `user` - Regular customer
- `admin` - Can manage products, categories, orders
- `superadmin` - Full system access, user management

### 4. Rate Limiting

**Implemented:**
- Global: 300 requests/15 min
- Auth: 30 requests/15 min
- Contact: 5 requests/hour
- Newsletter: 10 requests/hour
- Orders: 10 requests/minute

**Configuration:**
```javascript
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // limit each IP to 300 requests per windowMs
  store: redis, // Use Redis for distributed rate limiting
});
```

### 5. CSRF Protection

**Implemented:**
- CSRF token generation for GET requests
- Token validation for unsafe methods (POST, PUT, PATCH, DELETE)
- HttpOnly cookies for token storage
- One-time use tokens

**Usage:**
```javascript
// Token is automatically added to X-CSRF-Token header
// And X-CSRF-Cookie for cookie-based validation
fetch('/api/endpoint', {
  method: 'POST',
  headers: {
    'X-CSRF-Token': csrfToken,
  },
});
```

### 6. Security Headers

**Implemented:**
- Helmet.js for default security headers
- Content Security Policy (CSP)
- X-Content-Type-Options: nosniff
- X-Frame-Options: DENY
- Referrer-Policy: strict-origin-when-cross-origin
- HSTS (in production)

### 7. HTTPS Enforcement

**Required in Production:**
```javascript
// Enforce HTTPS redirect
if (process.env.NODE_ENV === 'production') {
  app.use((req, res, next) => {
    if (req.header('x-forwarded-proto') !== 'https') {
      return res.redirect(`https://${req.header('host')}${req.url}`);
    }
    next();
  });
}
```

### 8. Environment Variables

**Never commit to version control:**
- `.env` files must be in `.gitignore`
- Use `.env.example` for templates
- Rotate secrets regularly
- Use strong, random values for JWT secrets

**Sensitive Environment Variables:**
```
JWT_SECRET=generate_random_256_bit_hex
JWT_REFRESH_SECRET=generate_different_random_256_bit_hex
FLW_SECRET_KEY=keep_absolutely_secret
FLW_WEBHOOK_SECRET_HASH=keep_absolutely_secret
DB_PASSWORD=strong_database_password
EMAIL_PASS=strong_email_password
REDIS_PASSWORD=strong_redis_password
```

---

## Frontend Security

### 1. XSS Prevention

**Implemented:**
- React automatically escapes JSX content
- Content Security Policy headers
- No dangerous `innerHTML` usage

**Best Practices:**
```typescript
// Good - React escapes this
<div>{userInput}</div>

// Avoid - Never use innerHTML with user data
<div dangerouslySetInnerHTML={{ __html: userInput }} />
```

### 2. Token Management

**Implemented:**
- Tokens stored in localStorage
- Secure HTTP-only cookies in future updates
- Token expiration handling

**Best Practices:**
```typescript
// Clear tokens on logout
clearAuthSession();

// Refresh token before expiration
if (shouldRefreshToken()) {
  const newToken = await refreshToken();
  setAuthSession(newToken);
}
```

### 3. HTTPS Only

**Required:**
- All API communication over HTTPS (production)
- Upgrade-Insecure-Requests header
- HSTS preload

### 4. Content Security Policy

**Headers Configured:**
```
Content-Security-Policy: default-src 'self'; 
  script-src 'self' 'unsafe-inline'; 
  style-src 'self' 'unsafe-inline'; 
  img-src 'self' data: https:; 
  connect-src 'self' https:;
```

### 5. CSRF Protection

**Token Usage:**
```typescript
const csrfToken = document.querySelector('meta[name="csrf-token"]')?.content;

fetch('/api/endpoint', {
  method: 'POST',
  headers: {
    'X-CSRF-Token': csrfToken,
    'Content-Type': 'application/json',
  },
});
```

---

## Data Protection

### 1. Data Encryption

**At Rest:**
- Database passwords: bcryptjs with salt rounds 12
- Sensitive fields: Consider database-level encryption
- Backups: Encrypted storage

**In Transit:**
- HTTPS/TLS 1.3 mandatory
- Perfect Forward Secrecy enabled

**Implementation:**
```javascript
const hash = await bcrypt.hash(password, 12);
const isValid = await bcrypt.compare(password, hash);
```

### 2. PII Handling

**Best Practices:**
- Only collect necessary data
- Encrypt sensitive data fields
- Implement data retention policies
- Provide user data export functionality
- Implement right-to-be-forgotten

### 3. Logging & Monitoring

**Don't log:**
- Passwords
- Token values
- Credit card numbers
- API keys
- Secrets

**Implementation:**
```javascript
const sanitizedData = {
  ...userData,
  password: '***REDACTED***',
  secret: '***REDACTED***',
};
logger.info('User action', sanitizedData);
```

### 4. Database Security

**MySQL Configuration:**
```sql
-- Use strong passwords
ALTER USER 'root'@'localhost' IDENTIFIED BY 'strong_password';

-- Create limited-privilege user for app
CREATE USER 'app_user'@'localhost' IDENTIFIED BY 'strong_password';
GRANT SELECT, INSERT, UPDATE, DELETE ON revive_roots.* TO 'app_user'@'localhost';

-- Remove test databases
DROP DATABASE IF EXISTS test;

-- Disable remote root login
DELETE FROM mysql.user WHERE User='root' AND Host NOT IN ('localhost', '127.0.0.1', '::1');
FLUSH PRIVILEGES;
```

### 5. Redis Security

**Configuration:**
```javascript
// Require authentication
requirepass strong_redis_password

// Bind to localhost
bind 127.0.0.1

// Disable dangerous commands in production
rename-command FLUSHDB ""
rename-command FLUSHALL ""
rename-command KEYS ""
```

---

## Authentication & Authorization

### 1. Multi-Factor Authentication

**Implemented:**
- OTP-based 2FA for registration verification

**Future Enhancement:**
- Time-based OTP (TOTP)
- Security keys
- Passwordless authentication

### 2. OAuth Integration

**Implemented:**
- Google OAuth
- Apple OAuth

**Best Practices:**
```javascript
// Verify OAuth tokens on backend
const decoded = await googleClient.verifyIdToken({
  idToken: idToken,
  audience: process.env.GOOGLE_CLIENT_ID,
});

// Create or update user with OAuth provider info
const user = await findOrCreateOAuthUser({
  provider: 'google',
  subject: decoded.sub,
  email: decoded.email,
  name: decoded.name,
});
```

### 3. Password Security

**Requirements:**
- Minimum 8 characters
- Mix of uppercase, lowercase, numbers, special chars
- No common passwords
- Bcrypt with salt rounds 12

**Implementation:**
```javascript
const passwordStrength = getPasswordStrength(password);
// Weak, Fair, Good, Strong, Very Strong

if (passwordStrength === 'Weak') {
  return error('Password not strong enough');
}
```

### 4. Session Management

**Best Practices:**
- Sessions expire after inactivity (7 days for access token)
- Invalidate session on logout
- Prevent session hijacking with fingerprints
- Secure session storage

---

## Payment Security

### 1. Flutterwave Security

**Implemented:**
- Webhook signature verification
- Transaction status validation
- Amount verification
- Currency validation
- Order reference verification

**Webhook Verification:**
```javascript
const verifyWebhookSignature = (signatureHeader, payload) => {
  const hash = crypto
    .createHash('sha256')
    .update(JSON.stringify(payload) + FLW_WEBHOOK_SECRET_HASH)
    .digest('hex');
  
  return crypto.timingSafeEqual(
    Buffer.from(hash),
    Buffer.from(signatureHeader)
  );
};
```

### 2. PCI-DSS Compliance

**Measures:**
- Never store credit card data
- Use Flutterwave for payment processing
- HTTPS for all payment endpoints
- Rate limiting on payment endpoints
- Audit logging for payment operations

### 3. Transaction Handling

**Best Practices:**
```javascript
// 1. Verify transaction status
const txn = await paymentService.verifyTransaction(transactionId);
if (!isSuccessfulTransaction(txn)) {
  return error('Payment not confirmed');
}

// 2. Verify transaction details
if (txn.amount < order.totalAmount) {
  return error('Insufficient payment');
}

// 3. Update order atomically
await order.update({ paymentStatus: 'paid' });
```

---

## Infrastructure Security

### 1. Server Configuration

**Firewall Rules:**
```bash
# Allow HTTPS only
sudo ufw allow 443/tcp

# Allow SSH from specific IP
sudo ufw allow from 203.0.113.0/24 to any port 22

# Block everything else
sudo ufw default deny incoming
sudo ufw default allow outgoing
```

### 2. Database Backup

**Automated Backups:**
```bash
# Daily encrypted backup
0 2 * * * mysqldump -u root -p$PASSWORD revive_roots | gzip | gpg -r user_id -e > /backups/revive_roots_$(date +\%Y\%m\%d).sql.gz.gpg
```

### 3. SSL/TLS Certificate

**Let's Encrypt with Auto-Renewal:**
```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Generate certificate
sudo certbot certonly --nginx -d reviverootsessentials.com

# Auto-renewal
sudo systemctl enable certbot.timer
sudo systemctl start certbot.timer
```

### 4. Dependency Management

**Regular Updates:**
```bash
# Check for vulnerabilities
npm audit

# Fix automatically
npm audit fix

# Update dependencies
npm update
```

### 5. Docker Security

**Best Practices:**
```dockerfile
# Use minimal base image
FROM node:18-alpine

# Run as non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001
USER nodejs

# Don't run as root
# Use specific version tags
# Scan images for vulnerabilities
```

---

## Monitoring & Logging

### 1. Application Logging

**Implemented:**
- Structured JSON logging
- Separate log files for different levels (INFO, WARN, ERROR, AUDIT)
- Redacted sensitive data
- Timestamps and context

**Log Files Location:**
- `/backend/logs/info-YYYY-MM-DD.log`
- `/backend/logs/error-YYYY-MM-DD.log`
- `/backend/logs/audit-YYYY-MM-DD.log`

### 2. Audit Logging

**Tracked Events:**
- User login/logout
- Role changes
- Data modifications
- Admin actions
- Payment transactions
- Security events

**Usage:**
```javascript
logger.audit('user_login', userId, {
  ip: req.ip,
  userAgent: req.get('user-agent'),
});
```

### 3. Performance Monitoring

**Metrics to Track:**
- Response times
- Error rates
- Database query performance
- API endpoint popularity
- Cache hit rates

### 4. Security Monitoring

**Alert on:**
- Multiple failed login attempts
- Suspicious input patterns
- Rate limit violations
- Unusual database queries
- Webhook failures

### 5. Health Checks

**Implementation:**
```javascript
// Health check endpoint
GET /health
{
  "status": "OK",
  "timestamp": "2024-01-01T00:00:00Z",
  "environment": "production",
  "database": "connected",
  "redis": "connected"
}
```

---

## Deployment Checklist

### Pre-Deployment

- [ ] Security audit completed
- [ ] Penetration testing done
- [ ] All dependencies updated
- [ ] `npm audit` passes with no critical issues
- [ ] Environment variables configured
- [ ] Database backups configured
- [ ] SSL certificate generated
- [ ] Firewall rules configured
- [ ] Rate limiting configured
- [ ] Logging verified
- [ ] Test coverage > 80%
- [ ] Documentation updated

### Deployment

- [ ] Deploy to staging first
- [ ] Run smoke tests
- [ ] Verify all endpoints
- [ ] Check payment integration
- [ ] Test email notifications
- [ ] Verify Redis caching
- [ ] Deploy to production
- [ ] Monitor error logs
- [ ] Verify health checks

### Post-Deployment

- [ ] Monitor error rates
- [ ] Check performance metrics
- [ ] Verify all features working
- [ ] Test user registration/login
- [ ] Test payment flow
- [ ] Verify Email/SMS notifications
- [ ] Monitor uptime
- [ ] Review security logs daily

---

## Regular Security Tasks

### Daily
- [ ] Review error logs
- [ ] Check security logs for suspicious activity
- [ ] Monitor system resources

### Weekly
- [ ] Review server logs
- [ ] Check for failed backup jobs
- [ ] Update security patches on OS

### Monthly
- [ ] Security audit
- [ ] Review access logs
- [ ] Test disaster recovery
- [ ] Update documentation
- [ ] Review password policies

### Quarterly
- [ ] Penetration testing
- [ ] Security training for team
- [ ] Review and update security policies
- [ ] Audit third-party integrations

### Annually
- [ ] Full security assessment
- [ ] Compliance audit
- [ ] Employee security training
- [ ] Incident response drill

---

## Incident Response Plan

### 1. Detection
- Monitor logs and alerts
- Security team reviews alerts

### 2. Assessment
- Determine scope of breach
- Identify affected systems
- Estimate impact

### 3. Containment
- Isolate affected systems
- Revoke compromised credentials
- Block malicious IP addresses

### 4. Recovery
- Restore from clean backups
- Patch vulnerabilities
- Verify system integrity

### 5. Post-Incident
- Notify affected users
- Document lessons learned
- Update security policies

---

## Contact & Support

- **Security Issues:** security@reviverootsessentials.com
- **Bug Bounty:** Responsible disclosure policy available on website
- **General Support:** support@reviverootsessentials.com

---

## References

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [CWE Top 25](https://cwe.mitre.org/top25/)
- [PCI-DSS Compliance](https://www.pcisecuritystandards.org/)
- [NIST Cybersecurity Framework](https://www.nist.gov/cyberframework)
