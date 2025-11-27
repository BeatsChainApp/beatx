# MCP Server Connection Troubleshooting

## 🚨 Current Issue: 502 Gateway Errors

### **Status:**
- **MCP Server**: ✅ Running on Railway
- **Logs**: ✅ "BeatsChain MCP server listening on port 8080"
- **App Connection**: ❌ 502 Gateway errors
- **URL**: https://REPLACE_WITH_MCP_URL

### **Root Cause Analysis:**

#### 1. Port Mismatch Issue
Railway expects the app to bind to `process.env.PORT`, but logs show port 8080.

**Current Code:**
```javascript
const port = process.env.PORT || 4000;
app.listen(port, '0.0.0.0', () => console.log(`BeatsChain MCP server listening on port ${port}`));
```

**Issue**: Railway sets `PORT` dynamically, but the server might not be reading it correctly.

#### 2. Health Check Path
Railway's load balancer might be checking a different health endpoint.

### **Solutions:**

#### Solution 1: Fix Port Binding
```javascript
// Ensure Railway's PORT is used
const port = parseInt(process.env.PORT) || 4000;
console.log('Starting server on port:', port);
app.listen(port, '0.0.0.0', () => {
  console.log(`BeatsChain MCP server listening on port ${port}`);
  console.log('Environment PORT:', process.env.PORT);
});
```

#### Solution 2: Add Railway Health Check
```javascript
// Add root endpoint for Railway health check
app.get('/', (req, res) => {
  res.json({ 
    status: 'ok', 
    service: 'beatschain-mcp-server',
    port: process.env.PORT,
    timestamp: Date.now()
  });
});
```

#### Solution 3: Debug Environment Variables
Add logging to see what Railway is setting:
```javascript
console.log('Environment variables:');
console.log('PORT:', process.env.PORT);
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('All env keys:', Object.keys(process.env).filter(k => k.includes('PORT')));
```

### **App Connection Configuration:**

Your app is correctly configured to use:
```bash
NEXT_PUBLIC_MCP_SERVER_URL=https://REPLACE_WITH_MCP_URL
```

Found in these files:
- `src/components/ProfessionalServices.tsx`
- `src/components/BeatUpload.tsx`
- `src/components/EnhancedMintFlow.tsx`

### **Quick Test:**

```bash
# Test health endpoint
curl https://REPLACE_WITH_MCP_URL/healthz

# Test root endpoint
curl https://REPLACE_WITH_MCP_URL/

# Test with verbose output
curl -v https://REPLACE_WITH_MCP_URL/healthz
```

### **Next Steps:**

1. **Add debug logging** to MCP server
2. **Add root endpoint** for Railway health check
3. **Verify port binding** with explicit logging
4. **Check Railway dashboard** for health check configuration
5. **Test endpoints** after fixes

The server code is correct - this is a Railway configuration/port binding issue.