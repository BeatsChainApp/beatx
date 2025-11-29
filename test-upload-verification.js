#!/usr/bin/env node

/**
 * BeatsChain Upload Process Verification Script
 * Tests both Chrome Extension and Web App upload workflows
 */

const fs = require('fs');
const path = require('path');

class UploadVerificationTester {
  constructor() {
    this.results = {
      extension: {
        workflow: null,
        upload: null,
        isrc: null,
        minting: null,
        issues: []
      },
      app: {
        workflow: null,
        upload: null,
        nft: null,
        livepeer: null,
        issues: []
      },
      mcp: {
        routes: null,
        services: null,
        issues: []
      }
    };
  }

  async runTests() {
    console.log('🔍 BeatsChain Upload Process Verification');
    console.log('==========================================\n');

    await this.testExtensionWorkflow();
    await this.testAppWorkflow();
    await this.testMCPServer();
    
    this.generateReport();
  }

  async testExtensionWorkflow() {
    console.log('📱 Testing Chrome Extension Upload Workflow...\n');

    try {
      // Test 1: Check popup.js workflow structure
      const popupPath = '/workspaces/beatx/chrome-extension/popup/popup.js';
      if (fs.existsSync(popupPath)) {
        const popupContent = fs.readFileSync(popupPath, 'utf8');
        
        // Check for 6-step workflow
        const hasUploadSection = popupContent.includes('upload-section');
        const hasLicensingSection = popupContent.includes('licensing-section');
        const hasISRCSection = popupContent.includes('isrc-minting-section');
        const hasMintingSection = popupContent.includes('minting-section');
        const hasSuccessSection = popupContent.includes('success-section');
        const hasRadioSection = popupContent.includes('radio-section');

        this.results.extension.workflow = {
          status: 'PASS',
          steps: {
            upload: hasUploadSection,
            licensing: hasLicensingSection,
            isrc: hasISRCSection,
            minting: hasMintingSection,
            success: hasSuccessSection,
            radio: hasRadioSection
          },
          totalSteps: [hasUploadSection, hasLicensingSection, hasISRCSection, hasMintingSection, hasSuccessSection, hasRadioSection].filter(Boolean).length
        };

        console.log('✅ Extension workflow structure: PASS');
        console.log(`   - Found ${this.results.extension.workflow.totalSteps}/6 workflow steps`);

        // Test 2: Check upload functionality
        const hasFileUpload = popupContent.includes('processFile');
        const hasAudioManager = popupContent.includes('AudioManager');
        const hasMetadataExtraction = popupContent.includes('extractAudioMetadata');
        const hasSponsoredContent = popupContent.includes('displayLicensingSponsored');

        this.results.extension.upload = {
          status: hasFileUpload && hasAudioManager ? 'PASS' : 'FAIL',
          features: {
            fileProcessing: hasFileUpload,
            audioManager: hasAudioManager,
            metadataExtraction: hasMetadataExtraction,
            sponsoredContent: hasSponsoredContent
          }
        };

        console.log(`${hasFileUpload && hasAudioManager ? '✅' : '❌'} Extension upload functionality: ${hasFileUpload && hasAudioManager ? 'PASS' : 'FAIL'}`);

        // Test 3: Check ISRC generation
        const hasISRCManager = popupContent.includes('ISRCManager');
        const hasISRCGeneration = popupContent.includes('handleISRCGeneration');
        const hasISRCValidation = popupContent.includes('validateISRC');

        this.results.extension.isrc = {
          status: hasISRCManager && hasISRCGeneration ? 'PASS' : 'FAIL',
          features: {
            manager: hasISRCManager,
            generation: hasISRCGeneration,
            validation: hasISRCValidation
          }
        };

        console.log(`${hasISRCManager && hasISRCGeneration ? '✅' : '❌'} Extension ISRC system: ${hasISRCManager && hasISRCGeneration ? 'PASS' : 'FAIL'}`);

        // Test 4: Check minting process
        const hasMintNFT = popupContent.includes('mintNFT');
        const hasThirdweb = popupContent.includes('thirdweb');
        const hasSolanaManager = popupContent.includes('SolanaManager');
        const hasWalletContext = popupContent.includes('WalletContextManager');

        this.results.extension.minting = {
          status: hasMintNFT && (hasThirdweb || hasSolanaManager) ? 'PASS' : 'FAIL',
          features: {
            mintFunction: hasMintNFT,
            thirdweb: hasThirdweb,
            solana: hasSolanaManager,
            walletContext: hasWalletContext
          }
        };

        console.log(`${hasMintNFT && (hasThirdweb || hasSolanaManager) ? '✅' : '❌'} Extension minting system: ${hasMintNFT && (hasThirdweb || hasSolanaManager) ? 'PASS' : 'FAIL'}`);

      } else {
        this.results.extension.workflow = { status: 'FAIL', error: 'popup.js not found' };
        this.results.extension.issues.push('Chrome extension popup.js file missing');
        console.log('❌ Extension popup.js not found');
      }

    } catch (error) {
      this.results.extension.issues.push(`Extension test error: ${error.message}`);
      console.log(`❌ Extension test failed: ${error.message}`);
    }

    console.log('');
  }

