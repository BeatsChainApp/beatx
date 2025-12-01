# 🚀 Metadata Pipeline Implementation Plan

## 🎯 Phase 1: Critical Fixes (IMMEDIATE - 2 hours)

### **1.1 Fix EnhancedBeatUpload Component**
```typescript
// Location: packages/app/src/components/EnhancedBeatUpload.tsx
// Add missing professional metadata fields

const professionalFields = {
  // Basic Info
  album: '',
  releaseYear: new Date().getFullYear(),
  recordLabel: '',
  
  // Musical Properties  
  mood: 'neutral',
  energy: 5,
  timeSignature: '4/4',
  
  // Technical
  duration: 0, // Auto-extracted
  language: 'en',
  explicit: false,
  
  // Rights & Credits
  producer: '',
  mixer: '',
  copyrightHolder: '',
  featuredArtists: [],
  
  // Description & Tags
  description: '',
  tags: []
}
```

### **1.2 Add MCP Server Upload Status Endpoint**
```javascript
// Location: packages/mcp-server/src/index.js
// The endpoint exists but needs debugging

// Fix: Add proper error handling and response format
app.get('/api/upload/status', async (req, res) => {
  try {
    const status = {
      ipfs: { available: !!IpfsPinner },
      livepeer: { available: !!process.env.LIVEPEER_API_KEY },
      supabase: { available: !!supabaseClient },
      platforms: { extension: 'ready', app: 'ready' }
    }
    res.json({ success: true, status, timestamp: Date.now() })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
})
```

### **1.3 Fix Supabase Configuration**
```bash
# Add missing environment variables to Railway deployment
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## 🎵 Phase 2: Enhanced Metadata Processing (4 hours)

### **2.1 Create Metadata Extraction Service**
```javascript
// Location: packages/mcp-server/src/services/metadataExtractor.js

class MetadataExtractor {
  async extractFromAudio(filePath) {
    // Use node-ffprobe or similar to extract:
    return {
      duration: seconds,
      bitRate: kbps,
      sampleRate: hz,
      format: 'mp3|wav|m4a',
      bpm: detected_bpm, // Using aubio or similar
      key: detected_key,
      loudness: lufs_value
    }
  }
  
  async enhanceWithAI(basicMetadata) {
    // AI-powered metadata enhancement
    return {
      mood: 'energetic|calm|dark|uplifting',
      energy: 1-10,
      danceability: 0-1,
      valence: 0-1,
      genre_confidence: 0-1
    }
  }
}
```

### **2.2 Add Metadata Validation Route**
```javascript
// Location: packages/mcp-server/src/routes/metadata.js

router.post('/metadata/validate', async (req, res) => {
  const { metadata } = req.body
  
  const validation = {
    required_fields: validateRequired(metadata),
    format_compliance: validateFormats(metadata),
    distribution_ready: checkDistributionReadiness(metadata),
    rights_cleared: verifyRights(metadata)
  }
  
  res.json({ success: true, validation })
})
```

### **2.3 Enhanced Upload Processing**
```javascript
// Update: packages/mcp-server/src/index.js upload endpoint

