// Unified Profile System - Complete Integration Across All Platforms
class UnifiedProfileSystem {
    constructor() {
        this.platforms = ['app', 'extension', 'mcp', 'n8n', 'whatsapp'];
        this.storageAdapters = new Map();
        this.syncQueue = [];
        this.isInitialized = false;
    }

    async initialize() {
        try {
            // Initialize storage adapters for each platform
            await this.initializeStorageAdapters();
            
            // Set up real-time sync
            await this.setupRealTimeSync();
            
            // Process any pending sync operations
            await this.processSyncQueue();
            
            this.isInitialized = true;
            console.log('✅ Unified Profile System initialized');
            return true;
        } catch (error) {
            console.error('❌ Unified Profile System initialization failed:', error);
            return false;
        }
    }

    async initializeStorageAdapters() {
        // Supabase adapter (primary storage)
        this.storageAdapters.set('supabase', {
            read: async (userId) => {
                try {
                    const supabase = this.getSupabaseClient();
                    if (!supabase) return null;
                    
                    const { data, error } = await supabase
                        .from('unified_profiles')
                        .select('*')
                        .eq('user_id', userId)
                        .single();
                    
                    return error ? null : data;
                } catch (e) {
                    return null;
                }
            },
            write: async (profile) => {
                try {
                    const supabase = this.getSupabaseClient();
                    if (!supabase) return false;
                    
                    const { error } = await supabase
                        .from('unified_profiles')
                        .upsert(profile, { onConflict: 'user_id' });
                    
                    return !error;
                } catch (e) {
                    return false;
                }
            }
        });

        // Chrome Extension adapter
        this.storageAdapters.set('extension', {
            read: async (userId) => {
                try {
                    if (typeof chrome !== 'undefined' && chrome.storage) {
                        const result = await chrome.storage.local.get([`unified_profile_${userId}`]);
                        return result[`unified_profile_${userId}`] || null;
                    }
                    return null;
                } catch (e) {
                    return null;
                }
            },
            write: async (profile) => {
                try {
                    if (typeof chrome !== 'undefined' && chrome.storage) {
                        await chrome.storage.local.set({
                            [`unified_profile_${profile.user_id}`]: profile
                        });
                        return true;
                    }
                    return false;
                } catch (e) {
                    return false;
                }
            }
        });

        // App localStorage adapter
        this.storageAdapters.set('app', {
            read: async (userId) => {
                try {
                    if (typeof window !== 'undefined' && window.localStorage) {
                        const data = localStorage.getItem(`unified_profile_${userId}`);
                        return data ? JSON.parse(data) : null;
                    }
                    return null;
                } catch (e) {
                    return null;
                }
            },
            write: async (profile) => {
                try {
                    if (typeof window !== 'undefined' && window.localStorage) {
                        localStorage.setItem(`unified_profile_${profile.user_id}`, JSON.stringify(profile));
                        return true;
                    }
                    return false;
                } catch (e) {
                    return false;
                }
            }
        });

        // MCP server adapter
        this.storageAdapters.set('mcp', {
            read: async (userId) => {
                try {
                    const response = await fetch(`${this.getMcpUrl()}/api/profiles/${userId}`);
                    return response.ok ? await response.json() : null;
                } catch (e) {
                    return null;
                }
            },
            write: async (profile) => {
                try {
                    const response = await fetch(`${this.getMcpUrl()}/api/profiles/sync`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(profile)
                    });
                    return response.ok;
                } catch (e) {
                    return false;
                }
            }
        });
    }

    async createUnifiedProfile(userData) {
        const profile = {
            user_id: userData.user_id || this.generateUserId(),
            email: userData.email,
            wallet_address: userData.wallet_address?.toLowerCase(),
            google_id: userData.google_id,
            whatsapp_id: userData.whatsapp_id,
            
            // Identity data
            display_name: userData.display_name || userData.name,
            profile_image: userData.profile_image || userData.picture,
            bio: userData.bio || '',
            
            // Role and permissions (context-aware)
            app_role: this.determineRole(userData.email, userData.wallet_address, 'app'),
            extension_role: this.determineRole(userData.email, userData.wallet_address, 'extension'),
            
            // Verification status
            is_verified: userData.verified_email || this.isAdminUser(userData.email, userData.wallet_address),
            email_verified: userData.verified_email || false,
            wallet_verified: !!userData.wallet_address,
            
            // Platform-specific data
            platforms: {
                app: {
                    active: true,
                    last_login: new Date().toISOString(),
                    preferences: userData.app_preferences || {}
                },
                extension: {
                    active: true,
                    last_login: new Date().toISOString(),
                    preferences: userData.extension_preferences || {}
                },
                whatsapp: {
                    active: !!userData.whatsapp_id,
                    profile: userData.whatsapp_profile || null
                }
            },
            
            // Timestamps
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            last_sync: new Date().toISOString()
        };

        // Sync across all platforms
        await this.syncProfileToAllPlatforms(profile);
        
        return profile;
    }

    async syncProfileToAllPlatforms(profile) {
        const syncPromises = [];
        
        for (const [platform, adapter] of this.storageAdapters) {
            syncPromises.push(
                adapter.write(profile).catch(error => {
                    console.warn(`❌ Failed to sync to ${platform}:`, error);
                    return false;
                })
            );
        }

        // Also sync to N8N workflow
        syncPromises.push(this.syncToN8N(profile));
        
        const results = await Promise.allSettled(syncPromises);
        const successCount = results.filter(r => r.status === 'fulfilled' && r.value).length;
        
        console.log(`✅ Profile synced to ${successCount}/${this.storageAdapters.size + 1} platforms`);
        return successCount > 0;
    }

    async syncToN8N(profile) {
        try {
            const n8nUrl = process.env.N8N_WEBHOOK_URL || process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL;
            if (!n8nUrl) return false;

            const response = await fetch(`${n8nUrl}/webhook/profile-sync`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${process.env.N8N_WEBHOOK_TOKEN || ''}`
                },
                body: JSON.stringify({
                    event: 'profile_sync',
                    profile,
                    timestamp: new Date().toISOString()
                })
            });

            return response.ok;
        } catch (error) {
            console.warn('❌ N8N sync failed:', error);
            return false;
        }
    }

    async findExistingProfiles(userData) {
        const profiles = [];
        
        // Search by email
        if (userData.email) {
            const emailProfile = await this.findProfileByEmail(userData.email);
            if (emailProfile) profiles.push(emailProfile);
        }
        
        // Search by wallet address
        if (userData.wallet_address) {
            const walletProfile = await this.findProfileByWallet(userData.wallet_address);
            if (walletProfile) profiles.push(walletProfile);
        }
        
        // Search by Google ID
        if (userData.google_id) {
            const googleProfile = await this.findProfileByGoogleId(userData.google_id);
            if (googleProfile) profiles.push(googleProfile);
        }
        
        // Search by WhatsApp ID
        if (userData.whatsapp_id) {
            const whatsappProfile = await this.findProfileByWhatsApp(userData.whatsapp_id);
            if (whatsappProfile) profiles.push(whatsappProfile);
        }
        
        // Deduplicate by user_id
        const uniqueProfiles = profiles.filter((profile, index, self) => 
            index === self.findIndex(p => p.user_id === profile.user_id)
        );
        
        return uniqueProfiles;
    }

    async mergeProfiles(profiles, newData) {
        if (profiles.length === 0) {
            return await this.createUnifiedProfile(newData);
        }
        
        // Use the most recent profile as base
        const baseProfile = profiles.sort((a, b) => 
            new Date(b.updated_at) - new Date(a.updated_at)
        )[0];
        
        // Merge all profile data
        const mergedProfile = {
            ...baseProfile,
            
            // Update with new data
            email: newData.email || baseProfile.email,
            wallet_address: (newData.wallet_address || baseProfile.wallet_address)?.toLowerCase(),
            google_id: newData.google_id || baseProfile.google_id,
            whatsapp_id: newData.whatsapp_id || baseProfile.whatsapp_id,
            
            display_name: newData.display_name || newData.name || baseProfile.display_name,
            profile_image: newData.profile_image || newData.picture || baseProfile.profile_image,
            bio: newData.bio || baseProfile.bio,
            
            // Update verification status
            is_verified: newData.verified_email || baseProfile.is_verified || 
                        this.isAdminUser(newData.email || baseProfile.email, 
                                       newData.wallet_address || baseProfile.wallet_address),
            email_verified: newData.verified_email || baseProfile.email_verified,
            wallet_verified: !!(newData.wallet_address || baseProfile.wallet_address),
            
            // Merge platform data
            platforms: {
                ...baseProfile.platforms,
                app: {
                    ...baseProfile.platforms?.app,
                    active: true,
                    last_login: new Date().toISOString()
                },
                extension: {
                    ...baseProfile.platforms?.extension,
                    active: true,
                    last_login: new Date().toISOString()
                },
                whatsapp: {
                    ...baseProfile.platforms?.whatsapp,
                    active: !!(newData.whatsapp_id || baseProfile.whatsapp_id),
                    profile: newData.whatsapp_profile || baseProfile.platforms?.whatsapp?.profile
                }
            },
            
            updated_at: new Date().toISOString(),
            last_sync: new Date().toISOString()
        };
        
        // Update roles based on current context
        mergedProfile.app_role = this.determineRole(mergedProfile.email, mergedProfile.wallet_address, 'app');
        mergedProfile.extension_role = this.determineRole(mergedProfile.email, mergedProfile.wallet_address, 'extension');
        
        await this.syncProfileToAllPlatforms(mergedProfile);
        
        return mergedProfile;
    }

    async findProfileByEmail(email) {
        try {
            const supabase = this.getSupabaseClient();
            if (!supabase) return null;
            
            const { data, error } = await supabase
                .from('unified_profiles')
                .select('*')
                .eq('email', email.toLowerCase())
                .single();
            
            return error ? null : data;
        } catch (e) {
            return null;
        }
    }

    async findProfileByWallet(walletAddress) {
        try {
            const supabase = this.getSupabaseClient();
            if (!supabase) return null;
            
            const { data, error } = await supabase
                .from('unified_profiles')
                .select('*')
                .eq('wallet_address', walletAddress.toLowerCase())
                .single();
            
            return error ? null : data;
        } catch (e) {
            return null;
        }
    }

    async findProfileByGoogleId(googleId) {
        try {
            const supabase = this.getSupabaseClient();
            if (!supabase) return null;
            
            const { data, error } = await supabase
                .from('unified_profiles')
                .select('*')
                .eq('google_id', googleId)
                .single();
            
            return error ? null : data;
        } catch (e) {
            return null;
        }
    }

    async findProfileByWhatsApp(whatsappId) {
        try {
            const supabase = this.getSupabaseClient();
            if (!supabase) return null;
            
            const { data, error } = await supabase
                .from('unified_profiles')
                .select('*')
                .eq('whatsapp_id', whatsappId)
                .single();
            
            return error ? null : data;
        } catch (e) {
            return null;
        }
    }

    determineRole(email, walletAddress, context) {
        const adminEmails = [
            'admin@beatschain.com',
            'developer@beatschain.com', 
            'info@unamifoundation.org',
            'deannecoole5@gmail.com',
            'sihle.zuma680@gmail.com'
        ];

        const adminWallets = [
            '0xc84799a904eeb5c57abbbc40176e7db8be202c10'
        ];

        if (email && adminEmails.includes(email.toLowerCase())) {
            return 'SUPER_ADMIN';
        }

        if (walletAddress && adminWallets.includes(walletAddress.toLowerCase())) {
            return 'ADMIN';
        }

        if (context === 'app') {
            return email?.includes('@') ? 'PRODUCER' : 'USER';
        } else {
            return email?.includes('@') ? 'ARTIST' : 'USER';
        }
    }

    isAdminUser(email, walletAddress) {
        const role = this.determineRole(email, walletAddress, 'app');
        return ['SUPER_ADMIN', 'ADMIN'].includes(role);
    }

    generateUserId() {
        return `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    getSupabaseClient() {
        try {
            if (typeof window !== 'undefined' && window.supabase) {
                return window.supabase;
            }
            
            if (typeof require !== 'undefined') {
                const { getClient } = require('../../../packages/mcp-server/src/services/supabaseClient');
                return getClient();
            }
            
            return null;
        } catch (e) {
            return null;
        }
    }

    getMcpUrl() {
        return process.env.MCP_SERVER_URL || 
               process.env.NEXT_PUBLIC_MCP_SERVER_URL || 
               'https://beatschain-mcp-server-production.up.railway.app';
    }

    async setupRealTimeSync() {
        // Set up real-time sync listeners for each platform
        if (typeof window !== 'undefined') {
            // Browser environment - listen for storage events
            window.addEventListener('storage', (event) => {
                if (event.key?.startsWith('unified_profile_')) {
                    this.handleProfileUpdate(event.newValue ? JSON.parse(event.newValue) : null);
                }
            });
        }

        // Set up periodic sync
        setInterval(() => {
            this.processSyncQueue();
        }, 30000); // Sync every 30 seconds
    }

    async handleProfileUpdate(profile) {
        if (!profile) return;
        
        // Add to sync queue for cross-platform sync
        this.syncQueue.push({
            action: 'update',
            profile,
            timestamp: Date.now()
        });
    }

    async processSyncQueue() {
        if (this.syncQueue.length === 0) return;
        
        const batch = this.syncQueue.splice(0, 10); // Process in batches
        
        for (const item of batch) {
            try {
                await this.syncProfileToAllPlatforms(item.profile);
            } catch (error) {
                console.warn('❌ Sync queue processing failed:', error);
            }
        }
    }

    // Public API methods
    async authenticateUser(userData) {
        try {
            // Find existing profiles
            const existingProfiles = await this.findExistingProfiles(userData);
            
            // Merge or create profile
            const profile = await this.mergeProfiles(existingProfiles, userData);
            
            // Return unified profile with platform-specific roles
            return {
                success: true,
                profile,
                roles: {
                    app: profile.app_role,
                    extension: profile.extension_role
                },
                platforms: profile.platforms
            };
        } catch (error) {
            console.error('❌ User authentication failed:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    async updateProfile(userId, updates) {
        try {
            // Get current profile
            const currentProfile = await this.storageAdapters.get('supabase').read(userId);
            if (!currentProfile) {
                throw new Error('Profile not found');
            }
            
            // Apply updates
            const updatedProfile = {
                ...currentProfile,
                ...updates,
                updated_at: new Date().toISOString(),
                last_sync: new Date().toISOString()
            };
            
            // Sync to all platforms
            await this.syncProfileToAllPlatforms(updatedProfile);
            
            return {
                success: true,
                profile: updatedProfile
            };
        } catch (error) {
            console.error('❌ Profile update failed:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    async getProfile(userId) {
        try {
            // Try to get from primary storage first
            let profile = await this.storageAdapters.get('supabase').read(userId);
            
            // Fallback to other storage adapters
            if (!profile) {
                for (const [platform, adapter] of this.storageAdapters) {
                    if (platform !== 'supabase') {
                        profile = await adapter.read(userId);
                        if (profile) break;
                    }
                }
            }
            
            return {
                success: true,
                profile
            };
        } catch (error) {
            console.error('❌ Get profile failed:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }
}

// Export for different environments
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { UnifiedProfileSystem };
} else if (typeof window !== 'undefined') {
    window.UnifiedProfileSystem = UnifiedProfileSystem;
}