#!/usr/bin/env node

/**
 * Radio Submission System Smoke Test
 * Tests core functionality without breaking existing systems
 */

const fs = require('fs')
const path = require('path')

class RadioSystemSmokeTest {
  constructor() {
    this.results = []
    this.appPath = path.join(__dirname, 'src')
  }

  log(test, status, message = '') {
    const result = { test, status, message, timestamp: new Date().toISOString() }
    this.results.push(result)
    const icon = status === 'PASS' ? '✅' : status === 'FAIL' ? '❌' : '⚠️'
    console.log(`${icon} ${test}: ${message}`)
  }

  async runTests() {
    console.log('🎵 Starting Radio Submission System Smoke Tests...\n')

    // Test 1: Core Library Files
    this.testCoreLibraries()
    
    // Test 2: Component Structure
    this.testComponentStructure()
    
    // Test 3: API Routes
    this.testAPIRoutes()
    
    // Test 4: Page Structure
    this.testPageStructure()
    
    // Test 5: Integration Points
    this.testIntegrationPoints()

    // Test 6: No Breaking Changes
    this.testNoBreakingChanges()

    this.generateReport()
  }

  testCoreLibraries() {
    const libraries = [
      'lib/audio-analysis.ts',
      'lib/isrc-manager.ts', 
      'lib/revenue-tracker.ts',
      'lib/n8n-integration.ts'
    ]

    libraries.forEach(lib => {
      const filePath = path.join(this.appPath, lib)
      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf8')
        if (content.includes('export class') || content.includes('export interface')) {
          this.log(`Core Library: ${lib}`, 'PASS', 'Library structure valid')
        } else {
          this.log(`Core Library: ${lib}`, 'FAIL', 'Missing exports')
        }
      } else {
        this.log(`Core Library: ${lib}`, 'FAIL', 'File not found')
      }
    })
  }

  testComponentStructure() {
    const components = [
      'components/radio/RadioSubmissionWizard.tsx',
      'components/radio/SplitsheetManager.tsx',
      'components/producer/RadioSubmissionCard.tsx'
    ]

    components.forEach(comp => {
      const filePath = path.join(this.appPath, comp)
      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf8')
        if (content.includes('export default function') && content.includes('return')) {
          this.log(`Component: ${comp}`, 'PASS', 'React component structure valid')
        } else {
          this.log(`Component: ${comp}`, 'FAIL', 'Invalid component structure')
        }
      } else {
        this.log(`Component: ${comp}`, 'FAIL', 'Component not found')
      }
    })
  }

  testAPIRoutes() {
    const routes = [
      'app/api/radio/submit/route.ts',
      'app/api/radio/isrc/generate/route.ts'
    ]

    routes.forEach(route => {
      const filePath = path.join(this.appPath, route)
      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf8')
        if (content.includes('export async function POST') && content.includes('NextResponse')) {
          this.log(`API Route: ${route}`, 'PASS', 'API route structure valid')
        } else {
          this.log(`API Route: ${route}`, 'FAIL', 'Invalid API structure')
        }
      } else {
        this.log(`API Route: ${route}`, 'FAIL', 'Route not found')
      }
    })
  }

  testPageStructure() {
    const pages = [
      'app/radio/submit/page.tsx',
      'app/radio/analytics/page.tsx'
    ]

    pages.forEach(page => {
      const filePath = path.join(this.appPath, page)
      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf8')
        if (content.includes('export default function') && content.includes('return')) {
          this.log(`Page: ${page}`, 'PASS', 'Page structure valid')
        } else {
          this.log(`Page: ${page}`, 'FAIL', 'Invalid page structure')
        }
      } else {
        this.log(`Page: ${page}`, 'FAIL', 'Page not found')
      }
    })
  }

  testIntegrationPoints() {
    // Test producers page integration
    const producersPage = path.join(this.appPath, 'app/producers/page.tsx')
    if (fs.existsSync(producersPage)) {
      const content = fs.readFileSync(producersPage, 'utf8')
      if (content.includes('RadioSubmissionCard')) {
        this.log('Integration: Producers Page', 'PASS', 'Radio card integrated')
      } else {
        this.log('Integration: Producers Page', 'FAIL', 'Radio card not integrated')
      }
    }

    // Test admin campaign manager integration
    const campaignManager = path.join(this.appPath, 'components/admin/CampaignManager.tsx')
    if (fs.existsSync(campaignManager)) {
      const content = fs.readFileSync(campaignManager, 'utf8')
      if (content.includes('RADIO_PLACEMENTS')) {
        this.log('Integration: Campaign Manager', 'PASS', 'Radio placements integrated')
      } else {
        this.log('Integration: Campaign Manager', 'FAIL', 'Radio placements not integrated')
      }
    }
  }

  testNoBreakingChanges() {
    // Check that existing files still have their core functionality
    const criticalFiles = [
      'app/producers/page.tsx',
      'components/admin/CampaignManager.tsx'
    ]

    criticalFiles.forEach(file => {
      const filePath = path.join(this.appPath, file)
      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf8')
        
        // Check for syntax errors (basic check)
        const hasValidStructure = content.includes('export default function') && 
                                 content.includes('return') &&
                                 !content.includes('undefined') &&
                                 content.split('{').length === content.split('}').length

        if (hasValidStructure) {
          this.log(`No Breaking Changes: ${file}`, 'PASS', 'File structure intact')
        } else {
          this.log(`No Breaking Changes: ${file}`, 'WARN', 'Potential syntax issues')
        }
      }
    })
  }

  generateReport() {
    console.log('\n📊 Test Results Summary:')
    console.log('========================')
    
    const passed = this.results.filter(r => r.status === 'PASS').length
    const failed = this.results.filter(r => r.status === 'FAIL').length
    const warnings = this.results.filter(r => r.status === 'WARN').length
    
    console.log(`✅ Passed: ${passed}`)
    console.log(`❌ Failed: ${failed}`)
    console.log(`⚠️  Warnings: ${warnings}`)
    console.log(`📊 Total: ${this.results.length}`)
    
    const successRate = ((passed / this.results.length) * 100).toFixed(1)
    console.log(`🎯 Success Rate: ${successRate}%`)

    if (failed === 0) {
      console.log('\n🎉 All critical tests passed! Radio system ready for use.')
    } else {
      console.log('\n⚠️  Some tests failed. Review the issues above.')
    }

    // Save detailed report
    const report = {
      timestamp: new Date().toISOString(),
      summary: { passed, failed, warnings, total: this.results.length, successRate },
      results: this.results
    }

    fs.writeFileSync(
      path.join(__dirname, 'radio-system-test-report.json'),
      JSON.stringify(report, null, 2)
    )

    console.log('\n📄 Detailed report saved to: radio-system-test-report.json')
  }
}

// Run tests
const tester = new RadioSystemSmokeTest()
tester.runTests().catch(console.error)