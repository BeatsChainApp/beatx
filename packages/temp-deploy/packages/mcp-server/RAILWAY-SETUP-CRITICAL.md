# 🚨 CRITICAL RAILWAY SETUP FIXES

## 1. REMOVE PORT Variable
- Go to Railway Variables
- DELETE the PORT variable (Railway sets this automatically)

## 2. Clean SUPABASE_URL Variable
Ensure EXACT format (no quotes, spaces, or trailing slash):
```
SUPABASE_URL=https://zgdxpsenxjwyiwbbealf.supabase.co
```

## 3. Add Missing GOOGLE_CLIENT_SECRET
```
GOOGLE_CLIENT_SECRET=[YOUR_GOOGLE_CLIENT_SECRET]
```

## 4. Verify Shared Variables
- Go to Project Settings → Shared Variables
- Ensure BeatsChain-MCP service is subscribed (toggle ON)

## 5. Expected Success Logs:
```
✅ Ethers module found: 5.7.2
✅ Analytics routes loaded successfully
✅ Thirdweb routes loaded successfully
BeatsChain MCP server listening on port [RAILWAY_PORT]
```