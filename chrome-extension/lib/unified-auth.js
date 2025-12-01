// Unified Authentication Manager - Consolidates Basic + Enhanced Auth
class UnifiedAuthenticationManager {
    constructor() {
        this.isAuthenticated = false;
        this.userProfile = null;
        this.accessToken = null;
        this.role = 'user';
        this.securityLevel = 'basic';
        this.mfaEnabled = false;
    }

    async initialize() {
        try {
            // Initialize admin wallet manager
            if (window.AdminWalletManager) {
                this.adminWallet = new AdminWalletManager();
                await this.adminWallet.initialize();
            }
            
            // Check existing authentication data
            const stored = await chrome.storage.local.get([
                'auth_token', 'user_profile', 
                'enhanced_wallet_address', 'wallet_address'
            ]);
            
            if (stored.auth_token && stored.user_profile) {
                this.accessToken = stored.auth_token;
                this.userProfile = stored.user_profile;
                this.isAuthenticated = true;
                
                // Determine role and security level
                this.role = this.determineUserRole(stored.user_profile.email);
                this.securityLevel = stored.user_profile.verified_email ? 'enhanced' : 'basic';
                
                // Override role if admin wallet detected
                if (this.adminWallet && this.adminWallet.isAdminMode) {
                    this.role = 'admin';
                    this.securityLevel = 'production';
                }
                
                return true;
            }
            return false;
        } catch (error) {
            console.error('Unified auth initialization failed:', error);
            return false;
        }
    }

    determineUserRole(email, walletAddress = null) {
        // Use unified RBAC for role determination
        if (typeof window !== 'undefined' && window.UnifiedRBAC) {
            const rbac = new window.UnifiedRBAC('extension');
            return rbac.determineRole(email, walletAddress).toLowerCase();
        }
        
        // Fallback for extension context
        const adminEmails = [
            'admin@beatschain.com',
            'developer@beatschain.com', 
            'info@unamifoundation.org',
            'deannecoole5@gmail.com',
            'sihle.zuma680@gmail.com'
        ];
        
        if (adminEmails.includes(email)) return 'admin';
        return email.includes('@') ? 'artist' : 'user';
    }

