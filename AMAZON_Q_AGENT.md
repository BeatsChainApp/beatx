Amazon Q Agent Specification — BeatsChain MCP Server Integrations
===============================================================

Purpose
-------
This document is a complete, self-contained agent prompt and playbook you can feed into an automation agent (for example, Amazon Q or a similar LLM-driven executor) to implement production-grade integrations across the BeatsChain stack. It also contains the terminal commands the agent should run non-interactively (no browser popups), the repository layout assumptions, environment/secret handling, tests, and rollback steps.

Important notes before running
------------------------------
- This agent requires access to the repository `BeatsChainApp/beatx` and CI/CD provider credentials (Railway or GitHub Actions) as configured in the environment where Amazon Q runs.
- The agent MUST NOT print secrets to logs. Secrets should be injected through environment variables, secret managers (Railway secrets, AWS Secrets Manager, or GitHub Actions secrets), or CI environment variables.
- The agent will run reproducible shell commands only; any interactive step must be converted to a non-interactive API call and validated.

High-level Goals
----------------
1. Harden and enable all integration routes in `packages/mcp-server` to production grade: auth, RBAC, BeatNFT credit systems, mint systems, radio systems, dashboards, and Chrome extension backend integrations.
2. Add robust environment validation, graceful error handling (503 vs 404), and health endpoints for each integration.
3. Create CI checks, automated smoke tests, and deployment runbooks that run non-interactively.
4. Commit changes with clear atomic commits and run automated tests, then trigger a rebuild and verify production.

Repository layout (assumptions)
-----------------------------
- Root: `/workspaces/beatx`
- MCP server: `packages/mcp-server`
- Routes: `packages/mcp-server/src/routes/*`
- Server entry: `packages/mcp-server/src/index.js`
- Scripts: root `package.json` contains `install:mcp`, `build`, and `start` scripts to operate `packages/mcp-server`.

Access & Secrets Required
------------------------
- `RAILWAY_API_KEY` (if using Railway CLI / API)
- `GITHUB_TOKEN` (for creating PRs if agent modifies files)
- Production secrets required by the MCP server (store in secret manager):
  - `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_ANON_KEY`
  - `WEB3STORAGE_TOKEN` or IPFS credentials
  - `LIVEPEER_API_KEY`, `THIRDWEB_SECRET_KEY`, `PINATA_JWT` (if used)
  - Database credentials (PG) if migrations are needed: `DATABASE_URL`

Agent Instructions (Use exactly as the agent prompt)
--------------------------------------------------
System prompt summary (required):

You are an automation agent with repository-level git access and the ability to run shell commands non-interactively. Your job is to make production-grade integration changes in the `beatx` monorepo focusing on `packages/mcp-server` and associated systems. You must follow the commit, test, and deployment steps exactly. Never print secrets. Confirm each step before proceeding by writing a short JSON status update (success/failure and a one-line summary). If a step fails, retry once, then stop and report the failure with logs.

Agent task list (ordered)
-------------------------
1. Validate current repository state.
   - Run: `git fetch origin && git status --porcelain && git rev-parse --abbrev-ref HEAD`
2. Run static checks and unit tests (where present).
   - `npm run install:mcp && npm run build`
3. Discover missing or disabled routes and their dependencies.
   - Parse `packages/mcp-server/src/index.js` to list routes attempted to load and which ones are gated by env variables.
4. For each disabled route (analytics, notifications, content, recommendations):
   a. Identify missing env vars or missing modules in `packages/mcp-server/package.json`.
   b. If missing modules, add them to `package.json` and run `npm install` locally.
   c. If missing env variables, create a `.env.example` update and add instructions to store secrets in Railway / AWS Secrets Manager.
5. Add route-level health endpoints and a `/api` index that lists active endpoints.
6. Improve error handling in the route loader to return `503` with JSON when a route is present but could not be initialised due to missing dependencies; return `404` only when route file is absent.
7. Add comprehensive smoke tests that target specific endpoints (not base paths). Update `smoke-test-comprehensive.js` to reflect real endpoints.
8. Add CI job (GitHub Actions) config that runs the build and the smoke tests on PRs and on main.
9. Commit changes in small atomic commits; adhere to conventional commit messages.
10. Push and trigger a rebuild on Railway or via `railway up`.
11. Verify production health and run smoke tests against the production URL; collect HTTP logs for any failing endpoints.

Detailed shell sequences the agent should execute (non-interactive)
-----------------------------------------------------------------
Note: All commands should be executed from the repository root (`/workspaces/beatx`). Secrets are expected in environment variables.

1) Basic repo checks

```bash
git fetch origin --depth=1
git status --porcelain
git rev-parse --abbrev-ref HEAD
```

2) Install and build mcp-server

```bash
npm run install:mcp
npm run build
```

3) Discover route status (script the detection)

