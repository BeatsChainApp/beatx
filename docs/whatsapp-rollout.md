 **WhatsApp Rollout**

  **Purpose**: Add WhatsApp as an ingestion channel that forwards normalized events to in-repo N8N workflows and uses the MCP server for canonical upload, pinning, Livepeer TUS uploads, and Supabase persistence.

  **Quick Checklist**
    -  **MCP environment**: ensure `MCP_BASE_URL` and MCP service are reachable from the gateway.
    -  **Env vars for gateway** (set in deployment or local `.env`):
       - `WHATSAPP_WEBHOOK_VERIFY_TOKEN` — token used to verify GET webhook challenge.
       - `WHATSAPP_APP_SECRET` — optional app secret for validating webhook signature `x-hub-signature-256`.
       - `N8N_WEBHOOK_URL` — the URL that the gateway should forward normalized events to (in-repo N8N webhook when deployed).
       - `MCP_WHATSAPP_GATEWAY_URL` — optional base url for local smoke-tests.

  **Files added**:
    - `whatsapp_gateway/index.js` — Express microservice that verifies webhook GET/POST, normalizes payload, forwards to `N8N_WEBHOOK_URL`.
    - `n8n/workflows/whatsapp-router.json` — in-repo N8N workflow skeleton with Normalize, Intent Classifier, MCP Upload placeholder, and reply formatter.
    - `migrations/010_whatsapp_profiles_events.sql` — Supabase migration for WhatsApp tables (already added in prior work).
    - `scripts/smoke-test-whatsapp-gateway.js` — smoke-test for GET challenge and POST sample event.

  **Local test steps**
    1. Start MCP server (dev) and confirm `MCP_BASE_URL` is reachable.
       - Example: `cd packages/mcp-server && cp .env.example .env && npm install && npm run dev`
    2. Start the gateway locally:
       ```bash
       cd whatsapp_gateway
       cp .env.example .env
       npm install
       npm start
       ```
    3. Run the gateway smoke-test (adjust URL/envs as needed):
       ```bash
       MCP_WHATSAPP_GATEWAY_URL=http://localhost:3000 WHATSAPP_WEBHOOK_VERIFY_TOKEN=your_token node scripts/smoke-test-whatsapp-gateway.js
       ```
    4. Inspect logs from gateway and MCP; confirm the GET returns the challenge and POST is accepted and forwarded to the `N8N_WEBHOOK_URL`.

  **N8N workflow notes**
    - The workflow `n8n/workflows/whatsapp-router.json` is a skeleton for in-repo use only. It includes an HTTP request node placeholder (`MCP Upload`) which should be configured to call your MCP `/api/upload` or `/api/livepeer/upload` endpoints.
    - Because you requested N8N remain an in-repo artifact, these JSON workflows are for review and manual import into your running N8N instance if/when you deploy it.

  **Security & production**
    - Always validate `x-hub-signature-256` on POSTs using `WHATSAPP_APP_SECRET`.
    - Do not embed MCP or Supabase secrets in client-side code; keep calls to MCP from server-side components or trusted workflows.
    - Add rate limiting and request body size limits on the gateway to avoid abuse.

  **Next steps (recommended)**
    - Wire the MCP Upload node to perform multipart file upload (download WhatsApp media then POST to `MCP_BASE_URL/api/upload`).
    - Expand the workflow to trigger `metadata-enhancement` and `distribution-pipeline` flows (in-repo), ensuring the `source: 'whatsapp'` metadata is set.
    - Add a gateway healthcheck endpoint and a CI smoke-test that runs the smoke-test script against a staging endpoint.

**CI & Wiring Notes (added 2025-12-02)**

- CI job: `.github/workflows/smoke-test-whatsapp-gateway.yml` (already added) will run `scripts/smoke-test-whatsapp-gateway.js`. Provide `secrets.SMOKE_GATEWAY_URL`, `WHATSAPP_WEBHOOK_VERIFY_TOKEN`, and `WHATSAPP_APP_SECRET` in repository secrets for CI to exercise a staging gateway.