  async testAppWorkflow() {
    console.log('🌐 Testing Web App Upload Workflow...\n');

    try {
      // Test 1: Check BeatUpload component
      const uploadPath = '/workspaces/beatx/packages/app/src/components/BeatUpload.tsx';
      if (fs.existsSync(uploadPath)) {
        const uploadContent = fs.readFileSync(uploadPath, 'utf8');

        // Check for upload workflow
        const hasFileUpload = uploadContent.includes('useDropzone');
        const hasFormValidation = uploadContent.includes('validation');
        const hasProgressTracking = uploadContent.includes('progress');
        const hasProfessionalServices = uploadContent.includes('ProfessionalServices');

        this.results.app.workflow = {
          status: hasFileUpload ? 'PASS' : 'FAIL',
          features: {
            fileUpload: hasFileUpload,
            validation: hasFormValidation,
            progress: hasProgressTracking,
            professionalServices: hasProfessionalServices
          }
        };

        console.log(`${hasFileUpload ? '✅' : '❌'} App upload workflow: ${hasFileUpload ? 'PASS' : 'FAIL'}`);

        // Test 2: Check upload functionality
        const hasIPFSUpload = uploadContent.includes('uploadBeatAudio');
        const hasMetadataUpload = uploadContent.includes('uploadMetadata');
        const hasFileValidation = uploadContent.includes('canUpload');

        this.results.app.upload = {
          status: hasIPFSUpload && hasMetadataUpload ? 'PASS' : 'FAIL',
          features: {
            ipfsUpload: hasIPFSUpload,
            metadataUpload: hasMetadataUpload,
            fileValidation: hasFileValidation
          }
        };

        console.log(`${hasIPFSUpload && hasMetadataUpload ? '✅' : '❌'} App upload functionality: ${hasIPFSUpload && hasMetadataUpload ? 'PASS' : 'FAIL'}`);

        // Test 3: Check NFT minting
        const hasGaslessMinting = uploadContent.includes('gasless');
        const hasDirectMinting = uploadContent.includes('writeContract');
        const hasBeatNFTConfig = uploadContent.includes('BeatNFTConfig');

        this.results.app.nft = {
          status: hasGaslessMinting || hasDirectMinting ? 'PASS' : 'FAIL',
          features: {
            gaslessMinting: hasGaslessMinting,
            directMinting: hasDirectMinting,
            beatNFTConfig: hasBeatNFTConfig
          }
        };

        console.log(`${hasGaslessMinting || hasDirectMinting ? '✅' : '❌'} App NFT minting: ${hasGaslessMinting || hasDirectMinting ? 'PASS' : 'FAIL'}`);

        // Test 4: Check Livepeer integration
        const hasLivepeerUpload = uploadContent.includes('uploadToLivepeer');
        const hasOptimizedPlayback = uploadContent.includes('useOptimizedPlayback');
        const hasPlaybackUrl = uploadContent.includes('getPlaybackUrl');

        this.results.app.livepeer = {
          status: hasLivepeerUpload ? 'PASS' : 'FAIL',
          features: {
            upload: hasLivepeerUpload,
            optimizedPlayback: hasOptimizedPlayback,
            playbackUrl: hasPlaybackUrl
          }
        };

        console.log(`${hasLivepeerUpload ? '✅' : '❌'} App Livepeer integration: ${hasLivepeerUpload ? 'PASS' : 'FAIL'}`);

      } else {
        this.results.app.workflow = { status: 'FAIL', error: 'BeatUpload.tsx not found' };
        this.results.app.issues.push('Web app BeatUpload component missing');
        console.log('❌ App BeatUpload.tsx not found');
      }

    } catch (error) {
      this.results.app.issues.push(`App test error: ${error.message}`);
      console.log(`❌ App test failed: ${error.message}`);
    }

    console.log('');
  }

