const fetch = global.fetch || require('node-fetch');
const LIVEPEER_API_KEY = process.env.LIVEPEER_API_KEY;
const LIVEPEER_API_BASE = process.env.LIVEPEER_API_BASE || process.env.LIVEPEER_API_HOST || 'https://livepeer.studio/api';

// Validate TUS client availability
let tusClient = null;
try {
  tusClient = require('tus-js-client');
  console.log('✅ TUS client available for Livepeer uploads');
} catch (e) {
  console.warn('⚠️ TUS client not available:', e.message);
}

async function createAsset(name = 'beatschain-asset', options = {}) {
  // Default to mocking when no key is provided (safe for local dev)
  if (!LIVEPEER_API_KEY) {
    console.log('⚠️ Livepeer API key not configured - using mock mode');
    return {
      id: `mock-${Date.now()}`,
      name,
      status: 'created',
      uploadUrl: `https://mock-tus-endpoint.com/files/`,
      mocked: true,
      createdAt: Date.now()
    };
  }

  try {
    // Build request for Livepeer asset creation with TUS upload
    const url = `${LIVEPEER_API_BASE.replace(/\/$/, '')}/asset/request-upload`;
    const body = {
      name,
      staticMp4: true,
      playbackPolicy: { type: 'public' },
      profiles: [
        { name: '720p', bitrate: 2000000, fps: 30, width: 1280, height: 720 },
        { name: '480p', bitrate: 1000000, fps: 30, width: 854, height: 480 }
      ],
      ...options
    };

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${LIVEPEER_API_KEY}`
      },
      body: JSON.stringify(body)
    });

    if (!res.ok) {
      const text = await res.text();
      console.error('Livepeer API error:', res.status, text);
      throw new Error(`Livepeer createAsset failed: ${res.status} ${text}`);
    }

    const data = await res.json();
    console.log('✅ Livepeer asset created:', data.asset?.id);

    // Normalize upload URL for TUS
    const uploadUrl = data?.tusEndpoint || data?.url || data?.asset?.uploadUrl;
    if (uploadUrl) {
      data.uploadUrl = uploadUrl;
      data.asset = data.asset || {};
      data.asset.uploadUrl = uploadUrl;
    }

    return data;
  } catch (error) {
    console.error('Livepeer createAsset error:', error.message);
    throw error;
  }
}

async function getAsset(assetId) {
  if (!LIVEPEER_API_KEY) {
    return {
      id: assetId,
      status: 'ready',
      playbackUrl: `https://mock-playback.com/${assetId}.m3u8`,
      mocked: true
    };
  }

  try {
    const url = `${LIVEPEER_API_BASE.replace(/\/$/, '')}/asset/${assetId}`;
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${LIVEPEER_API_KEY}`
      }
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Livepeer getAsset failed: ${res.status} ${text}`);
    }

    return await res.json();
  } catch (error) {
    console.error('Livepeer getAsset error:', error.message);
    throw error;
  }
}

async function handleWebhook(payload) {
  try {
    if (payload.event === 'asset.ready' && payload.asset) {
      const asset = payload.asset;
      
      // Sync with real-time service if available
      try {
        const realTimeSync = require('./realTimeSync');
        await realTimeSync.syncBeatData({
          livepeerAssetId: asset.id,
          playbackUrl: asset.playbackUrl,
          status: 'ready',
          duration: asset.duration
        });
      } catch (syncError) {
        console.warn('Real-time sync not available:', syncError.message);
      }
      
      console.log(`Asset ${asset.id} processed successfully`);
      return { success: true, assetId: asset.id };
    }
    
    return { success: true, message: 'Webhook processed' };
  } catch (error) {
    console.error('Webhook processing failed:', error);
    throw error;
  }
}

module.exports = {
  createAsset,
  getAsset,
  handleWebhook
};
