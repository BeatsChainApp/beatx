#!/bin/bash

# Test BeatsChain MCP Server Deployment
# Usage: ./test-deployment.sh [URL]

URL=${1:-"http://localhost:4000"}

echo "🧪 Testing BeatsChain MCP Server at: $URL"

# Test health endpoint
echo "📋 Testing health endpoint..."
HEALTH_RESPONSE=$(curl -s "$URL/healthz")
if [[ $HEALTH_RESPONSE == *"ok"* ]]; then
    echo "✅ Health check passed"
else
    echo "❌ Health check failed: $HEALTH_RESPONSE"
fi

# Test token exchange endpoint
echo "📋 Testing token exchange endpoint..."
TOKEN_RESPONSE=$(curl -s -X POST "$URL/api/token-exchange" \
    -H "Content-Type: application/json" \
    -d '{"idToken":"test"}')

if [[ $TOKEN_RESPONSE == *"success"* ]]; then
    echo "✅ Token exchange endpoint working"
else
    echo "⚠️  Token exchange response: $TOKEN_RESPONSE"
fi

# Test CORS headers
echo "📋 Testing CORS headers..."
CORS_RESPONSE=$(curl -s -I "$URL/healthz" | grep -i "access-control")
if [[ -n $CORS_RESPONSE ]]; then
    echo "✅ CORS headers present"
else
    echo "⚠️  No CORS headers found"
fi

echo "🎉 Deployment test complete!"