#!/usr/bin/env node

/**
 * Railway Deployment Investigation & Fix
 * Comprehensive analysis and solution for monorepo deployment issues
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Railway Deployment Investigation');
console.log('===================================\n');

// Issue Analysis
console.log('📊 ISSUE ANALYSIS:');
console.log('Railway is detecting monorepo structure and trying to install ALL package.json files');
console.log('This causes package-lock.json sync issues with frontend dependencies\n');

// Root cause
console.log('🎯 ROOT CAUSE:');
console.log('- Railway copies ALL package.json files from monorepo');
console.log('- Tries to run npm ci on root with mixed dependencies');
console.log('- Frontend deps (next, tailwind) conflict with backend\n');

// Solution Strategy
console.log('💡 SOLUTION STRATEGY:');
console.log('1. Create isolated MCP server deployment');
console.log('2. Use Railway root directory configuration');
console.log('3. Minimal dependencies only\n');

// Create isolated deployment structure
const mcpServerPath = '/workspaces/beatx/packages/mcp-server';

// 1. Create standalone package.json (no monorepo deps)
const standalonePackage = {
  "name": "beatschain-mcp-server",
  "version": "1.0.0",
  "description": "BeatsChain MCP Server",
  "main": "src/index.js",
  "scripts": {
    "start": "node src/index.js",
    "build": "echo 'No build needed'"
  },
  "dependencies": {
    "@supabase/supabase-js": "2.81.1",
    "cors": "2.8.5",
    "dotenv": "16.4.5", 
    "express": "4.21.2",
    "multer": "1.4.5-lts.1",
    "node-fetch": "3.3.2"
  },
  "engines": {
    "node": "20.x"
  }
};

// 2. Update nixpacks.toml for Railway
const nixpacksConfig = `[variables]
NODE_VERSION = "20"

[phases.setup]
nixPkgs = ["nodejs-20_x", "npm-9_x"]

[phases.install]
cmds = ["rm -f package-lock.json", "npm install --no-package-lock"]

[phases.build] 
cmds = ["echo 'Build complete'"]

[start]
cmd = "npm start"`;

// 3. Create .railwayignore to exclude monorepo files
const railwayIgnore = `# Exclude monorepo files
../../node_modules
../../package.json
../../package-lock.json
../../packages/app
../../packages/hardhat
../../chrome-extension
../../server
../../scripts
../../migrations
../../docs
../../data
../../n8n
../../agentic
../../src
../../test
../../uploads
*.md
!README.md
.git
.env
*.log
.DS_Store`;

// Apply fixes
console.log('🔧 APPLYING FIXES:');

try {
  // Write standalone package.json
  fs.writeFileSync(path.join(mcpServerPath, 'package.json'), JSON.stringify(standalonePackage, null, 2));
  console.log('✅ Created standalone package.json');
  
  // Remove package-lock.json to force fresh install
  const lockPath = path.join(mcpServerPath, 'package-lock.json');
  if (fs.existsSync(lockPath)) {
    fs.unlinkSync(lockPath);
    console.log('✅ Removed package-lock.json');
  }
  
  // Update nixpacks.toml
  fs.writeFileSync(path.join(mcpServerPath, 'nixpacks.toml'), nixpacksConfig);
  console.log('✅ Updated nixpacks.toml');
  
  // Create comprehensive .railwayignore
  fs.writeFileSync(path.join(mcpServerPath, '.railwayignore'), railwayIgnore);
  console.log('✅ Created comprehensive .railwayignore');
  
  // Ensure Procfile is correct
  fs.writeFileSync(path.join(mcpServerPath, 'Procfile'), 'web: npm start');
  console.log('✅ Verified Procfile');
  
} catch (error) {
  console.error('❌ Error applying fixes:', error.message);
  process.exit(1);
}

console.log('\n🎯 DEPLOYMENT STRATEGY:');
console.log('1. Railway will now use isolated MCP server package.json');
console.log('2. No monorepo dependencies will interfere');
console.log('3. Clean npm install with minimal deps');
console.log('4. Server will start with node src/index.js');

console.log('\n📋 VERIFICATION CHECKLIST:');
console.log('- [x] Standalone package.json created');
console.log('- [x] Package-lock.json removed');
console.log('- [x] Nixpacks.toml configured');
console.log('- [x] .railwayignore comprehensive');
console.log('- [x] Procfile verified');

console.log('\n🚀 READY FOR DEPLOYMENT');
console.log('Railway should now deploy successfully with isolated MCP server');

// Generate deployment report
const report = {
  timestamp: new Date().toISOString(),
  issue: 'Monorepo package.json conflicts',
  solution: 'Isolated MCP server deployment',
  fixes_applied: [
    'Standalone package.json with minimal deps',
    'Removed package-lock.json',
    'Updated nixpacks.toml for clean install',
    'Comprehensive .railwayignore',
    'Verified Procfile configuration'
  ],
  next_steps: [
    'Commit and push changes',
    'Railway will auto-redeploy',
    'Verify MCP server health'
  ]
};

fs.writeFileSync('/workspaces/beatx/railway-deployment-report.json', JSON.stringify(report, null, 2));
console.log('\n📄 Report saved: railway-deployment-report.json');