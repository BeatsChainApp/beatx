#!/bin/bash
# Railway Direct Deployment Script

echo "🚀 Railway MCP Server Deployment"
echo "================================"

# Set environment variables directly in Railway
echo "Setting Railway environment variables..."

# Core variables
railway variables set SUPABASE_URL=https://zgdxpsenxjwyiwbbealf.supabase.co
railway variables set SUPABASE_SERVICE_ROLE_KEY=sb_secret_T6kuzjPB46RcdratmBdocA_53ceaOJc
railway variables set SUPABASE_ANON_KEY=sb_publishable_ZNsSNgXL7N74uzV6oWkp-A_MMMf15_r
railway variables set GOOGLE_CLIENT_ID=239753403483-re3akggqub93apgm4t5nnabbbrcp0q1p.apps.googleusercontent.com
railway variables set NODE_ENV=production
railway variables set CORS_ORIGIN=*

# Deploy
echo "Deploying to Railway..."
railway up

echo "✅ Deployment complete!"
echo "Test: curl https://REPLACE_WITH_MCP_URL/healthz"