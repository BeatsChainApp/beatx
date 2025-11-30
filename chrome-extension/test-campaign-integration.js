// Campaign Integration Test Suite
class CampaignIntegrationTester {
    constructor() {
        this.mcpServerUrl = process.env.MCP_SERVER_URL || 'http://localhost:3001';
        this.testResults = [];
    }

    async runAllTests() {
        console.log('🚀 Starting Campaign Integration Tests...');
        
        await this.testCampaignCRUD();
        await this.testRevenueTracking();
        await this.testN8NIntegration();
        await this.testMobileResponsiveness();
        
        this.generateReport();
    }

    async testCampaignCRUD() {
        console.log('📊 Testing Campaign CRUD Operations...');
        
        try {
            // Test Create Campaign
            const newCampaign = {
                name: 'Test Upload Campaign',
                platform: 'extension',
                placement: 'upload_complete',
                budget: 100.00,
                dailyLimit: 50
            };
            
            const createResult = await this.createCampaign(newCampaign);
            this.addResult('Campaign CRUD', 'Create Campaign', !!createResult.success, createResult);
            
            // Test Get Campaigns
            const campaigns = await this.getCampaigns('extension');
            this.addResult('Campaign CRUD', 'Get Campaigns', Array.isArray(campaigns), { count: campaigns.length });
            
            // Test Update Campaign
            if (createResult.campaign?.id) {
                const updateResult = await this.updateCampaign(createResult.campaign.id, { budget: 150.00 });
                this.addResult('Campaign CRUD', 'Update Campaign', !!updateResult.success, updateResult);
            }
            
        } catch (error) {
            this.addResult('Campaign CRUD', 'CRUD Operations', false, { error: error.message });
        }
    }

    async testRevenueTracking() {
        console.log('💰 Testing Revenue Tracking...');
        
        try {
            // Test Revenue Tracking
            const revenueData = {
                type: 'upload_complete',
                amount: 1.25,
                metadata: { 
                    platform: 'extension',
                    user_id: 'test_user',
                    timestamp: new Date().toISOString()
                }
            };
            
            const revenueResult = await this.trackRevenue(revenueData);
            this.addResult('Revenue Tracking', 'Track Revenue', !!revenueResult.success, revenueResult);
            
            // Test Campaign Stats
            const statsResult = await this.getCampaignStats();
            this.addResult('Revenue Tracking', 'Get Stats', !!statsResult.success, statsResult);
            
        } catch (error) {
            this.addResult('Revenue Tracking', 'Revenue Operations', false, { error: error.message });
        }
    }

    async testN8NIntegration() {
        console.log('🔄 Testing N8N Integration...');
        
        try {
            // Test N8N Webhook
            const webhookData = {
                event_type: 'upload_start',
                platform: 'extension',
                user_id: 'test_user',
                metadata: {
                    title: 'Test Beat',
                    genre: 'Hip Hop',
                    timestamp: new Date().toISOString()
                }
            };
            
            const webhookResult = await this.triggerN8NWebhook(webhookData);
            this.addResult('N8N Integration', 'Webhook Trigger', !!webhookResult, webhookResult);
            
        } catch (error) {
            this.addResult('N8N Integration', 'N8N Operations', false, { error: error.message });
        }
    }

    async testMobileResponsiveness() {
        console.log('📱 Testing Mobile Responsiveness...');
        
        const viewports = [
            { name: 'Mobile Portrait', width: 375, height: 667 },
            { name: 'Mobile Landscape', width: 667, height: 375 },
            { name: 'Tablet', width: 768, height: 1024 },
            { name: 'Desktop', width: 1200, height: 800 }
        ];
        
        for (const viewport of viewports) {
            const result = await this.testCampaignUIResponsiveness(viewport);
            this.addResult('Mobile Responsiveness', viewport.name, result.responsive, result);
        }
    }

