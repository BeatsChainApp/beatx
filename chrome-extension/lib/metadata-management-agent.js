// Metadata Management Agent - Coordinates between Supabase, IPFS, and Livepeer
class MetadataManagementAgent {
    constructor() {
        this.supabaseClient = null;
        this.ipfsClient = null;
        this.livepeerClient = null;
        this.isInitialized = false;
        
        this.config = {
            supabase: {
                url: process.env.SUPABASE_URL || 'https://demo.supabase.co',
                key: process.env.SUPABASE_ANON_KEY || 'demo-key'
            },
            ipfs: {
                gateway: 'https://gateway.pinata.cloud/ipfs/',
                apiKey: process.env.PINATA_API_KEY || 'demo-key',
                secretKey: process.env.PINATA_SECRET_KEY || 'demo-secret'
            },
            livepeer: {
                apiKey: process.env.LIVEPEER_API_KEY || 'demo-key',
                endpoint: 'https://livepeer.studio/api'
            }
        };
    }

    async initialize() {
        try {
            console.log('🔧 Initializing Metadata Management Agent...');
            
            // Initialize Supabase client
            if (window.supabase) {
                this.supabaseClient = window.supabase.createClient(
                    this.config.supabase.url,
                    this.config.supabase.key
                );
                console.log('✅ Supabase client initialized');
            }
            
            // Initialize IPFS client
            this.ipfsClient = new IPFSMetadataClient(this.config.ipfs);
            console.log('✅ IPFS client initialized');
            
            // Initialize Livepeer client
            this.livepeerClient = new LivepeerMetadataClient(this.config.livepeer);
            console.log('✅ Livepeer client initialized');
            
            this.isInitialized = true;
            console.log('✅ Metadata Management Agent ready');
            
            return true;
        } catch (error) {
            console.error('❌ Metadata Management Agent initialization failed:', error);
            return false;
        }
    }

    async processUpload(file, metadata) {
        if (!this.isInitialized) {
            await this.initialize();
        }

        const uploadId = this.generateUploadId();
        console.log(`🚀 Processing upload ${uploadId}...`);

        try {
            // 1. Store initial metadata in Supabase
            const supabaseRecord = await this.storeInSupabase(uploadId, file, metadata);
            
            // 2. Upload file to IPFS
            const ipfsResult = await this.uploadToIPFS(file, metadata);
            
            // 3. Process with Livepeer
            const livepeerResult = await this.processWithLivepeer(ipfsResult.cid, metadata);
            
            // 4. Update Supabase with IPFS and Livepeer data
            await this.updateSupabaseRecord(supabaseRecord.id, {
                ipfs_cid: ipfsResult.cid,
                ipfs_url: ipfsResult.url,
                livepeer_asset_id: livepeerResult.assetId,
                livepeer_playback_id: livepeerResult.playbackId,
                status: 'processed'
            });
            
            // 5. Return consolidated metadata
            return {
                uploadId,
                supabase: supabaseRecord,
                ipfs: ipfsResult,
                livepeer: livepeerResult,
                metadata: this.consolidateMetadata(metadata, ipfsResult, livepeerResult)
            };
            
        } catch (error) {
            console.error(`❌ Upload ${uploadId} failed:`, error);
            
            // Update status in Supabase if possible
            if (this.supabaseClient) {
                try {
                    await this.supabaseClient
                        .from('uploads')
                        .update({ status: 'failed', error: error.message })
                        .eq('upload_id', uploadId);
                } catch (updateError) {
                    console.warn('Failed to update error status:', updateError);
                }
            }
            
            throw error;
        }
    }

    async storeInSupabase(uploadId, file, metadata) {
        if (!this.supabaseClient) {
            console.warn('Supabase not available, using local storage');
            const record = {
                id: uploadId,
                upload_id: uploadId,
                filename: file.name,
                filesize: file.size,
                metadata: metadata,
                status: 'uploading',
                created_at: new Date().toISOString()
            };
            
            // Store in localStorage as fallback
            const stored = JSON.parse(localStorage.getItem('beatschain_uploads') || '[]');
            stored.push(record);
            localStorage.setItem('beatschain_uploads', JSON.stringify(stored));
            
            return record;
        }

        const { data, error } = await this.supabaseClient
            .from('uploads')
            .insert({
                upload_id: uploadId,
                filename: file.name,
                filesize: file.size,
                filetype: file.type,
                metadata: metadata,
                status: 'uploading'
            })
            .select()
            .single();

        if (error) {
            throw new Error(`Supabase storage failed: ${error.message}`);
        }

        return data;
    }

    async uploadToIPFS(file, metadata) {
        return await this.ipfsClient.uploadFile(file, metadata);
    }

    async processWithLivepeer(ipfsCid, metadata) {
        return await this.livepeerClient.processAsset(ipfsCid, metadata);
    }

    async updateSupabaseRecord(recordId, updates) {
        if (!this.supabaseClient) {
            // Update localStorage fallback
            const stored = JSON.parse(localStorage.getItem('beatschain_uploads') || '[]');
            const index = stored.findIndex(r => r.id === recordId);
            if (index !== -1) {
                stored[index] = { ...stored[index], ...updates };
                localStorage.setItem('beatschain_uploads', JSON.stringify(stored));
            }
            return;
        }

        const { error } = await this.supabaseClient
            .from('uploads')
            .update(updates)
            .eq('id', recordId);

        if (error) {
            console.warn('Failed to update Supabase record:', error);
        }
    }

