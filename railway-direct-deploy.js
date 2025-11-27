// RAILWAY DIRECT DEPLOYMENT BYPASS
// This file forces Railway to recognize new deployment

const express = require('express');
const app = express();
const port = process.env.PORT || 4000;

console.log('🚨 RAILWAY DEPLOYMENT BYPASS ACTIVE');
console.log('Timestamp:', new Date().toISOString());
console.log('Port:', port);
console.log('Environment variables loaded:', Object.keys(process.env).length);

// Force Railway to see this is new code
app.get('/', (req, res) => {
  res.json({
    status: 'BYPASS DEPLOYMENT ACTIVE',
    timestamp: Date.now(),
    port: port,
    message: 'Railway using old code - this is new deployment'
  });
});

app.listen(port, () => {
  console.log(`🚨 BYPASS SERVER on port ${port}`);
});