BeatsChain server scaffold

This folder contains a minimal Express scaffold for server-side pinning and upload brokering used in the BeatsChain project.

Features (scaffold):
- /api/token-exchange - stub token exchange endpoint (verify Firebase ID tokens server-side in production)
- /api/pin - pin JSON to IPFS via Web3.Storage (if WEB3STORAGE_TOKEN set)
- /api/upload - accepts a multipart `file` upload and pins file + metadata

Quickstart (local)

```bash
cd server
npm install
# create .env from .env.example and set WEB3STORAGE_TOKEN
npm run dev
```

Notes
- This is a scaffold for development and CI. Do NOT use the mock token behavior in production. Replace token-exchange with Firebase Admin SDK verification and pinning with a secure Web3.Storage or Pinata service on the server.
- The scaffold intentionally returns mock IPFS hashes when no WEB3STORAGE_TOKEN is provided to make local testing easier.
