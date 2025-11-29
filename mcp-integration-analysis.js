#!/usr/bin/env node

/**
 * MCP Integration Analysis - Compare Full vs Standalone
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 MCP Integration Analysis');
console.log('===========================\n');

const fullMCP = '/workspaces/beatx/packages/mcp-server/src';
const standaloneMCP = '/workspaces/beatx/mcp-server-standalone';

// Analyze full MCP server
console.log('📊 FULL MCP SERVER (/packages/mcp-server/src):');

const routes = fs.readdirSync(path.join(fullMCP, 'routes'));
console.log(`\n🔗 Routes (${routes.length}):`);
routes.forEach(route => console.log(`   - ${route}`));

const services = fs.readdirSync(path.join(fullMCP, 'services'));
console.log(`\n⚙️ Services (${services.length}):`);
services.forEach(service => console.log(`   - ${service}`));

// Check key integrations
const keyIntegrations = [
  'ipfsPinner.js',
  'supabaseClient.js', 
  'livepeerAdapter.js',
  'thirdwebAdapter.js',
  'analyticsEngine.js'
];

console.log('\n🎯 KEY INTEGRATIONS STATUS:');
keyIntegrations.forEach(integration => {
  const exists = fs.existsSync(path.join(fullMCP, 'services', integration));
  console.log(`   ${exists ? '✅' : '❌'} ${integration}`);
});

// Analyze standalone
console.log('\n📦 STANDALONE MCP SERVER (/mcp-server-standalone):');
const standaloneFiles = fs.readdirSync(standaloneMCP);
console.log('Files:', standaloneFiles.join(', '));

// Read standalone endpoints
const standaloneCode = fs.readFileSync(path.join(standaloneMCP, 'index.js'), 'utf8');
const endpoints = standaloneCode.match(/app\.(get|post)\('([^']+)'/g) || [];
console.log(`\n🔗 Standalone Endpoints (${endpoints.length}):`);
endpoints.forEach(endpoint => {
  const match = endpoint.match(/app\.(get|post)\('([^']+)'/);
  if (match) console.log(`   - ${match[1].toUpperCase()} ${match[2]}`);
});

console.log('\n⚠️ MISSING IN STANDALONE:');
console.log('   - Real IPFS integration (ipfsPinner.js)');
console.log('   - Supabase database (supabaseClient.js)');
console.log('   - Livepeer video processing (livepeerAdapter.js)');
console.log('   - Thirdweb gasless minting (thirdwebAdapter.js)');
console.log('   - Analytics engine (analyticsEngine.js)');
console.log('   - 16 route files with full functionality');
console.log('   - 19 service files with integrations');

console.log('\n💡 RECOMMENDATION:');
console.log('Use standalone for Railway deployment success, then enhance with integrations');

const analysis = {
  timestamp: new Date().toISOString(),
  full_mcp: {
    location: fullMCP,
    routes: routes.length,
    services: services.length,
    integrations: keyIntegrations.length
  },
  standalone_mcp: {
    location: standaloneMCP,
    files: standaloneFiles.length,
    endpoints: endpoints.length,
    integrations: 'mock_only'
  },
  missing_in_standalone: [
    'Real IPFS integration',
    'Supabase database',
    'Livepeer video processing', 
    'Thirdweb gasless minting',
    'Analytics engine',
    '16 route files',
    '19 service files'
  ],
  recommendation: 'Deploy standalone first, then migrate integrations'
};

fs.writeFileSync('/workspaces/beatx/mcp-integration-analysis.json', JSON.stringify(analysis, null, 2));
console.log('\n📄 Analysis saved: mcp-integration-analysis.json');