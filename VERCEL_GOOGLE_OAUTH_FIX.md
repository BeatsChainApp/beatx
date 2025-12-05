# 🚨 Vercel Google OAuth Configuration Fix

## ❌ **Current Issue on Vercel Deployment**
```
Domain: beatx-six.vercel.app
Client ID: 239753403483-re3akggqub93apgm4t5nnabbbrcp0q1p.apps.googleusercontent.com
Error: The given origin is not allowed for the given client ID
```

## 🎯 **Root Cause**
The Google OAuth client ID doesn't have `https://beatx-six.vercel.app` authorized in Google Cloud Console.

## ✅ **IMMEDIATE FIX REQUIRED**

### **Step 1: Update Google Cloud Console**
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Navigate to **APIs & Services > Credentials**
3. Find OAuth 2.0 Client ID: `239753403483-re3akggqub93apgm4t5nnabbbrcp0q1p`
4. Click **Edit**
5. Under **Authorized JavaScript origins**, add:
   - `https://beatx-six.vercel.app`
   - `https://*.vercel.app` (for all Vercel deployments)

### **Step 2: Verify Current Authorized Origins**
The client should have these domains authorized:
- `https://beatx-six.vercel.app` ← **MISSING - ADD THIS**
- `https://beatschain.app` (if using custom domain)
- `http://localhost:3000` (for development)

## 🔧 **Alternative: Environment-Based Client ID**

Create separate OAuth clients for different environments:

### **Production Client** (for Vercel)
- Domain: `https://beatx-six.vercel.app`
- Client ID: Create new one specifically for Vercel

### **Development Client** (for local)
- Domain: `http://localhost:3000`
- Client ID: Current one or new one

### **Update Environment Variables**
```bash
# .env.production (Vercel)
NEXT_PUBLIC_GOOGLE_CLIENT_ID=NEW_VERCEL_CLIENT_ID

# .env.local (Development)  
NEXT_PUBLIC_GOOGLE_CLIENT_ID=239753403483-re3akggqub93apgm4t5nnabbbrcp0q1p.apps.googleusercontent.com
```

## 🚀 **Quick Fix for Immediate Deployment**

Since you can't access Google Cloud Console right now, update the admin setup to use **Thirdweb embedded wallet only**:

```tsx
// Remove Google OAuth button entirely
// Keep only Thirdweb ConnectButton which handles OAuth internally
<ConnectButton 
  client={client}
  wallets={[inAppWallet({ auth: { providers: ["google"] } })]}
/>
```

This bypasses the domain authorization issue because Thirdweb handles OAuth internally with their own client ID.

## 📋 **Current Status**
- **Vercel Domain**: `beatx-six.vercel.app` ❌ Not authorized
- **Google Client**: `239753403483-re3akggqub93apgm4t5nnabbbrcp0q1p` ❌ Missing domain
- **Workaround**: ✅ Thirdweb embedded wallet available

## 🎯 **Action Required**
1. **Immediate**: Deploy with Thirdweb-only auth
2. **Next**: Add Vercel domain to Google OAuth client
3. **Future**: Consider separate OAuth clients per environment