    consolidateMetadata(originalMetadata, ipfsResult, livepeerResult) {
        return {
            ...originalMetadata,
            storage: {
                ipfs: {
                    cid: ipfsResult.cid,
                    url: ipfsResult.url,
                    gateway: this.config.ipfs.gateway
                },
                livepeer: {
                    assetId: livepeerResult.assetId,
                    playbackId: livepeerResult.playbackId,
                    streamUrl: livepeerResult.streamUrl
                }
            },
            blockchain: {
                ready: true,
                network: 'solana-devnet'
            },
            timestamp: new Date().toISOString()
        };
    }

    generateUploadId() {
        return `upload_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    async getUploadStatus(uploadId) {
        if (!this.supabaseClient) {
            const stored = JSON.parse(localStorage.getItem('beatschain_uploads') || '[]');
            return stored.find(r => r.upload_id === uploadId) || null;
        }

        const { data, error } = await this.supabaseClient
            .from('uploads')
            .select('*')
            .eq('upload_id', uploadId)
            .single();

        return error ? null : data;
    }
}

// IPFS Metadata Client
class IPFSMetadataClient {
    constructor(config) {
        this.config = config;
    }

    async uploadFile(file, metadata) {
        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('pinataMetadata', JSON.stringify({
                name: `${metadata.artist} - ${metadata.title}`,
                keyvalues: {
                    artist: metadata.artist || 'Unknown',
                    title: metadata.title || 'Untitled',
                    genre: metadata.genre || 'Unknown',
                    bpm: metadata.bpm || '0',
                    duration: metadata.duration || '0',
                    isrc: metadata.isrc || '',
                    uploadedBy: 'BeatsChain Extension'
                }
            }));

            const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
                method: 'POST',
                headers: {
                    'pinata_api_key': this.config.apiKey,
                    'pinata_secret_api_key': this.config.secretKey
                },
                body: formData
            });

            if (!response.ok) {
                throw new Error(`IPFS upload failed: ${response.statusText}`);
            }

            const result = await response.json();
            return {
                cid: result.IpfsHash,
                url: `${this.config.gateway}${result.IpfsHash}`,
                size: result.PinSize,
                timestamp: result.Timestamp
            };
        } catch (error) {
            console.warn('IPFS upload failed, using local fallback:', error);
            
            // Fallback to local blob URL
            const blobUrl = URL.createObjectURL(file);
            return {
                cid: `local_${Date.now()}`,
                url: blobUrl,
                size: file.size,
                timestamp: new Date().toISOString(),
                fallback: true
            };
        }
    }

    async uploadMetadata(metadata) {
        try {
            const metadataBlob = new Blob([JSON.stringify(metadata, null, 2)], {
                type: 'application/json'
            });

            const formData = new FormData();
            formData.append('file', metadataBlob, 'metadata.json');
            formData.append('pinataMetadata', JSON.stringify({
                name: `Metadata: ${metadata.title}`,
                keyvalues: {
                    type: 'metadata',
                    artist: metadata.artist,
                    title: metadata.title
                }
            }));

            const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
                method: 'POST',
                headers: {
                    'pinata_api_key': this.config.apiKey,
                    'pinata_secret_api_key': this.config.secretKey
                },
                body: formData
            });

            if (!response.ok) {
                throw new Error(`Metadata upload failed: ${response.statusText}`);
            }

            const result = await response.json();
            return {
                cid: result.IpfsHash,
                url: `${this.config.gateway}${result.IpfsHash}`
            };
        } catch (error) {
            console.warn('Metadata IPFS upload failed:', error);
            return null;
        }
    }
}

// Livepeer Metadata Client
class LivepeerMetadataClient {
    constructor(config) {
        this.config = config;
    }

    async processAsset(ipfsCid, metadata) {
        try {
            const response = await fetch(`${this.config.endpoint}/asset/import`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.config.apiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    url: `https://gateway.pinata.cloud/ipfs/${ipfsCid}`,
                    name: `${metadata.artist} - ${metadata.title}`,
                    metadata: {
                        artist: metadata.artist,
                        title: metadata.title,
                        genre: metadata.genre,
                        bpm: metadata.bpm,
                        isrc: metadata.isrc
                    }
                })
            });

            if (!response.ok) {
                throw new Error(`Livepeer processing failed: ${response.statusText}`);
            }

            const result = await response.json();
            return {
                assetId: result.id,
                playbackId: result.playbackId,
                streamUrl: result.playbackId ? `https://lvpr.tv/${result.playbackId}` : null,
                status: result.status || 'processing'
            };
        } catch (error) {
            console.warn('Livepeer processing failed, using fallback:', error);
            
            // Return fallback data
            return {
                assetId: `local_asset_${Date.now()}`,
                playbackId: `local_playback_${Date.now()}`,
                streamUrl: null,
                status: 'fallback',
                fallback: true
            };
        }
    }

    async getAssetStatus(assetId) {
        try {
            const response = await fetch(`${this.config.endpoint}/asset/${assetId}`, {
                headers: {
                    'Authorization': `Bearer ${this.config.apiKey}`
                }
            });

            if (!response.ok) {
                return null;
            }

            return await response.json();
        } catch (error) {
            console.warn('Failed to get Livepeer asset status:', error);
            return null;
        }
    }
}

// Export for use in extension
if (typeof window !== 'undefined') {
    window.MetadataManagementAgent = MetadataManagementAgent;
    window.IPFSMetadataClient = IPFSMetadataClient;
    window.LivepeerMetadataClient = LivepeerMetadataClient;
}

// Export for Node.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        MetadataManagementAgent,
        IPFSMetadataClient,
        LivepeerMetadataClient
    };
}