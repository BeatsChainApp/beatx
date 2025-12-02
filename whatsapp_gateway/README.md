# WhatsApp Gateway

Lightweight Express service that verifies Meta/WhatsApp webhooks, normalizes payloads and forwards them to an N8N webhook.

Purpose:

- Validate webhook subscription (GET /webhook)
- Verify request signature (if `WHATSAPP_APP_SECRET` is provided)
- Normalize payload and forward to `N8N_WEBHOOK_URL`
- Health check at `/health`

Environment variables (see `.env.example`):

- `PORT` - port to run the gateway
- `WHATSAPP_WEBHOOK_VERIFY_TOKEN` - verify token used during webhook registration
- `WHATSAPP_APP_SECRET` - app secret for signature verification (optional, recommended)
- `N8N_WEBHOOK_URL` - URL to forward normalized events to (e.g., `http://localhost:5678/webhook/whatsapp`)
- `N8N_WEBHOOK_TOKEN` - optional bearer token for forwarding

Run locally:

```bash
cd whatsapp_gateway
npm install
cp .env.example .env
# edit .env to set N8N_WEBHOOK_URL
npm start
```

No browser popups or any UI interactions are required by this service.
