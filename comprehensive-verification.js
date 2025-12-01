#!/usr/bin/env node

/**
 * Comprehensive BeatsChain Implementation Verification
 * Checks all recent implementations and identifies issues
 */

const fs = require('fs');
const path = require('path');

class BeatsChainVerifier {
    constructor() {
        this.issues = [];
        this.successes = [];
        this.warnings = [];
    }

    log(type, component, message, details = null) {
        const entry = { type, component, message, details, timestamp: new Date().toISOString() };
        
        switch(type) {
            case 'ERROR':
                this.issues.push(entry);
                console.log(`❌ [${component}] ${message}`);
                break;
            case 'SUCCESS':
                this.successes.push(entry);
                console.log(`✅ [${component}] ${message}`);
                break;
            case 'WARNING':
                this.warnings.push(entry);
                console.log(`⚠️  [${component}] ${message}`);
                break;
        }
        
        if (details) {
            console.log(`   Details: ${details}`);
        }
    }

    checkFileExists(filePath, component, description) {
        if (fs.existsSync(filePath)) {
            this.log('SUCCESS', component, `${description} exists`);
            return true;
        } else {
            this.log('ERROR', component, `${description} missing`, filePath);
            return false;
        }
    }

    checkFileContent(filePath, searchText, component, description) {
        if (!fs.existsSync(filePath)) {
            this.log('ERROR', component, `File missing for ${description}`, filePath);
            return false;
        }

        try {
            const content = fs.readFileSync(filePath, 'utf8');
            if (content.includes(searchText)) {
                this.log('SUCCESS', component, `${description} properly configured`);
                return true;
            } else {
                this.log('ERROR', component, `${description} not configured`, `Missing: ${searchText}`);
                return false;
            }
        } catch (error) {
            this.log('ERROR', component, `Failed to read ${description}`, error.message);
            return false;
        }
    }

    async verifyGoogleOAuth() {
        console.log('\n🔐 Verifying Google OAuth2 Implementation...');
        
        // Check Chrome Extension OAuth
        this.checkFileContent(
            './chrome-extension/manifest.json',
            '"oauth2"',
            'Chrome Extension OAuth',
            'OAuth2 configuration in manifest'
        );

        this.checkFileContent(
            './chrome-extension/manifest.json',
            '239753403483-re3akggqub93apgm4t5nnabbbrcp0q1p.apps.googleusercontent.com',
            'Chrome Extension OAuth',
            'Google Client ID configured'
        );

        // Check App OAuth
        this.checkFileContent(
            './packages/app/.env.production',
            'NEXT_PUBLIC_GOOGLE_CLIENT_ID=239753403483-re3akggqub93apgm4t5nnabbbrcp0q1p.apps.googleusercontent.com',
            'App OAuth',
            'Google Client ID in production env'
        );

        // Check Unified Auth Implementation
        this.checkFileExists(
            './chrome-extension/lib/unified-auth.js',
            'Chrome Extension Auth',
            'Unified authentication manager'
        );

        this.checkFileExists(
            './packages/app/src/context/UnifiedAuthContext.tsx',
            'App Auth',
            'Unified auth context'
        );
    }

    async verifyEmbeddedWallet() {
        console.log('\n💰 Verifying Embedded Wallet Implementation...');
        
        // Check wallet generation in unified auth
        this.checkFileContent(
            './chrome-extension/lib/unified-auth.js',
            'generateUnifiedWallet',
            'Chrome Extension Wallet',
            'Unified wallet generation'
        );

        // Check wallet context in app
        this.checkFileExists(
            './packages/app/src/context/Web3Provider.tsx',
            'App Wallet',
            'Web3 wallet provider'
        );

        // Check WalletConnect configuration
        this.checkFileContent(
            './packages/app/.env.production',
            'NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID',
            'App Wallet',
            'WalletConnect project ID'
        );
    }

