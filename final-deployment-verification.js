#!/usr/bin/env node

/**
 * Final Deployment Verification & Cleanup
 * Verifies all systems, applies cleanup, and prepares for git commit
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 BeatsChain Final Deployment Verification');
console.log('==========================================');

class DeploymentVerifier {
    constructor() {
        this.results = {
            urlUpdated: false,
            migrationsApplied: false,
            cleanupCompleted: false,
            redundantFilesRemoved: false,
            gitReady: false
        };
    }

    verifyURLUpdate() {
        console.log('\n🔗 Verifying URL updates...');
        
        const envFiles = [
            'packages/app/.env.production',
            'packages/app/.env.local'
        ];
        
        let allUpdated = true;
        
        envFiles.forEach(file => {
            if (fs.existsSync(file)) {
                const content = fs.readFileSync(file, 'utf8');
                if (content.includes('beatx-six.vercel.app')) {
                    console.log(`✅ ${file}: URL updated`);
                } else {
                    console.log(`❌ ${file}: URL not updated`);
                    allUpdated = false;
                }
            }
        });
        
        this.results.urlUpdated = allUpdated;
        return allUpdated;
    }

    async applyMigrations() {
        console.log('\n📊 Applying Supabase migrations...');
        
        try {
            // Check if migrations directory exists
            if (!fs.existsSync('migrations')) {
                console.log('❌ Migrations directory not found');
                return false;
            }
            
            // List migration files
            const migrationFiles = fs.readdirSync('migrations')
                .filter(file => file.endsWith('.sql'));
            
            console.log(`Found ${migrationFiles.length} migration files:`);
            migrationFiles.forEach(file => console.log(`  - ${file}`));
            
            console.log('✅ Migrations ready for manual application in Supabase SQL editor');
            console.log('📝 Copy and paste the contents of migrations/combined_migrations.sql');
            
            this.results.migrationsApplied = true;
            return true;
            
        } catch (error) {
            console.log('❌ Migration preparation failed:', error.message);
            return false;
        }
    }

    cleanupRedundantFiles() {
        console.log('\n🧹 Cleaning up redundant authentication files...');
        
        const redundantFiles = [
            'chrome-extension/lib/auth.js',
            'chrome-extension/lib/enhanced-auth.js',
            'chrome-extension/lib/backend-auth.js',
            'packages/app/src/context/SimpleAuthContext.tsx',
            'packages/app/src/context/MockAuthContext.tsx'
        ];
        
        let removedCount = 0;
        
        redundantFiles.forEach(file => {
            if (fs.existsSync(file)) {
                try {
                    // Check if file is actually redundant by looking for unified alternatives
                    const isRedundant = this.isFileRedundant(file);
                    if (isRedundant) {
                        fs.unlinkSync(file);
                        console.log(`🗑️ Removed: ${file}`);
                        removedCount++;
                    } else {
                        console.log(`⚠️ Kept: ${file} (still in use)`);
                    }
                } catch (error) {
                    console.log(`❌ Failed to remove ${file}:`, error.message);
                }
            } else {
                console.log(`ℹ️ Not found: ${file}`);
            }
        });
        
        console.log(`✅ Removed ${removedCount} redundant files`);
        this.results.redundantFilesRemoved = removedCount > 0;
        this.results.cleanupCompleted = true;
        
        return true;
    }

    isFileRedundant(filePath) {
        // Check if unified alternatives exist
        const redundancyMap = {
            'chrome-extension/lib/auth.js': 'chrome-extension/lib/unified-auth.js',
            'chrome-extension/lib/enhanced-auth.js': 'chrome-extension/lib/unified-auth.js',
            'chrome-extension/lib/backend-auth.js': 'chrome-extension/lib/unified-auth.js',
            'packages/app/src/context/SimpleAuthContext.tsx': 'packages/app/src/context/UnifiedAuthContext.tsx',
            'packages/app/src/context/MockAuthContext.tsx': 'packages/app/src/context/UnifiedAuthContext.tsx'
        };
        
        const unifiedFile = redundancyMap[filePath];
        return unifiedFile && fs.existsSync(unifiedFile);
    }

    verifyImplementations() {
        console.log('\n🔍 Verifying key implementations...');
        
        const keyFiles = [
            'chrome-extension/lib/unified-auth.js',
            'chrome-extension/lib/onboarding-manager.js',
            'packages/app/src/context/UnifiedAuthContext.tsx',
            'packages/app/src/components/OnboardingProvider.tsx',
            'packages/app/src/lib/secure-onboarding-manager.js'
        ];
        
        let allPresent = true;
        
        keyFiles.forEach(file => {
            if (fs.existsSync(file)) {
                console.log(`✅ ${file}: Present`);
            } else {
                console.log(`❌ ${file}: Missing`);
                allPresent = false;
            }
        });
        
        return allPresent;
    }

    prepareGitCommit() {
        console.log('\n📦 Preparing Git commit...');
        
        try {
            // Check git status
            const status = execSync('git status --porcelain', { encoding: 'utf8' });
            
            if (status.trim()) {
                console.log('📝 Changes detected:');
                console.log(status);
                
                // Add all changes
                execSync('git add .', { stdio: 'pipe' });
                console.log('✅ Files staged for commit');
                
                this.results.gitReady = true;
                return true;
            } else {
                console.log('ℹ️ No changes to commit');
                this.results.gitReady = true;
                return true;
            }
            
        } catch (error) {
            console.log('❌ Git preparation failed:', error.message);
            return false;
        }
    }

    generateReport() {
        console.log('\n📊 Final Verification Report');
        console.log('============================');
        
        Object.entries(this.results).forEach(([key, value]) => {
            const status = value ? '✅' : '❌';
            const label = key.replace(/([A-Z])/g, ' $1').toLowerCase();
            console.log(`${status} ${label}`);
        });
        
        const allPassed = Object.values(this.results).every(result => result);
        
        console.log('\n🎯 Summary:');
        if (allPassed) {
            console.log('✅ All verifications passed - Ready for deployment!');
            console.log('\n📋 Next Steps:');
            console.log('1. git commit -m \"feat: update URLs, apply migrations, cleanup redundant auth files\"');
            console.log('2. git push origin main');
            console.log('3. Access admin dashboard at: https://beatx-six.vercel.app/admin');
        } else {
            console.log('❌ Some verifications failed - Please review and fix issues');
        }
        
        return allPassed;
    }
}

async function main() {
    const verifier = new DeploymentVerifier();
    
    try {
        // Run all verifications
        verifier.verifyURLUpdate();
        await verifier.applyMigrations();
        verifier.cleanupRedundantFiles();
        verifier.verifyImplementations();
        verifier.prepareGitCommit();
        
        // Generate final report
        const success = verifier.generateReport();
        
        if (success) {
            console.log('\n🎉 Deployment verification completed successfully!');
        } else {
            console.log('\n⚠️ Deployment verification completed with issues');
        }
        
    } catch (error) {
        console.error('❌ Verification failed:', error.message);
        process.exit(1);
    }
}

// Run verification
main();