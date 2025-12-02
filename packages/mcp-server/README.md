# BeatsChain MCP Server — Quick Run & Smoke Tests

This README shows quick run and smoke-test instructions for the MCP server used by BeatsChain.

Prerequisites
- Node 20+ (includes global `fetch`)
- Environment variables configured (see `.env.example` in repo root or Railway variables)

Common env vars the MCP server expects:
- `PORT` - server port
- `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` - server-side Supabase
- `PINATA_JWT` or `WEB3STORAGE_TOKEN` - IPFS pinning
- `LIVEPEER_API_KEY` - Livepeer Studio API key

Run locally (development):
```bash
cd packages/mcp-server
npm install
cp .env.example .env
# edit .env and set required keys
npm run dev
```

Health & endpoints
- `GET /health` - basic health check
- `GET /api/upload/status` - upload subsystem status
- `POST /api/pin` - pin JSON metadata (used by extension fallbacks)
- `POST /api/upload` - file upload (multipart)
- `POST /api/livepeer/upload` - create Livepeer asset (starts import/TUS flow)
- `POST /api/livepeer/upload-file` - accept multipart file and start TUS upload
- `GET /api/livepeer/assets` - list known assets
- `POST /api/beats` - create beat metadata record

Smoke tests
From the repository root you can run the quick smoke script which posts lightweight requests to the MCP server.

```bash
# from repo root
node scripts/smoke-test-mcp.js

# Use NEXT_PUBLIC_MCP_SERVER_URL to point to a remote MCP
NEXT_PUBLIC_MCP_SERVER_URL=https://beatschain-mcp-server-production.up.railway.app node scripts/smoke-test-mcp.js
```

If any endpoints are failing, inspect the server logs and verify environment variables (especially `PINATA_JWT` and `LIVEPEER_API_KEY`).
