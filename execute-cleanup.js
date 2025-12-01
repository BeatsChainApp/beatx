const { CleanupManager } = require('./cleanup-plan.js');
const fs = require('fs');
const path = require('path');

// Execute comprehensive cleanup
async function executeFullCleanup() {
    console.log('🚀 Starting comprehensive cleanup...');
    
    // Remove duplicate auth files
    const duplicateFiles = [
        'chrome-extension/lib/auth.js',
        'chrome-extension/lib/enhanced-auth.js'
    ];
    
    duplicateFiles.forEach(file => {
        if (fs.existsSync(file)) {
            fs.unlinkSync(file);
            console.log(`✅ Removed: ${file}`);
        }
    });
    
    console.log('🧹 Cleanup completed');
}

executeFullCleanup();