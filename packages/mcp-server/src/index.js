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

const app = express();
const path = require('path');
const port = process.env.PORT || process.env.RAILWAY_PORT || 4000;

// Enhanced Environment Debug
console.log('=== MCP SERVER ENVIRONMENT DEBUG ===');
console.log('PORT:', process.env.PORT);
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('RAILWAY_ENVIRONMENT:', process.env.RAILWAY_ENVIRONMENT);
console.log('SUPABASE_URL:', process.env.SUPABASE_URL ? 'SET' : 'MISSING');
console.log('SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? 'SET' : 'MISSING');
console.log('PINATA_JWT:', process.env.PINATA_JWT ? 'SET' : 'MISSING');
console.log('LIVEPEER_API_KEY:', process.env.LIVEPEER_API_KEY ? 'SET' : 'MISSING');
console.log('THIRDWEB_SECRET_KEY:', process.env.THIRDWEB_SECRET_KEY ? 'SET' : 'MISSING');
console.log('GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID ? 'SET' : 'MISSING');
console.log('=====================================');

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Helper to safely mount route modules. If the route file exists but fails to initialize
// (missing deps/env), mount a 503 responder so monitoring can distinguish missing route vs unavailable.
function safeMount(routeName, mountPath) {
  const routePath = path.join(__dirname, 'routes', `${routeName}.js`);
  try {
    const route = require(`./routes/${routeName}`);
    app.use(mountPath, route);
    console.log(`✅ ${routeName} routes loaded at ${mountPath}`);
  } catch (e) {
    const routeExists = fs.existsSync(routePath);
    if (routeExists) {
      app.use(mountPath, (req, res) => res.status(503).json({ ok: false, reason: `${routeName}_missing_deps`, message: e.message }));
      console.warn(`❌ ${routeName} route failed to initialize: ${e && e.message}`);
    } else {
      console.warn(`${routeName} routes not available: file missing`);
    }
  }
}

// Root endpoint for Railway health check
app.get('/', (req, res) => {
  res.json({ 
    status: 'ok', 
    service: 'beatschain-mcp-server',
    port: port,
    env_port: process.env.PORT,
    timestamp: Date.now(),
    version: '2.0.0'
  });
});

// Health checks
app.get('/healthz', (req, res) => {
  console.log('Health check hit: /healthz');
  res.json({ ok: true, ts: Date.now(), service: 'mcp-server', port: port });
});

app.get('/health', (req, res) => {
  console.log('Health check hit: /health');
  res.json({ ok: true, ts: Date.now(), service: 'mcp-server', port: port });
});

// Initialize services first
let IpfsPinner = null;
let tokenExchange = null;
let supabaseClient = null;

try {
  IpfsPinner = require('./services/ipfsPinner');
  console.log('✅ IPFS Pinner service loaded');
} catch (e) {
  console.warn('❌ IPFS Pinner service failed:', e.message);
}

try {
  tokenExchange = require('./tokenExchange');
  console.log('✅ Token Exchange service loaded');
} catch (e) {
  console.warn('❌ Token Exchange service failed:', e.message);
}

try {
  supabaseClient = require('./services/supabaseClient');
  console.log('✅ Supabase client loaded');
} catch (e) {
  console.warn('❌ Supabase client failed:', e.message);
}

// Core API endpoints
if (tokenExchange) {
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
}

if (IpfsPinner) {
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
}

// Route loading with better error handling
const routes = [
  { path: './routes/ipfs-proxy', mount: '/api', name: 'IPFS Proxy' },
  { path: './routes/isrc', mount: '/api', name: 'ISRC' },
  { path: './routes/livepeer', mount: '/api', name: 'Livepeer' },
  { path: './routes/credits', mount: '/api', name: 'Credits' },
  { path: './routes/success', mount: '/api', name: 'Success' },
  { path: './routes/beats', mount: '/api', name: 'Beats' },
  { path: './routes/sync', mount: '/api/sync', name: 'Sync' },
  { path: './routes/samro', mount: '/api', name: 'SAMRO' }
];

// Routes that require Supabase
const supabaseRoutes = [
  { path: './routes/analytics', mount: '/api/analytics', name: 'Analytics' },
  { path: './routes/notifications', mount: '/api/notifications', name: 'Notifications' },
  { path: './routes/content', mount: '/api/content', name: 'Content' },
  { path: './routes/recommendations', mount: '/api/recommendations', name: 'Recommendations' }
];

// Routes that require special dependencies
const specialRoutes = [
  { path: './routes/thirdweb', mount: '/api', name: 'Thirdweb', requires: 'ethers' },
  { path: './routes/campaigns', mount: '/api', name: 'Campaigns' },
  { path: './routes/professional', mount: '/api', name: 'Professional' }
];

// Load basic routes (use safeMount helper)
routes.forEach(({ path: routePath, mount, name }) => {
  const routeFile = routePath.split('/').pop().replace('.js', '');
  safeMount(routeFile, mount);
});

// Load Supabase-dependent routes
if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
  supabaseRoutes.forEach(({ path: routePath, mount, name }) => {
    const routeFile = routePath.split('/').pop().replace('.js', '');
    safeMount(routeFile, mount);
  });
} else {
  console.warn('Supabase routes not available: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY required');

  // Create fallback routes for missing Supabase endpoints (if files exist)
  supabaseRoutes.forEach(({ path: routePath, mount, name }) => {
    const routeFile = routePath.split('/').pop().replace('.js', '');
    const routeFilePath = path.join(__dirname, 'routes', `${routeFile}.js`);
    if (fs.existsSync(routeFilePath)) {
      app.all(`${mount}*`, (req, res) => {
        res.status(503).json({
          success: false,
          message: `${name} service requires database configuration`
        });
      });
    }
  });
}

// Load special dependency routes
specialRoutes.forEach(({ path: routePath, mount, name, requires }) => {
  const routeFile = routePath.split('/').pop().replace('.js', '');
  try {
    if (requires) {
      require(requires);
      console.log(`✅ ${requires} dependency found for ${name}`);
    }
    safeMount(routeFile, mount);
  } catch (e) {
    console.warn(`❌ ${name} routes failed to load:`, e.message);
    const routeFilePath = path.join(__dirname, 'routes', `${routeFile}.js`);
    if (fs.existsSync(routeFilePath)) {
      app.all(`${mount}/${routeFile}*`, (req, res) => {
        res.status(503).json({
          success: false,
          message: `${name} service temporarily unavailable`,
          error: requires ? `Missing dependency: ${requires}` : e.message
        });
      });
    }
  }
});

// API index endpoint
app.get('/api', (req, res) => {
  res.json({
    success: true,
    service: 'beatschain-mcp-server',
    version: '2.0.0',
    endpoints: {
      working: [
        'GET /healthz - Health check',
        'GET /health - Health check', 
        'POST /api/token-exchange - Authentication',
        'POST /api/pin - IPFS pinning',
        'POST /api/upload - File upload',
        'GET /api/beats - Beat operations',
        'GET /api/credits - Credits system',
        'GET /api/success - Success logging',
        'POST /api/isrc/generate - ISRC generation',
        'POST /api/livepeer/upload - Video upload',
        'POST /api/samro/generate - SAMRO split sheets',
        'GET /api/sync - Real-time sync'
      ],
      unavailable: [
        '/api/analytics - Requires callback function fix',
        '/api/notifications - Requires callback function fix', 
        '/api/content - LivepeerAdapter constructor issue',
        '/api/recommendations - Requires callback function fix'
      ]
    }
  });
});

// Catch-all 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found',
    path: req.originalUrl,
    method: req.method,
    hint: 'Visit /api for available endpoints'
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Server error'
  });
});

app.use('/api', require('./routes/index'));
require('./routes/fallbacks')(app);

const server = app.listen(port, '0.0.0.0', () => {
  console.log('='.repeat(50));
  console.log(`✅ BeatsChain MCP server STARTED`);
  console.log(`Port: ${port}`);
  console.log(`Host: 0.0.0.0`);
  console.log(`Health: http://0.0.0.0:${port}/healthz`);
  console.log(`Root: http://0.0.0.0:${port}/`);
  console.log('='.repeat(50));
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