```bash
python3 - <<'PY'
import json,os,re
root='packages/mcp-server/src'
idx=open(os.path.join(root,'index.js')).read()
routes=re.findall(r"require\('\./routes/([^']+)'\)", idx)
print(json.dumps({'routes':sorted(list(set(routes)))}))
PY
```

4) Add `/api` index endpoint (if missing) — patch file merge

Agent should create `packages/mcp-server/src/routes/index.js` (or similar) that enumerates and returns active endpoints. Example content:

```js
const fs = require('fs');
const path = require('path');
module.exports = (req,res)=>{
  const routesDir = path.join(__dirname);
  const entries = fs.readdirSync(routesDir).filter(f=>f.endsWith('.js') && f!=='index.js').map(f=>`/api/${path.basename(f,'.js')}`);
  res.json({active: entries});
}
```

5) Improve route loader in `src/index.js` to detect and return 503 when route file exists but fails to load due to missing env or modules. Example pseudo-change the agent should apply:

```js
try {
  const analytics = require('./routes/analytics')
  app.use('/api/analytics', analytics)
} catch (e) {
  // If the route file exists but couldn't initialize, return 503 for its endpoints
  const routeExists = fs.existsSync(path.join(__dirname,'routes','analytics.js'))
  if(routeExists) {
    app.use('/api/analytics', (req,res)=>res.status(503).json({ok:false,reason:'analytics_missing_deps'}))
  }
}
```

6) Update smoke tests to hit specific endpoints

Example tests to add into `smoke-test-comprehensive.js` or a new file `smoke-test-endpoints.js`:

```js
const endpoints = [
  '/api/isrc/generate',
  '/api/samro/generate',
  '/api/livepeer/upload',
  '/api/thirdweb/<specific-route>',
]
// iterate and assert 2xx or 503 for expected routes
```

7) Add CI workflow (GitHub Actions) — `/.github/workflows/mcp-smoke.yml`

Minimal content (agent should create):

```yaml
name: MCP Smoke Tests
on: [push,pull_request]
jobs:
  build-and-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Install Node
        uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm run install:mcp
      - run: npm run build
      - run: node smoke-test-endpoints.js
```

8) Commit rules and examples

- Use conventional commits. Examples:
  - `fix(mcp-server): return 503 for analytics when dependencies missing`
  - `feat(mcp-server): add /api index listing active endpoints`
  - `test(mcp-server): add smoke test for specific endpoints`

9) Deploy and verify

Use Railway UI or CLI. Non-interactive command sequence (Railway CLI):

```bash
# Trigger a rebuild by pushing the branch
git checkout -b ch/mcp-route-fixes
git add -A
git commit -m "chore(mcp): apply route-loading hardening and smoke tests"
git push -u origin HEAD
# Trigger deploy (if railway CLI available and linked)
railway up --service beatschain-mcp-server --detach
# Wait and verify
sleep 45
curl -sS https://beatschain-mcp-server-production.up.railway.app/health | jq .
node smoke-test-endpoints.js
```

10) Rollback procedure (if deployment breaks)

```bash
# Option A: rollback to last successful deploy via Railway UI
# Option B: revert the commit and push
git revert <bad-commit-sha>
git push origin main
# Trigger rebuild
railway up --service beatschain-mcp-server --detach
```

Safety and logging
------------------
- The agent must redact all secrets from logs. Any error logs that include secrets must be truncated.
- The agent should produce a single JSON summary at the end of each major phase (discover, apply, test, deploy) with {phase, status, summary, artifacts:[files/commits], logs_url}.

How to feed this to Amazon Q (non-interactive)
---------------------------------------------
1. Save this file `AMAZON_Q_AGENT.md` to the repo root.
2. Create a payload file `amazon_q_payload.json` with fields: `"prompt": <contents of this file>`, `"env": { ... }` and give it to Amazon Q's bulk-run or automation endpoint.
3. If Amazon Q requires a single command to start execution, run (example placeholder):

```bash
# Create payload
printf '%s' "$(sed 's/"/\\"/g' AMAZON_Q_AGENT.md)" > /tmp/agent_prompt.txt
# Upload or post the file to Amazon Q via the CLI or API according to your account docs
```

If you cannot use Amazon Q directly because of browser popups, use the non-interactive CI approach above and run the scripts in this repo via a runner that has the required secrets.

Deliverables this agent will produce
------------------------------------
- `packages/mcp-server/src/routes/index.js` or updated route index file
- Changes in `packages/mcp-server/src/index.js` to return 503 for missing deps
- `smoke-test-endpoints.js` + GitHub Actions workflow
- Commit(s) and PR with the changes
- A final JSON summary file at `artifacts/agent-run-summary.json`

---

If you want, I will now:
1) Add `smoke-test-endpoints.js` and the GitHub Actions workflow to the repo, and
2) Implement the `/api` index endpoint and the route-loading changes described above, in small commits, and push them to a branch.

Which of the two (1 or 2) should I implement now? Or do you want the agent payload JSON prepared for you instead?
