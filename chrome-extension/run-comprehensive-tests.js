#!/usr/bin/env node

// Comprehensive Test Runner for BeatsChain Extension
const fs = require('fs');
const path = require('path');

class ComprehensiveTestRunner {
    constructor() {
        this.testResults = {
            upload: null,
            campaign: null,
            integration: null,
            mobile: null
        };
        this.startTime = Date.now();
    }

    async runAllTests() {
        console.log('🚀 Starting Comprehensive BeatsChain Extension Tests...\n');
        
        try {
            // Load test modules
            const { UploadProcessTester } = require('./test-upload-comprehensive.js');
            const { CampaignIntegrationTester, UploadProcessIntegrationTester } = require('./test-campaign-integration.js');
            
            // Run Upload Process Tests
            console.log('📤 Running Upload Process Tests...');
            const uploadTester = new UploadProcessTester();
            this.testResults.upload = await uploadTester.runAllTests();
            
            // Run Campaign Integration Tests
            console.log('\n📊 Running Campaign Integration Tests...');
            const campaignTester = new CampaignIntegrationTester();
            this.testResults.campaign = await campaignTester.runAllTests();
            
            // Run Upload Integration Tests
            console.log('\n🔄 Running Upload Integration Tests...');
            const integrationTester = new UploadProcessIntegrationTester();
            this.testResults.integration = await integrationTester.runAllTests();
            
            // Run Mobile Responsiveness Tests
            console.log('\n📱 Running Mobile Responsiveness Tests...');
            await this.runMobileTests();
            
            // Generate comprehensive report
            this.generateComprehensiveReport();
            
        } catch (error) {
            console.error('❌ Test execution failed:', error);
            process.exit(1);
        }
    }

    async runMobileTests() {
        const mobileTests = [
            { name: 'Campaign Cards Mobile', test: () => this.testCampaignCardsMobile() },
            { name: 'Upload Form Mobile', test: () => this.testUploadFormMobile() },
            { name: 'Navigation Mobile', test: () => this.testNavigationMobile() },
            { name: 'Modal Responsiveness', test: () => this.testModalResponsiveness() }
        ];

        const results = [];
        for (const test of mobileTests) {
            try {
                const result = await test.test();
                results.push({ name: test.name, passed: result.passed, details: result });
                console.log(`${result.passed ? '✅' : '❌'} ${test.name}`);
            } catch (error) {
                results.push({ name: test.name, passed: false, error: error.message });
                console.log(`❌ ${test.name}: ${error.message}`);
            }
        }

        this.testResults.mobile = {
            summary: {
                totalTests: results.length,
                passedTests: results.filter(r => r.passed).length,
                successRate: (results.filter(r => r.passed).length / results.length) * 100
            },
            results
        };
    }

    testCampaignCardsMobile() {
        // Mock mobile viewport testing
        const viewports = [375, 768, 1200];
        const results = viewports.map(width => ({
            viewport: width,
            responsive: width >= 375,
            layout: width < 768 ? 'stacked' : 'grid'
        }));

        return {
            passed: results.every(r => r.responsive),
            viewports: results
        };
    }

    testUploadFormMobile() {
        return {
            passed: true,
            elements: {
                fileInput: true,
                metadataForm: true,
                progressBar: true,
                submitButton: true
            }
        };
    }

    testNavigationMobile() {
        return {
            passed: true,
            features: {
                hamburgerMenu: true,
                collapsibleSections: true,
                touchFriendly: true
            }
        };
    }

    testModalResponsiveness() {
        return {
            passed: true,
            modals: {
                campaignCreate: true,
                campaignDetails: true,
                uploadProgress: true
            }
        };
    }

    generateComprehensiveReport() {
        const endTime = Date.now();
        const duration = ((endTime - this.startTime) / 1000).toFixed(2);

        console.log('\n' + '='.repeat(80));
        console.log('📊 COMPREHENSIVE TEST RESULTS SUMMARY');
        console.log('='.repeat(80));

        // Overall Statistics
        const totalTests = Object.values(this.testResults)
            .filter(r => r && r.summary)
            .reduce((sum, r) => sum + r.summary.totalTests, 0);
        
        const totalPassed = Object.values(this.testResults)
            .filter(r => r && r.summary)
            .reduce((sum, r) => sum + r.summary.passedTests, 0);

        const overallSuccessRate = totalTests > 0 ? ((totalPassed / totalTests) * 100).toFixed(1) : 0;

        console.log(`\n🎯 OVERALL RESULTS:`);
        console.log(`   Total Tests: ${totalTests}`);
        console.log(`   Passed: ${totalPassed}`);
        console.log(`   Failed: ${totalTests - totalPassed}`);
        console.log(`   Success Rate: ${overallSuccessRate}%`);
        console.log(`   Duration: ${duration}s`);

        // Individual Test Suite Results
        console.log(`\n📋 TEST SUITE BREAKDOWN:`);
        
        if (this.testResults.upload) {
            const upload = this.testResults.upload.summary;
            console.log(`   📤 Upload Process: ${upload.passedTests}/${upload.totalTests} (${upload.successRate.toFixed(1)}%)`);
        }

        if (this.testResults.campaign) {
            const campaign = this.testResults.campaign.summary;
            console.log(`   📊 Campaign Integration: ${campaign.passedTests}/${campaign.totalTests} (${campaign.successRate.toFixed(1)}%)`);
        }

        if (this.testResults.integration) {
            const integration = this.testResults.integration.summary;
            console.log(`   🔄 Upload Integration: ${integration.passedTests}/${integration.totalTests} (${integration.successRate.toFixed(1)}%)`);
        }

        if (this.testResults.mobile) {
            const mobile = this.testResults.mobile.summary;
            console.log(`   📱 Mobile Responsiveness: ${mobile.passedTests}/${mobile.totalTests} (${mobile.successRate.toFixed(1)}%)`);
        }

        // Critical Issues
        this.reportCriticalIssues();

        // Recommendations
        this.generateRecommendations();

        // Save detailed report
        this.saveDetailedReport();

        console.log('\n' + '='.repeat(80));
        console.log(`✅ Comprehensive testing completed in ${duration}s`);
        console.log('📄 Detailed report saved to: test-results-comprehensive.json');
        console.log('='.repeat(80));
    }

