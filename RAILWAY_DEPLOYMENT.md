# Railway CLI Deployment Guide

## 🚀 Deploy BeatsChain MCP Server using Railway CLI

### Prerequisites
1. Install Railway CLI: `npm install -g @railway/cli`
2. Login to Railway: `railway login`

### Quick Deployment

```bash
# Navigate to MCP server directory
cd packages/mcp-server

# Run the deployment script
./deploy-railway.sh
```

### Manual Step-by-Step

#### 1. Initialize Project
```bash
# Create new project or link existing
railway init
# OR link to existing project
railway link
```

#### 2. Set Environment Variables
```bash
# Core
railway variables set NODE_ENV=production
railway variables set PORT=4000

# Supabase
railway variables set SUPABASE_URL=https://zgdxpsenxjwyiwbbealf.supabase.co
railway variables set SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpnZHhwc2VueGp3eWl3YmJlYWxmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Mjg4Njg5OSwiZXhwIjoyMDc4NDYyODk5fQ.Kx0VThgOXJFN6vryD5mHuoH28xadvdasmNyKIe6VMas

# Google OAuth2
railway variables set GOOGLE_CLIENT_ID=239753403483-re3akggqub93apgm4t5nnabbbrcp0q1p.apps.googleusercontent.com
railway variables set GOOGLE_API_KEY=AIzaSyD6_CzA-jtpWKAz6YK9RA7oQ82SEQO7sW0

# IPFS/Pinata
railway variables set PINATA_JWT=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiIzNjdmNzc1YS0zZjg4LTQ5MzctYWE0Zi0yYTViMDE2MDU0NDgiLCJlbWFpbCI6InVuYW1pYmVhdHN3YXBAZ21haWwuY29tIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsInBpbl9wb2xpY3kiOnsicmVnaW9ucyI6W3siZGVzaXJlZFJlcGxpY2F0aW9uQ291bnQiOjEsImlkIjoiRlJBMSJ9LHsiZGVzaXJlZFJlcGxpY2F0aW9uQ291bnQiOjEsImlkIjoiTllDMSJ9XSwidmVyc2lvbiI6MX0sIm1mYV9lbmFibGVkIjpmYWxzZSwic3RhdHVzIjoiQUNUSVZFIn0sImF1dGhlbnRpY2F0aW9uVHlwZSI6InNjb3BlZEtleSIsInNjb3BlZEtleUtleSI6ImZlMDI3NzJkNzA5NzgxMmI0YjllIiwic2NvcGVkS2V5U2VjcmV0IjoiYmZiOTEzNWUzYTIxYTcxYWUxN2QyMjJiZjQzYzY2N2EyNDVmMWZiZjE5NTgwYTU5ZTlhNDNkYzQxNDY2MDc0MyIsImV4cCI6MTc4MjczMjExOX0.4m0JHIE6BRTbKIQA_TThcdvwJQOaXASIk8WkE08Em_I

# App Config
railway variables set CORS_ORIGIN=https://beats-app.vercel.app
railway variables set SUPER_ADMIN_WALLET=0xc84799A904EeB5C57aBBBc40176E7dB8be202C10
```

#### 3. Deploy
```bash
# Deploy with logs
railway up

# Deploy without waiting for logs
railway up --detach
```

### Monitoring

```bash
# Check deployment status
railway status

# View logs
railway logs

# View environment variables
railway variables

# SSH into running container
railway ssh
```

### Troubleshooting

#### Port Issues
- Railway automatically assigns PORT via $PORT environment variable
- Our server uses: `const port = process.env.PORT || process.env.RAILWAY_PORT || 4000`

#### Environment Variables
- Check variables: `railway variables`
- Update variable: `railway variables set KEY=value`
- Delete variable: `railway variables delete KEY`

#### Logs
- Real-time logs: `railway logs --follow`
- Build logs: `railway logs --build`

### Health Check

After deployment, test the endpoints:
```bash
# Health check
curl https://REPLACE_WITH_MCP_URL/healthz

# Test token exchange
curl -X POST https://REPLACE_WITH_MCP_URL/api/token-exchange \
  -H "Content-Type: application/json" \
  -d '{"idToken":"test"}'

# Run test script
bash test-deployment.sh https://REPLACE_WITH_MCP_URL
```

### Live URL
**Production MCP Server**: https://REPLACE_WITH_MCP_URL

### 502 Error Troubleshooting
If getting 502 errors:
1. Check Railway logs: `railway logs`
2. Verify port binding: Server listens on `0.0.0.0:$PORT`
3. Check start command: `npm start`
4. Connect GitHub repo for auto-deploy (see RAILWAY_GITHUB_SETUP.md)

### Railway Dashboard

Access your project at: https://railway.app/dashboard

- View deployments
- Monitor metrics
- Manage environment variables
- View logs
- Configure custom domains