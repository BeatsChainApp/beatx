# 🔍 Data Pipeline Investigation & Fixes

## 📊 Current Pipeline Status

### **✅ OPERATIONAL PIPELINES**
| Pipeline | Status | Location | Details |
|----------|--------|----------|---------|
| **MCP Server** | 🟢 **LIVE** | `packages/mcp-server` | Railway deployment active |
| **IPFS Proxy** | 🟢 **OPERATIONAL** | `/api/ipfs/:hash` | Cloudflare gateway |
| **Livepeer Upload** | 🟡 **PARTIAL** | `/api/livepeer/upload` | TUS client issues |
| **Supabase Integration** | 🟢 **CONNECTED** | All routes | Database operational |

### **❌ REMOVED CHAOS**
- ✅ **Standalone MCP Server Deleted**: `mcp-server-standalone/` removed
- ✅ **Single Source of Truth**: Only `packages/mcp-server` remains
- ✅ **Clean Repository**: No conflicting MCP implementations

## 🔧 CRITICAL PIPELINE FIXES NEEDED

### **1. Livepeer Upload Route Issues**

**Current Problems:**
- TUS client dependency issues
- Graceful fallbacks but no real uploads
- Mock responses when Livepeer API unavailable

**Fix Required:**
```javascript
// packages/mcp-server/src/routes/livepeer.js
// Need to ensure TUS client properly installed and configured
```

### **2. Upload Flow Integration**

**Current State:**
- App upload page uses `EnhancedBeatUpload` component
- MCP server has upload routes but needs verification
- IPFS proxy operational but needs testing

**Pipeline Flow:**
```
App Upload → MCP Server → IPFS → Livepeer → Supabase
```

### **3. N8N Pipeline Integration**

**Current State:**
- N8N workflows exist in `/n8n/workflows/`
- Not deployed to live N8N instance
- Campaign automation ready but not active

## 🚀 IMMEDIATE FIXES REQUIRED

### **Fix 1: TUS Client Installation**
```bash
cd packages/mcp-server
npm install tus-js-client@latest
```

### **Fix 2: Livepeer Environment Variables**
```bash
# Required in Railway deployment
LIVEPEER_API_KEY=663a61a0-8277-4633-9012-5576cb9d0afb
LIVEPEER_API_HOST=https://livepeer.studio/api
```

### **Fix 3: Upload Route Verification**
```javascript
// Test all upload endpoints
POST /api/livepeer/upload
POST /api/livepeer/upload-file  
POST /api/pin (IPFS)
POST /api/upload (File upload)
```

### **Fix 4: Supabase Pipeline Verification**
```sql
-- Verify tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public';

-- Check upload-related tables
SELECT * FROM success LIMIT 5;
SELECT * FROM credit_ledger LIMIT 5;
```

## 📋 VERIFICATION CHECKLIST

### **MCP Server Routes**
- [ ] `/api/livepeer/upload` - Asset creation
- [ ] `/api/livepeer/upload-file` - File upload via TUS
- [ ] `/api/livepeer/webhook` - Webhook handling
- [ ] `/api/pin` - IPFS pinning
- [ ] `/api/upload` - General file upload
- [ ] `/api/ipfs/:hash` - IPFS proxy

### **Database Integration**
- [ ] Supabase connection active
- [ ] Success logging functional
- [ ] Credit ledger updates
- [ ] Asset metadata storage

### **Frontend Integration**
- [ ] Upload page loads correctly
- [ ] File selection works
- [ ] Progress indicators functional
- [ ] Error handling graceful

### **N8N Workflow Integration**
- [ ] Campaign automation workflows ready
- [ ] SAMRO processing workflow ready
- [ ] Webhook endpoints configured
- [ ] Revenue attribution functional

## 🎯 IMPLEMENTATION PLAN

### **Phase 1: Fix TUS Client (Immediate)**
```bash
cd packages/mcp-server
npm install tus-js-client@3.1.1
npm install cross-fetch@4.0.0
```

### **Phase 2: Verify Environment Variables**
```bash
# Check Railway environment
echo $LIVEPEER_API_KEY
echo $SUPABASE_URL
echo $PINATA_JWT
```

### **Phase 3: Test Upload Pipeline**
```bash
# Test file upload end-to-end
curl -X POST http://localhost:4000/api/upload \
  -F "file=@test.mp3" \
  -F "metadata={\"title\":\"test\"}"
```

### **Phase 4: Verify Database Pipeline**
```bash
# Test Supabase integration
node scripts/inspect_supabase.js
```

### **Phase 5: Deploy Fixes**
```bash
git add -A
git commit -m "fix(pipelines): resolve upload routes and TUS client issues"
git push origin main
```

## 🔍 DIAGNOSTIC COMMANDS

### **Check MCP Server Health**
```bash
curl https://beatschain-mcp-server-production.up.railway.app/health
```

### **Test IPFS Proxy**
```bash
curl https://beatschain-mcp-server-production.up.railway.app/api/ipfs/QmTest
```

### **Test Livepeer Upload**
```bash
curl -X POST https://beatschain-mcp-server-production.up.railway.app/api/livepeer/upload \
  -H "Content-Type: application/json" \
  -d '{"name":"test-asset","metadata":{}}'
```

### **Verify Supabase Connection**
```bash
curl https://beatschain-mcp-server-production.up.railway.app/api/success
```

## 📊 EXPECTED RESULTS

### **After Fixes:**
- ✅ TUS client properly installed and functional
- ✅ Livepeer uploads working end-to-end
- ✅ IPFS pinning operational
- ✅ Supabase logging all operations
- ✅ Upload flow working from app to database
- ✅ N8N workflows ready for deployment

### **Success Metrics:**
- Upload success rate > 95%
- Response time < 2 seconds
- Error rate < 1%
- Database consistency 100%

---

**Status**: 🔄 **INVESTIGATION COMPLETE - FIXES READY FOR IMPLEMENTATION**