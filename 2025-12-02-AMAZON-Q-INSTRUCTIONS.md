# 2025-12-02 — Amazon Q Agent: Finish Remaining Tasks & Run Tests

Purpose
-------
Provide a complete, deterministic instruction set for the Amazon Q agent to finish the remaining implementation tasks in this repository and run the full suite of smoke/integration/unit tests. The agent must not rely on or interact with the browser UI for permission prompts (the user reports that pressing "Allow" breaks their browser). All actions should be performed from the project dev container or CI runner using CLI commands and environment variables.

Context & constraints
---------------------
- Repo: `beatx` (root at `/workspaces/beatx`). Branch: `main`.
- The MCP server is used for canonical uploads/pins/Livepeer TUS and Supabase (service role) persistence.
- N8N workflows live in `n8n/workflows/` and are in-repo artifacts (do not deploy N8N automatically unless instructed).
- The user reports that clicking browser permission prompts (e.g. allow) causes the browser to crash; do not perform any flow that requires clicking client-side permission popups. Use server-side or headless API calls instead.
- The Amazon Q agent has SSH/CLI access to the repo and can run commands in the dev container or a CI environment.

Top-level goals for the agent
----------------------------
1. Run the full test & smoke-test suite to verify MCP, gateway, and workflows work end-to-end.
2. Finish wiring remaining N8N workflow details (binary download → MCP upload → MCP create Beat → trigger metadata/distribution webhooks) and verify by running local imports or simulated webhook calls.
3. Execute the MCP smoke tests and WhatsApp gateway smoke tests already present in the repo.
4. Commit any small fixes required to make the tests pass, produce a self-contained PR with logs, and leave clear runbook steps for manual verification.

Precise tasks (step-by-step)
----------------------------
Environment setup (precondition):

1. Work from the dev container (Ubuntu) or a CI runner. If using local devcontainer, open a terminal at `/workspaces/beatx`.

2. Ensure the following environment variables are set in the session (or available in CI as secrets):
   - `MCP_BASE_URL` — URL of the MCP server (e.g. `https://mcp.example.com` or `http://localhost:4000` for local dev).
   - `N8N_BASE_URL` — URL of a local N8N instance if available for webhook testing (optional; otherwise leave as `http://localhost:5678`).
   - `WHATSAPP_WEBHOOK_VERIFY_TOKEN` — verify token used by the gateway GET challenge.
   - `WHATSAPP_APP_SECRET` — optional; if present, the gateway expects `x-hub-signature-256` HMAC on POSTs.
   - `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` — required only if MCP is run locally and you need to test Supabase persistence.

3. Install project dependencies at repo root as needed. Use the repository's package manager (node/npm) for Node scripts:

```bash
cd /workspaces/beatx
npm ci
```

If the project uses workspaces and installing at root fails, run `npm ci` inside the subpackages you need (e.g. `packages/mcp-server`, `whatsapp_gateway`).

Run the MCP smoke tests and gateway smoke tests
----------------------------------------------
4. Verify MCP smoke test script exists and run it:

```bash
# Run MCP smoke-test script
node scripts/smoke-test-mcp.js
```

Expectations: the script should exercise MCP health, `/api/upload` (POST), `/api/pin` (POST), `/api/livepeer/assets` (GET), and `/api/beats` (POST). If any endpoints fail, capture the HTTP status codes and response bodies in a `mcp-smoke-logs/` directory, and retry with exponential backoff (3 attempts, 5s -> 15s -> 45s).

5. Run the WhatsApp gateway smoke-test (verifies GET challenge + POST simulated webhook):

```bash
# set gateway URL to local gateway or the staging endpoint
export MCP_WHATSAPP_GATEWAY_URL=${MCP_WHATSAPP_GATEWAY_URL:-http://localhost:3000}
export WHATSAPP_WEBHOOK_VERIFY_TOKEN=${WHATSAPP_WEBHOOK_VERIFY_TOKEN:-test-verify-token}
node scripts/smoke-test-whatsapp-gateway.js
```

Expectations: GET should return the challenge token; POST should return 200/202 and the gateway should forward the normalized event to `N8N_WEBHOOK_URL` or log the forward attempt. Save logs under `gateway-smoke-logs/` for inclusion in the PR.

If the gateway POST fails due to missing `N8N_WEBHOOK_URL`, set `N8N_WEBHOOK_URL` to a placeholder HTTP endpoint (e.g. a temporary request bin URL) or a local N8N webhook endpoint.

Wire N8N workflow for binary handling and MCP upload (in-repo changes)
----------------------------------------------------------------------
6. Confirm `n8n/workflows/whatsapp-router.json` is present. If needed, update the `MCP Upload` node to ensure binary property mapping is correct for your N8N version.

7. Simulate the N8N workflow by calling the `WhatsApp Webhook` path locally or by invoking `whatsapp_gateway` directly with a sample payload. Use `curl` to POST a sample payload mirroring `scripts/smoke-test-whatsapp-gateway.js` and observe the gateway logs.

Commands to test the end-to-end upload flow (server-side, no browser):

