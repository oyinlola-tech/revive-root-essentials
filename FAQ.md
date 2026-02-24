# FAQ

## Account and Consent

### 1. Why must I accept Terms and Conditions to create an account?
Acceptance is required to establish a valid user agreement for account usage, ordering, support, communication controls, and data handling expectations.

### 2. Are marketing and newsletter options compulsory?
No. They are optional and can be left unchecked during registration.

### 3. Can I still buy products if I do not accept marketing/newsletter?
Yes. Marketing consent is optional and does not block core checkout functionality.

### 4. What happens if I subscribe later from the website footer?
Your email is added to newsletter subscribers, and if it matches an existing account, newsletter preference can be reactivated for that user.

## Newsletter and Email Marketing

### 5. How often is the newsletter sent?
The system is configured for weekly campaigns using backend scheduler settings.

### 6. What is in the weekly newsletter?
Each weekly email can include the latest 15 products with:

- Product image
- Price in NGN (Naira)
- Direct link to each product page

### 7. Why are prices in Naira in newsletter emails?
Campaign format is designed to present pricing in NGN for market consistency and conversion clarity.

### 8. What does “luxury newsletter design” mean in this implementation?
The campaign template uses a premium editorial layout with restrained styling, strong hierarchy, and at most two app-aligned colors for visual consistency and high readability.

### 9. Can an admin send newsletter before the scheduled day?
A superadmin can manually trigger “Send Newsletter Now” at any time from the superadmin dashboard.

### 10. What if no products are available when newsletter runs?
The campaign skips sending and returns a status indicating no eligible products were found.

### 11. Will out-of-stock items be sent?
The campaign prioritizes in-stock recent products; dynamic stock can still change between send time and user click.

## Unsubscribe and Preferences

### 12. How do users unsubscribe?
Every newsletter email includes a one-click unsubscribe link that deactivates future newsletter sends for that email.

### 13. Is unsubscribe immediate?
Unsubscribe requests are processed immediately in the application. Normal email delivery timing still applies for previously queued messages.

### 14. Can users re-subscribe later?
Yes. They can subscribe again using the newsletter subscription form or other subscription-enabled flows.

## Account Deletion and Data

### 15. Can users delete their account themselves?
Yes. Authenticated users can delete their account directly from their dashboard profile section.

### 16. What happens after account deletion?
Access is removed. Data is handled according to operational and legal retention obligations, including potential retention of transaction records needed for compliance and fraud prevention.

### 17. Does account deletion remove newsletter subscription?
If the account email is linked to newsletter preferences, account-related newsletter settings are disabled for that user profile.

## Security and Platform Controls

### 18. What measures protect registration and login?
The backend includes validation, OTP verification flows, auth middleware, and restricted-role routing controls.

### 19. Can users change another user’s profile?
No. Access controls restrict regular users to their own data, while privileged roles have broader administrative controls.

### 20. Where should vulnerabilities be reported?
Use the coordinated disclosure process in `SECURITY.md`.
