#!/usr/bin/env node

// Comprehensive Unified Profiles System Test Suite

const axios = require('axios');
const crypto = require('crypto');

class UnifiedProfilesTestSuite {
    constructor() {
        this.mcpUrl = process.env.MCP_SERVER_URL || 'https://beatschain-mcp-server-production.up.railway.app';
        this.testResults = [];
        this.testUsers = [];
    }

    async runAllTests() {
        console.log('🧪 Starting Unified Profiles System Test Suite...\n');
        
        try {
            // Test 1: MCP Server Health
            await this.testMcpServerHealth();
            
            // Test 2: Profile Authentication
            await this.testProfileAuthentication();
            
            // Test 3: Profile Merging
            await this.testProfileMerging();
            
            // Test 4: Cross-Platform Sync
            await this.testCrossPlatformSync();
            
            // Test 5: Wallet Management
            await this.testWalletManagement();
            
            // Test 6: WhatsApp Integration
            await this.testWhatsAppIntegration();
            
            // Test 7: Role-Based Access
            await this.testRoleBasedAccess();
            
            // Test 8: Profile Updates
            await this.testProfileUpdates();
            
            // Test 9: Activity Logging
            await this.testActivityLogging();
            
            // Test 10: Performance Test
            await this.testPerformance();
            
            // Generate test report
            this.generateTestReport();
            
        } catch (error) {
            console.error('❌ Test suite failed:', error);
            process.exit(1);
        }
    }

    async testMcpServerHealth() {
        console.log('🏥 Testing MCP Server Health...');
        
        try {
            const response = await axios.get(`${this.mcpUrl}/api/profiles/health`, {
                timeout: 10000
            });
            
            if (response.status === 200 && response.data.success) {
                this.addTestResult('MCP Server Health', true, 'Server is healthy and responding');
                console.log('✅ MCP Server is healthy');
                console.log(`   - Database: ${response.data.status.database_status}`);
                console.log(`   - Total Profiles: ${response.data.status.total_profiles}`);
                console.log(`   - Storage Adapters: ${response.data.status.storage_adapters.join(', ')}`);
            } else {
                throw new Error('Health check returned unexpected response');
            }
        } catch (error) {
            this.addTestResult('MCP Server Health', false, error.message);
            console.log('❌ MCP Server health check failed');
            throw error;
        }
    }

    async testProfileAuthentication() {
        console.log('\n🔐 Testing Profile Authentication...');
        
        const testCases = [
            {
                name: 'Google OAuth User',
                userData: {
                    email: 'test.user@gmail.com',
                    google_id: 'google_123456789',
                    display_name: 'Test User',
                    verified_email: true,
                    platform: 'app',
                    auth_method: 'google'
                }
            },
            {
                name: 'Wallet User',
                userData: {
                    wallet_address: '0x1234567890123456789012345678901234567890',
                    display_name: 'Wallet User',
                    platform: 'extension',
                    auth_method: 'wallet'
                }
            },
            {
                name: 'WhatsApp User',
                userData: {
                    whatsapp_id: '+1234567890',
                    display_name: 'WhatsApp User',
                    platform: 'whatsapp',
                    auth_method: 'whatsapp'
                }
            }
        ];

        for (const testCase of testCases) {
            try {
                console.log(`   Testing ${testCase.name}...`);
                
                const response = await axios.post(`${this.mcpUrl}/api/profiles/authenticate`, testCase.userData);
                
                if (response.data.success && response.data.profile) {
                    this.addTestResult(`Authentication - ${testCase.name}`, true, 'Profile created/authenticated successfully');
                    this.testUsers.push(response.data.profile);
                    console.log(`   ✅ ${testCase.name} authenticated successfully`);
                    console.log(`      User ID: ${response.data.profile.user_id}`);
                } else {
                    throw new Error(response.data.error || 'Authentication failed');
                }
            } catch (error) {
                this.addTestResult(`Authentication - ${testCase.name}`, false, error.message);
                console.log(`   ❌ ${testCase.name} authentication failed: ${error.message}`);
            }
        }
    }

    async testProfileMerging() {
        console.log('\n🔗 Testing Profile Merging...');
        
        try {
            // Create two profiles for the same user
            const userData1 = {
                email: 'merge.test@gmail.com',
                google_id: 'google_merge_123',
                display_name: 'Merge Test User',
                platform: 'app'
            };
            
            const userData2 = {
                email: 'merge.test@gmail.com',
                wallet_address: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd',
                display_name: 'Merge Test User',
                platform: 'extension'
            };

            // Authenticate both - should merge automatically
            const response1 = await axios.post(`${this.mcpUrl}/api/profiles/authenticate`, userData1);
            const response2 = await axios.post(`${this.mcpUrl}/api/profiles/authenticate`, userData2);

            if (response1.data.success && response2.data.success) {
                const profile1 = response1.data.profile;
                const profile2 = response2.data.profile;
                
                // Check if profiles were merged (same user_id)
                if (profile1.user_id === profile2.user_id) {
                    this.addTestResult('Profile Merging', true, 'Profiles merged successfully by email');
                    console.log('✅ Profile merging works correctly');
                    console.log(`   Merged User ID: ${profile1.user_id}`);
                } else {
                    throw new Error('Profiles were not merged');
                }
            } else {
                throw new Error('Failed to create test profiles for merging');
            }
        } catch (error) {
            this.addTestResult('Profile Merging', false, error.message);
            console.log(`❌ Profile merging test failed: ${error.message}`);
        }
    }

