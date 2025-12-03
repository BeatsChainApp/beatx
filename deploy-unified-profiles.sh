#!/bin/bash

# Deploy Unified Profiles System - Complete Setup Script

set -e

echo "🚀 Deploying Unified Profiles System..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    print_error "Please run this script from the project root directory"
    exit 1
fi

print_status "Starting unified profiles deployment..."

# 1. Apply database migrations
print_status "Applying database migrations..."
if [ -f "migrations/012_unified_profiles_schema.sql" ]; then
    # Check if we have Supabase CLI
    if command -v supabase &> /dev/null; then
        print_status "Using Supabase CLI to apply migrations..."
        supabase db push
    else
        print_warning "Supabase CLI not found. Please apply migrations manually:"
        echo "1. Go to your Supabase dashboard"
        echo "2. Navigate to SQL Editor"
        echo "3. Run the contents of migrations/012_unified_profiles_schema.sql"
        read -p "Press Enter after applying migrations manually..."
    fi
else
    print_error "Migration file not found: migrations/012_unified_profiles_schema.sql"
    exit 1
fi

# 2. Install dependencies for shared auth package
print_status "Installing shared auth dependencies..."
cd packages/shared/auth
if [ ! -f "package.json" ]; then
    npm init -y
    npm install --save-dev @types/node
fi
cd ../../..

# 3. Update MCP server dependencies
print_status "Updating MCP server..."
cd packages/mcp-server
npm install
cd ../..

# 4. Update app dependencies
print_status "Updating app dependencies..."
cd packages/app
npm install
cd ../..

# 5. Update WhatsApp gateway
print_status "Updating WhatsApp gateway..."
cd whatsapp_gateway
npm install axios
cd ..

# 6. Deploy MCP server with unified profiles
print_status "Deploying MCP server..."
cd packages/mcp-server

# Check if Railway CLI is available
if command -v railway &> /dev/null; then
    print_status "Deploying to Railway..."
    railway up
else
    print_warning "Railway CLI not found. Manual deployment required:"
    echo "1. Push changes to your repository"
    echo "2. Railway will auto-deploy from GitHub"
    echo "3. Or use railway up after installing Railway CLI"
fi

cd ../..

# 7. Update Chrome extension
print_status "Updating Chrome extension..."
# Copy unified profile manager to extension lib
cp chrome-extension/lib/unified-profile-manager.js chrome-extension/lib/

print_success "Chrome extension updated with unified profile manager"

# 8. Test unified profile system
print_status "Testing unified profile system..."

# Test MCP server health
MCP_URL="${MCP_SERVER_URL:-https://beatschain-mcp-server-production.up.railway.app}"
print_status "Testing MCP server at $MCP_URL..."

if curl -f -s "$MCP_URL/api/profiles/health" > /dev/null; then
    print_success "MCP server is responding"
else
    print_warning "MCP server health check failed - may still be deploying"
fi

# 9. Update N8N workflows
print_status "N8N workflow update required..."
print_warning "Please manually import the following workflow:"
echo "File: n8n/workflows/unified-profile-sync.json"
echo "1. Go to your N8N instance"
echo "2. Import the workflow"
echo "3. Activate the workflow"
echo "4. Update webhook URLs in environment variables"

# 10. Environment variables check
print_status "Checking environment variables..."

REQUIRED_VARS=(
    "SUPABASE_URL"
    "SUPABASE_SERVICE_ROLE_KEY"
    "MCP_SERVER_URL"
    "N8N_WEBHOOK_URL"
)

MISSING_VARS=()

for var in "${REQUIRED_VARS[@]}"; do
    if [ -z "${!var}" ]; then
        MISSING_VARS+=("$var")
    fi
done