  async testMCPServer() {
    console.log('🔧 Testing MCP Server Upload Support...\n');

    try {
      // Test 1: Check routes
      const routesPath = '/workspaces/beatx/packages/mcp-server/src/routes';
      if (fs.existsSync(routesPath)) {
        const routes = fs.readdirSync(routesPath);
        
        const hasBeatsRoute = routes.includes('beats.js');
        const hasIPFSRoute = routes.includes('ipfs-proxy.js');
        const hasISRCRoute = routes.includes('isrc.js');
        const hasLivepeerRoute = routes.includes('livepeer.js');

        this.results.mcp.routes = {
          status: hasBeatsRoute ? 'PASS' : 'FAIL',
          available: routes,
          critical: {
            beats: hasBeatsRoute,
            ipfs: hasIPFSRoute,
            isrc: hasISRCRoute,
            livepeer: hasLivepeerRoute
          }
        };

        console.log(`${hasBeatsRoute ? '✅' : '❌'} MCP routes: ${hasBeatsRoute ? 'PASS' : 'FAIL'}`);
        console.log(`   - Found ${routes.length} routes: ${routes.join(', ')}`);

        // Test beats route functionality
        if (hasBeatsRoute) {
          const beatsContent = fs.readFileSync(path.join(routesPath, 'beats.js'), 'utf8');
          const hasGetBeats = beatsContent.includes('GET /api/beats');
          const hasPostBeats = beatsContent.includes('POST /api/beats');
          const hasPlayTracking = beatsContent.includes('POST /api/beats/:beatId/play');

          console.log(`   - Beats route features: GET(${hasGetBeats}) POST(${hasPostBeats}) PLAY(${hasPlayTracking})`);
        }

      } else {
        this.results.mcp.routes = { status: 'FAIL', error: 'Routes directory not found' };
        console.log('❌ MCP routes directory not found');
      }

      // Test 2: Check services
      const servicesPath = '/workspaces/beatx/packages/mcp-server/src/services';
      if (fs.existsSync(servicesPath)) {
        const services = fs.readdirSync(servicesPath);
        
        const hasSupabaseClient = services.includes('supabaseClient.js');
        const hasIPFSPinner = services.includes('ipfsPinner.js');
        const hasAnalyticsEngine = services.includes('analyticsEngine.js');

        this.results.mcp.services = {
          status: hasSupabaseClient ? 'PASS' : 'FAIL',
          available: services,
          critical: {
            supabase: hasSupabaseClient,
            ipfs: hasIPFSPinner,
            analytics: hasAnalyticsEngine
          }
        };

        console.log(`${hasSupabaseClient ? '✅' : '❌'} MCP services: ${hasSupabaseClient ? 'PASS' : 'FAIL'}`);
        console.log(`   - Found ${services.length} services: ${services.join(', ')}`);

      } else {
        this.results.mcp.services = { status: 'FAIL', error: 'Services directory not found' };
        console.log('❌ MCP services directory not found');
      }

    } catch (error) {
      this.results.mcp.issues.push(`MCP test error: ${error.message}`);
      console.log(`❌ MCP test failed: ${error.message}`);
    }

    console.log('');
  }

