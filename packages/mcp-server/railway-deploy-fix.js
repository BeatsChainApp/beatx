#!/usr/bin/env node

/**
 * Railway Deployment Fix - Minimal MCP Server
 * Fixes monorepo deployment issues
 */

const fs = require('fs');
const path = require('path');

// Create minimal package.json for Railway
const minimalPackage = {
  "name": "beatschain-mcp-server",
  "version": "1.0.0",
  "main": "src/index.js",
  "scripts": {
    "start": "node src/index.js",
    "build": "echo 'No build needed'"
  },
  "dependencies": {
    "@supabase/supabase-js": "^2.81.1",
    "cors": "^2.8.5", 
    "dotenv": "^16.4.5",
    "express": "^4.21.2",
    "multer": "^1.4.5-lts.1",
    "node-fetch": "^3.3.2"
  },
  "engines": {
    "node": ">=20.0.0"
  }
};

// Write minimal package.json
fs.writeFileSync('package.json', JSON.stringify(minimalPackage, null, 2));

// Remove package-lock.json to force fresh install
if (fs.existsSync('package-lock.json')) {
  fs.unlinkSync('package-lock.json');
}

console.log('✅ Railway deployment fix applied');
console.log('📦 Minimal package.json created');
console.log('🔄 Ready for Railway deployment');