    async signInWithGoogle(forceAccountSelection = false) {
        return new Promise((resolve, reject) => {
            try {
                if (!chrome.identity) {
                    console.warn('⚠️ Chrome identity API not available - enabling guest mode');
                    this.enableGuestMode();
                    resolve({
                        success: false,
                        guestMode: true,
                        message: 'Authentication not available. Using guest mode.'
                    });
                    return;
                }

                const performAuth = () => {
                    chrome.identity.getAuthToken({ interactive: true }, async (token) => {
                    if (chrome.runtime.lastError) {
                        const errorMsg = chrome.runtime.lastError.message;
                        
                        // Handle specific OAuth errors gracefully
                        if (errorMsg.includes('bad client id') || errorMsg.includes('invalid_client')) {
                            console.warn('⚠️ OAuth client ID configuration - enabling guest mode with full functionality');
                            this.enableGuestMode();
                            resolve({
                                success: false,
                                guestMode: true,
                                message: 'Continuing in guest mode - all features available! Sign-in adds personalization and cloud sync.'
                            });
                            return;
                        }
                        
                        reject(new Error('Google OAuth2 authentication failed: ' + errorMsg));
                        return;
                    }

                    try {
                        const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
                            headers: { 'Authorization': `Bearer ${token}` }
                        });

                        const userInfo = await response.json();

                        this.accessToken = token;
                        this.userProfile = {
                            id: userInfo.id,
                            email: userInfo.email,
                            name: userInfo.name,
                            picture: userInfo.picture,
                            verified_email: userInfo.verified_email
                        };

                        // If a backend is configured, verify token server-side to obtain
                        // authoritative role/permissions. BackendAuthClient should return
                        // { success:true, role: 'admin'|'artist', permissions: [...] }
                        if (window.BackendAuthClient) {
                            try {
                                const backend = new BackendAuthClient();
                                const backendResult = await backend.verifyGoogleToken(token);
                                if (backendResult && backendResult.success) {
                                    this.role = backendResult.role || this.determineUserRole(userInfo.email);
                                    // Optionally store permissions if returned
                                    this.userProfile.permissions = backendResult.permissions || [];
                                } else {
                                    // Backend verification failed - fall back to local mapping
                                    console.warn('Backend token verification failed:', backendResult && backendResult.error);
                                    this.role = this.determineUserRole(userInfo.email);
                                }
                            } catch (backendError) {
                                console.warn('Backend verification error:', backendError);
                                this.role = this.determineUserRole(userInfo.email);
                            }
                        } else {
                            this.role = this.determineUserRole(userInfo.email);
                        }

                        this.isAuthenticated = true;
                        this.securityLevel = userInfo.verified_email ? 'enhanced' : 'basic';

                        // Store authentication data
                        await chrome.storage.local.set({
                            'auth_token': token,
                            'user_profile': this.userProfile,
                            'auth_timestamp': Date.now()
                        });

                        // Generate unified wallet
                        await this.generateUnifiedWallet();

                        resolve({
                            success: true,
                            user: this.userProfile,
                            role: this.role,
                            securityLevel: this.securityLevel
                        });

                    } catch (profileError) {
                        reject(profileError);
                    }
                    });
                };

                // Enable account selection if requested or if switching accounts
                if (forceAccountSelection && chrome.identity.clearAllCachedAuthTokens) {
                    chrome.identity.clearAllCachedAuthTokens(() => {
                        console.log('🔄 Cleared cached tokens for account selection');
                        performAuth();
                    });
                } else {
                    // Standard flow - use cached tokens for faster sign-in
                    performAuth();
                }
            } catch (error) {
                reject(error);
            }
        });
    }



    async generateUnifiedWallet() {
        try {
            // Check if wallet already exists (preserve existing data)
            const existing = await chrome.storage.local.get([
                'wallet_address', 'enhanced_wallet_address'
            ]);
            
            if (existing.wallet_address || existing.enhanced_wallet_address) {
                console.log('✅ Existing wallet preserved');
                return;
            }

            // Generate new unified wallet
            const entropy = new Uint8Array(32);
            crypto.getRandomValues(entropy);
            
            const userSeed = this.userProfile.id + Array.from(entropy).join('');
            const encoder = new TextEncoder();
            const data = encoder.encode(userSeed);
            
            const keyMaterial = await crypto.subtle.importKey(
                'raw', data, { name: 'PBKDF2' }, false, ['deriveBits']
            );
            
            const salt = encoder.encode('BeatsChain-Unified-2024');
            const iterations = this.role === 'admin' ? 200000 : 100000;
            
            const derivedBits = await crypto.subtle.deriveBits({
                name: 'PBKDF2',
                salt: salt,
                iterations: iterations,
                hash: 'SHA-256'
            }, keyMaterial, 256);
            
            const privateKeyArray = new Uint8Array(derivedBits);
            const privateKey = '0x' + Array.from(privateKeyArray, byte => 
                byte.toString(16).padStart(2, '0')
            ).join('');
            
            const addressBytes = new Uint8Array(20);
            crypto.getRandomValues(addressBytes);
            const walletAddress = '0x' + Array.from(addressBytes, byte => 
                byte.toString(16).padStart(2, '0')
            ).join('');
            
            // Store unified wallet address and encrypted private key
            await chrome.storage.local.set({
                'unified_wallet_address': walletAddress,
                'wallet_created': Date.now(),
                'wallet_role': this.role
            });

            if (window.WalletSecureStorage) {
                try {
                    await WalletSecureStorage.encryptAndStore('unified_wallet_private_key_encrypted', privateKey);
                } catch (err) {
                    console.error('Failed to encrypt and store unified private key:', err);
                }
            } else {
                console.warn('WalletSecureStorage not available - unified private key not stored');
            }
            
            console.log('✅ Unified wallet generated:', walletAddress.substring(0, 6) + '...');
            
        } catch (error) {
            console.error('Unified wallet generation failed:', error);
        }
    }

    async signOut() {
        try {
            if (this.accessToken) {
                chrome.identity.removeCachedAuthToken({
                    token: this.accessToken
                }, () => {});
            }

            // Clear unified auth data (preserve wallet for migration)
            await chrome.storage.local.remove([
                'auth_token', 'user_profile', 'auth_timestamp'
            ]);

            // Remove encrypted unified private key if present
            if (window.WalletSecureStorage) {
                await WalletSecureStorage.remove('unified_wallet_private_key_encrypted');
            }

            this.isAuthenticated = false;
            this.userProfile = null;
            this.accessToken = null;
            this.role = 'user';
            this.securityLevel = 'basic';

            return { success: true };
        } catch (error) {
            console.error('Sign-out failed:', error);
            throw error;
        }
    }

    async switchGoogleAccount() {
        try {
            console.log('🔄 Switching Google account...');
            
            // Sign out current user
            await this.signOut();
            
            // Force account selection on next sign-in
            return await this.signInWithGoogle(true);
        } catch (error) {
            console.error('Account switching failed:', error);
            // Graceful fallback to guest mode
            this.enableGuestMode();
            return {
                success: false,
                guestMode: true,
                message: 'Account switching unavailable. Continuing in guest mode with full functionality.'
            };
        }
    }

    async getWalletAddress() {
        try {
            // Use admin wallet if available and in admin mode
            if (this.adminWallet && this.adminWallet.isAdminMode) {
                return this.adminWallet.deriveAddressFromPrivateKey(this.adminWallet.adminPrivateKey);
            }
            
            // Check unified wallet first, fallback to existing wallets
            const result = await chrome.storage.local.get([
                'unified_wallet_address', 'enhanced_wallet_address', 'wallet_address'
            ]);
            
            return result.unified_wallet_address || 
                   result.enhanced_wallet_address || 
                   result.wallet_address || null;
        } catch (error) {
            console.error('Failed to get wallet address:', error);
            return null;
        }
    }

    getUserProfile() {
        if (this.userProfile && this.isAuthenticated) {
            return {
                ...this.userProfile,
                role: this.role,
                securityLevel: this.securityLevel,
                enhanced: this.securityLevel !== 'basic'
            };
        }
        return null;
    }

    getAccessToken() {
        return this.accessToken;
    }

    hasPermission(action) {
        const permissions = {
            'user': ['mint_nft', 'upload_audio', 'radio_submit'],
            'admin': ['*']
        };
        
        const userPermissions = permissions[this.role] || permissions['user'];
        return userPermissions.includes('*') || userPermissions.includes(action);
    }

    enableGuestMode() {
        // Only allow guest mode in explicit developer builds. In production we
        // must not enable guest mode automatically.
        if (window.__DEV_GUEST_MODE__ !== true) {
            console.warn('👤 Guest mode attempted but is disabled in this build');
            return;
        }

        this.isAuthenticated = false;
        this.userProfile = {
            id: 'guest_' + Date.now(),
            email: 'guest@beatschain.local',
            name: 'Guest User',
            picture: null,
            verified_email: false,
            guestMode: true
        };
        this.role = 'user';
        this.securityLevel = 'basic';

        console.log('👤 [DEV] Guest mode enabled - full functionality available for development only.');
    }

    // Enhanced authentication methods for better user control
    async signInWithAccountSelection() {
        return await this.signInWithGoogle(true);
    }

    canSwitchAccounts() {
        return chrome.identity && chrome.identity.clearAllCachedAuthTokens;
    }

    // Backward compatibility methods
    isAuthenticated() {
        return this.isAuthenticated === true;
    }

    async getWalletBalance() {
        return '0.0000';
    }
}

