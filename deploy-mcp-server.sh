#!/bin/bash

# BeatsChain MCP Server - Deployment Script
# Deploys improved MCP server to Railway with comprehensive route support

echo "🚀 Deploying BeatsChain MCP Server v2.0.0 to Railway..."

# Check if we're in the right directory
if [ ! -f "packages/mcp-server/package.json" ]; then
    echo "❌ Error: Must run from project root directory"
    exit 1
fi

# Navigate to MCP server directory
cd packages/mcp-server

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI not found. Install with: npm install -g @railway/cli"
    exit 1
fi

# Check if logged in
if ! railway whoami &> /dev/null; then
    echo "❌ Not logged in to Railway. Run: railway login"
    exit 1
fi

echo "📋 Current Railway project status:"
railway status

echo ""
echo "🔧 Setting critical environment variables..."

# Core configuration
railway variables set NODE_ENV=production
railway variables set PORT=4000

# Supabase (CRITICAL for route loading)
railway variables set SUPABASE_URL=https://zgdxpsenxjwyiwbbealf.supabase.co
railway variables set SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpnZHhwc2VueGp3eWl3YmJlYWxmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Mjg4Njg5OSwiZXhwIjoyMDc4NDYyODk5fQ.Kx0VThgOXJFN6vryD5mHuoH28xadvdasmNyKIe6VMas
railway variables set SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpnZHhwc2VueGp3eWl3YmJlYWxmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI4ODY4OTksImV4cCI6MjA3ODQ2Mjg5OX0.YourAnonKeyHere

# Google OAuth2
railway variables set GOOGLE_CLIENT_ID=239753403483-re3akggqub93apgm4t5nnabbbrcp0q1p.apps.googleusercontent.com
railway variables set GOOGLE_API_KEY=AIzaSyD6_CzA-jtpWKAz6YK9RA7oQ82SEQO7sW0

# IPFS/Pinata
railway variables set PINATA_API_KEY=fe02772d7097812b4b9e
railway variables set PINATA_SECRET_API_KEY=bfb9135e3a21a71ae17d222bf43c667a245f1fbf19580a59e9a43dc414660743
railway variables set PINATA_JWT=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiIzNjdmNzc1YS0zZjg4LTQ5MzctYWE0Zi0yYTViMDE2MDU0NDgiLCJlbWFpbCI6InVuYW1pYmVhdHN3YXBAZ21haWwuY29tIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsInBpbl9wb2xpY3kiOnsicmVnaW9ucyI6W3siZGVzaXJlZFJlcGxpY2F0aW9uQ291bnQiOjEsImlkIjoiRlJBMSJ9LHsiZGVzaXJlZFJlcGxpY2F0aW9uQ291bnQiOjEsImlkIjoiTllDMSJ9XSwidmVyc2lvbiI6MX0sIm1mYV9lbmFibGVkIjpmYWxzZSwic3RhdHVzIjoiQUNUSVZFIn0sImF1dGhlbnRpY2F0aW9uVHlwZSI6InNjb3BlZEtleSIsInNjb3BlZEtleUtleSI6ImZlMDI3NzJkNzA5NzgxMmI0YjllIiwic2NvcGVkS2V5U2VjcmV0IjoiYmZiOTEzNWUzYTIxYTcxYWUxN2QyMjJiZjQzYzY2N2EyNDVmMWZiZjE5NTgwYTU5ZTlhNDNkYzQxNDY2MDc0MyIsImV4cCI6MTc4MjczMjExOX0.4m0JHIE6BRTbKIQA_TThcdvwJQOaXASIk8WkE08Em_I

# Thirdweb
railway variables set THIRDWEB_CLIENT_ID=53c6d7d26b476a57e09e7706265a60bb
railway variables set THIRDWEB_SECRET_KEY=PcKBR2HRtTeWhqzi-9p1_8YWb-xAWIbFaYtX-YZEKDrrdH2J6zH-B4eeWC7CIL4Gp4m5QOnnE6v47H9V6C-Dhg

# Livepeer
railway variables set LIVEPEER_API_KEY=663a61a0-8277-4633-9012-5576cb9d0afb
railway variables set LIVEPEER_API_HOST=https://livepeer.studio/api

# Web3 Storage
railway variables set WEB3STORAGE_TOKEN=YOUR_WEB3STORAGE_TOKEN_HERE

# App configuration
railway variables set CORS_ORIGIN=https://beats-app.vercel.app
railway variables set SUPER_ADMIN_WALLET=0xc84799A904EeB5C57aBBBc40176E7dB8be202C10

echo ""
echo "🚀 Deploying to Railway..."
railway up --detach

echo ""
echo "⏳ Waiting for deployment to complete..."
sleep 10

echo ""
echo "📊 Checking deployment status..."
railway status

echo ""
echo "✅ Deployment completed!"
echo ""
echo "🔗 Next steps:"
echo "1. Run 'railway logs' to view deployment logs"
echo "2. Test endpoints with: node ../../smoke-test-comprehensive.js"
echo "3. Check Railway dashboard for detailed metrics"
echo ""
echo "📡 Production URL: https://beatschain-mcp-server-production.up.railway.app"