- N8N wiring checklist:
  - Confirm your N8N instance accepts binary data on the webhook you import. Some N8N installs require enabling `binaryData` or specific node versions to pass files between HTTP nodes.
  - The `Download Media` node in `n8n/workflows/whatsapp-router.json` should be set to `responseFormat: file` and the `MCP Upload` node should reference that binary property (property name used: `data`). If your N8N instance returns a different binary property (e.g. `data` vs `file`), update the `binaryPropertyName` field in the `MCP Upload` node before importing.
  - For local integration tests, set `N8N_BASE_URL` to `http://localhost:5678` (or your local N8N), and ensure a webhook endpoint exists for `metadata-enhancement` and `distribution-pipeline` or change the URLs in the workflow to point at your import IDs.

- Logging & artifacts (recommended for CI and agent runs):
  - Save smoke-test outputs to an artifact path `automation-2025-12-02/` with files:
    - `automation-2025-12-02/mcp-smoke.log`
    - `automation-2025-12-02/gateway-smoke.log`
    - `automation-2025-12-02/lint.log` (if lint run)
    - `automation-2025-12-02/tests.log` (if unit/integration tests run)
  - Mask secrets in any uploaded logs. Do not commit secrets to the repository.

- Example failure-handling (CI):
  - If the gateway POST fails with 401/403: confirm `WHATSAPP_APP_SECRET` and `WHATSAPP_WEBHOOK_VERIFY_TOKEN` values are correct.
  - If `MCP Upload` returns 4xx: inspect body and ensure `MCP_BASE_URL` is reachable and that the MCP server has `PINATA_JWT` or Livepeer credentials configured.

Append these wiring checks to your PR description if you open one for the changes.

  **CI / Automation**
    - A GitHub Actions workflow was added at `.github/workflows/smoke-test-whatsapp-gateway.yml` which runs `scripts/smoke-test-whatsapp-gateway.js`.
    - The workflow accepts an input `gateway_url` (or reads `secrets.SMOKE_GATEWAY_URL`) and uses `secrets.WHATSAPP_WEBHOOK_VERIFY_TOKEN` and `secrets.WHATSAPP_APP_SECRET` to validate requests. Add these secrets to the repository settings for staging runs.
    - Example: create a repo secret `SMOKE_GATEWAY_URL` pointing at the staging gateway base URL (e.g. `https://staging-gateway.example.com`).

  **Wiring details for N8N `MCP Upload` node**
    - Node sequence:
      1. `Download Media` (HTTP Request): GET the `mediaUrl` from the WhatsApp event, set `Response Format` to `file`.
      2. `MCP Upload` (HTTP Request): POST to `{{ $env.MCP_BASE_URL }}/api/upload`.
         - Set `binaryData` = true, `binaryPropertyName` = `data`.
         - Add a JSON body parameter `metadata` containing `source: 'whatsapp'`, `whatsapp_id`, and any `original_message` fields.
      3. `MCP Create Beat` (HTTP Request): POST to `{{ $env.MCP_BASE_URL }}/api/beats` with the response from `MCP Upload`.
      4. Trigger downstream webhooks for metadata enhancement and distribution with the created `beatId`.

    - Notes:
      - Some WhatsApp media URLs require you to call the WhatsApp API to exchange an `id` for a temporary downloadable URL. Ensure your `Download Media` step does this if required by your WhatsApp integration.
      - Confirm your N8N instance supports binary forwarding using the `binaryPropertyName` configured above. If not, use a small function node to base64-encode and POST as JSON to MCP, then have MCP accept base64 payloads.

  **CI run example (manual dispatch)**
    - Trigger the workflow from GitHub Actions `Actions` → `Smoke Test — WhatsApp Gateway` → `Run workflow`, provide the `gateway_url` input or add `SMOKE_GATEWAY_URL` to secrets.

