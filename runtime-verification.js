#!/usr/bin/env node

/**
 * Runtime Verification - Check actual deployment and runtime issues
 */

const fs = require('fs');
const https = require('https');
const http = require('http');

class RuntimeVerifier {
    constructor() {
        this.issues = [];
        this.successes = [];
    }

    log(type, message, details = null) {
        const entry = { type, message, details, timestamp: new Date().toISOString() };
        
        if (type === 'ERROR') {
            this.issues.push(entry);
            console.log(`❌ ${message}`);
        } else {
            this.successes.push(entry);
            console.log(`✅ ${message}`);
        }
        
        if (details) {
            console.log(`   → ${details}`);
        }
    }

    async checkURL(url, description) {
        return new Promise((resolve) => {
            const client = url.startsWith('https') ? https : http;
            
            const req = client.get(url, (res) => {
                if (res.statusCode >= 200 && res.statusCode < 400) {
                    this.log('SUCCESS', `${description} is accessible`, `Status: ${res.statusCode}`);
                    resolve(true);
                } else {
                    this.log('ERROR', `${description} returned error`, `Status: ${res.statusCode}`);
                    resolve(false);
                }
            });

            req.on('error', (error) => {
                this.log('ERROR', `${description} is not accessible`, error.message);
                resolve(false);
            });

            req.setTimeout(10000, () => {
                req.destroy();
                this.log('ERROR', `${description} timed out`, 'Request timeout after 10s');
                resolve(false);
            });
        });
    }

    checkEnvironmentVariables() {
        console.log('\n🔧 Checking Environment Variables...');
        
        const envFiles = [
            './packages/app/.env.production',
            './packages/app/.env.local'
        ];

        envFiles.forEach(envFile => {
            if (fs.existsSync(envFile)) {
                const content = fs.readFileSync(envFile, 'utf8');
                
                // Check for placeholder values
                const placeholders = [
                    'YOUR_',
                    'REPLACE_',
                    'CHANGE_',
                    'TODO',
                    'FIXME'
                ];

                let hasPlaceholders = false;
                placeholders.forEach(placeholder => {
                    if (content.includes(placeholder)) {
                        hasPlaceholders = true;
                        this.log('ERROR', `Environment file contains placeholder values`, `${envFile} contains ${placeholder}`);
                    }
                });

                if (!hasPlaceholders) {
                    this.log('SUCCESS', `Environment file properly configured`, envFile);
                }

                // Check for missing required variables
                const requiredVars = [
                    'NEXT_PUBLIC_SUPABASE_URL',
                    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
                    'NEXT_PUBLIC_GOOGLE_CLIENT_ID',
                    'NEXT_PUBLIC_MCP_SERVER_URL'
                ];

                requiredVars.forEach(varName => {
                    if (content.includes(`${varName}=`) && !content.includes(`${varName}=\n`)) {
                        this.log('SUCCESS', `Required variable ${varName} is set`);
                    } else {
                        this.log('ERROR', `Required variable ${varName} is missing or empty`);
                    }
                });
            }
        });
    }

    async checkSupabaseConnection() {
        console.log('\n🗄️  Checking Supabase Connection...');
        
        const supabaseUrl = 'https://zgdxpsenxjwyiwbbealf.supabase.co';
        await this.checkURL(`${supabaseUrl}/rest/v1/`, 'Supabase REST API');
        
        // Check if migrations are applied
        try {
            const migrationFile = './migrations/combined_migrations.sql';
            if (fs.existsSync(migrationFile)) {
                const content = fs.readFileSync(migrationFile, 'utf8');
                if (content.includes('CREATE TABLE IF NOT EXISTS public.success')) {
                    this.log('SUCCESS', 'Database migrations are ready for deployment');
                    this.log('ERROR', 'Database migrations need to be applied to Supabase', 'Run migrations in Supabase SQL editor');
                } else {
                    this.log('ERROR', 'Database migration file is incomplete');
                }
            }
        } catch (error) {
            this.log('ERROR', 'Failed to check migration file', error.message);
        }
    }

    async checkMCPServerDeployment() {
        console.log('\n🚀 Checking MCP Server Deployment...');
        
        const mcpUrl = 'https://beatschain-mcp-server.up.railway.app';
        await this.checkURL(`${mcpUrl}/health`, 'MCP Server Health Check');
        await this.checkURL(`${mcpUrl}/api/analytics/dashboard`, 'MCP Server Analytics API');
    }