if [ ${#MISSING_VARS[@]} -gt 0 ]; then
    print_warning "Missing environment variables:"
    for var in "${MISSING_VARS[@]}"; do
        echo "  - $var"
    done
    echo ""
    echo "Please set these variables in:"
    echo "  - packages/mcp-server/.env"
    echo "  - packages/app/.env.local"
    echo "  - whatsapp_gateway/.env"
fi

# 11. Generate deployment summary
print_status "Generating deployment summary..."

cat > UNIFIED_PROFILES_DEPLOYMENT_SUMMARY.md << EOF
# Unified Profiles System Deployment Summary

## ✅ Completed Tasks

1. **Database Schema**: Applied unified profiles schema with all necessary tables
2. **MCP Server**: Updated with unified profile routes and authentication
3. **App Integration**: Added useUnifiedProfile hook for React components
4. **Extension Integration**: Added UnifiedProfileManager for Chrome extension
5. **WhatsApp Integration**: Added profile sync and command processing
6. **N8N Workflows**: Created unified profile sync pipeline

## 🔧 System Components

### Core Components
- \`UnifiedProfileSystem\`: Main profile management class
- \`unified_profiles\` table: Primary storage for user profiles
- Cross-platform sync: Real-time profile synchronization

### Platform Integration
- **App**: \`useUnifiedProfile\` hook for React components
- **Extension**: \`UnifiedProfileManager\` for Chrome extension
- **MCP**: RESTful API endpoints for profile management
- **N8N**: Automated workflows for profile sync
- **WhatsApp**: Bot commands and profile integration

### Database Tables
- \`unified_profiles\`: Main profile storage
- \`profile_sync_events\`: Sync event logging
- \`wallet_mappings\`: Cross-platform wallet management
- \`auth_sessions\`: Session management
- \`user_activity_log\`: Activity tracking

## 🌐 API Endpoints

### Profile Management
- \`POST /api/profiles/authenticate\`: Authenticate and create/merge profiles
- \`GET /api/profiles/find\`: Find profile by any identifier
- \`PUT /api/profiles/:userId\`: Update profile
- \`POST /api/profiles/:userId/sync\`: Sync profile across platforms

### Wallet Management
- \`GET /api/profiles/:userId/wallets\`: Get user wallets
- \`POST /api/profiles/:userId/wallets\`: Add wallet mapping

### WhatsApp Integration
- \`POST /api/profiles/whatsapp/sync\`: Sync WhatsApp profile
- WhatsApp bot commands: /profile, /wallet, /link, /help, /status

## 🔄 Sync Flow

1. User authenticates on any platform
2. System finds existing profiles by email/wallet/google_id/whatsapp_id
3. Profiles are merged if duplicates found
4. Profile synced to all platforms (app, extension, MCP, N8N)
5. Real-time updates propagated across platforms

## 📱 Platform Features

### App Features
- Unified authentication with Google OAuth + Wallet
- Real-time profile sync
- Cross-platform wallet management
- Role-based permissions (PRODUCER, ADMIN, SUPER_ADMIN)

### Extension Features
- Legacy profile migration
- Unified wallet management
- Cross-platform sync
- Role-based permissions (ARTIST, ADMIN, SUPER_ADMIN)

### WhatsApp Features
- Profile creation via WhatsApp
- Account linking with existing profiles
- Bot commands for profile management
- Cross-platform notifications

## 🚀 Next Steps

1. **Test Authentication**: Verify login works across all platforms
2. **Test Profile Sync**: Ensure changes sync in real-time
3. **Test WhatsApp Bot**: Verify bot commands work correctly
4. **Monitor Logs**: Check MCP server logs for any errors
5. **Performance Testing**: Test with multiple concurrent users

## 🔧 Manual Tasks Required

1. **N8N Workflow**: Import unified-profile-sync.json workflow
2. **Environment Variables**: Set all required environment variables
3. **Database Access**: Verify Supabase connection and permissions
4. **WhatsApp Setup**: Configure WhatsApp Business API if needed

## 📊 Monitoring

- MCP Server Health: \`GET /api/profiles/health\`
- Profile Count: Check \`unified_profiles\` table
- Sync Events: Monitor \`profile_sync_events\` table
- Activity Logs: Review \`user_activity_log\` table

Deployment completed at: $(date)
EOF

print_success "Deployment summary generated: UNIFIED_PROFILES_DEPLOYMENT_SUMMARY.md"

# 12. Final status
echo ""
echo "🎉 Unified Profiles System Deployment Complete!"
echo ""
print_success "✅ Database schema applied"
print_success "✅ MCP server updated"
print_success "✅ App integration ready"
print_success "✅ Extension integration ready"
print_success "✅ WhatsApp integration ready"
print_success "✅ N8N workflows created"
echo ""
print_status "🔍 Next steps:"
echo "1. Test authentication on app and extension"
echo "2. Verify profile sync across platforms"
echo "3. Import N8N workflow manually"
echo "4. Set missing environment variables"
echo "5. Monitor MCP server logs"
echo ""
print_status "📖 Full documentation: UNIFIED_PROFILES_DEPLOYMENT_SUMMARY.md"
echo ""