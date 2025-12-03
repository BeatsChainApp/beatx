#!/usr/bin/env node

const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')

console.log('🚀 BeatsChain Build & Test Suite')
console.log('================================')

const runCommand = (command, description) => {
  console.log(`\n📋 ${description}`)
  console.log(`Running: ${command}`)
  try {
    const output = execSync(command, { 
      stdio: 'inherit', 
      cwd: process.cwd(),
      env: { ...process.env, NODE_ENV: 'test' }
    })
    console.log(`✅ ${description} - SUCCESS`)
    return true
  } catch (error) {
    console.error(`❌ ${description} - FAILED`)
    console.error(error.message)
    return false
  }
}

const checkFile = (filePath, description) => {
  console.log(`\n📁 Checking: ${description}`)
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${filePath} exists`)
    return true
  } else {
    console.log(`❌ ${filePath} missing`)
    return false
  }
}

// Test suite
const tests = [
  // File existence checks
  () => checkFile('src/lib/walletAdapter.ts', 'Wallet Adapter'),
  () => checkFile('src/context/ThirdwebProvider.tsx', 'Thirdweb Provider'),
  () => checkFile('src/components/SessionGate.tsx', 'Session Gate'),
  () => checkFile('src/styles/mobile-fixes.css', 'Mobile Fixes'),
  () => checkFile('src/__tests__/walletAdapter.test.ts', 'Wallet Tests'),
  
  // Install dependencies
  () => runCommand('npm install', 'Installing Dependencies'),
  
  // Lint check
  () => runCommand('npm run lint', 'ESLint Check'),
  
  // Type check
  () => runCommand('npx tsc --noEmit', 'TypeScript Check'),
  
  // Build check
  () => runCommand('npm run build', 'Next.js Build'),
  
  // Test run (if jest is configured)
  () => {
    try {
      return runCommand('npm test -- --passWithNoTests', 'Unit Tests')
    } catch {
      console.log('⚠️  No test runner configured, skipping unit tests')
      return true
    }
  }
]

// Run all tests
let passed = 0
let failed = 0

console.log(`\n🧪 Running ${tests.length} tests...\n`)

tests.forEach((test, index) => {
  console.log(`\n--- Test ${index + 1}/${tests.length} ---`)
  if (test()) {
    passed++
  } else {
    failed++
  }
})

// Summary
console.log('\n' + '='.repeat(50))
console.log('📊 TEST SUMMARY')
console.log('='.repeat(50))
console.log(`✅ Passed: ${passed}`)
console.log(`❌ Failed: ${failed}`)
console.log(`📈 Success Rate: ${Math.round((passed / tests.length) * 100)}%`)

if (failed === 0) {
  console.log('\n🎉 All tests passed! Ready for deployment.')
  process.exit(0)
} else {
  console.log('\n⚠️  Some tests failed. Please review and fix issues.')
  process.exit(1)
}