    async testCrossPlatformSync() {
        console.log('\n🔄 Testing Cross-Platform Sync...');
        
        if (this.testUsers.length === 0) {
            console.log('⚠️ No test users available for sync test');
            return;
        }

        try {
            const testUser = this.testUsers[0];
            
            // Trigger sync
            const syncResponse = await axios.post(`${this.mcpUrl}/api/profiles/${testUser.user_id}/sync`, {
                platform: 'test'
            });

            if (syncResponse.data.success) {
                this.addTestResult('Cross-Platform Sync', true, 'Profile sync completed successfully');
                console.log('✅ Cross-platform sync works');
            } else {
                throw new Error(syncResponse.data.error || 'Sync failed');
            }
        } catch (error) {
            this.addTestResult('Cross-Platform Sync', false, error.message);
            console.log(`❌ Cross-platform sync test failed: ${error.message}`);
        }
    }

    async testWalletManagement() {
        console.log('\n💳 Testing Wallet Management...');
        
        if (this.testUsers.length === 0) {
            console.log('⚠️ No test users available for wallet test');
            return;
        }

        try {
            const testUser = this.testUsers[0];
            const testWallet = '0x' + crypto.randomBytes(20).toString('hex');
            
            // Add wallet
            const addResponse = await axios.post(`${this.mcpUrl}/api/profiles/${testUser.user_id}/wallets`, {
                platform: 'test',
                wallet_address: testWallet,
                wallet_type: 'connected',
                is_primary: false
            });

            if (addResponse.data.success) {
                // Get wallets
                const getResponse = await axios.get(`${this.mcpUrl}/api/profiles/${testUser.user_id}/wallets`);
                
                if (getResponse.data.success && getResponse.data.wallets.length > 0) {
                    const hasTestWallet = getResponse.data.wallets.some(w => w.wallet_address === testWallet.toLowerCase());
                    
                    if (hasTestWallet) {
                        this.addTestResult('Wallet Management', true, 'Wallet added and retrieved successfully');
                        console.log('✅ Wallet management works');
                        console.log(`   Added wallet: ${testWallet}`);
                    } else {
                        throw new Error('Test wallet not found in wallet list');
                    }
                } else {
                    throw new Error('Failed to retrieve wallets');
                }
            } else {
                throw new Error(addResponse.data.error || 'Failed to add wallet');
            }
        } catch (error) {
            this.addTestResult('Wallet Management', false, error.message);
            console.log(`❌ Wallet management test failed: ${error.message}`);
        }
    }

    async testWhatsAppIntegration() {
        console.log('\n💬 Testing WhatsApp Integration...');
        
        try {
            const whatsappData = {
                whatsapp_id: '+1234567890',
                profile_data: {
                    name: 'WhatsApp Test User',
                    phone: '+1234567890'
                }
            };

            const response = await axios.post(`${this.mcpUrl}/api/profiles/whatsapp/sync`, whatsappData);

            if (response.data.success && response.data.profile) {
                this.addTestResult('WhatsApp Integration', true, 'WhatsApp profile sync successful');
                console.log('✅ WhatsApp integration works');
                console.log(`   WhatsApp User ID: ${response.data.profile.user_id}`);
            } else {
                throw new Error(response.data.error || 'WhatsApp sync failed');
            }
        } catch (error) {
            this.addTestResult('WhatsApp Integration', false, error.message);
            console.log(`❌ WhatsApp integration test failed: ${error.message}`);
        }
    }

    async testRoleBasedAccess() {
        console.log('\n👑 Testing Role-Based Access...');
        
        try {
            // Test admin user
            const adminData = {
                email: 'admin@beatschain.com',
                display_name: 'Admin User',
                platform: 'app'
            };

            const response = await axios.post(`${this.mcpUrl}/api/profiles/authenticate`, adminData);

            if (response.data.success && response.data.profile) {
                const profile = response.data.profile;
                
                if (profile.app_role === 'SUPER_ADMIN' || profile.extension_role === 'SUPER_ADMIN') {
                    this.addTestResult('Role-Based Access', true, 'Admin role assigned correctly');
                    console.log('✅ Role-based access works');
                    console.log(`   Admin role: ${profile.app_role}`);
                } else {
                    throw new Error(`Expected admin role, got: ${profile.app_role}`);
                }
            } else {
                throw new Error(response.data.error || 'Admin authentication failed');
            }
        } catch (error) {
            this.addTestResult('Role-Based Access', false, error.message);
            console.log(`❌ Role-based access test failed: ${error.message}`);
        }
    }

