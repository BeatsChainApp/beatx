# 🔐 BeatsChain Admin Wallet Setup Guide

## 🎯 **Current Situation**
You have multiple wallets causing authentication confusion:

1. **Super Admin Wallet**: `0xc84799a904eeb5c57abbbc40176e7db8be202c10`
2. **Thirdweb Embedded**: `0x8B7a...B17F` (auto-generated from Google)
3. **Your Personal Wallet**: (Your actual wallet address)

## ✅ **RECOMMENDED SOLUTION: Email-First Authentication**

### **Option 1: Use Email Authentication (EASIEST)**
1. Go to `/admin/setup`
2. Click "Sign in with Google (Recommended)"
3. Use email: `info@unamifoundation.org`
4. ✅ **Instant admin access** - no wallet import needed

### **Option 2: Import Super Admin Wallet**
1. Get the private key for: `0xc84799a904eeb5c57abbbc40176e7db8be202c10`
2. Import it into MetaMask/wallet
3. Connect with that wallet
4. ✅ **Full super admin access**

### **Option 3: Add Your Wallet to Admin List**
1. Find your actual wallet address
2. Add it to `SUPER_ADMIN_WALLETS` in code:
```javascript
const SUPER_ADMIN_WALLETS = [
  '0xc84799a904eeb5c57abbbc40176e7db8be202c10',
  'YOUR_ACTUAL_WALLET_ADDRESS'.toLowerCase(), // Add this
]
```

## 🔧 **Why Multiple Wallets Exist**

### **Thirdweb Embedded Wallets**
- **Auto-generated** when you sign in with Google/email
- **Different for each email** used
- **Tied to Thirdweb project** - not your personal wallet

### **Your Personal Wallet**
- **Your actual wallet** (MetaMask, etc.)
- **You control the private keys**
- **Needs to be imported** or added to admin list

## 🎯 **IMMEDIATE ACTION PLAN**

### **For Quick Access (5 minutes):**
```bash
1. Go to /admin/setup
2. Click "Sign in with Google (Recommended)"  
3. Use: info@unamifoundation.org
4. ✅ Admin access granted via email
```

### **For Full Control (if you have the private key):**
```bash
1. Import super admin wallet private key into MetaMask
2. Connect with that wallet
3. ✅ Full blockchain admin access
```

### **For Using Your Own Wallet:**
```bash
1. Get your wallet address
2. Add it to SUPER_ADMIN_WALLETS array
3. Deploy changes
4. Connect with your wallet
```

## 📋 **Current Configuration**

```javascript
// Email-based admin access (WORKING)
ADMIN_EMAILS = [
  'info@unamifoundation.org',     // ✅ Your admin email
  'admin@beatschain.app',
  'support@beatschain.app'
]

// Wallet-based admin access
SUPER_ADMIN_WALLETS = [
  '0xc84799a904eeb5c57abbbc40176e7db8be202c10'  // ✅ Configured
]
```

## 🚀 **RECOMMENDATION**

**Use Option 1 (Email Auth)** - it's the fastest and most reliable:
- No wallet import needed
- No private key management
- Instant access
- Works across all devices

The system is designed to work with **email-first authentication** for exactly this reason - wallet management complexity.