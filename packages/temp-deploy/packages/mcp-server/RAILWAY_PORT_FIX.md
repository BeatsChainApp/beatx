# Railway Port Configuration Fix

## 🎯 **Issue Identified:**
Railway is configured with **Target Port: 4000** but should use Railway's dynamic port assignment.

## 🔧 **Fix Steps:**

### **Step 1: Remove Custom Target Port**
In Railway Dashboard → Networking → Public Networking:
1. Click **Custom port** field
2. **Delete the "4000"** from Target port field  
3. **Leave it EMPTY** (Railway will auto-detect)
4. Click **Update**

### **Step 2: Verify Server Code**
Server should use Railway's dynamic PORT:
```javascript
const port = process.env.PORT || 4000;
app.listen(port, '0.0.0.0', () => {
  console.log(`Server listening on port ${port}`);
});
```

### **Step 3: Check Railway.json**
Ensure railway.json doesn't override port settings:
```json
{
  "$schema": "https://railway.com/railway.schema.json",
  "build": {
    "builder": "DOCKERFILE"
  },
  "deploy": {
    "startCommand": "npm start",
    "healthcheckPath": "/healthz",
    "healthcheckTimeout": 30,
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 3
  }
}
```

## 🚨 **Why This Matters:**
- Railway assigns ports dynamically (usually 8080, 3000, etc.)
- Setting a fixed target port (4000) creates a mismatch
- The load balancer can't reach the app on the wrong port

## ✅ **Expected Result:**
After removing the custom target port, Railway will:
1. Auto-detect the port your app is listening on
2. Configure the load balancer correctly
3. Resolve the 502 gateway errors

## 🧪 **Test After Fix:**
```bash
curl https://REPLACE_WITH_MCP_URL/healthz
# Should return: {"ok": true, "ts": 1699901234567, "service": "mcp-server"}
```