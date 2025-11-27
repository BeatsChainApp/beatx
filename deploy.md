# MCP Server Deployment Guide

## Deployment Options

### Option 1: Railway (Recommended)
1. Install Railway CLI: `npm install -g @railway/cli`
2. Login: `railway login`
3. Deploy: `npm run deploy:railway`
4. Set environment variables in Railway dashboard

### Option 2: Render
1. Connect GitHub repo to Render
2. Use `render.yaml` configuration
3. Set environment variables in Render dashboard

### Option 3: Vercel (Functions)
- Not recommended for this server due to database connections and long-running processes

## Environment Variables Required

Copy from `.env.production` and set in your deployment platform:

- `NODE_ENV=production`
- `PORT=4000`
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `ADMIN_WALLET_PRIVATE_KEY`
- `RPC_URL`
- `CONTRACT_ADDRESS`
- `PINATA_API_KEY`
- `PINATA_SECRET_API_KEY`
- `PINATA_JWT`
- `FIREBASE_PROJECT_ID`
- `FIREBASE_CLIENT_EMAIL`
- `FIREBASE_PRIVATE_KEY`

## Post-Deployment

1. Update `NEXT_PUBLIC_MCP_SERVER_URL` in app's `.env.production`
2. Test endpoints: `curl https://your-mcp-server.com/health`
3. Run database migrations if needed

## Health Check

The server exposes `/health` endpoint for monitoring.