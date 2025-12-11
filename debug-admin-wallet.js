#!/usr/bin/env node

/**
 * Admin Wallet Debug Script
 * Comprehensive debugging for the wallet mismatch issue
 */

console.log('🔍 ADMIN WALLET DEBUG SCRIPT')
console.log('=' .repeat(50))

// Environment variables check
console.log('\n📋 ENVIRONMENT VARIABLES:')
console.log('NEXT_PUBLIC_SUPER_ADMIN_WALLET:', process.env.NEXT_PUBLIC_SUPER_ADMIN_WALLET)
console.log('SUPER_ADMIN_WALLET:', process.env.SUPER_ADMIN_WALLET)
console.log('ADMIN_API_KEY:', process.env.ADMIN_API_KEY ? '✅ Set' : '❌ Missing')

// Expected vs actual wallet addresses
const expectedWallet = '0xc84799a904eeb5c57abbbc40176e7db8be202c10'
const envWallet = process.env.NEXT_PUBLIC_SUPER_ADMIN_WALLET
const currentWallet = '0x8B7a...B17F' // User's current connected wallet

console.log('\n🔐 WALLET COMPARISON:')
console.log('Expected (hardcoded):', expectedWallet)
console.log('Environment variable:', envWallet)
console.log('Current connected:', currentWallet)
console.log('Case match:', envWallet?.toLowerCase() === expectedWallet.toLowerCase() ? '✅' : '❌')

// Admin emails
const adminEmails = [
  'info@unamifoundation.org',
  'admin@beatschain.app', 
  'support@beatschain.app'
]

console.log('\n📧 ADMIN EMAILS:')
adminEmails.forEach(email => console.log(`  - ${email}`))

// Test wallet verification logic
function testWalletVerification(testWallet, testEmail) {
  console.log(`\n🧪 TESTING VERIFICATION:`)
  console.log(`Wallet: ${testWallet}`)
  console.log(`Email: ${testEmail}`)
  
  const superAdminWallets = [
    process.env.NEXT_PUBLIC_SUPER_ADMIN_WALLET?.toLowerCase(),
    expectedWallet.toLowerCase()
  ].filter(Boolean)
  
  const isWalletAdmin = testWallet && superAdminWallets.includes(testWallet.toLowerCase())
  const isEmailAdmin = testEmail && adminEmails.includes(testEmail.toLowerCase())
  
  console.log(`Wallet admin: ${isWalletAdmin ? '✅' : '❌'}`)
  console.log(`Email admin: ${isEmailAdmin ? '✅' : '❌'}`)
  console.log(`Overall admin: ${isWalletAdmin || isEmailAdmin ? '✅' : '❌'}`)
  
  return { isWalletAdmin, isEmailAdmin, isAdmin: isWalletAdmin || isEmailAdmin }
}

// Test scenarios
console.log('\n🎯 TEST SCENARIOS:')

// Scenario 1: Correct super admin wallet
testWalletVerification(expectedWallet, null)

// Scenario 2: Admin email only
testWalletVerification(null, 'info@unamifoundation.org')

// Scenario 3: Current user's wallet (should fail)
testWalletVerification('0x8B7a1234567890abcdef1234567890abcdef1B17F', null)

// Scenario 4: Both correct wallet and email
testWalletVerification(expectedWallet, 'info@unamifoundation.org')

// Case sensitivity test
console.log('\n🔤 CASE SENSITIVITY TEST:')
const upperCaseWallet = '0xC84799A904EEB5C57ABBBC40176E7DB8BE202C10'
const lowerCaseWallet = '0xc84799a904eeb5c57abbbc40176e7db8be202c10'
const mixedCaseWallet = '0xc84799A904EeB5C57aBBBc40176E7dB8be202C10'

console.log('Uppercase:', upperCaseWallet.toLowerCase() === expectedWallet.toLowerCase() ? '✅' : '❌')
console.log('Lowercase:', lowerCaseWallet.toLowerCase() === expectedWallet.toLowerCase() ? '✅' : '❌')
console.log('Mixed case:', mixedCaseWallet.toLowerCase() === expectedWallet.toLowerCase() ? '✅' : '❌')

// MCP Server test
async function testMCPServer() {
  console.log('\n🌐 MCP SERVER TEST:')
  
  const mcpUrl = process.env.NEXT_PUBLIC_MCP_SERVER_URL || 'https://beatschain-mcp-server.up.railway.app'
  console.log('MCP URL:', mcpUrl)
  
  try {
    const response = await fetch(`${mcpUrl}/healthz`)
    const health = await response.json()
    console.log('Health check:', response.ok ? '✅' : '❌')
    console.log('Response:', health)
  } catch (error) {
    console.log('Health check: ❌')
    console.log('Error:', error.message)
  }
  
  // Test wallet verification endpoint
  try {
    const verifyResponse = await fetch(`${mcpUrl}/api/admin/verify-wallet`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-wallet-address': expectedWallet,
        'x-user-email': 'info@unamifoundation.org'
      },
      body: JSON.stringify({
        walletAddress: expectedWallet,
        email: 'info@unamifoundation.org'
      })
    })
    
    const verifyResult = await verifyResponse.json()
    console.log('Wallet verification:', verifyResponse.ok ? '✅' : '❌')
    console.log('Verification result:', verifyResult)
  } catch (error) {
    console.log('Wallet verification: ❌')
    console.log('Error:', error.message)
  }
}

// Recommendations
console.log('\n💡 RECOMMENDATIONS:')
console.log('1. ✅ Fixed case sensitivity in environment variable')
console.log('2. ✅ Added debugging logs to UnifiedAuthContext')
console.log('3. ✅ Created AdminWalletManager component')
console.log('4. 🔄 Connect with admin email (info@unamifoundation.org) via Google OAuth')
console.log('5. 🔄 OR import the super admin wallet private key into your wallet')
console.log('6. 🔄 Check browser console for wallet verification logs')

// Run MCP server test if in async context
if (typeof fetch !== 'undefined') {
  testMCPServer().catch(console.error)
} else {
  console.log('\n⚠️  Run this script in a browser environment to test MCP server')
}

console.log('\n' + '='.repeat(50))
console.log('🏁 DEBUG COMPLETE - Check the fixes above!')