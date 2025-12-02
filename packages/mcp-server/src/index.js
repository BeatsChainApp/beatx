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
  { path: './routes/pricing', mount: '/api', name: 'Pricing' },
  { path: './routes/payments', mount: '/api', name: 'Payments' },
  { path: './routes/purchases', mount: '/api', name: 'Purchases' },
  { path: './routes/profiles', mount: '/api', name: 'Profiles' },
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
  { path: './routes/professional', mount: '/api', name: 'Professional' },
  { path: './routes/enhanced-radio', mount: '/api', name: 'Enhanced Radio' }
];

// Load basic routes (use safeMount helper)
routes.forEach(({ path: routePath, mount, name }) => {
  const routeFile = routePath.split('/').pop().replace('.js', '');
  safeMount(routeFile, mount);
});

// Load signatures route
safeMount('signatures', '/api');

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
        'GET /api/pricing - Beat pricing',
        'POST /api/payments - Payment processing',
        'GET /api/purchases - Purchase history',
        'POST /api/profiles/sync - Profile synchronization',
        'GET /api/credits - Credits system',
        'GET /api/success - Success logging',
        'POST /api/isrc/generate - ISRC generation',
        'POST /api/livepeer/upload - Video upload',
        'POST /api/samro/generate - SAMRO split sheets',
        'GET /api/sync - Real-time sync'
      ],
      available_with_schema: [
        '/api/analytics - Ready after schema deployment',
        '/api/notifications - Ready after schema deployment'
      ],
      unavailable: [
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

// Enhanced Radio Flow endpoints
app.post('/api/enhanced-radio/splitsheets', async (req, res) => {
  try {
    const { contributors, track_metadata, user_id } = req.body;
    
    if (!contributors || !Array.isArray(contributors)) {
      return res.status(400).json({ success: false, message: 'contributors array required' });
    }
    
    // Validate splitsheet data
    const totalPercentage = contributors.reduce((sum, c) => sum + (c.percentage || 0), 0);
    if (Math.abs(totalPercentage - 100) > 0.01) {
      return res.status(400).json({ 
        success: false, 
        message: `Total percentage must equal 100% (current: ${totalPercentage}%)` 
      });
    }
    
    // Validate ID numbers for SAMRO compliance
    const idValidationErrors = [];
    contributors.forEach((c, i) => {
      if (!c.name?.trim()) idValidationErrors.push(`Contributor ${i+1}: Name required`);
      if (!c.idNumber?.trim()) idValidationErrors.push(`Contributor ${i+1}: ID/Passport required`);
      
      // Validate ID format (SA ID 13 digits or Passport 6-9 alphanumeric)
      if (c.idNumber?.trim()) {
        const saIdPattern = /^[0-9]{13}$/;
        const passportPattern = /^[A-Z0-9]{6,9}$/;
        if (!saIdPattern.test(c.idNumber) && !passportPattern.test(c.idNumber)) {
          idValidationErrors.push(`Contributor ${i+1}: Invalid ID format (SA ID: 13 digits, Passport: 6-9 chars)`);
        }
      }
    });
    
    if (idValidationErrors.length > 0) {
      return res.status(400).json({ 
        success: false, 
        message: `ID validation failed: ${idValidationErrors.join(', ')}` 
      });
    }
    
    const splitsheetData = {
      contributors,
      track_metadata,
      user_id,
      total_percentage: totalPercentage,
      created_at: new Date().toISOString(),
      flow_type: 'enhanced_radio'
    };
    
    // Store in Supabase if available
    if (supabaseClient) {
      try {
        const { getClient } = require('./services/supabaseClient');
        const sb = getClient();
        if (sb) {
          const { error } = await sb
            .from('radio_splitsheets')
            .insert(splitsheetData);
          if (error) throw error;
        }
      } catch (dbError) {
        console.warn('Splitsheet database storage failed:', dbError);
      }
    }
    
    res.json({ 
      success: true, 
      splitsheet_id: `splitsheet_${Date.now()}`,
      data: splitsheetData
    });
  } catch (error) {
    console.error('Splitsheet processing error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/enhanced-radio/samro', async (req, res) => {
  try {
    const { contributors, track_metadata, samro_member_number, user_id } = req.body;
    
    if (!contributors || !track_metadata) {
      return res.status(400).json({ 
        success: false, 
        message: 'contributors and track_metadata required' 
      });
    }
    
    const samroData = {
      contributors,
      track_metadata,
      samro_member_number: samro_member_number || null,
      user_id,
      document_generated: true,
      created_at: new Date().toISOString(),
      flow_type: 'enhanced_radio'
    };
    
    // Store in Supabase if available
    if (supabaseClient) {
      try {
        const { getClient } = require('./services/supabaseClient');
        const sb = getClient();
        if (sb) {
          const { error } = await sb
            .from('radio_samro_documents')
            .insert(samroData);
          if (error) throw error;
        }
      } catch (dbError) {
        console.warn('SAMRO database storage failed:', dbError);
      }
    }
    
    res.json({ 
      success: true, 
      samro_id: `samro_${Date.now()}`,
      data: samroData,
      pdf_generated: true
    });
  } catch (error) {
    console.error('SAMRO processing error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/enhanced-radio/package', async (req, res) => {
  try {
    const { 
      track_metadata, 
      splitsheets, 
      samro_data, 
      isrc_data, 
      user_id,
      package_components 
    } = req.body;
    
    if (!track_metadata) {
      return res.status(400).json({ 
        success: false, 
        message: 'track_metadata required' 
      });
    }
    
    const packageData = {
      track_metadata,
      splitsheets: splitsheets || null,
      samro_data: samro_data || null,
      isrc_data: isrc_data || null,
      user_id,
      package_components: package_components || [],
      has_enhanced_components: !!(splitsheets || samro_data),
      created_at: new Date().toISOString(),
      flow_type: 'enhanced_radio',
      package_id: `radio_package_${Date.now()}`
    };
    
    // Store in Supabase if available
    if (supabaseClient) {
      try {
        const { getClient } = require('./services/supabaseClient');
        const sb = getClient();
        if (sb) {
          const { error } = await sb
            .from('radio_packages')
            .insert(packageData);
          if (error) throw error;
        }
      } catch (dbError) {
        console.warn('Package database storage failed:', dbError);
      }
    }
    
    res.json({ 
      success: true, 
      package_id: packageData.package_id,
      data: packageData,
      enhanced: packageData.has_enhanced_components
    });
  } catch (error) {
    console.error('Package processing error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Enhanced revenue tracking for new placements
app.post('/api/campaigns/track-enhanced-revenue', async (req, res) => {
  try {
    const { type, amount, metadata } = req.body;
    
    if (!type || !amount) {
      return res.status(400).json({ 
        success: false, 
        message: 'type and amount required' 
      });
    }
    
    const revenueData = {
      type,
      amount: parseFloat(amount),
      metadata: metadata || {},
      timestamp: new Date().toISOString(),
      flow_type: metadata?.flow_type || 'enhanced_radio'
    };
    
    // Store in Supabase if available
    if (supabaseClient) {
      try {
        const { getClient } = require('./services/supabaseClient');
        const sb = getClient();
        if (sb) {
          const { error } = await sb
            .from('enhanced_revenue_tracking')
            .insert(revenueData);
          if (error) throw error;
        }
      } catch (dbError) {
        console.warn('Revenue tracking database storage failed:', dbError);
      }
    }
    
    res.json({ 
      success: true, 
      revenue_id: `revenue_${Date.now()}`,
      data: revenueData
    });
  } catch (error) {
    console.error('Enhanced revenue tracking error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
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

// Load RBAC routes
try {
  const rbacRoutes = require('./routes/rbac');
  app.use('/api/rbac', rbacRoutes);
  console.log('✅ RBAC routes loaded');
} catch (e) {
  console.log('ℹ️ RBAC routes not found');
}

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