app.post('/api/upload', upload.single('file'), async (req, res) => {
  try {
    // 1. Extract technical metadata
    const extractedMeta = await metadataExtractor.extractFromAudio(req.file.path)
    
    // 2. Merge with user metadata
    const completeMeta = {
      ...JSON.parse(req.body.metadata || '{}'),
      ...extractedMeta,
      platform: req.body.platform || 'app'
    }
    
    // 3. Validate metadata
    const validation = await validateMetadata(completeMeta)
    
    // 4. Upload to IPFS
    const ipfsResult = await pinner.pinFile(req.file.path, req.file.originalname)
    
    // 5. Store in Supabase with complete metadata
    await supabaseClient.from('beats').insert({
      title: completeMeta.title,
      artist: completeMeta.artist,
      album: completeMeta.album,
      release_year: completeMeta.releaseYear,
      genre: completeMeta.genre,
      bpm: completeMeta.bpm,
      key: completeMeta.key,
      mood: completeMeta.mood,
      energy_level: completeMeta.energy,
      duration_seconds: completeMeta.duration,
      ipfs_hash: ipfsResult.cid,
      metadata_complete: validation.complete,
      platform: completeMeta.platform
    })
    
    res.json({ success: true, metadata: completeMeta, validation })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
})
```

## 🎬 Phase 3: Streaming Enhancement (6 hours)

### **3.1 Fix Livepeer TUS Integration**
```javascript
// Location: packages/mcp-server/src/routes/livepeer.js
// Install missing dependencies first:

// npm install tus-js-client@3.1.1 cross-fetch@4.0.0

const tus = require('tus-js-client')
const fetch = require('cross-fetch')

// Fix TUS upload implementation with proper error handling
```

### **3.2 Add Streaming Manager Integration**
```javascript
// Location: packages/mcp-server/src/services/streamingManager.js
// Already exists but needs integration with upload pipeline

// Add to upload route:
const streamingManager = new StreamingManager()
const uploadSession = await streamingManager.initializeUpload(userId, fileInfo)
```

### **3.3 Enhanced Playback Capabilities**
```typescript
// Location: packages/app/src/components/AudioPlayer.tsx

interface PlaybackCapabilities {
  adaptiveBitrate: boolean
  offlinePlayback: boolean
  crossfade: boolean
  waveformVisualization: boolean
  realtimeAnalytics: boolean
}

const audioPlayer = {
  // Priority: Livepeer HLS → IPFS MP3 → Sanity fallback
  sources: [
    { type: 'hls', url: livepeerHLS, quality: 'adaptive' },
    { type: 'mp3', url: ipfsURL, quality: 'original' },
    { type: 'mp3', url: sanityFallback, quality: 'compressed' }
  ]
}
```

## 🗄️ Phase 4: Database Schema Enhancement (3 hours)

### **4.1 Supabase Schema Updates**
```sql
-- Location: packages/mcp-server/migrations/006_enhanced_metadata.sql

-- Add missing columns to beats table
ALTER TABLE beats ADD COLUMN IF NOT EXISTS album VARCHAR(255);
ALTER TABLE beats ADD COLUMN IF NOT EXISTS release_year INTEGER;
ALTER TABLE beats ADD COLUMN IF NOT EXISTS record_label VARCHAR(255);
ALTER TABLE beats ADD COLUMN IF NOT EXISTS duration_seconds INTEGER;
ALTER TABLE beats ADD COLUMN IF NOT EXISTS mood VARCHAR(100);
ALTER TABLE beats ADD COLUMN IF NOT EXISTS energy_level INTEGER CHECK (energy_level BETWEEN 1 AND 10);
ALTER TABLE beats ADD COLUMN IF NOT EXISTS explicit BOOLEAN DEFAULT FALSE;
ALTER TABLE beats ADD COLUMN IF NOT EXISTS language VARCHAR(10) DEFAULT 'en';
ALTER TABLE beats ADD COLUMN IF NOT EXISTS isrc VARCHAR(50);
ALTER TABLE beats ADD COLUMN IF NOT EXISTS upc VARCHAR(50);
ALTER TABLE beats ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE beats ADD COLUMN IF NOT EXISTS tags TEXT[];

-- Create royalty splits table
CREATE TABLE IF NOT EXISTS beat_splits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  beat_id UUID NOT NULL REFERENCES beats(id) ON DELETE CASCADE,
  contributor_name VARCHAR(255) NOT NULL,
  contributor_role VARCHAR(100) NOT NULL,
  percentage DECIMAL(5,2) NOT NULL CHECK (percentage >= 0 AND percentage <= 100),
  split_type VARCHAR(50) NOT NULL CHECK (split_type IN ('composition', 'master', 'publishing')),
  samro_number VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create production credits table
CREATE TABLE IF NOT EXISTS beat_credits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  beat_id UUID NOT NULL REFERENCES beats(id) ON DELETE CASCADE,
  credit_type VARCHAR(100) NOT NULL,
  credit_name VARCHAR(255) NOT NULL,
  credit_role VARCHAR(100) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### **4.2 Enhanced Analytics Tables**
```sql
-- Real-time play analytics
CREATE TABLE IF NOT EXISTS beat_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  beat_id UUID NOT NULL REFERENCES beats(id) ON DELETE CASCADE,
  user_id UUID,
  play_duration INTEGER NOT NULL,
  completion_rate DECIMAL(5,2),
  source_platform VARCHAR(50),
  device_type VARCHAR(50),
  location_country VARCHAR(10),
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## 🔄 Phase 5: N8N Workflow Deployment (4 hours)

### **5.1 Metadata Enhancement Workflow**
```json
// Location: n8n/workflows/metadata-enhancement.json

{
  "name": "Metadata Enhancement Pipeline",
  "nodes": [
    {
      "name": "Upload Trigger",
      "type": "webhook",
      "parameters": { "path": "metadata-enhance" }
    },
    {
      "name": "Extract Audio Features",
      "type": "httpRequest",
      "parameters": {
        "url": "{{ $env.MCP_SERVER_URL }}/api/metadata/extract",
        "method": "POST"
      }
    },
    {
      "name": "AI Enhancement",
      "type": "httpRequest", 
      "parameters": {
        "url": "{{ $env.AI_SERVICE_URL }}/enhance-metadata",
        "method": "POST"
      }
    },
    {
      "name": "Store Enhanced Metadata",
      "type": "httpRequest",
      "parameters": {
        "url": "{{ $env.MCP_SERVER_URL }}/api/metadata/store",
        "method": "POST"
      }
    }
  ]
}
```

### **5.2 Rights Verification Workflow**
```json
// Location: n8n/workflows/rights-verification.json

{
  "name": "Rights Verification Pipeline",
  "nodes": [
    {
      "name": "Rights Check Trigger",
      "type": "webhook"
    },
    {
      "name": "SAMRO Lookup",
      "type": "httpRequest"
    },
    {
      "name": "Copyright Database Check",
      "type": "httpRequest"
    },
    {
      "name": "Generate Rights Report",
      "type": "code"
    }
  ]
}
```

## 📊 Phase 6: Testing & Validation (2 hours)

### **6.1 End-to-End Upload Testing**
```bash
# Test complete upload pipeline
curl -X POST https://beatschain-mcp-server-production.up.railway.app/api/upload \
  -F "file=@test-track.mp3" \
  -F "platform=app" \
  -F "metadata={
    \"title\": \"Test Track\",
    \"artist\": \"Test Artist\",
    \"album\": \"Test Album\",
    \"releaseYear\": 2024,
    \"genre\": \"Electronic\",
    \"bpm\": 128,
    \"mood\": \"energetic\",
    \"energy\": 8
  }"
