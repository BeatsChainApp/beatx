const express = require('express');
const router = express.Router();
const Livepeer = require('../services/livepeerAdapter');
const Store = require('../services/livepeerStore');
const IpfsPinner = require('../services/ipfsPinner');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const fs = require('fs');

// TUS client with error handling
let tus = null;
try {
  tus = require('tus-js-client');
  console.log('✅ TUS client available for Livepeer uploads');
} catch (e) {
  console.warn('⚠️ TUS client not available:', e.message);
}

const fetch = require('cross-fetch');

// POST /api/livepeer/upload
// body: { ipfsCid, name, metadata }
router.post('/livepeer/upload', async (req, res) => {
  try {
    const { ipfsCid, name, metadata } = req.body || {};
    
    // Validate input
    if (!name && !ipfsCid) {
      return res.status(400).json({ 
        success: false, 
        message: 'name or ipfsCid required' 
      });
    }

    const assetName = name || `beats-${Date.now()}`;
    console.log('Creating Livepeer asset:', assetName);
    
    const asset = await Livepeer.createAsset(assetName, { metadata });
    
    const record = {
      assetId: asset.id || asset.asset?.id || `mock-${Date.now()}`,
      name: assetName,
      ipfsCid: ipfsCid || null,
      createdAt: Date.now(),
      uploadUrl: asset.uploadUrl || asset.tusEndpoint,
      asset,
      mocked: asset.mocked || false
    };

    // Save to store with error handling
    try {
      await Store.saveAsset(record);
    } catch (storeError) {
      console.warn('Asset store save failed:', storeError.message);
      // Continue without failing the request
    }

    res.json({ success: true, asset: record });
  } catch (err) {
    console.error('livepeer upload error', err);
    // Return graceful error instead of 500
    res.json({ 
      success: false, 
      message: err.message,
      fallback: true,
      asset: {
        assetId: `error-${Date.now()}`,
        name: req.body?.name || 'error-asset',
        error: err.message,
        mocked: true
      }
    });
  }
});

