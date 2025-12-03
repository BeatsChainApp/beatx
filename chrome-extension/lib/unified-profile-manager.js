// Unified Profile Manager for Chrome Extension
class UnifiedProfileManager {
    constructor() {
        this.profile = null;
        this.isInitialized = false;
        this.syncInProgress = false;
        this.mcpUrl = 'https://beatschain-mcp-server-production.up.railway.app';
    }

    async initialize() {
        try {
            // Load existing profile from storage
            const stored = await chrome.storage.local.get(['unified_profile', 'auth_token', 'user_profile']);
            
            if (stored.unified_profile) {
                this.profile = stored.unified_profile;
            } else if (stored.user_profile && stored.auth_token) {
                // Migrate from old profile format
                await this.migrateFromLegacyProfile(stored.user_profile, stored.auth_token);
            }

            this.isInitialized = true;
            console.log('✅ Unified Profile Manager initialized');
            return true;
        } catch (error) {
            console.error('❌ Profile Manager initialization failed:', error);
            return false;
        }
    }

    async authenticateUser(userData) {
        try {
            // Get existing auth data
            const stored = await chrome.storage.local.get(['auth_token', 'user_profile', 'wallet_address']);
            
            const authData = {
                email: userData.email || stored.user_profile?.email,
                wallet_address: userData.wallet_address || stored.wallet_address,
                google_id: userData.google_id || stored.user_profile?.id,
                display_name: userData.display_name || userData.name || stored.user_profile?.name,
                profile_image: userData.profile_image || userData.picture || stored.user_profile?.picture,
                verified_email: userData.verified_email || stored.user_profile?.verified_email,
                platform: 'extension',
                auth_method: userData.auth_method || 'google'
            };

            const response = await fetch(`${this.mcpUrl}/api/profiles/authenticate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(authData)
            });

            if (!response.ok) {
                throw new Error(`Authentication failed: ${response.statusText}`);
            }

            const result = await response.json();

            if (result.success && result.profile) {
                this.profile = result.profile;
                
                // Store unified profile
                await chrome.storage.local.set({
                    unified_profile: result.profile,
                    profile_last_sync: Date.now()
                });

                console.log('✅ User authenticated and profile synced');
                return {
                    success: true,
                    profile: result.profile,
                    roles: result.roles
                };
            } else {
                throw new Error(result.error || 'Authentication failed');
            }
        } catch (error) {
            console.error('❌ Authentication error:', error);
            
            // Fallback to local profile if available
            if (this.profile) {
                return {
                    success: true,
                    profile: this.profile,
                    offline: true
                };
            }
            
            return {
                success: false,
                error: error.message
            };
        }
    }

    async updateProfile(updates) {
        if (!this.profile) {
            throw new Error('No profile loaded');
        }

        try {
            const response = await fetch(`${this.mcpUrl}/api/profiles/${this.profile.user_id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    ...updates,
                    platform: 'extension'
                })
            });

            if (!response.ok) {
                throw new Error(`Update failed: ${response.statusText}`);
            }

            const result = await response.json();