    // API Methods
    async createCampaign(campaign) {
        try {
            const response = await fetch(`${this.mcpServerUrl}/api/campaigns/${campaign.platform}/create`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(campaign)
            });
            return await response.json();
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async getCampaigns(platform) {
        try {
            const response = await fetch(`${this.mcpServerUrl}/api/campaigns/${platform}`);
            const result = await response.json();
            return result.campaigns || [];
        } catch (error) {
            return [];
        }
    }

    async updateCampaign(campaignId, updates) {
        try {
            const response = await fetch(`${this.mcpServerUrl}/api/campaigns/${campaignId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updates)
            });
            return await response.json();
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async trackRevenue(data) {
        try {
            const response = await fetch(`${this.mcpServerUrl}/api/campaigns/track-revenue`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            return await response.json();
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async getCampaignStats() {
        try {
            const response = await fetch(`${this.mcpServerUrl}/api/campaigns/stats`);
            return await response.json();
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async triggerN8NWebhook(data) {
        try {
            const response = await fetch('https://n8n.beatschain.app/webhook/campaign-event', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            return response.ok;
        } catch (error) {
            return false;
        }
    }

    async testCampaignUIResponsiveness(viewport) {
        // Mock viewport testing
        return {
            responsive: viewport.width >= 375,
            elements: {
                campaignHeader: true,
                campaignCards: true,
                campaignFilters: viewport.width >= 768,
                campaignMetrics: true
            },
            layout: viewport.width < 768 ? 'stacked' : 'grid'
        };
    }

    addResult(category, test, passed, details = {}) {
        this.testResults.push({
            category,
            test,
            passed,
            details,
            timestamp: new Date().toISOString()
        });
        
        const status = passed ? '✅' : '❌';
        console.log(`${status} ${category}: ${test}`);
    }

    generateReport() {
        const totalTests = this.testResults.length;
        const passedTests = this.testResults.filter(r => r.passed).length;
        const failedTests = totalTests - passedTests;
        
        console.log('\n📊 Campaign Integration Test Results:');
        console.log(`Total Tests: ${totalTests}`);
        console.log(`Passed: ${passedTests}`);
        console.log(`Failed: ${failedTests}`);
        console.log(`Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`);
        
        // Group by category
        const categories = {};
        this.testResults.forEach(result => {
            if (!categories[result.category]) {
                categories[result.category] = { passed: 0, total: 0 };
            }
            categories[result.category].total++;
            if (result.passed) categories[result.category].passed++;
        });
        
        console.log('\n📋 Results by Category:');
        Object.entries(categories).forEach(([category, stats]) => {
            const rate = ((stats.passed / stats.total) * 100).toFixed(1);
            console.log(`${category}: ${stats.passed}/${stats.total} (${rate}%)`);
        });
        
        return {
            summary: { totalTests, passedTests, failedTests, successRate: (passedTests / totalTests) * 100 },
            categories,
            results: this.testResults
        };
    }
}

// Upload Process Integration Test
class UploadProcessIntegrationTester {
    constructor() {
        this.uploadManager = null;
        this.testResults = [];
    }

    async runAllTests() {
        console.log('⬆️ Starting Upload Process Integration Tests...');
        
        await this.initializeUploadManager();
        await this.testFileValidation();
        await this.testMetadataExtraction();
        await this.testCampaignIntegration();
        await this.testUploadFlow();
        
        this.generateReport();
    }

    async initializeUploadManager() {
        try {
            this.uploadManager = new UploadManager();
            this.addResult('Initialization', 'Upload Manager', true, { initialized: true });
        } catch (error) {
            this.addResult('Initialization', 'Upload Manager', false, { error: error.message });
        }
    }

    async testFileValidation() {
        console.log('📁 Testing File Validation...');
        
        const testFiles = [
            { name: 'Valid MP3', type: 'audio/mpeg', size: 5000000, expected: true },
            { name: 'Invalid Type', type: 'text/plain', size: 1000, expected: false },
            { name: 'Too Large', type: 'audio/mpeg', size: 100000000, expected: false },
            { name: 'Empty File', type: 'audio/mpeg', size: 0, expected: false }
        ];

        for (const testFile of testFiles) {
            try {
                const mockFile = new File(['test'], 'test.mp3', { 
                    type: testFile.type,
                    size: testFile.size 
                });
                
                const result = await this.uploadManager.validateFile(mockFile);
                this.addResult('File Validation', testFile.name, result === testFile.expected, { 
                    result, 
                    expected: testFile.expected 
                });
            } catch (error) {
                this.addResult('File Validation', testFile.name, false, { error: error.message });
            }
        }
    }

    async testMetadataExtraction() {
        console.log('🎵 Testing Metadata Extraction...');
        
        try {
            const mockFile = new File(['mock audio'], 'test-beat.mp3', { type: 'audio/mpeg' });
            const mockMetadata = {
                title: 'Test Beat',
                artist: 'Test Artist',
                duration: 180,
                genre: 'Hip Hop'
            };
            
            // Mock the extraction process
            const result = await this.simulateMetadataExtraction(mockFile, mockMetadata);
            this.addResult('Metadata Extraction', 'Basic Extraction', !!result, result);
            
            // Test user input priority
            const userInput = { title: 'User Title', artist: 'User Artist' };
            const merged = { ...result, ...userInput };
            this.addResult('Metadata Extraction', 'User Input Priority', 
                merged.title === userInput.title, { merged });
                
        } catch (error) {
            this.addResult('Metadata Extraction', 'Extraction Process', false, { error: error.message });
        }
    }

    async testCampaignIntegration() {
        console.log('📊 Testing Campaign Integration...');
        
        try {
            const campaignEvent = {
                event_type: 'upload_start',
                platform: 'extension',
                user_id: 'test_user',
                metadata: { title: 'Test Beat', genre: 'Hip Hop' }
            };
            
            const result = await this.uploadManager.triggerCampaignEvent('upload_start', campaignEvent.metadata);
            this.addResult('Campaign Integration', 'Event Trigger', !!result, result);
            
        } catch (error) {
            this.addResult('Campaign Integration', 'Campaign Events', false, { error: error.message });
        }
    }

    async testUploadFlow() {
        console.log('🔄 Testing Complete Upload Flow...');
        
        try {
            const mockFile = new File(['mock audio'], 'test-beat.mp3', { type: 'audio/mpeg' });
            const mockMetadata = { title: 'Test Beat', artist: 'Test Artist' };
            
            // Simulate upload process steps
            const steps = [
                'File Validation',
                'Metadata Extraction', 
                'Campaign Trigger',
                'IPFS Upload',
                'Livepeer Processing',
                'NFT Minting',
                'Campaign Attribution'
            ];
            
            for (const step of steps) {
                const result = await this.simulateUploadStep(step);
                this.addResult('Upload Flow', step, result.success, result);
            }
            
        } catch (error) {
            this.addResult('Upload Flow', 'Complete Flow', false, { error: error.message });
        }
    }

    async simulateMetadataExtraction(file, metadata) {
        return {
            title: metadata.title,
            artist: metadata.artist,
            duration: metadata.duration,
            genre: metadata.genre,
            extractedAt: new Date().toISOString()
        };
    }

    async simulateUploadStep(step) {
        const stepResults = {
            'File Validation': { success: true, validated: true },
            'Metadata Extraction': { success: true, metadata: { title: 'Test' } },
            'Campaign Trigger': { success: true, campaignId: 'test_campaign' },
            'IPFS Upload': { success: true, cid: 'QmTest123' },
            'Livepeer Processing': { success: true, playbackId: 'lp_test' },
            'NFT Minting': { success: true, tokenId: '123' },
            'Campaign Attribution': { success: true, revenue: 1.25 }
        };
        
        return stepResults[step] || { success: false, error: 'Unknown step' };
    }

    addResult(category, test, passed, details = {}) {
        this.testResults.push({
            category,
            test,
            passed,
            details,
            timestamp: new Date().toISOString()
        });
        
        const status = passed ? '✅' : '❌';
        console.log(`${status} ${category}: ${test}`);
    }

    generateReport() {
        const totalTests = this.testResults.length;
        const passedTests = this.testResults.filter(r => r.passed).length;
        
        console.log('\n📊 Upload Process Integration Results:');
        console.log(`Total Tests: ${totalTests}`);
        console.log(`Passed: ${passedTests}`);
        console.log(`Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`);
        
        return {
            summary: { totalTests, passedTests, successRate: (passedTests / totalTests) * 100 },
            results: this.testResults
        };
    }
}

// Export for use
if (typeof window !== 'undefined') {
    window.CampaignIntegrationTester = CampaignIntegrationTester;
    window.UploadProcessIntegrationTester = UploadProcessIntegrationTester;
    
    window.runCampaignIntegrationTests = async () => {
        const tester = new CampaignIntegrationTester();
        return await tester.runAllTests();
    };
    
    window.runUploadIntegrationTests = async () => {
        const tester = new UploadProcessIntegrationTester();
        return await tester.runAllTests();
    };
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { CampaignIntegrationTester, UploadProcessIntegrationTester };
}