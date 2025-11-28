#!/bin/bash
# Feed BeatsChain implementation to Amazon Q

echo "🤖 Feeding BeatsChain Production Implementation to Amazon Q"
echo "=================================================="

# Method 1: Direct Amazon Q CLI (if available)
if command -v amazon-q &> /dev/null; then
    echo "Using Amazon Q CLI..."
    amazon-q execute --file amazon-q-agent-payload.json --workspace /workspaces/beatx
    exit $?
fi

# Method 2: AWS CLI with Amazon Q service
if command -v aws &> /dev/null; then
    echo "Using AWS CLI for Amazon Q..."
    aws amazonq start-conversation --input-file amazon-q-agent-payload.json
    exit $?
fi

# Method 3: Copy-paste instructions
echo "📋 COPY-PASTE INSTRUCTIONS FOR AMAZON Q:"
echo "========================================"
echo ""
echo "1. Open Amazon Q in your IDE or browser"
echo "2. Start a new conversation"
echo "3. Copy and paste this prompt:"
echo ""
echo "---BEGIN AMAZON Q PROMPT---"
cat << 'EOF'
Execute BeatsChain production hardening implementation. Repository: /workspaces/beatx

PHASE 1 - Setup:
```bash
cd /workspaces/beatx
git checkout -b production-hardening-$(date +%s)
npm install && cd packages/mcp-server && npm install && cd ../..
```

PHASE 2 - Route Hardening:
Create packages/mcp-server/src/routes/fallbacks.js:
```js
module.exports = function(app){
  const fs = require('fs');
  const path = require('path');
  const routesDir = path.join(__dirname);
  const files = fs.readdirSync(routesDir).filter(f => f.endsWith('.js') && f !== 'index.js' && f !== 'fallbacks.js');
  files.forEach(f => {
    const name = path.basename(f, '.js');
    const mount = `/api/${name}`;
    if (fs.existsSync(path.join(routesDir, f))) {
      app.use(mount, (req, res) => {
        res.status(503).json({ ok: false, reason: `${name}_missing_deps` });
      });
    }
  });
};
```

Update packages/mcp-server/src/index.js to load fallbacks before server.listen().

PHASE 3 - Testing:
Create smoke-test-production.js with endpoint validation.

PHASE 4 - Chrome Extension:
Update chrome-extension/manifest.json MCP URL to production.

PHASE 5 - Deploy:
```bash
git add -A
git commit -m "feat(production): harden MCP server routes"
git push -u origin HEAD
./scripts/deploy_via_railway.sh
```

Execute all phases non-interactively. Report status after each phase.
EOF
echo "---END AMAZON Q PROMPT---"
echo ""
echo "4. Amazon Q will execute the implementation automatically"
echo "5. Monitor progress and verify deployment success"
echo ""
echo "🔗 Alternative: Use the JSON payload file directly if Amazon Q supports file upload:"
echo "   File: amazon-q-agent-payload.json"