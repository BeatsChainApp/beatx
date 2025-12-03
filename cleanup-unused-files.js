#!/usr/bin/env node

// Cleanup unused files to avoid conflicts
const fs = require('fs');
const path = require('path');

const filesToRemove = [
  // Duplicate or conflicting components
  'packages/app/src/components/EnhancedBeatManagement.tsx', // Using BeatManagementSystem instead
  
  // Old auth files (replaced by unified system)
  'packages/app/src/hooks/useWeb3Profile.ts', // Using useUnifiedProfile instead
  
  // Temporary files
  'packages/app/src/components/temp-*.tsx',
  'packages/app/src/hooks/temp-*.ts',
  
  // Test files that might conflict
  'packages/app/src/test-*.tsx',
  'packages/app/src/test-*.ts'
];

const directoriesToClean = [
  'packages/app/.next',
  'packages/app/node_modules/.cache',
  'node_modules/.cache'
];

console.log('🧹 Cleaning up unused files...');

// Remove specific files
filesToRemove.forEach(file => {
  const fullPath = path.join(__dirname, file);
  if (fs.existsSync(fullPath)) {
    try {
      fs.unlinkSync(fullPath);
      console.log(`✅ Removed: ${file}`);
    } catch (error) {
      console.warn(`⚠️ Could not remove ${file}:`, error.message);
    }
  }
});

// Clean directories
directoriesToClean.forEach(dir => {
  const fullPath = path.join(__dirname, dir);
  if (fs.existsSync(fullPath)) {
    try {
      fs.rmSync(fullPath, { recursive: true, force: true });
      console.log(`✅ Cleaned: ${dir}`);
    } catch (error) {
      console.warn(`⚠️ Could not clean ${dir}:`, error.message);
    }
  }
});

console.log('✅ Cleanup complete!');