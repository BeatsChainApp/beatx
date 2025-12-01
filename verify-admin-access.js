#!/usr/bin/env node

/**
 * Admin Access Verification and Setup
 */

console.log('👑 BeatsChain Admin Access Verification');
console.log('======================================');

// Check wallet connection
console.log('\n🔗 Wallet Connection:');
console.log('- Connect wallet: 0xc84799A904EeB5C57aBBBc40176E7dB8be202C10');
console.log('- Network: Sepolia Testnet (Chain ID: 11155111)');

// Check admin dashboard access
console.log('\n🎯 Admin Dashboard Access:');
console.log('- URL: https://beatschain.app/admin');
console.log('- Required: Super admin wallet connected');
console.log('- Required: Sign message with wallet');

// Check environment variables
console.log('\n🔧 Environment Check:');
const fs = require('fs');

const envFile = './packages/app/.env.production';
if (fs.existsSync(envFile)) {
    const content = fs.readFileSync(envFile, 'utf8');
    
    if (content.includes('NEXT_PUBLIC_SUPER_ADMIN_WALLET=0xc84799A904EeB5C57aBBBc40176E7dB8be202C10')) {
        console.log('✅ Super admin wallet configured');
    } else {
        console.log('❌ Super admin wallet not configured');
    }
    
    if (content.includes('NEXT_PUBLIC_SUPABASE_URL')) {
        console.log('✅ Supabase URL configured');
    } else {
        console.log('❌ Supabase URL missing');
    }
} else {
    console.log('❌ Environment file missing');
}

console.log('\n🚀 Next Steps:');
console.log('1. Deploy app to production (Vercel)');
console.log('2. Apply database migrations to Supabase');
console.log('3. Connect wallet 0xc84799A904EeB5C57aBBBc40176E7dB8be202C10');
console.log('4. Visit https://beatschain.app/admin');
console.log('5. Sign message to authenticate');
