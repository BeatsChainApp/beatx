#!/usr/bin/env bash
set -euo pipefail

# run_local_checks.sh
# Non-interactive script to install, build and run local smoke tests for packages/mcp-server

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

echo "==> Repo status"
git fetch origin --depth=1 || true
git status --porcelain

echo "==> Installing production deps for mcp-server"
npm run install:mcp

echo "==> Building mcp-server"
npm run build

LOG=/tmp/mcp-server.log
PIDFILE=/tmp/mcp-server.pid

echo "==> Starting mcp-server in background (logs: $LOG)"
PORT=${PORT:-4000}
PORT=${PORT}
nohup npm start > "$LOG" 2>&1 &
echo $! > "$PIDFILE"

echo "==> Waiting for server to become healthy (port $PORT)"
for i in {1..15}; do
  if curl -sS "http://127.0.0.1:${PORT}/health" >/dev/null 2>&1; then
    echo "Server healthy"
    break
  fi
  sleep 2
done

echo "==> Running smoke-test-endpoints.js"
node smoke-test-endpoints.js || true

echo "==> Tail logs (last 200 lines):"
tail -n 200 "$LOG" || true

echo "==> To stop the server: kill \\$(cat $PIDFILE) && rm $PIDFILE"