// POST /api/livepeer/upload-file
// Accepts multipart form with `file` field. Server uploads file to Livepeer via tus.
router.post('/livepeer/upload-file', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        message: 'file required' 
      });
    }

    const name = req.body.name || req.file.originalname;
    console.log('Uploading file to Livepeer:', name);

    // Create asset in Livepeer (adapter will return mock if no key)
    const asset = await Livepeer.createAsset(name, { 
      metadata: req.body.metadata ? JSON.parse(req.body.metadata) : {} 
    });

    // If mocked, just save local mapping and return
    if (asset.mocked) {
      const record = {
        assetId: asset.id,
        name,
        path: req.file.path,
        size: req.file.size,
        createdAt: Date.now(),
        asset,
        mocked: true
      };
      
      try {
        await Store.saveAsset(record);
      } catch (storeError) {
        console.warn('Mock asset store failed:', storeError.message);
      }
      
      return res.json({ success: true, asset: record });
    }

    // Get TUS upload URL
    const uploadUrl = asset.uploadUrl || asset.tusEndpoint || asset.url;
    if (!uploadUrl) {
      console.warn('No upload URL provided by Livepeer');
      const record = { 
        assetId: asset.id || asset.asset?.id, 
        name, 
        createdAt: Date.now(), 
        asset,
        warning: 'No upload URL available'
      };
      
      try {
        await Store.saveAsset(record);
      } catch (storeError) {
        console.warn('Asset store failed:', storeError.message);
      }
      
      return res.json({ success: true, asset: record, warning: 'Upload URL not available' });
    }

    // Check if TUS client is available
    if (!tus) {
      console.warn('TUS client not available - saving asset without upload');
      const record = {
        assetId: asset.id || asset.asset?.id,
        name,
        path: req.file.path,
        size: req.file.size,
        createdAt: Date.now(),
        asset,
        warning: 'TUS upload not available'
      };
      
      try {
        await Store.saveAsset(record);
      } catch (storeError) {
        console.warn('Asset store failed:', storeError.message);
      }
      
      return res.json({ success: true, asset: record, warning: 'TUS client not available' });
    }

    // Perform TUS upload in background and return started response.
    // We attempt to read the file size from disk to pass to tus client.
    let uploadCompleted = false;
    try {
      const stats = fs.statSync(req.file.path);
      const fileStream = fs.createReadStream(req.file.path);

      const tusUpload = new tus.Upload(fileStream, {
        endpoint: uploadUrl,
        metadata: {
          filename: req.file.originalname,
          filetype: req.file.mimetype
        },
        uploadSize: stats.size,
        retryDelays: [0, 1000, 3000, 5000],
        onError: function(error) {
          console.error('TUS upload failed:', error);
          uploadCompleted = true;
          // mark store
          (async () => {
            try {
              await Store.updateAsset(asset.id || asset.asset?.id || asset.id, { status: 'upload_failed', error: String(error) });
            } catch (uErr) { console.warn('Failed to mark asset upload_failed:', uErr?.message); }
            try { fs.unlinkSync(req.file.path); } catch (e) { /* ignore */ }
          })();
        },
        onProgress: function(bytesUploaded, bytesTotal) {
          const percent = ((bytesUploaded / bytesTotal) * 100).toFixed(2);
          console.log('Upload progress:', percent + '%');
        },
        onSuccess: async function() {
          console.log('TUS upload completed successfully');
          uploadCompleted = true;
          try {
            const record = { 
              assetId: asset.id || asset.asset?.id, 
              name, 
              uploadedAt: Date.now(), 
              asset,
              status: 'uploaded'
            };
            await Store.saveAsset(record);

            // Attempt to remove temp file
            try { fs.unlinkSync(req.file.path); } catch (e) { /* ignore */ }

            // Poll Livepeer for asset readiness for a short period
            (async function pollAssetReady(attempts = 0) {
              try {
                const lp = require('../services/livepeerAdapter');
                const assetId = asset.id || asset.asset?.id || (record.asset && (record.asset.id || record.asset._id));
                const info = await lp.getAsset(assetId);
                if (info && (info.status === 'ready' || info.status === 'ready' || info?.asset?.status === 'ready')) {
                  // Update store with playback info
                  const playback = info.playbackId || info.playback_id || info.asset?.playbackId || info.asset?.playback_id || info.playbackUrl || info.asset?.playbackUrl;
                  await Store.updateAsset(assetId, { status: 'ready', playbackId: playback, lastWebhook: info });

                  // Log success to Supabase success table if available
                  try {
                    const { getClient } = require('../services/supabaseClient');
                    const sb = getClient();
                    if (sb) {
                      await sb.from('success').insert([{ event: 'livepeer_asset_ready', status: 'processed', metadata: { assetId, playback }, details: { info } }]);
                    }
                  } catch (logErr) {
                    console.warn('Success logging failed:', logErr.message);
                  }
                  return;
                }
              } catch (err) {
                // ignore and retry
              }
              if (attempts < 6) setTimeout(() => pollAssetReady(attempts + 1), 5000);
            })();

          } catch (err) {
            console.warn('Saving asset record failed after upload:', err.message);
          }
        }
      });

      // Start upload asynchronously (don't block response)
      try {
        tusUpload.start();
      } catch (startErr) {
        console.error('Failed to start TUS upload:', startErr);
      }

    } catch (statErr) {
      console.warn('Failed to stat uploaded file for TUS:', statErr.message);
      // Save record as warning and return
      try {
        await Store.saveAsset({ assetId: asset.id || asset.asset?.id, name, path: req.file.path, size: req.file.size, createdAt: Date.now(), asset, warning: 'stat_failed' });
      } catch (e) { /* ignore */ }
    }

    res.json({ 
      success: true, 
      started: true, 
      asset: {
        assetId: asset.id || asset.asset?.id,
        name,
        uploadUrl,
        status: 'uploading'
      }
    });
    
  } catch (err) {
    console.error('upload-file error', err);
    // Graceful error handling
    res.json({ 
      success: false, 
      message: err.message,
      fallback: true,
      asset: {
        assetId: `upload-error-${Date.now()}`,
        name: req.file?.originalname || 'unknown',
        error: err.message
      }
    });
  }
});

// POST /api/livepeer/webhook - Enhanced webhook with real-time sync
router.post('/livepeer/webhook', async (req, res) => {
  try {
    const payload = req.body || {};
    console.log('Livepeer webhook received:', payload);
    
    // Use enhanced webhook handler from adapter
    const result = await Livepeer.handleWebhook(payload);
    
    // Update local store for backward compatibility
    const assetId = payload.id || (payload.asset && (payload.asset.id || payload.asset._id));
    if (assetId) {
      const patch = { 
        lastWebhook: payload, 
        updatedAt: Date.now(),
        status: payload.asset?.status || 'processing'
      };
      await Store.updateAsset(assetId, patch);
    }
    
    // Log to success table if available
    try {
      const { getClient } = require('../services/supabaseClient');
      const sb = getClient();
      if (sb) {
        const insert = {
          event: 'livepeer_webhook',
          status: 'processed',
          metadata: { assetId, event: payload.event },
          details: { webhook: payload, result }
        };
        sb.from('success').insert([insert]).then(() => {}).catch(err => 
          console.warn('Success logging failed:', err?.message)
        );
      }
    } catch (logError) {
      console.warn('Success logging failed:', logError.message);
    }
    
    res.json(result);
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/livepeer/assets
router.get('/livepeer/assets', async (req, res) => {
  try {
    const list = await Store.listAssets();
    res.json({ success: true, assets: list });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;

