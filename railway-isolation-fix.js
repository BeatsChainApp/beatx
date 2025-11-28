#!/usr/bin/env node

/**
 * Railway Isolation Fix - Complete MCP Server Isolation
 * Creates a completely isolated deployment structure
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 Railway Isolation Fix - Complete MCP Server Isolation');
console.log('========================================================\n');

const mcpPath = '/workspaces/beatx/packages/mcp-server';

// 1. Create Railway-specific package.json (no monorepo references)
const railwayPackage = {
  "name": "beatschain-mcp-server",
  "version": "1.0.0",
  "main": "src/index.js",
  "scripts": {
    "start": "node src/index.js"
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

// 2. Create Railway-specific .railwayignore (exclude everything else)
const railwayIgnore = `# Exclude entire monorepo except MCP server
/*
!/packages/
/packages/*
!/packages/mcp-server/
/packages/mcp-server/node_modules/
/packages/mcp-server/*.log
/packages/mcp-server/.env`;

// 3. Create Railway root directory configuration
const railwayToml = `[build]
builder = "nixpacks"

[deploy]
startCommand = "cd packages/mcp-server && npm start"
restartPolicyType = "ON_FAILURE"
restartPolicyMaxRetries = 10

[environments.production.variables]
NODE_ENV = "production"`;

// Apply fixes
console.log('🔧 Applying Railway isolation fixes...\n');

try {
  // Write Railway-specific package.json
  fs.writeFileSync(path.join(mcpPath, 'package.json'), JSON.stringify(railwayPackage, null, 2));
  console.log('✅ Created Railway-specific package.json');
  
  // Remove any existing lock files
  const lockFiles = ['package-lock.json', 'yarn.lock', 'pnpm-lock.yaml'];
  lockFiles.forEach(lockFile => {
    const lockPath = path.join(mcpPath, lockFile);
    if (fs.existsSync(lockPath)) {
      fs.unlinkSync(lockPath);
      console.log(`✅ Removed ${lockFile}`);
    }
  });
  
  // Create root-level .railwayignore
  fs.writeFileSync('/workspaces/beatx/.railwayignore', railwayIgnore);
  console.log('✅ Created root-level .railwayignore');
  
  // Create railway.toml for deployment config
  fs.writeFileSync('/workspaces/beatx/railway.toml', railwayToml);
  console.log('✅ Created railway.toml deployment config');
  
  // Update nixpacks.toml for clean install
  const nixpacks = `[variables]
NODE_VERSION = "20"

[phases.setup]
nixPkgs = ["nodejs-20_x", "npm-9_x"]

[phases.install]
cmds = [
  "cd packages/mcp-server",
  "rm -f package-lock.json",
  "npm install --no-package-lock --production"
]

[phases.build]
cmds = ["echo 'Build complete'"]

[start]
cmd = "cd packages/mcp-server && npm start"`;
  
  fs.writeFileSync(path.join(mcpPath, 'nixpacks.toml'), nixpacks);
  console.log('✅ Updated nixpacks.toml for isolated install');
  
} catch (error) {
  console.error('❌ Error applying fixes:', error.message);
  process.exit(1);
}

console.log('\n🎯 ISOLATION STRATEGY APPLIED:');
console.log('1. Railway-specific package.json (no monorepo deps)');
console.log('2. Root-level .railwayignore (exclude everything except MCP server)');
console.log('3. Railway.toml with proper start command');
console.log('4. Nixpacks.toml for isolated installation');

console.log('\n📋 DEPLOYMENT FLOW:');
console.log('1. Railway will only see MCP server directory');
console.log('2. Install will happen in packages/mcp-server/');
console.log('3. Start command: cd packages/mcp-server && npm start');
console.log('4. No monorepo interference');

console.log('\n🚀 READY FOR RAILWAY DEPLOYMENT');

// Generate final report
const report = {
  timestamp: new Date().toISOString(),
  strategy: 'Complete MCP Server Isolation',
  fixes: [
    'Railway-specific package.json (no monorepo deps)',
    'Root-level .railwayignore (exclude monorepo)',
    'Railway.toml deployment configuration',
    'Nixpacks.toml isolated installation',
    'Removed all lock files'
  ],
  deployment_flow: [
    'Railway sees only MCP server',
    'Installs in packages/mcp-server/',
    'Starts with: cd packages/mcp-server && npm start',
    'No monorepo conflicts'
  ]
};

fs.writeFileSync('/workspaces/beatx/railway-isolation-report.json', JSON.stringify(report, null, 2));
console.log('\n📄 Report saved: railway-isolation-report.json');