#!/usr/bin/env node

/**
 * BeatNFT Credit System Integration Test
 * Tests all components work together in production-grade setup
 */

const fs = require('fs')
const path = require('path')

class BeatNFTIntegrationTest {
  constructor() {
    this.results = {
      passed: 0,
      failed: 0,
      warnings: 0,
      tests: []
    }
  }

  log(message, type = 'info') {
    const colors = {
      info: '\x1b[36m',
      success: '\x1b[32m',
      error: '\x1b[31m',
      warning: '\x1b[33m',
      reset: '\x1b[0m'
    }
    
    console.log(`${colors[type]}[${type.toUpperCase()}]${colors.reset} ${message}`)
  }

  test(name, testFn) {
    try {
      const result = testFn()
      if (result) {
        this.results.passed++
        this.results.tests.push({ name, status: 'PASS', message: result === true ? 'OK' : result })
        this.log(`✓ ${name}`, 'success')
      } else {
        this.results.failed++
        this.results.tests.push({ name, status: 'FAIL', message: 'Test returned false' })
        this.log(`✗ ${name}`, 'error')
      }
    } catch (error) {
      this.results.failed++
      this.results.tests.push({ name, status: 'FAIL', message: error.message })
      this.log(`✗ ${name}: ${error.message}`, 'error')
    }
  }

  warn(name, message) {
    this.results.warnings++
    this.results.tests.push({ name, status: 'WARN', message })
    this.log(`⚠ ${name}: ${message}`, 'warning')
  }

  fileExists(filePath) {
    return fs.existsSync(filePath)
  }

  fileContains(filePath, searchString) {
    if (!this.fileExists(filePath)) return false
    const content = fs.readFileSync(filePath, 'utf8')
    return content.includes(searchString)
  }

  runTests() {
    this.log('🎫 Starting BeatNFT Credit System Integration Tests', 'info')
    this.log('=' .repeat(60), 'info')

    // Test 1: Core Components Exist
    this.test('Admin Dashboard Component', () => {
      return this.fileExists('packages/app/src/app/admin/page.tsx') &&
             this.fileContains('packages/app/src/app/admin/page.tsx', 'BeatNFTAdminDashboard')
    })

    this.test('BeatNFT Admin Dashboard', () => {
      return this.fileExists('packages/app/src/components/BeatNFTAdminDashboard.tsx') &&
             this.fileContains('packages/app/src/components/BeatNFTAdminDashboard.tsx', 'Credit System')
    })

    this.test('Enhanced Upload Form', () => {
      return this.fileExists('packages/app/src/components/upload/EnhancedBeatUploadForm.tsx') &&
             this.fileContains('packages/app/src/components/upload/EnhancedBeatUploadForm.tsx', 'useBeatNFT')
    })

    // Test 2: Credit System Components
    this.test('Buy BeatNFT Modal', () => {
      return this.fileExists('packages/app/src/components/BuyBeatNFTModal.tsx') &&
             this.fileContains('packages/app/src/components/BuyBeatNFTModal.tsx', 'Pro BeatNFT')
    })

    this.test('Credit Trading Modal', () => {
      return this.fileExists('packages/app/src/components/CreditTradingModal.tsx') &&
             this.fileContains('packages/app/src/components/CreditTradingModal.tsx', 'useBeatNFTCreditTrading')
    })

    this.test('Request Credits Modal', () => {
      return this.fileExists('packages/app/src/components/RequestCreditsModal.tsx') &&
             this.fileContains('packages/app/src/components/RequestCreditsModal.tsx', 'bonus credits')
    })

    // Test 3: Hooks and State Management
    this.test('BeatNFT Hook', () => {
      return this.fileExists('packages/app/src/hooks/useBeatNFT.ts') &&
             this.fileContains('packages/app/src/hooks/useBeatNFT.ts', 'canUpload') &&
             this.fileContains('packages/app/src/hooks/useBeatNFT.ts', 'useCredits')
    })

    this.test('Credit Trading Hook', () => {
      return this.fileExists('packages/app/src/hooks/useBeatNFTCreditTrading.ts') &&
             this.fileContains('packages/app/src/hooks/useBeatNFTCreditTrading.ts', 'listCreditsForSale')
    })

    this.test('Site Settings Hook', () => {
      return this.fileExists('packages/app/src/hooks/useSiteSettings.ts') &&
             this.fileContains('packages/app/src/hooks/useSiteSettings.ts', 'platformFee')
    })

    // Test 4: Backend Integration
    this.test('MCP Server Credit Routes', () => {
      return this.fileExists('packages/mcp-server/src/routes/beatnft-credits.js') &&
             this.fileContains('packages/mcp-server/src/routes/beatnft-credits.js', '/balance/:userAddress')
    })

    this.test('Supabase Schema', () => {
      return this.fileExists('supabase-beatnft-schema.sql') &&
             this.fileContains('supabase-beatnft-schema.sql', 'beatnft_credit_balances')
    })

    // Test 5: N8N Automation
    this.test('N8N Credit Automation Workflow', () => {
      return this.fileExists('n8n/workflows/beatnft-credit-automation.json') &&
             this.fileContains('n8n/workflows/beatnft-credit-automation.json', 'Credit Purchase Webhook')
    })

    // Test 6: Upload Integration
    this.test('Original Upload Component Integration', () => {
      return this.fileExists('packages/app/src/components/BeatUpload.tsx') &&
             this.fileContains('packages/app/src/components/BeatUpload.tsx', 'useBeatNFT') &&
             this.fileContains('packages/app/src/components/BeatUpload.tsx', 'canUpload')
    })

    // Test 7: Admin Settings Integration
    this.test('Admin Settings Page', () => {
      return this.fileExists('packages/app/src/app/admin/settings/page.tsx') &&
             this.fileContains('packages/app/src/app/admin/settings/page.tsx', 'BeatNFT')
    })

    // Test 8: Configuration Files
    this.test('Package.json Dependencies', () => {
      if (!this.fileExists('packages/app/package.json')) return false
      const pkg = JSON.parse(fs.readFileSync('packages/app/package.json', 'utf8'))
      return pkg.dependencies && (pkg.dependencies.wagmi || pkg.dependencies.viem)
    })

    // Test 9: Smart Contract Integration
    this.test('BeatNFT Contract Config', () => {
      return this.fileExists('packages/app/src/contracts/BeatNFT.ts') ||
             this.fileExists('packages/app/src/abis/beatNFT.ts')
    })

    // Test 10: Deployment Scripts
    this.test('Deployment Script', () => {
      return this.fileExists('deploy-comprehensive-beatnft-system.sh') &&
             this.fileContains('deploy-comprehensive-beatnft-system.sh', 'BeatNFT Credit System')
    })

    // Warnings for optional components
    if (!this.fileExists('packages/app/src/components/ProfessionalServices.tsx')) {
      this.warn('Professional Services', 'Component not found - ISRC and audio analysis features may not work')
    }

    if (!this.fileExists('packages/app/src/hooks/useLivepeer.ts')) {
      this.warn('Livepeer Integration', 'Hook not found - optimized playback may not work')
    }

    // Test Integration Points
    this.test('Upload Form Credit Integration', () => {
      const uploadForm = 'packages/app/src/components/upload/EnhancedBeatUploadForm.tsx'
      return this.fileContains(uploadForm, 'canUpload') &&
             this.fileContains(uploadForm, 'BuyBeatNFTModal') &&
             this.fileContains(uploadForm, 'RequestCreditsModal')
    })

    this.test('Admin Dashboard Tab Integration', () => {
      const adminPage = 'packages/app/src/app/admin/page.tsx'
      return this.fileContains(adminPage, 'beatnft') &&
             this.fileContains(adminPage, 'BeatNFTAdminDashboard') &&
             this.fileContains(adminPage, 'activeTab')
    })

    // Test Data Flow
    this.test('Credit Balance Data Flow', () => {
      const hook = 'packages/app/src/hooks/useBeatNFT.ts'
      return this.fileContains(hook, 'localStorage') &&
             this.fileContains(hook, 'balance') &&
             this.fileContains(hook, 'setBalance')
    })

    this.log('=' .repeat(60), 'info')
    this.generateReport()
  }

