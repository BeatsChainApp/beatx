# 🚀 Railway Deployment Guide

## Quick Deploy

1. **Connect Repository**
   - Go to Railway dashboard
   - Click "New Project" → "Deploy from GitHub repo"
   - Select this repository
   - Set root directory to: `packages/mcp-server`

2. **Environment Variables**
   ```
   NODE_ENV=production
   PORT=4000
   SUPABASE_URL=your_supabase_url
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   LIVEPEER_API_KEY=your_livepeer_key
   ```

3. **Deploy Settings**
   - Build Command: `npm ci`
   - Start Command: `npm start`
   - Health Check: `/health`

## Test Deployment

```bash
# Update URL in smoke test
export MCP_SERVER_URL=https://your-deployment-url.railway.app
node smoke-test-mcp-server.js
```

## Files Created
- ✅ Dockerfile
- ✅ .dockerignore  
- ✅ railway.json
- ✅ .env.production

Ready for deployment! 🎯