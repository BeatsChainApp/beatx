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
  // Try Pinata first (more reliable)
  if (process.env.PINATA_JWT) {
    IpfsPinner = require('./services/pinataPinner');
    console.log('✅ Pinata IPFS service loaded');
  } else {
    IpfsPinner = require('./services/ipfsPinner');
    console.log('✅ Web3.Storage IPFS service loaded');
  }
} catch (e) {
  console.warn('❌ IPFS service failed:', e.message);
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

      const pinner = new IpfsPinner(process.env.PINATA_JWT || process.env.WEB3STORAGE_TOKEN);
      const result = await pinner.pinJSON(payload);
      
      // Log success to Supabase
      if (supabaseClient) {
        try {
          await supabaseClient.from('success').insert({
            event: 'ipfs_pin',
            status: 'completed',
            metadata: { cid: result.cid || result.hash },
            details: { payload, result }
          });
        } catch (logErr) {
          console.warn('Success logging failed:', logErr.message);
        }
      }
      
      res.json({ success: true, ipfs: result });
    } catch (err) {
      console.error('pin error', err);
      res.status(500).json({ success: false, message: err.message });
    }
  });

  app.post('/api/upload', upload.single('file'), async (req, res) => {
    try {
      const metadata = req.body.metadata ? JSON.parse(req.body.metadata) : {};
      const platform = req.body.platform || 'app'; // extension or app
      
      if (!req.file) return res.status(400).json({ success: false, message: 'file required' });

      const pinner = new IpfsPinner(process.env.PINATA_JWT || process.env.WEB3STORAGE_TOKEN);
      const fileResult = await pinner.pinFile(req.file.path, req.file.originalname);

      const meta = {
        ...metadata,
        platform,
        originalName: req.file.originalname,
        size: req.file.size,
        mimeType: req.file.mimetype,
        uploadedAt: new Date().toISOString(),
        ipfs: fileResult,
        
        // Professional metadata validation
        professional_complete: !!(metadata.title && metadata.artist && metadata.genre),
        distribution_ready: !!(metadata.title && metadata.artist && metadata.album && metadata.releaseYear),
        
        // Technical metadata
        technical: {
          format: req.file.mimetype,
          size_mb: (req.file.size / (1024 * 1024)).toFixed(2)
        }
      };

      const metaResult = await pinner.pinJSON(meta);
      
      // Log success to Supabase with platform info
      if (supabaseClient) {
        try {
          await supabaseClient.from('success').insert({
            event: `${platform}_upload`,
            status: 'completed',
            metadata: { 
              filename: req.file.originalname,
              size: req.file.size,
              platform,
              ipfs_cid: fileResult.cid || fileResult.hash
            },
            details: { meta, fileResult, metaResult }
          });
        } catch (logErr) {
          console.warn('Success logging failed:', logErr.message);
        }
      }
      
      res.json({ 
        success: true, 
        file: fileResult, 
        metadata: metaResult,
        platform 
      });
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

// Upload pipeline status endpoint
app.get('/api/upload/status', async (req, res) => {
  try {
    const status = {
      ipfs: {
        available: !!IpfsPinner,
        pinata_configured: !!process.env.PINATA_JWT,
        web3storage_configured: !!process.env.WEB3STORAGE_TOKEN
      },
      livepeer: {
        available: !!process.env.LIVEPEER_API_KEY,
        tus_client: !!require('tus-js-client')
      },
      supabase: {
        available: !!supabaseClient,
        url_configured: !!process.env.SUPABASE_URL
      },
      platforms: {
        extension: 'ready',
        app: 'ready'
      }
    };
    
    // Test database connection
    if (supabaseClient) {
      try {
        const { data, error } = await supabaseClient.from('success').select('count').limit(1);
        status.supabase.connection = error ? 'error' : 'connected';
      } catch (e) {
        status.supabase.connection = 'error';
      }
    }
    
    res.json({ success: true, status, timestamp: Date.now() });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
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

// Add metadata validation endpoint
app.post('/api/metadata/validate', async (req, res) => {
  try {
    const { metadata } = req.body;
    if (!metadata) {
      return res.status(400).json({ success: false, message: 'metadata required' });
    }
    
    const validation = {
      required_fields: {
        title: !!metadata.title,
        artist: !!metadata.artist,
        genre: !!metadata.genre
      },
      professional_fields: {
        album: !!metadata.album,
        release_year: !!metadata.releaseYear,
        record_label: !!metadata.recordLabel,
        bpm: !!metadata.bpm,
        key: !!metadata.key
      },
      distribution_ready: !!(
        metadata.title && metadata.artist && metadata.album && 
        metadata.releaseYear && metadata.genre
      ),
      completeness_score: 0
    };
    
    // Calculate completeness score
    const allFields = { ...validation.required_fields, ...validation.professional_fields };
    const completedFields = Object.values(allFields).filter(Boolean).length;
    const totalFields = Object.keys(allFields).length;
    validation.completeness_score = Math.round((completedFields / totalFields) * 100);
    
    res.json({ success: true, validation });
  } catch (error) {
    console.error('Metadata validation error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Add metadata extraction endpoint
app.post('/api/metadata/extract', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'file required' });
    }
    
    const extractedMetadata = {
      duration: 0,
      bitrate: 0,
      sample_rate: 0,
      format: req.file.mimetype,
      size: req.file.size,
      bpm: null,
      key: null,
      mood: null,
      energy: null
    };
    
    res.json({ 
      success: true, 
      extracted: extractedMetadata,
      message: 'Audio analysis features coming soon' 
    });
  } catch (error) {
    console.error('Metadata extraction error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
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

// Add metadata storage endpoint
app.post('/api/metadata/store', async (req, res) => {
  try {
    const { beat_id, enhanced_metadata } = req.body;
    
    if (!beat_id || !enhanced_metadata) {
      return res.status(400).json({ 
        success: false, 
        message: 'beat_id and enhanced_metadata required' 
      });
    }
    
    if (supabaseClient) {
      try {
        const { getClient } = require('./services/supabaseClient');
        const sb = getClient();
        if (sb) {
          const { error } = await sb
            .from('beats')
            .update({
              mood: enhanced_metadata.mood,
              energy_level: enhanced_metadata.energy,
              professional_complete: enhanced_metadata.professional_complete,
              distribution_ready: enhanced_metadata.distribution_ready,
              duration_seconds: enhanced_metadata.duration,
              bpm: enhanced_metadata.bpm,
              updated_at: new Date().toISOString()
            })
            .eq('id', beat_id);
            
          if (error) throw error;
        }
      } catch (dbError) {
        console.error('Database update failed:', dbError);
        return res.status(500).json({ 
          success: false, 
          error: 'Database update failed' 
        });
      }
    }
    
    res.json({ 
      success: true, 
      message: 'Enhanced metadata stored successfully' 
    });
  } catch (error) {
    console.error('Metadata storage error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
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

// Load additional routes if they exist
try {
  const indexRoute = require('./routes/index');
  app.use('/api', indexRoute);
  console.log('✅ Additional index routes loaded');
} catch (e) {
  console.log('ℹ️ No additional index routes found');
}

try {
  require('./routes/fallbacks')(app);
  console.log('✅ Fallback routes loaded');
} catch (e) {
  console.log('ℹ️ No fallback routes found');
}

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
