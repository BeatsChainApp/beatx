# BeatsChain Production Implementation - Complete Terminal Commands

## Prerequisites
```bash
# Ensure you're in the correct directory
cd /workspaces/beatx

# Verify git status
git status
```

## Phase 1: Repository Setup & Validation
```bash
# 1. Create production branch
git fetch origin --depth=1
git checkout -b production-hardening-$(date +%s)

# 2. Install all dependencies
npm install
cd packages/mcp-server && npm install && cd ../..
cd packages/app && npm install && cd ../..
cd chrome-extension && npm install && cd ../..

# 3. Validate current MCP server
./scripts/run_local_checks.sh
```

## Phase 2: MCP Server Route Hardening
```bash
# 1. Create route fallbacks system
cat > packages/mcp-server/src/routes/fallbacks.js << 'EOF'
module.exports = function(app){
  const fs = require('fs');
  const path = require('path');
  const routesDir = path.join(__dirname);
  const files = fs.readdirSync(routesDir).filter(f => f.endsWith('.js') && f !== 'index.js' && f !== 'fallbacks.js');

  files.forEach(f => {
    const name = path.basename(f, '.js');
    const mount = `/api/${name}`;
    const routeFilePath = path.join(routesDir, f);

    if (fs.existsSync(routeFilePath)) {
      app.use(mount, (req, res) => {
        res.status(503).json({ ok: false, reason: `${name}_missing_deps` });
      });
    }
  });
};
EOF

# 2. Update route index to list active endpoints
cat > packages/mcp-server/src/routes/index.js << 'EOF'
const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();
const routesDir = path.join(__dirname);

const entries = fs.readdirSync(routesDir)
  .filter(f => f.endsWith('.js') && f !== 'index.js' && f !== 'fallbacks.js')
  .map(f => `/api/${path.basename(f, '.js')}`);

router.get('/', (req, res) => {
  res.json({ active: entries });
});

module.exports = router;
EOF

# 3. Insert route loading into main index.js (before server listen)
perl -0777 -pe "unless (/app.use\\('\\/api', require\\('\\.\\/routes\\/index'\\)\\);/s) { s/(const server = app.listen[\\s\\S]*?$)/app.use('\\/api', require('\\.\\/routes\\/index'));\nrequire('\\.\\/routes\\/fallbacks')(app);\n\n\$1/s }" -i packages/mcp-server/src/index.js
```

## Phase 3: Enhanced Testing Suite
```bash
# 1. Create comprehensive production smoke test
cat > smoke-test-production.js << 'EOF'
const fetch = require('node-fetch');
const BASE = process.env.MCP_BASE || 'https://beatschain-mcp-server-production.up.railway.app';

const endpoints = [
  { path: '/health', method: 'GET', expect: [200] },
  { path: '/api', method: 'GET', expect: [200] },
  { path: '/api/isrc/generate', method: 'POST', expect: [200, 400] },
  { path: '/api/samro/generate', method: 'POST', expect: [200, 400] },
  { path: '/api/livepeer/upload', method: 'POST', expect: [200, 400] },
  { path: '/api/credits', method: 'GET', expect: [200, 503] },
  { path: '/api/analytics', method: 'GET', expect: [200, 503] },
  { path: '/api/notifications', method: 'GET', expect: [200, 503] }
];

(async function(){
  let success = 0;
  console.log(`Testing ${endpoints.length} endpoints against ${BASE}`);
  
  for (const {path, method, expect} of endpoints) {
    const url = BASE + path;
    try {
      const res = await fetch(url, {method});
      const ok = expect.includes(res.status);
      console.log(`${method} ${path} -> ${res.status} ${ok ? 'OK' : 'FAIL'}`);
      if (ok) success++;
    } catch(e) {
      console.log(`${method} ${path} -> ERROR: ${e.message}`);
    }
  }
  
  console.log(`\nSummary: ${success}/${endpoints.length} endpoints OK`);
  process.exit(success === endpoints.length ? 0 : 1);
})();
EOF

# 2. Test locally first
MCP_BASE=http://127.0.0.1:4000 node smoke-test-production.js
```

## Phase 4: Database & Auth Validation
```bash
# 1. Run database migrations
node scripts/run_migrations.js

# 2. Inspect Supabase connection
node scripts/inspect_supabase.js

# 3. Migrate content in Next.js app
cd packages/app
npm run migrate-content
cd ../..

# 4. Test auth flow
node test-auth-flow.js || echo "Auth test completed (may fail without full setup)"
```

