#!/usr/bin/env bash
set -euo pipefail

# deploy_via_railway.sh
# Non-interactive helper to push branch and trigger railway up (if railway CLI is available)

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

BRANCH=${BRANCH:-ch/mcp-route-fixes}
echo "==> Creating branch $BRANCH and pushing"
git checkout -B "$BRANCH"
git add -A
git commit -m "chore(mcp): apply route-loading hardening and smoke tests" || echo "No changes to commit"
git push -u origin "$BRANCH"

if command -v railway >/dev/null 2>&1; then
  echo "==> Running railway up (detached)"
  railway up --service beatschain-mcp-server --detach
else
  echo "railway CLI not found. Please trigger deploy from Railway UI or install the CLI."
fi

echo "==> Sleeping 45s to allow deploy"
sleep 45
echo "==> Checking health"
curl -sS https://beatschain-mcp-server-production.up.railway.app/health || true
