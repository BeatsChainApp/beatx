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
const port = process.env.PORT || 4000;

console.log('=== MCP SERVER STANDALONE ===');
console.log('PORT:', port);
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('==============================');

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Root endpoint
app.get('/', (req, res) => {
  res.json({ 
    status: 'ok', 
    service: 'beatschain-mcp-server-standalone',
    port: port,
    timestamp: Date.now(),
    version: '1.0.0'
  });
});

// Health checks
app.get('/healthz', (req, res) => {
  res.json({ ok: true, ts: Date.now(), service: 'mcp-server', port: port });
});

app.get('/health', (req, res) => {
  res.json({ ok: true, ts: Date.now(), service: 'mcp-server', port: port });
});

// API index
app.get('/api', (req, res) => {
  res.json({
    success: true,
    service: 'beatschain-mcp-server-standalone',
    version: '1.0.0',
    endpoints: [
      'GET /healthz - Health check',
      'GET /health - Health check', 
      'POST /api/pin - IPFS pinning',
      'POST /api/isrc/generate - ISRC generation',
      'POST /api/samro/generate - SAMRO split sheets'
    ]
  });
});

// IPFS pinning (mock for standalone)
app.post('/api/pin', async (req, res) => {
  try {
    const payload = req.body;
    if (!payload) return res.status(400).json({ success: false, message: 'body required' });

    // Mock IPFS response
    const mockHash = 'QmMock' + Math.random().toString(36).substr(2, 9);
    res.json({ success: true, ipfs: { ipfsHash: mockHash } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ISRC generation (mock for standalone)
app.post('/api/isrc/generate', async (req, res) => {
  try {
    const { trackTitle, artistName } = req.body;
    
    const year = new Date().getFullYear().toString().slice(-2);
    const countryCode = 'ZA';
    const registrantCode = 'BTC';
    const designationCode = Math.floor(Math.random() * 99999).toString().padStart(5, '0');
    const isrcCode = `${countryCode}-${registrantCode}-${year}-${designationCode}`;

    res.json({
      success: true,
      isrc: isrcCode,
      breakdown: { countryCode, registrantCode, year, designationCode },
      note: 'Generated in standalone mode'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// SAMRO generation
app.post('/api/samro/generate', async (req, res) => {
  try {
    res.json({ 
      success: true, 
      message: 'SAMRO split sheet generation ready',
      data: req.body 
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/samro/fill', async (req, res) => {
  try {
    const { userData, contributors } = req.body;
    
    const instructions = {
      trackInfo: {
        title: userData?.trackTitle || 'Track Title',
        artist: userData?.artistName || 'Artist Name',
        isrc: userData?.isrc || 'ZA-BTC-25-XXXXX'
      },
      contributors: contributors || [],
      steps: [
        '1. Print the SAMRO Composer Split Confirmation PDF',
        '2. Fill in track title: ' + (userData?.trackTitle || '[Track Title]'),
        '3. Fill in artist name: ' + (userData?.artistName || '[Artist Name]'),
        '4. Add ISRC code: ' + (userData?.isrc || '[ISRC Code]'),
        '5. List all contributors with percentages',
        '6. Ensure percentages total 100%',
        '7. Sign and date the form',
        '8. Submit to SAMRO for processing'
      ]
    };
    
    res.json({ success: true, instructions });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Catch-all 404
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found',
    path: req.originalUrl,
    hint: 'Visit /api for available endpoints'
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ success: false, message: 'Server error' });
});

const server = app.listen(port, '0.0.0.0', () => {
  console.log('='.repeat(40));
  console.log(`✅ MCP Server STANDALONE Started`);
  console.log(`Port: ${port}`);
  console.log(`Health: http://0.0.0.0:${port}/healthz`);
  console.log('='.repeat(40));
});

server.on('error', (error) => {
  console.error('Server error:', error);
  process.exit(1);
});