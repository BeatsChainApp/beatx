require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const multer = require('multer');

// Ensure uploads directory exists
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads', { recursive: true });
}

const upload = multer({ dest: 'uploads/' });
const IpfsPinner = require('./services/ipfsPinner');

const app = express();
const port = process.env.PORT || 4000;

// Enhanced Railway Environment Debug
console.log('=== RAILWAY ENVIRONMENT DEBUG ===');
console.log('PORT:', process.env.PORT);
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('RAILWAY_ENVIRONMENT:', process.env.RAILWAY_ENVIRONMENT);
console.log('RAILWAY_PROJECT_ID:', process.env.RAILWAY_PROJECT_ID);
console.log('SUPABASE_URL:', process.env.SUPABASE_URL || 'MISSING');
console.log('SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? `${process.env.SUPABASE_SERVICE_ROLE_KEY.substring(0, 20)}...` : 'MISSING');
console.log('SUPABASE_ANON_KEY:', process.env.SUPABASE_ANON_KEY ? `${process.env.SUPABASE_ANON_KEY.substring(0, 20)}...` : 'MISSING');
console.log('PINATA_JWT:', process.env.PINATA_JWT ? 'SET' : 'MISSING');
console.log('LIVEPEER_API_KEY:', process.env.LIVEPEER_API_KEY ? 'SET' : 'MISSING');
console.log('THIRDWEB_SECRET_KEY:', process.env.THIRDWEB_SECRET_KEY ? 'SET' : 'MISSING');
console.log('THIRDWEB_CLIENT_ID:', process.env.THIRDWEB_CLIENT_ID ? 'SET' : 'MISSING');
console.log('GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID ? 'SET' : 'MISSING');
console.log('All environment keys:', Object.keys(process.env).length);
console.log('All env keys:', Object.keys(process.env).sort());
console.log('SUPABASE keys found:', Object.keys(process.env).filter(k => k.includes('SUPABASE')));
console.log('================================');

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Root endpoint for Railway health check
app.get('/', (req, res) => {
  res.json({ 
    status: 'ok', 
    service: 'beatschain-mcp-server',
    port: port,
    env_port: process.env.PORT,
    timestamp: Date.now()
  });
});

// Mount IPFS proxy route
try {
  const ipfsProxy = require('./routes/ipfs-proxy');
  app.use('/api', ipfsProxy);
} catch (e) {
  console.warn('IPFS proxy route not available:', e && e.message);
}

// Mount ISRC routes
try {
  const isrcRoutes = require('./routes/isrc')
  app.use('/api', isrcRoutes)
} catch (e) {
  console.warn('ISRC routes not available:', e && e.message)
}

// Mount Livepeer routes
try {
  const livepeerRoutes = require('./routes/livepeer');
  app.use('/api', livepeerRoutes);
} catch (e) {
  console.warn('Livepeer routes not available:', e && e.message);
}

// Mount Credits routes
try {
  const creditsRoutes = require('./routes/credits')
  app.use('/api', creditsRoutes)
} catch (e) {
  console.warn('Credits routes not available:', e && e.message)
}

// Mount Success routes
try {
  const successRoutes = require('./routes/success')
  app.use('/api', successRoutes)
} catch (e) {
  console.warn('Success routes not available:', e && e.message)
}

// Mount Thirdweb routes (requires ethers module)
try {
  const ethers = require('ethers') // Test if ethers is available
  console.log('✅ Ethers module found:', ethers.version)
  const thirdwebRoutes = require('./routes/thirdweb')
  app.use('/api', thirdwebRoutes)
  console.log('✅ Thirdweb routes loaded successfully')
} catch (e) {
  console.warn('Thirdweb routes not available:', e.message)
}

// Mount Campaigns routes
try {
  const campaigns = require('./routes/campaigns')
  app.use('/api', campaigns)
} catch (e) {
  console.warn('Campaigns routes not available:', e && e.message)
}

// Mount Professional Services routes
try {
  const professional = require('./routes/professional')
  app.use('/api', professional)
} catch (e) {
  console.warn('Professional services routes not available:', e && e.message)
}

// Mount Analytics routes (requires Supabase)
if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
  try {
    const analytics = require('./routes/analytics')
    app.use('/api/analytics', analytics)
    console.log('✅ Analytics routes loaded successfully')
  } catch (e) {
    console.warn('❌ Analytics routes failed to load:', e && e.message)
  }
} else {
  console.warn('Analytics routes not available: SUPABASE_URL is required.')
}

// Mount Notifications routes (requires Supabase)
if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
  try {
    const notifications = require('./routes/notifications')
    app.use('/api/notifications', notifications)
    console.log('✅ Notifications routes loaded successfully')
  } catch (e) {
    console.warn('❌ Notifications routes failed to load:', e && e.message)
  }
} else {
  console.warn('Notifications routes not available: SUPABASE_URL is required.')
}

// Mount Content routes (requires Supabase)
if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
  try {
    const content = require('./routes/content')
    app.use('/api/content', content)
    console.log('✅ Content routes loaded successfully')
  } catch (e) {
    console.warn('❌ Content routes failed to load:', e && e.message)
  }
} else {
  console.warn('Content routes not available: SUPABASE_URL is required.')
}

// Mount Recommendations routes (requires Supabase)
if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
  try {
    const recommendations = require('./routes/recommendations')
    app.use('/api/recommendations', recommendations)
    console.log('✅ Recommendations routes loaded successfully')
  } catch (e) {
    console.warn('❌ Recommendations routes failed to load:', e && e.message)
  }
} else {
  console.warn('Recommendations routes not available: SUPABASE_URL is required.')
}

// Mount Beats routes
try {
  const beats = require('./routes/beats')
  app.use('/api', beats)
} catch (e) {
  console.warn('Beats routes not available:', e && e.message)
}

// Mount Sync routes
try {
  const sync = require('./routes/sync')
  app.use('/api/sync', sync)
} catch (e) {
  console.warn('Sync routes not available:', e && e.message)
}

// Health checks
app.get('/healthz', (req, res) => res.json({ ok: true, ts: Date.now(), service: 'mcp-server' }));
app.get('/health', (req, res) => res.json({ ok: true, ts: Date.now(), service: 'mcp-server' }));

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
    const metadata = req.body.metadata ? JSON.parse(req.body.metadata) : {};
    if (!req.file) return res.status(400).json({ success: false, message: 'file required' });

    const pinner = new IpfsPinner(process.env.WEB3STORAGE_TOKEN || null);
    const fileResult = await pinner.pinFile(req.file.path, req.file.originalname);

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



// Mount SAMRO routes
try {
  const samroRoutes = require('./routes/samro');
  app.use('/api', samroRoutes);
  console.log('✅ SAMRO routes loaded successfully');
} catch (e) {
  console.warn('SAMRO routes not available:', e && e.message);
}

const server = app.listen(port, '0.0.0.0', () => {
  console.log(`BeatsChain MCP server listening on port ${port}`);
  console.log(`Server accessible at: http://0.0.0.0:${port}`);
  console.log(`Health check: http://0.0.0.0:${port}/healthz`);
  console.log(`Root endpoint: http://0.0.0.0:${port}/`);
});

server.on('error', (error) => {
  console.error('Server error:', error);
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled rejection at:', promise, 'reason:', reason);
  process.exit(1);
});