```

### **6.2 Streaming Pipeline Testing**
```bash
# Test streaming capabilities
curl -X GET https://beatschain-mcp-server-production.up.railway.app/api/streaming/test-playback/BEAT_ID
```

### **6.3 Metadata Validation Testing**
```bash
# Test metadata validation
curl -X POST https://beatschain-mcp-server-production.up.railway.app/api/metadata/validate \
  -H "Content-Type: application/json" \
  -d '{"metadata": {"title": "Test", "artist": "Artist"}}'
```

## 🎯 Success Criteria

### **Metadata Completeness**
- [ ] All professional fields captured (20+ fields)
- [ ] Auto-extraction working (duration, BPM, key)
- [ ] AI enhancement functional (mood, energy)
- [ ] Validation pipeline operational

### **Streaming Performance**
- [ ] Livepeer TUS uploads working
- [ ] Adaptive bitrate streaming enabled
- [ ] Fallback system operational (IPFS → Sanity)
- [ ] Real-time analytics tracking

### **Database Integration**
- [ ] Enhanced schema deployed
- [ ] Royalty splits tracking
- [ ] Production credits system
- [ ] Analytics data collection

### **N8N Automation**
- [ ] Metadata enhancement workflow live
- [ ] Rights verification automation
- [ ] Campaign attribution working
- [ ] Revenue tracking operational

## 📈 Implementation Timeline

| Phase | Duration | Priority | Dependencies |
|-------|----------|----------|--------------|
| Phase 1 | 2 hours | CRITICAL | None |
| Phase 2 | 4 hours | HIGH | Phase 1 |
| Phase 3 | 6 hours | HIGH | Phase 1, 2 |
| Phase 4 | 3 hours | MEDIUM | Phase 1 |
| Phase 5 | 4 hours | MEDIUM | Phase 2, 4 |
| Phase 6 | 2 hours | HIGH | All phases |

**Total Estimated Time: 21 hours**
**Critical Path: Phases 1-3 (12 hours)**

---

**Status**: 🚀 **READY FOR IMPLEMENTATION**
**Next Action**: Begin Phase 1 - Critical Fixes