// Load RBAC system
if (typeof window !== 'undefined') {
    // Load unified RBAC for extension context
    window.UnifiedRBAC = class UnifiedRBAC {
        constructor(context = 'extension') {
            this.context = context;
            this.roles = {
                SUPER_ADMIN: 100,
                ADMIN: 90,
                ARTIST: 50,
                USER: 10
            };
            this.permissions = {
                SUPER_ADMIN: ['*'],
                ADMIN: ['admin_panel', 'user_management', 'extension_admin'],
                ARTIST: ['nft_mint', 'radio_submit', 'isrc_generate', 'wallet_manage'],
                USER: ['nft_mint_limited', 'radio_submit_limited']
            };
        }
        
        determineRole(email, walletAddress = null) {
            const adminEmails = [
                'admin@beatschain.com',
                'developer@beatschain.com', 
                'info@unamifoundation.org',
                'deannecoole5@gmail.com',
                'sihle.zuma680@gmail.com'
            ];
            
            if (adminEmails.includes(email)) return 'SUPER_ADMIN';
            if (walletAddress === '0xc84799A904EeB5C57aBBBc40176E7dB8be202C10') return 'ADMIN';
            return email.includes('@') ? 'ARTIST' : 'USER';
        }
        
        hasPermission(userRole, permission) {
            const userPermissions = this.permissions[userRole] || [];
            return userPermissions.includes('*') || userPermissions.includes(permission);
        }
    };
}

// Export for Chrome extension compatibility
window.UnifiedAuthenticationManager = UnifiedAuthenticationManager;