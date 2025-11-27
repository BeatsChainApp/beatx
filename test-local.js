#!/usr/bin/env node

// Quick local test to verify all imports work
console.log('🧪 Testing MCP Server imports...');

try {
  require('./src/index.js');
  console.log('✅ All imports successful - ready for deployment');
} catch (error) {
  console.error('❌ Import error:', error.message);
  process.exit(1);
}