    checkChromeExtensionManifest() {
        console.log('\n🔌 Checking Chrome Extension Configuration...');
        
        try {
            const manifestPath = './chrome-extension/manifest.json';
            const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
            
            // Check OAuth configuration
            if (manifest.oauth2 && manifest.oauth2.client_id) {
                this.log('SUCCESS', 'Chrome extension OAuth2 configured');
            } else {
                this.log('ERROR', 'Chrome extension OAuth2 not configured');
            }

            // Check permissions
            const requiredPermissions = ['storage', 'identity'];
            const hasAllPermissions = requiredPermissions.every(perm => 
                manifest.permissions && manifest.permissions.includes(perm)
            );

            if (hasAllPermissions) {
                this.log('SUCCESS', 'Chrome extension has required permissions');
            } else {
                this.log('ERROR', 'Chrome extension missing required permissions');
            }

            // Check host permissions for MCP server
            if (manifest.host_permissions && 
                manifest.host_permissions.some(perm => perm.includes('beatschain-mcp-server'))) {
                this.log('SUCCESS', 'Chrome extension can access MCP server');
            } else {
                this.log('ERROR', 'Chrome extension cannot access MCP server', 'Missing host permission');
            }

        } catch (error) {
            this.log('ERROR', 'Failed to parse Chrome extension manifest', error.message);
        }
    }

    checkAppBuildConfiguration() {
        console.log('\n🏗️  Checking App Build Configuration...');
        
        try {
            const packagePath = './packages/app/package.json';
            const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
            
            // Check if required dependencies are installed
            const requiredDeps = [
                'wagmi',
                '@web3modal/wagmi',
                'viem',
                '@supabase/supabase-js'
            ];

            requiredDeps.forEach(dep => {
                if (packageJson.dependencies && packageJson.dependencies[dep]) {
                    this.log('SUCCESS', `Required dependency ${dep} is installed`);
                } else {
                    this.log('ERROR', `Required dependency ${dep} is missing`);
                }
            });

            // Check build scripts
            if (packageJson.scripts && packageJson.scripts.build) {
                this.log('SUCCESS', 'Build script is configured');
            } else {
                this.log('ERROR', 'Build script is missing');
            }

        } catch (error) {
            this.log('ERROR', 'Failed to check app package.json', error.message);
        }
    }

    checkAdminAccess() {
        console.log('\n👑 Checking Admin Access Configuration...');
        
        // Check if admin wallet is properly configured
        const envFiles = ['./packages/app/.env.production', './packages/app/.env.local'];
        
        envFiles.forEach(envFile => {
            if (fs.existsSync(envFile)) {
                const content = fs.readFileSync(envFile, 'utf8');
                
                if (content.includes('NEXT_PUBLIC_SUPER_ADMIN_WALLET=0xc84799A904EeB5C57aBBBc40176E7dB8be202C10')) {
                    this.log('SUCCESS', `Super admin wallet configured in ${envFile}`);
                } else {
                    this.log('ERROR', `Super admin wallet not configured in ${envFile}`);
                }
            }
        });

        // Check admin page protection
        const adminPagePath = './packages/app/src/app/admin/page.tsx';
        if (fs.existsSync(adminPagePath)) {
            const content = fs.readFileSync(adminPagePath, 'utf8');
            
            if (content.includes('useWeb3Auth') && content.includes('super_admin')) {
                this.log('SUCCESS', 'Admin page has proper role protection');
            } else {
                this.log('ERROR', 'Admin page lacks proper role protection');
            }
        }
    }

    generateRuntimeReport() {
        console.log('\n📊 RUNTIME VERIFICATION REPORT');
        console.log('==============================');
        
        console.log(`\n✅ Successes: ${this.successes.length}`);
        console.log(`❌ Issues: ${this.issues.length}`);

        if (this.issues.length > 0) {
            console.log('\n🚨 RUNTIME ISSUES FOUND:');
            console.log('========================');
            this.issues.forEach((issue, index) => {
                console.log(`${index + 1}. ${issue.message}`);
                if (issue.details) {
                    console.log(`   → ${issue.details}`);
                }
            });

            console.log('\n🔧 IMMEDIATE ACTIONS REQUIRED:');
            console.log('==============================');
            console.log('1. Apply database migrations to Supabase');
            console.log('2. Verify MCP server is deployed and running');
            console.log('3. Check environment variables are properly set');
            console.log('4. Test admin dashboard access with your wallet');
            console.log('5. Verify Chrome extension permissions');
        } else {
            console.log('✅ All runtime checks passed!');
        }

        // Save report
        const report = {
            timestamp: new Date().toISOString(),
            summary: {
                successes: this.successes.length,
                issues: this.issues.length
            },
            successes: this.successes,
            issues: this.issues
        };

        fs.writeFileSync('./runtime-report.json', JSON.stringify(report, null, 2));
        console.log('\n📄 Runtime report saved to: runtime-report.json');
    }

    async run() {
        console.log('🔍 Starting Runtime Verification...\n');
        
        this.checkEnvironmentVariables();
        await this.checkSupabaseConnection();
        await this.checkMCPServerDeployment();
        this.checkChromeExtensionManifest();
        this.checkAppBuildConfiguration();
        this.checkAdminAccess();
        
        this.generateRuntimeReport();
    }
}

// Run verification
const verifier = new RuntimeVerifier();
verifier.run().catch(console.error);