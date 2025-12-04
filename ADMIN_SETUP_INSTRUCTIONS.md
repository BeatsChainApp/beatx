
# Admin Setup Complete

## Admin Access Configuration

### Super Admin Wallets:
- 0xc84799a904eeb5c57abbbc40176e7db8be202c10

### Admin Emails:
- info@unamifoundation.org
- admin@beatschain.app
- support@beatschain.app

### Environment Variables Set:
- ADMIN_API_KEY: 4a803c4287dd2395ad763b331d873a30a0d9c0af09aa7adb6335926074a059a4

## How to Access Admin Panel:

1. **Wallet-based Admin Access:**
   - Connect with super admin wallet: 0xc84799a904eeb5c57abbbc40176e7db8be202c10
   - Navigate to /admin
   - Admin setup prompt will appear automatically

2. **Email-based Admin Access:**
   - Sign in with Google using admin email
   - Connect any wallet (optional)
   - Navigate to /admin
   - Admin setup prompt will appear automatically

3. **API-based Admin Access:**
   - Use ADMIN_API_KEY in Authorization header
   - Access MCP server admin endpoints directly

## Admin Endpoints:
- GET /api/admin/dashboard - Admin dashboard data
- GET /api/admin/users - User management
- GET /api/admin/beats - Beat management
- GET /api/admin/settings - System settings
- POST /api/admin/verify-wallet - Verify admin access
- POST /api/admin/setup - Setup admin access

## Troubleshooting:
- Ensure MCP server is running with updated environment
- Check browser console for authentication errors
- Verify wallet address matches exactly (lowercase)
- Clear browser cache if admin setup doesn't appear

Generated: 2025-12-04T13:50:40.334Z
