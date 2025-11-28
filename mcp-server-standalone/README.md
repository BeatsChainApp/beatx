# BeatsChain MCP Server - Standalone

Standalone deployment of BeatsChain MCP Server for Railway.

## Deployment

This is a completely isolated MCP server with no monorepo dependencies.

### Features
- Health checks (/healthz, /health)
- IPFS pinning (mock mode)
- ISRC generation (demo mode)
- SAMRO split sheets

### Usage
```bash
npm install
npm start
```

### Railway Deployment
This directory can be deployed directly to Railway without monorepo conflicts.