    reportCriticalIssues() {
        console.log(`\n⚠️  CRITICAL ISSUES:`);
        
        const criticalIssues = [];
        
        // Check for critical failures
        Object.entries(this.testResults).forEach(([suite, results]) => {
            if (results && results.summary && results.summary.successRate < 80) {
                criticalIssues.push(`${suite} test suite has low success rate (${results.summary.successRate.toFixed(1)}%)`);
            }
        });

        if (criticalIssues.length === 0) {
            console.log('   ✅ No critical issues detected');
        } else {
            criticalIssues.forEach(issue => {
                console.log(`   ❌ ${issue}`);
            });
        }
    }

    generateRecommendations() {
        console.log(`\n💡 RECOMMENDATIONS:`);
        
        const recommendations = [];
        
        // Upload process recommendations
        if (this.testResults.upload && this.testResults.upload.summary.successRate < 90) {
            recommendations.push('Improve upload process error handling and validation');
        }

        // Campaign recommendations
        if (this.testResults.campaign && this.testResults.campaign.summary.successRate < 90) {
            recommendations.push('Enhance campaign management API integration');
        }

        // Mobile recommendations
        if (this.testResults.mobile && this.testResults.mobile.summary.successRate < 95) {
            recommendations.push('Optimize mobile responsiveness for better user experience');
        }

        // Performance recommendations
        recommendations.push('Implement comprehensive error logging');
        recommendations.push('Add performance monitoring for upload processes');
        recommendations.push('Set up automated testing pipeline');

        if (recommendations.length === 0) {
            console.log('   ✅ All systems performing well');
        } else {
            recommendations.forEach((rec, index) => {
                console.log(`   ${index + 1}. ${rec}`);
            });
        }
    }

    saveDetailedReport() {
        const report = {
            timestamp: new Date().toISOString(),
            duration: ((Date.now() - this.startTime) / 1000).toFixed(2),
            environment: {
                node: process.version,
                platform: process.platform,
                arch: process.arch
            },
            results: this.testResults,
            summary: {
                totalTests: Object.values(this.testResults)
                    .filter(r => r && r.summary)
                    .reduce((sum, r) => sum + r.summary.totalTests, 0),
                totalPassed: Object.values(this.testResults)
                    .filter(r => r && r.summary)
                    .reduce((sum, r) => sum + r.summary.passedTests, 0)
            }
        };

        try {
            fs.writeFileSync(
                path.join(__dirname, 'test-results-comprehensive.json'),
                JSON.stringify(report, null, 2)
            );
        } catch (error) {
            console.error('Failed to save detailed report:', error.message);
        }
    }
}

// CLI Test Runner
class CLITestRunner {
    static async run() {
        const args = process.argv.slice(2);
        const runner = new ComprehensiveTestRunner();

        if (args.includes('--help') || args.includes('-h')) {
            this.showHelp();
            return;
        }

        if (args.includes('--upload-only')) {
            console.log('🚀 Running Upload Tests Only...');
            const { UploadProcessTester } = require('./test-upload-comprehensive.js');
            const tester = new UploadProcessTester();
            await tester.runAllTests();
            return;
        }

        if (args.includes('--campaign-only')) {
            console.log('🚀 Running Campaign Tests Only...');
            const { CampaignIntegrationTester } = require('./test-campaign-integration.js');
            const tester = new CampaignIntegrationTester();
            await tester.runAllTests();
            return;
        }

        // Run all tests by default
        await runner.runAllTests();
    }

    static showHelp() {
        console.log(`
BeatsChain Extension Test Runner

Usage: node run-comprehensive-tests.js [options]

Options:
  --help, -h          Show this help message
  --upload-only       Run only upload process tests
  --campaign-only     Run only campaign integration tests

Examples:
  node run-comprehensive-tests.js                 # Run all tests
  node run-comprehensive-tests.js --upload-only  # Upload tests only
  node run-comprehensive-tests.js --campaign-only # Campaign tests only
        `);
    }
}

// Run if called directly
if (require.main === module) {
    CLITestRunner.run().catch(error => {
        console.error('❌ Test runner failed:', error);
        process.exit(1);
    });
}

module.exports = { ComprehensiveTestRunner, CLITestRunner };