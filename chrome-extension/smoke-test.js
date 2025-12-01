/**
 * Chrome Extension Smoke Test
 */

const fs = require('fs');
const path = require('path');

console.log('🧪 Running Chrome Extension Smoke Tests...\n');

// Test 1: Manifest validation
function testManifest() {
    console.log('1. Testing manifest.json...');
    try {
        const manifest = JSON.parse(fs.readFileSync('manifest.json', 'utf8'));
        
        // Required fields
        const required = ['manifest_version', 'name', 'version', 'description'];
        const missing = required.filter(field => !manifest[field]);
        
        if (missing.length > 0) {
            console.log('❌ Missing required fields:', missing);
            return false;
        }
        
        // Chrome Web Store compliance
        if (manifest.manifest_version !== 3) {
            console.log('❌ Must use Manifest V3');
            return false;
        }
        
        console.log('✅ Manifest valid');
        return true;
    } catch (error) {
        console.log('❌ Manifest error:', error.message);
        return false;
    }
}

// Test 2: Required files
function testRequiredFiles() {
    console.log('\n2. Testing required files...');
    const required = [
        'manifest.json',
        'popup/index.html',
        'popup/popup.js',
        'popup/popup.css',
        'background/service-worker.js',
        'assets/icons/icon16.png',
        'assets/icons/icon48.png',
        'assets/icons/icon128.png'
    ];
    
    const missing = required.filter(file => !fs.existsSync(file));
    
    if (missing.length > 0) {
        console.log('❌ Missing files:', missing);
        return false;
    }
    
    console.log('✅ All required files present');
    return true;
}

// Test 3: Signature system
function testSignatureSystem() {
    console.log('\n3. Testing signature system...');
    const signatureFiles = [
        'lib/signature-manager.js',
        'lib/enhanced-signature-manager.js',
        'lib/radio-signature-integration.js',
        'popup/signature-styles.css'
    ];
    
    const missing = signatureFiles.filter(file => !fs.existsSync(file));
    
    if (missing.length > 0) {
        console.log('❌ Missing signature files:', missing);
        return false;
    }
    
    // Check HTML integration
    const html = fs.readFileSync('popup/index.html', 'utf8');
    if (!html.includes('signature-styles.css') || !html.includes('signature-manager.js')) {
        console.log('❌ Signature system not integrated in HTML');
        return false;
    }
    
    console.log('✅ Signature system integrated');
    return true;
}

// Test 4: Radio submission system
function testRadioSystem() {
    console.log('\n4. Testing radio submission system...');
    const radioFiles = [
        'lib/enhanced-radio-flow.js',
        'lib/radio-sponsor-integration.js',
        'lib/samro-split-manager.js'
    ];
    
    const missing = radioFiles.filter(file => !fs.existsSync(file));
    
    if (missing.length > 0) {
        console.log('❌ Missing radio files:', missing);
        return false;
    }
    
    console.log('✅ Radio submission system present');
    return true;
}

// Test 5: File sizes (Chrome Web Store limits)
function testFileSizes() {
    console.log('\n5. Testing file sizes...');
    
    function getFileSize(filePath) {
        try {
            return fs.statSync(filePath).size;
        } catch {
            return 0;
        }
    }
    
    const largeFiles = [];
    const maxSize = 5 * 1024 * 1024; // 5MB limit
    
    function checkDirectory(dir) {
        const files = fs.readdirSync(dir, { withFileTypes: true });
        
        for (const file of files) {
            const fullPath = path.join(dir, file.name);
            
            if (file.isDirectory()) {
                checkDirectory(fullPath);
            } else {
                const size = getFileSize(fullPath);
                if (size > maxSize) {
                    largeFiles.push({ path: fullPath, size });
                }
            }
        }
    }
    
    checkDirectory('.');
    
    if (largeFiles.length > 0) {
        console.log('❌ Files too large:', largeFiles);
        return false;
    }
    
    console.log('✅ All files within size limits');
    return true;
}

// Run all tests
function runTests() {
    const tests = [
        testManifest,
        testRequiredFiles,
        testSignatureSystem,
        testRadioSystem,
        testFileSizes
    ];
    
    const results = tests.map(test => test());
    const passed = results.filter(Boolean).length;
    
    console.log(`\n📊 Test Results: ${passed}/${tests.length} passed`);
    
    if (passed === tests.length) {
        console.log('✅ All smoke tests passed! Extension ready for Chrome Web Store.');
        return true;
    } else {
        console.log('❌ Some tests failed. Please fix issues before submission.');
        return false;
    }
}

// Run tests
const success = runTests();
process.exit(success ? 0 : 1);