```bash
# 1) Start MCP server (in a terminal) if running locally
cd packages/mcp-server
cp .env.example .env
npm install
npm run dev

# 2) Start whatsapp gateway in separate terminal
cd /workspaces/beatx/whatsapp_gateway
cp .env.example .env
npm install
npm start

# 3) POST sample webhook (from this environment)
node scripts/smoke-test-whatsapp-gateway.js

# 4) Confirm MCP received the upload: check logs and run MCP-smoke-test again
node scripts/smoke-test-mcp.js
```

Running unit/integration tests and linters
----------------------------------------
8. Run repository test suites (if present). Execute these commands and capture outputs:

```bash
# run ESLint if configured
npm run lint --if-present || true

# run unit tests (root or per-package)
npm test --if-present || true

# If packages have their own tests
cd packages/mcp-server
npm ci
npm test --if-present || true

cd /workspaces/beatx
```

Test failure handling: for each failing test, capture the failing test names, stack traces, and relevant logs into `test-failures/` and attempt to fix only minimal, safe issues required to get tests passing (e.g., missing mock env var — set it as secret or read fallback). Document each fix in the PR description.

Automated fixes Amazon Q agent is authorized to make
---------------------------------------------------
- Fix trivial typos and missing `process.env` guards that cause runtime crashes in Node scripts.
- Add retry/backoff logic to flaky HTTP calls in smoke-test scripts (up to 3 attempts) and commit those changes with tests.
- Ensure `n8n/workflows/whatsapp-router.json` binary properties are consistent (update JSON nodes only).

Do not:
- Do not perform interactive, browser-based permission prompts or flows that require clicking "Allow" in the browser. If an existing flow requires client-side permissions, implement a server-side equivalent or simulate via API calls.
- Do not rotate or expose secrets in plaintext in the repo. Use CI secrets or ephemeral env vars.

What to commit and how to report
--------------------------------
If the agent makes changes, follow this commit/PR pattern:

1. Create a branch: `git checkout -b automation/amazon-q/2025-12-02-tests`.
2. Stage only the minimal files needed for fixes (e.g., updated `scripts/*.js`, `n8n/workflows/*.json`, or small server-side guards).
3. Commit with a clear message: `chore: amazon-q agent run — fix smoke-test issues and add retry/backoff`.
4. Push the branch and open a PR against `main` titled: `automation: amazon-q run 2025-12-02 — tests & smoke-tests`.

PR contents:
- Summary of actions taken.
- Test outputs attached (include `mcp-smoke-logs/`, `gateway-smoke-logs/`, `test-failures/`).
- List of any remaining failures and suggested next steps.

If tests pass
------------
1. Tag the PR as `[ready]` and include a short checklist a human reviewer can validate manually (start MCP, run smoke tests, import workflow into N8N and test webhook path). Provide the exact commands used.

If failing and agent cannot fix
------------------------------
1. Capture logs and failing test details. Create a PR that contains only the supporting test artifacts and the suggested minimal code changes in a branch called `automation/amazon-q/2025-12-02-errors` with a clear request for human review.
2. Add a short `NEXT_STEPS.md` in the PR root listing required manual actions.

Diagnostics & logging
---------------------
- Save all outputs (stdout/stderr) of the following into a folder with timestamp prefix `automation-2025-12-02/`:
  - `node scripts/smoke-test-mcp.js`
  - `node scripts/smoke-test-whatsapp-gateway.js`
  - `npm test` results
  - `npm run lint` results
- If any HTTP calls return 5xx, capture raw response bodies and include request headers in logs (mask sensitive headers except `MCP_BASE_URL`).

Retry policy for network calls
-----------------------------
- Retry up to 3 times for transient HTTP failures (status >= 500 or network timeout).
- Use exponential backoff: 5s, 15s, 45s.

Reporting format for the PR description (template)
-------------------------------------------------
- Title: `automation: amazon-q run 2025-12-02 — tests & smoke-tests`
- Body:
  - Summary: one-paragraph summary of what ran and what changed.
  - Commands run: include exact CLI commands executed.
  - Results: pass/fail summary for each major item (MCP smoke, gateway smoke, lint, unit tests, integration tests).
  - Artifacts: list of files/dirs with logs included in the branch (attach or link).
  - Next steps: 3 bullet items for the reviewer.

Extra notes for the agent
-------------------------
- If any step requires credentials not present as env vars, fail the step gracefully and add a comment in the PR listing which secrets are missing and the exact environment variable names expected.
- If the MCP server is unreachable, try toggling `MCP_BASE_URL` between `http://localhost:4000` and the configured staging URL and include both attempted endpoints in the logs.
- When invoking `npm install` or `npm ci`, prefer `npm ci` in CI and `npm install` in a developer container when caches are desired.

Hand-off artifacts
------------------
When finished, the agent must create or update a PR which includes:
1. The branch with any minimal code fixes committed.
2. The `automation-2025-12-02/` log folder with all captured logs.
3. The PR description following the template.

If you (Amazon Q agent) finish all tasks and everything passes, add a final checklist item to the PR: `All smoke-tests and unit tests passed on 2025-12-02` and mark the PR as ready for merge.

Contact escalation
------------------
If you encounter non-deterministic failures that you cannot fix: open the PR and @mention `@BeatsChainApp` team and include `NEXT_STEPS.md` that enumerates the required human debug items.

End of instructions
-------------------
This file is intended to be machine-readable and followed by an automation agent. If anything is ambiguous, prefer safe defaults (do not rotate or print secrets) and fail with logs and a PR that requests human review.
