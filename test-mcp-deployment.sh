#!/bin/bash

# BeatsChain MCP Server Deployment Test Script
# Tests the production deployment at beatschain-mcp-server-production.up.railway.app

echo "🚀 BeatsChain MCP Server Deployment Test"
echo "========================================="
echo "Target: beatschain-mcp-server-production.up.railway.app"
echo "Time: $(date)"
echo ""

# Make script executable
chmod +x smoke-test-mcp-server.js

# Run the comprehensive smoke tests
echo "🧪 Running comprehensive smoke tests..."
node smoke-test-mcp-server.js

# Capture exit code
EXIT_CODE=$?

echo ""
echo "========================================="
if [ $EXIT_CODE -eq 0 ]; then
    echo "✅ All tests passed! MCP server is healthy."
else
    echo "❌ Some tests failed. Check the output above."
fi
echo "========================================="

exit $EXIT_CODE