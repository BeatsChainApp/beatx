/**
 * Create Chrome Web Store Compliant Extension ZIP
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('📦 Creating Chrome Web Store compliant extension ZIP...\n');

// Files to exclude from ZIP
const excludePatterns = [
    'node_modules',
    '.git',
    '.env',
    '*.log',
    '*.md',
    'create-webstore-zip.js',
    'smoke-test.js',
    'test-*',
    '*.zip',
    '.DS_Store',
    'Thumbs.db'
];

// Create exclusion string for zip command
const excludeArgs = excludePatterns.map(pattern => `--exclude="${pattern}"`).join(' ');

// Get version from manifest
const manifest = JSON.parse(fs.readFileSync('manifest.json', 'utf8'));
const version = manifest.version;
const zipName = `BeatsChain-Extension-v${version}-${new Date().toISOString().split('T')[0]}.zip`;

try {
    // Create ZIP with exclusions
    const zipCommand = `zip -r "../${zipName}" . ${excludeArgs}`;
    console.log('Creating ZIP file...');
    execSync(zipCommand, { stdio: 'inherit' });
    
    // Verify ZIP contents
    console.log('\n📋 ZIP Contents:');
    execSync(`unzip -l "../${zipName}"`, { stdio: 'inherit' });
    
    // Get ZIP size
    const zipStats = fs.statSync(`../${zipName}`);
    const zipSizeMB = (zipStats.size / (1024 * 1024)).toFixed(2);
    
    console.log(`\n✅ Chrome Web Store ZIP created successfully!`);
    console.log(`📁 File: ${zipName}`);
    console.log(`📏 Size: ${zipSizeMB} MB`);
    console.log(`🏪 Ready for Chrome Web Store submission`);
    
    // Chrome Web Store size limit check
    if (zipStats.size > 128 * 1024 * 1024) { // 128MB limit
        console.log('⚠️  Warning: ZIP exceeds Chrome Web Store 128MB limit');
    }
    
} catch (error) {
    console.error('❌ Error creating ZIP:', error.message);
    process.exit(1);
}