            if (result.success && result.profile) {
                this.profile = result.profile;
                
                // Update local storage
                await chrome.storage.local.set({
                    unified_profile: result.profile,
                    profile_last_sync: Date.now()
                });

                console.log('✅ Profile updated successfully');
                return true;
            } else {
                throw new Error(result.error || 'Update failed');
            }
        } catch (error) {
            console.error('❌ Profile update error:', error);
            
            // Update locally if offline
            if (this.profile) {
                this.profile = { ...this.profile, ...updates, updated_at: new Date().toISOString() };
                await chrome.storage.local.set({
                    unified_profile: this.profile,
                    profile_needs_sync: true
                });
                return true;
            }
            
            throw error;
        }
    }

    async syncProfile() {
        if (!this.profile || this.syncInProgress) {
            return false;
        }

        try {
            this.syncInProgress = true;
            
            const response = await fetch(`${this.mcpUrl}/api/profiles/${this.profile.user_id}/sync`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    platform: 'extension'
                })
            });

            if (!response.ok) {
                throw new Error(`Sync failed: ${response.statusText}`);
            }

            const result = await response.json();

            if (result.success) {
                // Get updated profile
                const profileResponse = await fetch(`${this.mcpUrl}/api/profiles/${this.profile.user_id}`);
                if (profileResponse.ok) {
                    const profileResult = await profileResponse.json();
                    if (profileResult.success && profileResult.profile) {
                        this.profile = profileResult.profile;
                        await chrome.storage.local.set({
                            unified_profile: this.profile,
                            profile_last_sync: Date.now(),
                            profile_needs_sync: false
                        });
                    }
                }

                console.log('✅ Profile synced successfully');
                return true;
            } else {
                throw new Error(result.error || 'Sync failed');
            }
        } catch (error) {
            console.error('❌ Profile sync error:', error);
            return false;
        } finally {
            this.syncInProgress = false;
        }
    }

    async addWallet(walletAddress, walletType = 'connected') {
        if (!this.profile) {
            throw new Error('No profile loaded');
        }

        try {
            const response = await fetch(`${this.mcpUrl}/api/profiles/${this.profile.user_id}/wallets`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    platform: 'extension',
                    wallet_address: walletAddress,
                    wallet_type: walletType,
                    is_primary: !this.profile.wallet_address
                })
            });

            if (!response.ok) {
                throw new Error(`Add wallet failed: ${response.statusText}`);
            }

            const result = await response.json();

            if (result.success) {
                // Refresh profile
                await this.syncProfile();
                console.log('✅ Wallet added successfully');
                return true;
            } else {
                throw new Error(result.error || 'Add wallet failed');
            }
        } catch (error) {
            console.error('❌ Add wallet error:', error);
            throw error;
        }
    }

    async getWallets() {
        if (!this.profile) {
            return [];
        }

        try {
            const response = await fetch(`${this.mcpUrl}/api/profiles/${this.profile.user_id}/wallets`);
            
            if (!response.ok) {
                throw new Error(`Get wallets failed: ${response.statusText}`);
            }

            const result = await response.json();

            if (result.success) {
                return result.wallets || [];
            } else {
                throw new Error(result.error || 'Get wallets failed');
            }
        } catch (error) {
            console.error('❌ Get wallets error:', error);
            return [];
        }
    }

    async migrateFromLegacyProfile(legacyProfile, authToken) {
        try {
            console.log('🔄 Migrating from legacy profile format...');
            
            const userData = {
                email: legacyProfile.email,
                google_id: legacyProfile.id,
                display_name: legacyProfile.name,
                profile_image: legacyProfile.picture,
                verified_email: legacyProfile.verified_email,
                platform: 'extension',
                auth_method: 'google_legacy'
            };

            const result = await this.authenticateUser(userData);
            
            if (result.success) {
                // Clean up legacy data
                await chrome.storage.local.remove(['user_profile', 'auth_token']);
                console.log('✅ Legacy profile migrated successfully');
            }
            
            return result.success;
        } catch (error) {
            console.error('❌ Legacy profile migration failed:', error);
            return false;
        }
    }

    getProfile() {
        return this.profile;
    }

    getUserId() {
        return this.profile?.user_id || null;
    }

    getRole(context = 'extension') {
        if (!this.profile) return 'USER';
        return context === 'extension' ? this.profile.extension_role : this.profile.app_role;
    }

    hasPermission(permission) {
        const role = this.getRole();
        
        const permissions = {
            'USER': ['nft_mint_limited', 'radio_submit_limited'],
            'ARTIST': ['nft_mint', 'radio_submit', 'isrc_generate', 'wallet_manage'],
            'ADMIN': ['admin_panel', 'user_management', 'extension_admin'],
            'SUPER_ADMIN': ['*']
        };
        
        const userPermissions = permissions[role] || permissions['USER'];
        return userPermissions.includes('*') || userPermissions.includes(permission);
    }

    isVerified() {
        return this.profile?.is_verified || false;
    }

    isProfileComplete() {
        return this.profile && !!(
            this.profile.display_name &&
            this.profile.email &&
            (this.profile.wallet_address || this.profile.google_id) &&
            this.profile.is_verified
        );
    }

    async setupPeriodicSync() {
        // Sync every 5 minutes
        setInterval(async () => {
            if (this.profile && !this.syncInProgress) {
                await this.syncProfile();
            }
        }, 5 * 60 * 1000);

        // Check for pending sync on startup
        const stored = await chrome.storage.local.get(['profile_needs_sync']);
        if (stored.profile_needs_sync && this.profile) {
            setTimeout(() => this.syncProfile(), 2000);
        }
    }

    // Integration with existing extension systems
    async integrateWithUnifiedAuth() {
        if (typeof window !== 'undefined' && window.UnifiedAuthenticationManager) {
            const authManager = new window.UnifiedAuthenticationManager();
            
            // Sync profile data with auth manager
            if (this.profile && authManager.userProfile) {
                const updates = {
                    platforms: {
                        ...this.profile.platforms,
                        extension: {
                            active: true,
                            last_login: new Date().toISOString(),
                            preferences: authManager.userProfile.preferences || {}
                        }
                    }
                };
                
                await this.updateProfile(updates);
            }
        }
    }

    // Event system for profile changes
    addEventListener(event, callback) {
        if (!this.eventListeners) {
            this.eventListeners = new Map();
        }
        
        if (!this.eventListeners.has(event)) {
            this.eventListeners.set(event, []);
        }
        
        this.eventListeners.get(event).push(callback);
    }

    removeEventListener(event, callback) {
        if (!this.eventListeners || !this.eventListeners.has(event)) {
            return;
        }
        
        const listeners = this.eventListeners.get(event);
        const index = listeners.indexOf(callback);
        if (index > -1) {
            listeners.splice(index, 1);
        }
    }

    emit(event, data) {
        if (!this.eventListeners || !this.eventListeners.has(event)) {
            return;
        }
        
        this.eventListeners.get(event).forEach(callback => {
            try {
                callback(data);
            } catch (error) {
                console.error(`Event listener error for ${event}:`, error);
            }
        });
    }
}

// Export for Chrome extension
window.UnifiedProfileManager = UnifiedProfileManager;