    async testProfileUpdates() {
        console.log('\n📝 Testing Profile Updates...');
        
        if (this.testUsers.length === 0) {
            console.log('⚠️ No test users available for update test');
            return;
        }

        try {
            const testUser = this.testUsers[0];
            const newBio = `Updated bio at ${new Date().toISOString()}`;
            
            const response = await axios.put(`${this.mcpUrl}/api/profiles/${testUser.user_id}`, {
                bio: newBio,
                platform: 'test'
            });

            if (response.data.success && response.data.profile) {
                if (response.data.profile.bio === newBio) {
                    this.addTestResult('Profile Updates', true, 'Profile updated successfully');
                    console.log('✅ Profile updates work');
                    console.log(`   Updated bio: ${newBio}`);
                } else {
                    throw new Error('Profile update not reflected');
                }
            } else {
                throw new Error(response.data.error || 'Profile update failed');
            }
        } catch (error) {
            this.addTestResult('Profile Updates', false, error.message);
            console.log(`❌ Profile updates test failed: ${error.message}`);
        }
    }

    async testActivityLogging() {
        console.log('\n📊 Testing Activity Logging...');
        
        if (this.testUsers.length === 0) {
            console.log('⚠️ No test users available for activity test');
            return;
        }

        try {
            const testUser = this.testUsers[0];
            
            const response = await axios.get(`${this.mcpUrl}/api/profiles/${testUser.user_id}/activity?limit=10`);

            if (response.data.success && Array.isArray(response.data.activity)) {
                this.addTestResult('Activity Logging', true, `Found ${response.data.activity.length} activity records`);
                console.log('✅ Activity logging works');
                console.log(`   Activity records: ${response.data.activity.length}`);
            } else {
                throw new Error('Failed to retrieve activity log');
            }
        } catch (error) {
            this.addTestResult('Activity Logging', false, error.message);
            console.log(`❌ Activity logging test failed: ${error.message}`);
        }
    }

    async testPerformance() {
        console.log('\n⚡ Testing Performance...');
        
        try {
            const startTime = Date.now();
            const promises = [];
            
            // Create 10 concurrent authentication requests
            for (let i = 0; i < 10; i++) {
                const userData = {
                    email: `perf.test.${i}@example.com`,
                    display_name: `Performance Test User ${i}`,
                    platform: 'test'
                };
                
                promises.push(axios.post(`${this.mcpUrl}/api/profiles/authenticate`, userData));
            }
            
            const results = await Promise.allSettled(promises);
            const endTime = Date.now();
            const duration = endTime - startTime;
            
            const successful = results.filter(r => r.status === 'fulfilled' && r.value.data.success).length;
            const avgTime = duration / 10;
            
            if (successful >= 8 && avgTime < 2000) { // At least 80% success, under 2s average
                this.addTestResult('Performance', true, `${successful}/10 requests successful, ${avgTime}ms average`);
                console.log('✅ Performance test passed');
                console.log(`   Successful requests: ${successful}/10`);
                console.log(`   Average time: ${avgTime}ms`);
            } else {
                throw new Error(`Performance below threshold: ${successful}/10 successful, ${avgTime}ms average`);
            }
        } catch (error) {
            this.addTestResult('Performance', false, error.message);
            console.log(`❌ Performance test failed: ${error.message}`);
        }
    }

    addTestResult(testName, success, details) {
        this.testResults.push({
            test: testName,
            success,
            details,
            timestamp: new Date().toISOString()
        });
    }

    generateTestReport() {
        console.log('\n📋 Test Results Summary:');
        console.log('=' .repeat(50));
        
        const passed = this.testResults.filter(r => r.success).length;
        const total = this.testResults.length;
        const passRate = ((passed / total) * 100).toFixed(1);
        
        console.log(`Overall: ${passed}/${total} tests passed (${passRate}%)\n`);
        
        this.testResults.forEach(result => {
            const status = result.success ? '✅' : '❌';
            console.log(`${status} ${result.test}`);
            console.log(`   ${result.details}`);
        });
        
        // Generate JSON report
        const report = {
            summary: {
                total_tests: total,
                passed: passed,
                failed: total - passed,
                pass_rate: passRate + '%',
                timestamp: new Date().toISOString()
            },
            results: this.testResults,
            test_users: this.testUsers.map(u => ({
                user_id: u.user_id,
                email: u.email,
                platforms: Object.keys(u.platforms).filter(p => u.platforms[p].active)
            }))
        };
        
        require('fs').writeFileSync('unified-profiles-test-report.json', JSON.stringify(report, null, 2));
        
        console.log('\n📄 Detailed report saved to: unified-profiles-test-report.json');
        
        if (passRate < 80) {
            console.log('\n⚠️ Warning: Pass rate below 80%. Please review failed tests.');
            process.exit(1);
        } else {
            console.log('\n🎉 All tests completed successfully!');
        }
    }
}

// Run tests if called directly
if (require.main === module) {
    const testSuite = new UnifiedProfilesTestSuite();
    testSuite.runAllTests().catch(console.error);
}

module.exports = { UnifiedProfilesTestSuite };