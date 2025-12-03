require('dotenv').config();
const express = require('express');
const axios = require('axios');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 3333;

// Initialize WhatsApp Profile Integration
let whatsappIntegration = null;
try {
  const { WhatsAppProfileIntegration } = require('./unified-profile-integration');
  whatsappIntegration = new WhatsAppProfileIntegration();
  console.log('✅ WhatsApp Profile Integration initialized');
} catch (e) {
  console.warn('⚠️ WhatsApp Profile Integration not available:', e.message);
}

// Use JSON parser for body; we'll re-stringify for signature verification if needed
app.use(express.json({ limit: '10mb' }));

function verifySignature(req) {
  const sig = req.headers['x-hub-signature-256'] || req.headers['x-hub-signature'];
  const secret = process.env.WHATSAPP_APP_SECRET;
  if (!sig || !secret) return true; // no secret configured => skip verification (safe for local)

  // header may be like 'sha256=...' or just hex
  const headerHash = sig.includes('=') ? sig.split('=')[1] : sig;
  const payload = Buffer.from(JSON.stringify(req.body));
  const hmac = crypto.createHmac('sha256', secret).update(payload).digest('hex');
  return crypto.timingSafeEqual(Buffer.from(hmac), Buffer.from(headerHash));
}

function normalizeWhatsAppPayload(body) {
  try {
    // Meta's webhook format. We'll pick common fields if present.
    const entry = (body.entry && body.entry[0]) || {};
    const change = (entry.changes && entry.changes[0]) || {};
    const value = change.value || {};

    const contacts = value.contacts || [];
    const messages = value.messages || [];

    const contact = contacts[0] || {};
    const message = messages[0] || {};

    return {
      source: 'whatsapp',
      raw: body,
      whatsapp_id: contact.wa_id || (message.from && message.from) || null,
      profile: contact.profile || null,
      message: message,
      timestamp: entry.time || Date.now()
    };
  } catch (e) {
    return { source: 'whatsapp', raw: body };
  }
}

app.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'] || req.query['mode'];
  const token = req.query['hub.verify_token'] || req.query['verify_token'] || req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'] || req.query['challenge'];

  if (mode && token) {
    if (token === process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN) {
      return res.status(200).send(challenge || 'OK');
    }
    return res.status(403).send('Verify token mismatch');
  }
  res.status(200).json({ ok: true });
});

app.post('/webhook', async (req, res) => {
  // Verify signature if configured
  try {
    if (!verifySignature(req)) {
      console.warn('Webhook signature verification failed');
      return res.status(403).send('Invalid signature');
    }
  } catch (err) {
    console.error('Signature verification error', err);
    return res.status(500).send('signature error');
  }

  const normalized = normalizeWhatsAppPayload(req.body);

  // Process with unified profile integration
  if (whatsappIntegration) {
    try {
      const result = await whatsappIntegration.handleWhatsAppMessage(normalized);
      if (result && result.response) {
        // Send response back to WhatsApp if needed
        console.log('WhatsApp response:', result.response);
      }
    } catch (err) {
      console.error('WhatsApp integration error:', err);
    }
  }

  // Forward to N8N or configured router
  const forwardUrl = process.env.N8N_WEBHOOK_URL;
  try {
    if (forwardUrl) {
      const headers = {};
      if (process.env.N8N_WEBHOOK_TOKEN) headers['authorization'] = `Bearer ${process.env.N8N_WEBHOOK_TOKEN}`;
      await axios.post(forwardUrl, normalized, { headers, timeout: 10000 });
    } else {
      console.warn('N8N_WEBHOOK_URL not set; webhook received but not forwarded');
    }
  } catch (err) {
    console.error('Error forwarding to N8N:', err && err.message);
  }

  // Respond quickly to WhatsApp
  res.status(200).send('EVENT_RECEIVED');
});

app.get('/health', (req, res) => res.json({ ok: true, ts: Date.now() }));

app.listen(PORT, () => console.log(`whatsapp_gateway listening on ${PORT}`));
