# Railway Environment Variables Setup

## CRITICAL: Set these variables in Railway Dashboard

Go to: https://railway.app/project/[PROJECT_ID]/variables

### Required Environment Variables:

```bash
# Core Infrastructure
PORT=${{RAILWAY_PORT}}
NODE_ENV=production

# Database (REQUIRED)
SUPABASE_URL=https://zgdxpsenxjwyiwbbealf.supabase.co
SUPABASE_SERVICE_ROLE_KEY=sb_secret_T6kuzjPB46RcdratmBdocA_53ceaOJc
SUPABASE_ANON_KEY=sb_publishable_ZNsSNgXL7N74uzV6oWkp-A_MMMf15_r

# IPFS Storage (REQUIRED)
PINATA_JWT=[SET_IN_RAILWAY_DASHBOARD]
WEB3STORAGE_TOKEN=[SET_IN_RAILWAY_DASHBOARD]

# Video/Audio Processing (REQUIRED)
LIVEPEER_API_KEY=[SET_IN_RAILWAY_DASHBOARD]
LIVEPEER_API_HOST=[SET_IN_RAILWAY_DASHBOARD]

# Gasless Minting (REQUIRED)
THIRDWEB_CLIENT_ID=[SET_IN_RAILWAY_DASHBOARD]
THIRDWEB_SECRET_KEY=[SET_IN_RAILWAY_DASHBOARD]

# Authentication (REQUIRED)
GOOGLE_CLIENT_ID=239753403483-re3akggqub93apgm4t5nnabbbrcp0q1p.apps.googleusercontent.com
GOOGLE_API_KEY=[SET_IN_RAILWAY_DASHBOARD]

# Additional Required Variables
CORS_ORIGIN=*
SUPER_ADMIN_WALLET=[SET_IN_RAILWAY_DASHBOARD]
RPC_URL=[SET_IN_RAILWAY_DASHBOARD]
NEXT_PUBLIC_CONTRACT_ADDRESS=[SET_IN_RAILWAY_DASHBOARD]
NETWORK_ID=11155111
```

## Verification Steps:

1. Set all variables in Railway dashboard
2. Trigger manual deployment
3. Check logs for enhanced debug output
4. Verify all routes are loaded successfully

## Expected Log Output After Fix:

```
=== RAILWAY ENVIRONMENT DEBUG ===
PORT: 8080
SUPABASE_URL: https://zgdxpsenxjwyiwbbealf.supabase.co
SUPABASE_SERVICE_ROLE_KEY: sb_secret_T6kuzjPB46R...
✅ Analytics routes loaded successfully
✅ Notifications routes loaded successfully
✅ Content routes loaded successfully
✅ Recommendations routes loaded successfully
✅ Thirdweb routes loaded successfully
BeatsChain MCP server listening on port 8080
```