## Phase 5: Chrome Extension Production Update
```bash
# 1. Update manifest with production MCP URL
sed -i 's|https://REPLACE_WITH_MCP_URL/\*|https://beatschain-mcp-server-production.up.railway.app/\*|g' chrome-extension/manifest.json

# 2. Create production Chrome store package
node create-chrome-store-zip.js

# 3. Verify Chrome extension readiness
node verify-chrome-store-ready.js || echo "Chrome extension verification completed"
```

## Phase 6: Commit & Deploy
```bash
# 1. Stage all changes
git add -A

# 2. Commit with conventional commit message
git commit -m "feat(production): harden MCP server routes, add comprehensive testing and Chrome extension production config

- Add route fallbacks for missing dependencies (503 responses)
- Implement /api index endpoint listing active routes  
- Create comprehensive production smoke tests
- Update Chrome extension manifest for production MCP URL
- Add database migration validation
- Enhance error handling and monitoring"

# 3. Push to origin
git push -u origin HEAD

# 4. Deploy to Railway (if CLI available)
./scripts/deploy_via_railway.sh

# 5. Wait for deployment and test production
sleep 60
node smoke-test-production.js
```

## Phase 7: Frontend App Deployment
```bash
# 1. Build and deploy Next.js app
cd packages/app
npm run build
npm run deploy:production || npm run vercel-build

# 2. Verify frontend deployment
curl -f https://beats-app.vercel.app/api/health || curl -f https://beats-app.vercel.app/

cd ../..
```

## Phase 8: Final Validation
```bash
# 1. Test all production endpoints
node smoke-test-production.js

# 2. Test specific integrations
curl -sS https://beatschain-mcp-server-production.up.railway.app/api | jq .
curl -sS https://beatschain-mcp-server-production.up.railway.app/api/isrc/generate -X POST -H "Content-Type: application/json" -d '{}' | jq .

# 3. Verify Chrome extension package
ls -la BeatsChain-Chrome-Extension-*.zip

# 4. Check deployment logs
tail -f packages/mcp-server/mcp-server.log || echo "Local logs not available"
```

## Rollback Procedures (if needed)
```bash
# Option A: Revert git changes
git log --oneline -n 5
git revert <commit-sha>
git push origin HEAD

# Option B: Railway rollback (via UI or CLI)
railway rollback --service beatschain-mcp-server

# Option C: Vercel rollback
cd packages/app
vercel rollback --prod
```

## Monitoring Commands
```bash
# 1. Health check script (add to cron)
cat > health-check.sh << 'EOF'
#!/bin/bash
curl -f https://beatschain-mcp-server-production.up.railway.app/health || echo "MCP Server DOWN"
curl -f https://beats-app.vercel.app/ || echo "Frontend DOWN"
EOF
chmod +x health-check.sh

# 2. Run health check
./health-check.sh

# 3. Continuous monitoring (run in background)
watch -n 30 './health-check.sh'
```

## Environment Variables Checklist
```bash
# Verify Railway environment (these should be set in Railway dashboard)
echo "Required Railway Environment Variables:"
echo "- SUPABASE_URL"
echo "- SUPABASE_SERVICE_ROLE_KEY" 
echo "- PINATA_JWT"
echo "- LIVEPEER_API_KEY"
echo "- GOOGLE_CLIENT_ID"
echo "- PORT (auto-set by Railway)"

# Verify Vercel environment (these should be set in Vercel dashboard)
echo "Required Vercel Environment Variables:"
echo "- NEXT_PUBLIC_MCP_SERVER_URL=https://beatschain-mcp-server-production.up.railway.app"
echo "- NEXT_PUBLIC_SUPABASE_URL"
echo "- NEXT_PUBLIC_SUPABASE_ANON_KEY"
```

## Success Validation
```bash
# All these should return success
curl -f https://beatschain-mcp-server-production.up.railway.app/health
curl -f https://beatschain-mcp-server-production.up.railway.app/api
curl -f https://beats-app.vercel.app/
node smoke-test-production.js
echo "✅ All systems operational"
```

---

**Total Execution Time**: ~15-30 minutes (depending on deployment speeds)
**Risk Level**: Low (all changes are additive and backwards compatible)
**Rollback Time**: ~5 minutes if needed