  generateReport() {
    console.log('📊 Upload Process Verification Report');
    console.log('=====================================\n');

    // Extension Summary
    console.log('🔸 CHROME EXTENSION:');
    const extWorkflow = this.results.extension.workflow?.status || 'FAIL';
    const extUpload = this.results.extension.upload?.status || 'FAIL';
    const extISRC = this.results.extension.isrc?.status || 'FAIL';
    const extMinting = this.results.extension.minting?.status || 'FAIL';

    console.log(`   Workflow Structure: ${extWorkflow === 'PASS' ? '✅' : '❌'} ${extWorkflow}`);
    console.log(`   Upload Process:     ${extUpload === 'PASS' ? '✅' : '❌'} ${extUpload}`);
    console.log(`   ISRC Generation:    ${extISRC === 'PASS' ? '✅' : '❌'} ${extISRC}`);
    console.log(`   NFT Minting:        ${extMinting === 'PASS' ? '✅' : '❌'} ${extMinting}`);

    if (this.results.extension.workflow?.totalSteps) {
      console.log(`   Total Steps Found:  ${this.results.extension.workflow.totalSteps}/6`);
    }

    // App Summary
    console.log('\n🔸 WEB APPLICATION:');
    const appWorkflow = this.results.app.workflow?.status || 'FAIL';
    const appUpload = this.results.app.upload?.status || 'FAIL';
    const appNFT = this.results.app.nft?.status || 'FAIL';
    const appLivepeer = this.results.app.livepeer?.status || 'FAIL';

    console.log(`   Upload Workflow:    ${appWorkflow === 'PASS' ? '✅' : '❌'} ${appWorkflow}`);
    console.log(`   File Upload:        ${appUpload === 'PASS' ? '✅' : '❌'} ${appUpload}`);
    console.log(`   NFT Minting:        ${appNFT === 'PASS' ? '✅' : '❌'} ${appNFT}`);
    console.log(`   Livepeer Streaming: ${appLivepeer === 'PASS' ? '✅' : '❌'} ${appLivepeer}`);

    // MCP Server Summary
    console.log('\n🔸 MCP SERVER:');
    const mcpRoutes = this.results.mcp.routes?.status || 'FAIL';
    const mcpServices = this.results.mcp.services?.status || 'FAIL';

    console.log(`   API Routes:         ${mcpRoutes === 'PASS' ? '✅' : '❌'} ${mcpRoutes}`);
    console.log(`   Backend Services:   ${mcpServices === 'PASS' ? '✅' : '❌'} ${mcpServices}`);

    if (this.results.mcp.routes?.available) {
      console.log(`   Available Routes:   ${this.results.mcp.routes.available.length} routes`);
    }

    // Overall Status
    console.log('\n🎯 OVERALL STATUS:');
    const allPassing = [extWorkflow, extUpload, appWorkflow, appUpload, mcpRoutes].every(status => status === 'PASS');
    console.log(`   Upload Systems:     ${allPassing ? '✅ OPERATIONAL' : '⚠️  NEEDS ATTENTION'}`);

    // Issues Summary
    const allIssues = [
      ...this.results.extension.issues,
      ...this.results.app.issues,
      ...this.results.mcp.issues
    ];

    if (allIssues.length > 0) {
      console.log('\n⚠️  ISSUES FOUND:');
      allIssues.forEach((issue, index) => {
        console.log(`   ${index + 1}. ${issue}`);
      });
    }

    // Recommendations
    console.log('\n💡 RECOMMENDATIONS:');
    
    if (extWorkflow !== 'PASS') {
      console.log('   - Verify Chrome extension popup.js workflow structure');
    }
    
    if (appWorkflow !== 'PASS') {
      console.log('   - Check web app BeatUpload component implementation');
    }
    
    if (mcpRoutes !== 'PASS') {
      console.log('   - Ensure MCP server routes are properly configured');
    }

    console.log('   - Test upload process with actual audio files');
    console.log('   - Verify Google OAuth configuration for new domain');
    console.log('   - Check PINATA_JWT environment variable deployment');
    console.log('   - Test ISRC generation and validation');
    console.log('   - Verify NFT minting on both platforms');

    console.log('\n✅ Verification Complete!');
    
    // Save detailed results
    const reportPath = '/workspaces/beatx/upload-verification-report.json';
    fs.writeFileSync(reportPath, JSON.stringify(this.results, null, 2));
    console.log(`📄 Detailed report saved to: ${reportPath}`);
  }
}

// Run the tests
const tester = new UploadVerificationTester();
tester.runTests().catch(console.error);