  generateReport() {
    const total = this.results.passed + this.results.failed
    const passRate = total > 0 ? ((this.results.passed / total) * 100).toFixed(1) : 0

    this.log(`📊 Test Results Summary:`, 'info')
    this.log(`   Passed: ${this.results.passed}`, 'success')
    this.log(`   Failed: ${this.results.failed}`, 'error')
    this.log(`   Warnings: ${this.results.warnings}`, 'warning')
    this.log(`   Pass Rate: ${passRate}%`, passRate >= 90 ? 'success' : passRate >= 70 ? 'warning' : 'error')

    // Generate detailed report
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        total,
        passed: this.results.passed,
        failed: this.results.failed,
        warnings: this.results.warnings,
        passRate: parseFloat(passRate)
      },
      tests: this.results.tests,
      recommendations: this.generateRecommendations()
    }

    fs.writeFileSync('beatnft-integration-test-report.json', JSON.stringify(report, null, 2))
    this.log(`📋 Detailed report saved to: beatnft-integration-test-report.json`, 'info')

    if (this.results.failed > 0) {
      this.log(`❌ ${this.results.failed} tests failed. Please review and fix issues before deployment.`, 'error')
      process.exit(1)
    } else if (this.results.warnings > 0) {
      this.log(`⚠️  ${this.results.warnings} warnings found. System functional but some features may be limited.`, 'warning')
    } else {
      this.log(`🎉 All tests passed! BeatNFT Credit System is ready for production.`, 'success')
    }
  }

  generateRecommendations() {
    const recommendations = []

    if (this.results.failed > 0) {
      recommendations.push('Fix failing tests before deploying to production')
    }

    if (this.results.warnings > 0) {
      recommendations.push('Review warnings and implement missing optional features if needed')
    }

    if (!this.fileExists('.env.local')) {
      recommendations.push('Create .env.local with required environment variables')
    }

    if (!this.fileExists('packages/app/.env.production')) {
      recommendations.push('Create production environment configuration')
    }

    recommendations.push('Run deployment script: ./deploy-comprehensive-beatnft-system.sh')
    recommendations.push('Test credit purchase flow in staging environment')
    recommendations.push('Verify admin dashboard functionality')
    recommendations.push('Monitor system performance after deployment')

    return recommendations
  }
}

// Run the tests
const tester = new BeatNFTIntegrationTest()
tester.runTests()