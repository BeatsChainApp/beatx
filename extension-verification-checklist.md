# Chrome Extension Verification Checklist

## 🎯 Pre-Verification Setup

### 1. Deploy Supabase Schema
```sql
-- Apply the enhanced schema in Supabase SQL Editor
-- File: /workspaces/beatx/supabase-commerce-schema.sql
```

### 2. Verify MCP Server Deployment
- ✅ Railway deployment: `https://beatx-mcp-server-production.up.railway.app`
- ✅ Health check: `GET /healthz`
- ✅ New routes available: `/api/pricing`, `/api/payments`, `/api/purchases`, `/api/profiles`

## 🔍 Extension Verification Steps

### Phase 1: Basic Functionality
1. **Load Extension**
   - Open Chrome → Extensions → Load unpacked
   - Select `/workspaces/beatx/packages/extension/dist`
   - Verify extension loads without errors

2. **Authentication Flow**
   - Click extension icon
   - Test wallet connection (Reown AppKit)
   - Verify user profile creation
   - Check localStorage profile sync

3. **File Upload**
   - Select audio file (.mp3, .wav)
   - Add metadata (title, artist, genre)
   - Verify IPFS upload to Pinata
   - Check MCP server beat creation

### Phase 2: Data Flow Integration
4. **MCP Server Integration**
   - Verify upload calls `/api/upload`
   - Check beat creation via `/api/beats`
   - Confirm profile sync via `/api/profiles/sync`
   - Test analytics tracking

5. **Supabase Data Persistence**
   - Check beats table for new entries
   - Verify users table profile sync
   - Confirm analytics_events logging
   - Test producer_stats updates

6. **IPFS Storage Verification**
   - Confirm audio files on Pinata
   - Check metadata JSON storage
   - Verify gateway URLs accessible
   - Test file retrieval

### Phase 3: Cross-Platform Sync
7. **Web App Integration**
   - Upload via extension
   - Check beat appears on web app
   - Verify play counts sync
   - Test purchase flow

8. **WhatsApp Integration**
   - Send audio to WhatsApp number
   - Verify N8N workflow triggers
   - Check beat creation from WhatsApp
   - Confirm cross-platform visibility

### Phase 4: Advanced Features
9. **Commerce Integration**
   - Set beat pricing via extension
   - Test purchase flow (mock)
   - Verify transaction recording
   - Check earnings tracking

10. **Analytics & Monitoring**
    - Verify play tracking
    - Check analytics dashboard
    - Test producer stats
    - Confirm real-time updates

## 🚨 Common Issues & Solutions

### Extension Loading Issues
```javascript
// Check manifest.json permissions
"permissions": ["storage", "activeTab", "identity"]
"host_permissions": ["https://beatx-mcp-server-production.up.railway.app/*"]
```

### Authentication Problems
```javascript
// Verify Reown AppKit configuration
const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID
// Check if Google OAuth is enabled
```

### Upload Failures
```javascript
// Check MCP server logs
// Verify Pinata JWT token
// Confirm file size limits
```

### Data Sync Issues
```javascript
// Check Supabase connection
// Verify RLS policies
// Confirm table schemas match
```

## 📊 Success Metrics

### Functional Requirements
- [ ] Extension loads without errors
- [ ] Wallet connection works
- [ ] File upload completes successfully
- [ ] Beat appears in web app
- [ ] Analytics tracking functions
- [ ] Cross-platform sync works

### Performance Requirements
- [ ] Upload completes within 30 seconds
- [ ] UI remains responsive during upload
- [ ] No memory leaks detected
- [ ] Error handling graceful

### Integration Requirements
- [ ] MCP server responds correctly
- [ ] Supabase data persists
- [ ] IPFS files accessible
- [ ] N8N workflows trigger
- [ ] Web app sync confirmed

## 🎉 Post-Verification Actions

### If All Tests Pass
1. Update Chrome Web Store listing
2. Increment version number
3. Deploy production build
4. Monitor error logs
5. Gather user feedback

### If Issues Found
1. Document specific failures
2. Check error logs (Chrome DevTools)
3. Verify environment variables
4. Test individual components
5. Fix and re-test

## 🔧 Debug Commands

```bash
# Check MCP server health
curl https://beatx-mcp-server-production.up.railway.app/healthz

# Test file upload
curl -X POST https://beatx-mcp-server-production.up.railway.app/api/upload \
  -F "file=@test.mp3" \
  -F "metadata={\"title\":\"Test Beat\"}"

# Verify Supabase connection
node packages/mcp-server/scripts/inspect_supabase.js

# Check extension console
# Chrome DevTools → Extensions → BeatsChain → Inspect views
```

## 📝 Verification Report Template

```markdown
## Extension Verification Report
**Date**: [DATE]
**Version**: [VERSION]
**Tester**: [NAME]

### Test Results
- [ ] Basic functionality: PASS/FAIL
- [ ] Authentication: PASS/FAIL  
- [ ] File upload: PASS/FAIL
- [ ] Data sync: PASS/FAIL
- [ ] Cross-platform: PASS/FAIL

### Issues Found
1. [Issue description]
2. [Issue description]

### Recommendations
1. [Recommendation]
2. [Recommendation]

**Overall Status**: READY/NEEDS_WORK
```