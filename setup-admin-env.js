#!/usr/bin/env node

const fs = require('fs')
const path = require('path')
const crypto = require('crypto')

// Generate a secure admin API key
const generateAdminKey = () => {
  return crypto.randomBytes(32).toString('hex')
}

// Update environment files
const updateEnvFile = (filePath, key, value) => {
  if (!fs.existsSync(filePath)) {
    console.log(`Creating ${filePath}`)
    fs.writeFileSync(filePath, '')
  }
  
  let content = fs.readFileSync(filePath, 'utf8')
  const keyPattern = new RegExp(`^${key}=.*$`, 'm')
  
  if (keyPattern.test(content)) {
    content = content.replace(keyPattern, `${key}=${value}`)
    console.log(`Updated ${key} in ${filePath}`)
  } else {
    content += `\n${key}=${value}\n`
    console.log(`Added ${key} to ${filePath}`)
  }
  
  fs.writeFileSync(filePath, content)
}

console.log('🔧 Setting up admin environment variables...')

const adminApiKey = generateAdminKey()

// Update MCP server environment
const mcpEnvPath = path.join(__dirname, 'packages/mcp-server/.env')
updateEnvFile(mcpEnvPath, 'ADMIN_API_KEY', adminApiKey)

// Update app environment
const appEnvPath = path.join(__dirname, 'packages/app/.env.local')
updateEnvFile(appEnvPath, 'NEXT_PUBLIC_ADMIN_API_KEY', adminApiKey)

// Update root environment
const rootEnvPath = path.join(__dirname, '.env')
updateEnvFile(rootEnvPath, 'ADMIN_API_KEY', adminApiKey)

console.log('✅ Admin environment setup complete!')
console.log('🔑 Admin API Key generated and configured')
console.log('🚀 Restart your servers to apply changes')

// Create admin setup instructions
const instructions = `
# Admin Setup Complete

## Admin Access Configuration

### Super Admin Wallets:
- 0xc84799a904eeb5c57abbbc40176e7db8be202c10

### Admin Emails:
- info@unamifoundation.org
- admin@beatschain.app
- support@beatschain.app

### Environment Variables Set:
- ADMIN_API_KEY: ${adminApiKey}

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

Generated: ${new Date().toISOString()}
`

fs.writeFileSync(path.join(__dirname, 'ADMIN_SETUP_INSTRUCTIONS.md'), instructions)
console.log('📋 Admin setup instructions saved to ADMIN_SETUP_INSTRUCTIONS.md')