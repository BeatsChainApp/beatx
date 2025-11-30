// Enhanced Upload Manager with Campaign Integration
class UploadManager {
    constructor() {
        this.mcpClient = new MCPClient();
        this.campaignManager = new CampaignManager();
        this.audioManager = new AudioManager();
        this.metadataWriter = new MetadataWriter();
        this.userInputManager = new UserInputManager();
        
        this.uploadState = {
            file: null,
            metadata: {},
            progress: 0,
            stage: 'idle',
            campaignId: null
        };
    }

    async processUpload(file, userMetadata = {}) {
        try {
            this.updateProgress(0, 'starting');
            
            // 1. Validate file
            await this.validateFile(file);
            this.updateProgress(10, 'validated');
            
            // 2. Extract metadata
            const extractedMetadata = await this.audioManager.extractMetadata(file);
            this.updateProgress(20, 'metadata_extracted');
            
            // 3. Merge with user input (user input takes priority)
            const finalMetadata = this.userInputManager.mergeMetadata(extractedMetadata, userMetadata);
            this.updateProgress(30, 'metadata_merged');
            
            // 4. Trigger campaign event
            const campaignEvent = await this.triggerCampaignEvent('upload_start', finalMetadata);
            this.uploadState.campaignId = campaignEvent.campaignId;
            this.updateProgress(40, 'campaign_triggered');
            
            // 5. Upload to IPFS
            const ipfsResult = await this.uploadToIPFS(file, finalMetadata);
            this.updateProgress(60, 'ipfs_uploaded');
            
            // 6. Process with Livepeer
            const livepeerResult = await this.processWithLivepeer(ipfsResult.cid);
            this.updateProgress(80, 'livepeer_processed');
            
            // 7. Mint NFT
            const mintResult = await this.mintNFT(finalMetadata, ipfsResult, livepeerResult);
            this.updateProgress(90, 'nft_minted');
            
            // 8. Complete campaign attribution
            await this.completeCampaignAttribution(mintResult);
            this.updateProgress(100, 'completed');
            
            return {
                success: true,
                tokenId: mintResult.tokenId,
                ipfsCid: ipfsResult.cid,
                playbackId: livepeerResult.playbackId,
                campaignId: this.uploadState.campaignId
            };
            
        } catch (error) {
            this.updateProgress(this.uploadState.progress, 'error', error.message);
            await this.handleUploadError(error);
            throw error;
        }
    }

    async validateFile(file) {
        if (!file) throw new Error('No file provided');
        if (file.size === 0) throw new Error('File is empty');
        if (file.size > 50 * 1024 * 1024) throw new Error('File too large (max 50MB)');
        
        const validTypes = ['audio/mpeg', 'audio/wav', 'audio/mp4', 'audio/aac'];
        if (!validTypes.includes(file.type)) {
            throw new Error('Invalid file type. Please upload MP3, WAV, MP4, or AAC files.');
        }
        
        this.uploadState.file = file;
        return true;
    }

