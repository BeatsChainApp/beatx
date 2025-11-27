#!/usr/bin/env node

const https = require('https');

const BASE_URL = 'https://beatschain-mcp-server-production.up.railway.app';

async function checkDeployment() {
  return new Promise((resolve, reject) => {
    const req = https.get(`${BASE_URL}/`, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const data = JSON.parse(body);
          resolve({
            status: res.statusCode,
            timestamp: data.timestamp,
            service: data.service,
            deployed: true
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            deployed: false,
            error: 'Invalid JSON response'
          });
        }
      });
    });
    
    req.on('error', (error) => {
      resolve({
        deployed: false,
        error: error.message
      });
    });
    
    req.setTimeout(5000, () => {
      req.destroy();
      resolve({
        deployed: false,
        error: 'Timeout'
      });
    });
  });
}

async function waitForDeployment(maxAttempts = 10) {
  console.log('🔍 Checking deployment status...');
  
  for (let i = 1; i <= maxAttempts; i++) {
    console.log(`Attempt ${i}/${maxAttempts}...`);
    
    const result = await checkDeployment();
    
    if (result.deployed && result.status === 200) {
      console.log('✅ Deployment successful!');
      console.log(`📊 Service: ${result.service}`);
      console.log(`⏰ Timestamp: ${result.timestamp}`);
      return true;
    }
    
    console.log(`❌ Not ready: ${result.error || 'Status ' + result.status}`);
    
    if (i < maxAttempts) {
      console.log('⏳ Waiting 10 seconds...');
      await new Promise(resolve => setTimeout(resolve, 10000));
    }
  }
  
  console.log('❌ Deployment check failed after maximum attempts');
  return false;
}

if (require.main === module) {
  waitForDeployment().then(success => {
    process.exit(success ? 0 : 1);
  });
}

module.exports = { checkDeployment, waitForDeployment };