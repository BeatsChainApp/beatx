# MCP Server Railway Deployment

## Configuration

**Builder:** NIXPACKS (not Docker)
**Root Directory:** `/` (repo root)
**Start Command:** Automatic from nixpacks.toml

## Railway Settings

1. **Service:** beatschain-mcp-server
2. **Builder:** NIXPACKS
3. **Health Check:** `/health` or `/healthz`
4. **Port:** Auto-detected from `process.env.PORT`

## Files

- `/nixpacks.toml` - Build configuration
- `/railway.json` - Deployment settings
- `packages/mcp-server/railway.json` - Package-specific settings

## Why NIXPACKS?

Docker builds were hitting cache issues with monorepo structure. NIXPACKS:
- ✅ No cache conflicts
- ✅ Direct npm install in mcp-server directory
- ✅ Simpler monorepo handling

## Auto-Deploy

Railway auto-deploys on push to `main` branch when:
- ✅ GitHub integration is connected
- ✅ Service is linked to this repo
- ✅ Watch paths include `packages/mcp-server/**`

## Manual Deploy

If auto-deploy isn't working:
1. Check Railway dashboard → Service → Settings → GitHub
2. Verify branch is set to `main`
3. Check watch paths include `packages/mcp-server/**`
4. Manually trigger deploy from Railway dashboard