    async verifyDatabaseSchema() {
        console.log('\n🗄️  Verifying Database Schema Deployment...');
        
        // Check migration files
        this.checkFileExists(
            './migrations/combined_migrations.sql',
            'Database Schema',
            'Combined migrations file'
        );

        // Check Supabase configuration
        this.checkFileContent(
            './packages/app/.env.production',
            'NEXT_PUBLIC_SUPABASE_URL=https://zgdxpsenxjwyiwbbealf.supabase.co',
            'Database Config',
            'Supabase URL configured'
        );

        this.checkFileContent(
            './packages/mcp-server/.env.example',
            'SUPABASE_URL=https://zgdxpsenxjwyiwbbealf.supabase.co',
            'MCP Server Config',
            'Supabase URL in MCP server'
        );

        // Check if tables are referenced in code
        this.checkFileContent(
            './migrations/combined_migrations.sql',
            'CREATE TABLE IF NOT EXISTS public.success',
            'Database Schema',
            'Success table creation'
        );

        this.checkFileContent(
            './migrations/combined_migrations.sql',
            'alter table if exists public.isrc_registry',
            'Database Schema',
            'ISRC registry table modification'
        );
    }

    async verifyOnboardingManager() {
        console.log('\n🚀 Verifying Onboarding Manager Implementation...');
        
        // Check Chrome Extension onboarding
        this.checkFileExists(
            './chrome-extension/lib/onboarding-manager.js',
            'Chrome Extension Onboarding',
            'Extension onboarding manager'
        );

        // Check App onboarding
        this.checkFileExists(
            './packages/app/src/lib/app-onboarding-manager.js',
            'App Onboarding',
            'App onboarding manager'
        );

        this.checkFileExists(
            './packages/app/src/components/OnboardingProvider.tsx',
            'App Onboarding',
            'Onboarding provider component'
        );

        // Check if onboarding is mounted in layout
        this.checkFileContent(
            './packages/app/src/app/layout.tsx',
            'OnboardingProvider',
            'App Layout',
            'Onboarding provider mounted in layout'
        );
    }

    async verifyUIComponents() {
        console.log('\n🎨 Verifying UI Components Implementation...');
        
        // Check Chrome Extension UI
        this.checkFileExists(
            './chrome-extension/popup/index.html',
            'Chrome Extension UI',
            'Main popup HTML'
        );

        this.checkFileExists(
            './chrome-extension/popup/popup.js',
            'Chrome Extension UI',
            'Main popup JavaScript'
        );

        // Check App UI Components
        this.checkFileExists(
            './packages/app/src/components/auth/SignInModal.tsx',
            'App UI',
            'Sign-in modal component'
        );

        this.checkFileExists(
            './packages/app/src/components/auth/AppOnboardingModal.tsx',
            'App UI',
            'App onboarding modal'
        );

        // Check if components are properly imported
        this.checkFileContent(
            './packages/app/src/app/layout.tsx',
            'UnifiedAuthProvider',
            'App Layout',
            'Unified auth provider mounted'
        );
    }

    async verifySuperAdminDashboard() {
        console.log('\n👑 Verifying Super Admin Dashboard Access...');
        
        // Check admin page exists
        this.checkFileExists(
            './packages/app/src/app/admin/page.tsx',
            'Admin Dashboard',
            'Admin dashboard page'
        );

        // Check protected route component
        this.checkFileExists(
            './packages/app/src/components/ProtectedRoute.tsx',
            'Admin Dashboard',
            'Protected route component'
        );

        // Check super admin wallet configuration
        this.checkFileContent(
            './packages/app/.env.production',
            'NEXT_PUBLIC_SUPER_ADMIN_WALLET=0xc84799A904EeB5C57aBBBc40176E7dB8be202C10',
            'Admin Dashboard',
            'Super admin wallet configured'
        );

        // Check unified auth context for admin roles
        this.checkFileContent(
            './packages/app/src/context/UnifiedAuthContext.tsx',
            'SUPER_ADMIN_WALLETS',
            'Admin Dashboard',
            'Super admin wallets array defined'
        );
    }

    async verifyMCPServerDeployment() {
        console.log('\n🚀 Verifying MCP Server Deployment...');
        
        // Check MCP server files
        this.checkFileExists(
            './packages/mcp-server/src/index.js',
            'MCP Server',
            'Main server file'
        );

        // Check deployment configuration
        this.checkFileExists(
            './packages/mcp-server/Dockerfile',
            'MCP Server',
            'Docker configuration'
        );

        this.checkFileExists(
            './packages/mcp-server/railway.json',
            'MCP Server',
            'Railway deployment config'
        );

        // Check if MCP server URL is configured in app
        this.checkFileContent(
            './packages/app/.env.production',
            'NEXT_PUBLIC_MCP_SERVER_URL=https://beatschain-mcp-server.up.railway.app',
            'MCP Server',
            'MCP server URL configured in app'
        );
    }

