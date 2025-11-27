require('dotenv').config();
const express = require('express');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const IpfsPinner = require('./services/ipfsPinner');

const app = express();
const port = process.env.PORT || 4000;

app.use(express.json({ limit: '10mb' }));

// Mount IPFS proxy route
try {
  const ipfsProxy = require('./routes/ipfs-proxy');
  app.use('/api', ipfsProxy);
} catch (e) {
  console.warn('IPFS proxy route not available:', e && e.message);
}

// Simple health check
app.get('/healthz', (req, res) => res.json({ ok: true, ts: Date.now() }));

// POST /api/token-exchange
const tokenExchange = require('./tokenExchange');

app.post('/api/token-exchange', async (req, res) => {
  const { idToken } = req.body || {};
  if (!idToken) return res.status(400).json({ success: false, message: 'idToken required' });
  try {
    const session = await tokenExchange.verifyAndCreateSession(idToken);
    res.json(session);
  } catch (err) {
    console.error('token-exchange error', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/pin - pin JSON or return mock if no token configured
app.post('/api/pin', async (req, res) => {
  try {
    const payload = req.body;
    if (!payload) return res.status(400).json({ success: false, message: 'body required' });

    const pinner = new IpfsPinner(process.env.WEB3STORAGE_TOKEN || null);
    const result = await pinner.pinJSON(payload);
    res.json({ success: true, ipfs: result });
  } catch (err) {
    console.error('pin error', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/upload - accepts multipart form: file + metadata
app.post('/api/upload', upload.single('file'), async (req, res) => {
  try {
    // metadata can be in req.body.metadata (JSON string)
    const metadata = req.body.metadata ? JSON.parse(req.body.metadata) : {};
    if (!req.file) return res.status(400).json({ success: false, message: 'file required' });

    const pinner = new IpfsPinner(process.env.WEB3STORAGE_TOKEN || null);
    // For this scaffold we pin the received file directly via Web3.Storage if token exists
    const fileResult = await pinner.pinFile(req.file.path, req.file.originalname);

    // Compose metadata + returned ipfs hash
    const meta = {
      ...metadata,
      originalName: req.file.originalname,
      size: req.file.size,
      ipfs: fileResult
    };

    const metaResult = await pinner.pinJSON(meta);

    res.json({ success: true, file: fileResult, metadata: metaResult });
  } catch (err) {
    console.error('upload error', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

app.listen(port, () => console.log(`BeatsChain server scaffold listening on http://localhost:${port}`));