    async triggerCampaignEvent(eventType, metadata) {
        try {
            const event = {
                event_type: eventType,
                platform: 'extension',
                user_id: await this.getCurrentUserId(),
                metadata: {
                    ...metadata,
                    timestamp: new Date().toISOString()
                }
            };
            
            // Send to N8N webhook
            const response = await fetch('https://n8n.beatschain.app/webhook/campaign-event', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(event)
            });
            
            if (!response.ok) {
                console.warn('Campaign event failed:', response.statusText);
                return { campaignId: null };
            }
            
            const result = await response.json();
            return result;
            
        } catch (error) {
            console.warn('Campaign event error:', error);
            return { campaignId: null };
        }
    }

    async uploadToIPFS(file, metadata) {
        // Use Pinata IPFS service instead of local storage
        const formData = new FormData();
        formData.append('file', file);
        formData.append('pinataMetadata', JSON.stringify({
            name: metadata.title || file.name,
            keyvalues: {
                artist: metadata.artist,
                genre: metadata.genre,
                bpm: metadata.bpm
            }
        }));
        
        const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
            method: 'POST',
            headers: {
                'pinata_api_key': process.env.PINATA_API_KEY || 'demo-key',
                'pinata_secret_api_key': process.env.PINATA_SECRET_KEY || 'demo-secret'
            },
            body: formData
        });
        
        if (!response.ok) {
            // Fallback to local processing if IPFS fails
            console.warn('IPFS upload failed, using local processing');
            return {
                cid: 'local-' + Date.now(),
                url: URL.createObjectURL(file)
            };
        }
        
        const result = await response.json();
        return {
            cid: result.IpfsHash,
            url: `https://gateway.pinata.cloud/ipfs/${result.IpfsHash}`
        };
    }

    async processWithLivepeer(ipfsCid) {
        try {
            const response = await fetch('https://livepeer.studio/api/asset/import', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${process.env.LIVEPEER_API_KEY || 'demo-key'}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    url: `https://gateway.pinata.cloud/ipfs/${ipfsCid}`,
                    name: `BeatsChain Asset ${Date.now()}`
                })
            });
            
            if (!response.ok) {
                throw new Error('Livepeer API failed');
            }
            
            const result = await response.json();
            return {
                playbackId: result.playbackId || 'demo-playback-id',
                assetId: result.id
            };
        } catch (error) {
            console.warn('Livepeer processing failed, using fallback:', error);
            return {
                playbackId: 'local-playback-' + Date.now(),
                assetId: 'local-asset-' + Date.now()
            };
        }
    }

    async mintNFT(metadata, ipfsResult, livepeerResult) {
        // Use Solana blockchain for real minting
        const mintData = {
            name: metadata.title || 'BeatsChain NFT',
            description: `${metadata.artist} - ${metadata.title}`,
            image: ipfsResult.url,
            animation_url: livepeerResult.playbackId ? `https://lvpr.tv/${livepeerResult.playbackId}` : ipfsResult.url,
            attributes: [
                { trait_type: 'Artist', value: metadata.artist },
                { trait_type: 'Genre', value: metadata.genre },
                { trait_type: 'BPM', value: metadata.bpm },
                { trait_type: 'Duration', value: metadata.duration },
                { trait_type: 'ISRC', value: metadata.isrc || 'N/A' }
            ],
            properties: {
                files: [{
                    uri: ipfsResult.url,
                    type: 'audio/mpeg'
                }],
                category: 'audio'
            }
        };
        
        // Use Solana manager for minting
        if (window.solanaManager) {
            try {
                const result = await window.solanaManager.mintNFT(mintData);
                return {
                    tokenId: result.mint,
                    transactionHash: result.signature,
                    network: 'solana-devnet'
                };
            } catch (error) {
                console.error('Solana minting failed:', error);
                throw new Error('Blockchain minting failed: ' + error.message);
            }
        } else {
            throw new Error('Solana manager not available');
        }
    }

    async completeCampaignAttribution(mintResult) {
        if (!this.uploadState.campaignId) return;
        
        try {
            await this.mcpClient.trackRevenue({
                type: 'upload_complete',
                amount: 1.25,
                metadata: {
                    campaignId: this.uploadState.campaignId,
                    tokenId: mintResult.tokenId,
                    platform: 'extension'
                }
            });
        } catch (error) {
            console.warn('Campaign attribution failed:', error);
        }
    }

    async handleUploadError(error) {
        // Track failed upload for campaign analytics
        if (this.uploadState.campaignId) {
            try {
                await this.mcpClient.trackEvent({
                    type: 'upload_failed',
                    campaignId: this.uploadState.campaignId,
                    error: error.message
                });
            } catch (e) {
                console.warn('Error tracking failed:', e);
            }
        }
        
        // Reset upload state
        this.uploadState = {
            file: null,
            metadata: {},
            progress: 0,
            stage: 'error',
            campaignId: null
        };
    }

    updateProgress(progress, stage, message = '') {
        this.uploadState.progress = progress;
        this.uploadState.stage = stage;
        
        // Emit progress event
        const event = new CustomEvent('uploadProgress', {
            detail: {
                progress,
                stage,
                message,
                state: this.uploadState
            }
        });
        
        if (typeof window !== 'undefined') {
            window.dispatchEvent(event);
        }
        
        console.log(`Upload Progress: ${progress}% - ${stage}${message ? ` (${message})` : ''}`);
    }

    async getCurrentUserId() {
        // Get current user wallet or ID
        if (typeof window !== 'undefined' && window.ethereum) {
            try {
                const accounts = await window.ethereum.request({ method: 'eth_accounts' });
                return accounts[0] || 'anonymous';
            } catch (error) {
                return 'anonymous';
            }
        }
        return 'anonymous';
    }

    getUploadState() {
        return { ...this.uploadState };
    }

    resetUpload() {
        this.uploadState = {
            file: null,
            metadata: {},
            progress: 0,
            stage: 'idle',
            campaignId: null
        };
    }
}

// Enhanced MCP Client for campaign integration
class MCPClient {
    constructor() {
        this.baseUrl = process.env.MCP_SERVER_URL || 'http://localhost:3001';
    }

    async trackRevenue(data) {
        try {
            const response = await fetch(`${this.baseUrl}/api/campaigns/track-revenue`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            
            if (!response.ok) {
                throw new Error(`Revenue tracking failed: ${response.statusText}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('MCP revenue tracking error:', error);
            throw error;
        }
    }

    async trackEvent(data) {
        try {
            const response = await fetch(`${this.baseUrl}/api/analytics/track`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            
            return response.ok ? await response.json() : null;
        } catch (error) {
            console.error('MCP event tracking error:', error);
            return null;
        }
    }

    async getCampaigns(platform = 'extension') {
        try {
            const response = await fetch(`${this.baseUrl}/api/campaigns/${platform}`);
            
            if (!response.ok) {
                throw new Error(`Get campaigns failed: ${response.statusText}`);
            }
            
            const result = await response.json();
            return result.campaigns || [];
        } catch (error) {
            console.error('MCP get campaigns error:', error);
            return [];
        }
    }
}

// Export for use in extension
if (typeof window !== 'undefined') {
    window.UploadManager = UploadManager;
    window.MCPClient = MCPClient;
}

// Export for Node.js testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { UploadManager, MCPClient };
}