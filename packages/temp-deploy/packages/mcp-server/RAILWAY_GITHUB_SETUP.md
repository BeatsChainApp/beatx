# Railway GitHub Integration Setup

## 🔗 Connect GitHub Repository to Railway

### Current Status
- **CLI Deployment**: ✅ Working
- **GitHub Integration**: ❌ Not connected
- **Live URL**: https://REPLACE_WITH_MCP_URL
- **Issue**: 502 Application failed to respond

### Fix GitHub Connection

#### 1. Connect Repository
1. Go to Railway Dashboard: https://railway.com/project/326d4b98-d2bd-453d-a2a3-68b314a0e5fd
2. Click **Settings** → **Source**
3. Click **Connect GitHub Repository**
4. Select: `your-username/beatschain`
5. Set **Root Directory**: `packages/mcp-server`
6. Set **Branch**: `main`

#### 2. Configure Build Settings
```bash
# Build Command (if needed)
npm install

# Start Command
npm start

# Root Directory
packages/mcp-server
```

#### 3. Environment Variables (Already Set)
✅ All environment variables are configured via CLI

### Troubleshooting 502 Errors

#### Check Logs
```bash
railway logs --follow
```

#### Common Issues
1. **Port Binding**: Server must listen on `0.0.0.0:$PORT`
2. **Start Command**: Must be `npm start` or `node src/index.js`
3. **Dependencies**: All packages must be in package.json

#### Current Server Configuration
```javascript
// src/index.js
const port = process.env.PORT || process.env.RAILWAY_PORT || 4000;
app.listen(port, '0.0.0.0', () => console.log(`BeatsChain MCP server listening on port ${port}`));
```

### Manual Redeploy Options

#### Option 1: CLI Redeploy
```bash
cd packages/mcp-server
railway up
```

#### Option 2: GitHub Auto-Deploy
1. Connect GitHub repository (steps above)
2. Push changes to main branch
3. Railway auto-deploys on git push

### Verification Steps

1. **Check Railway Dashboard**: Ensure service is running
2. **View Logs**: Look for startup errors
3. **Test Health Endpoint**: `curl https://REPLACE_WITH_MCP_URL/healthz`
4. **Verify Environment Variables**: Check all required vars are set

### Expected Response
```json
{
  "ok": true,
  "ts": 1699901234567,
  "service": "mcp-server"
}
```