    async verifyDataPipelines() {
        console.log('\n🔄 Verifying Data Pipelines Implementation...');
        
        // Check N8N workflows
        this.checkFileExists(
            './n8n/workflows/user-onboarding.json',
            'Data Pipelines',
            'User onboarding workflow'
        );

        this.checkFileExists(
            './n8n/workflows/extension-onboarding.json',
            'Data Pipelines',
            'Extension onboarding workflow'
        );

        // Check MCP server routes
        if (fs.existsSync('./packages/mcp-server/src')) {
            const routesDir = './packages/mcp-server/src/routes';
            if (fs.existsSync(routesDir)) {
                const routes = fs.readdirSync(routesDir);
                if (routes.length > 0) {
                    this.log('SUCCESS', 'Data Pipelines', `Found ${routes.length} API routes`);
                } else {
                    this.log('WARNING', 'Data Pipelines', 'No API routes found');
                }
            }
        }
    }

    async checkSystemIntegration() {
        console.log('\n🔗 Checking System Integration...');
        
        // Check if all systems are properly connected
        const integrationChecks = [
            {
                file: './chrome-extension/lib/unified-auth.js',
                search: 'BackendAuthClient',
                component: 'Extension-Backend Integration',
                description: 'Backend client integration in extension'
            },
            {
                file: './packages/app/src/context/UnifiedAuthContext.tsx',
                search: 'useAccount',
                component: 'App-Wallet Integration',
                description: 'Wallet integration in unified auth'
            },
            {
                file: './chrome-extension/manifest.json',
                search: 'beatschain-mcp-server',
                component: 'Extension-MCP Integration',
                description: 'MCP server URL in extension permissions'
            }
        ];

        integrationChecks.forEach(check => {
            this.checkFileContent(check.file, check.search, check.component, check.description);
        });
    }

    generateReport() {
        console.log('\n📊 COMPREHENSIVE VERIFICATION REPORT');
        console.log('=====================================');
        
        console.log(`\n✅ Successes: ${this.successes.length}`);
        console.log(`⚠️  Warnings: ${this.warnings.length}`);
        console.log(`❌ Issues: ${this.issues.length}`);

        if (this.issues.length > 0) {
            console.log('\n🚨 CRITICAL ISSUES FOUND:');
            console.log('========================');
            this.issues.forEach((issue, index) => {
                console.log(`${index + 1}. [${issue.component}] ${issue.message}`);
                if (issue.details) {
                    console.log(`   → ${issue.details}`);
                }
            });
        }

        if (this.warnings.length > 0) {
            console.log('\n⚠️  WARNINGS:');
            console.log('=============');
            this.warnings.forEach((warning, index) => {
                console.log(`${index + 1}. [${warning.component}] ${warning.message}`);
                if (warning.details) {
                    console.log(`   → ${warning.details}`);
                }
            });
        }

        console.log('\n🎯 RECOMMENDATIONS:');
        console.log('==================');
        
        if (this.issues.length > 0) {
            console.log('1. Fix all critical issues before deployment');
            console.log('2. Run database migrations on Supabase');
            console.log('3. Verify MCP server deployment status');
            console.log('4. Test super admin dashboard access');
            console.log('5. Validate all authentication flows');
        } else {
            console.log('✅ All systems appear to be properly implemented!');
        }

        // Save detailed report
        const report = {
            timestamp: new Date().toISOString(),
            summary: {
                successes: this.successes.length,
                warnings: this.warnings.length,
                issues: this.issues.length
            },
            successes: this.successes,
            warnings: this.warnings,
            issues: this.issues
        };

        fs.writeFileSync('./verification-report.json', JSON.stringify(report, null, 2));
        console.log('\n📄 Detailed report saved to: verification-report.json');
    }

    async run() {
        console.log('🔍 Starting Comprehensive BeatsChain Verification...\n');
        
        await this.verifyGoogleOAuth();
        await this.verifyEmbeddedWallet();
        await this.verifyDatabaseSchema();
        await this.verifyOnboardingManager();
        await this.verifyUIComponents();
        await this.verifySuperAdminDashboard();
        await this.verifyMCPServerDeployment();
        await this.verifyDataPipelines();
        await this.checkSystemIntegration();
        
        this.generateReport();
    }
}

// Run verification
const verifier = new BeatsChainVerifier();
verifier.run().catch(console.error);