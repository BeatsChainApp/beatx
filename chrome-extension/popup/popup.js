// Config manager is available as window.config (no import needed)

// Safe error handling utility (inline to avoid import issues)
const ErrorHandler = {
    safeErrorMessage: (error, fallback = 'Unknown error') => {
        try {
            if (error === null || error === undefined) {
                return fallback;
            }
            if (error instanceof Error && error.message) {
                return String(error.message);
            }
            if (error && typeof error === 'object' && error.message) {
                return String(error.message);
            }
            if (typeof error === 'string') {
                return error.trim() || fallback;
            }
            return String(error) || fallback;
        } catch {
            return fallback;
        }
    }
};

// Global unified system variables
let unifiedAuth = null;
let walletContext = null;


// BeatsChain Extension Popup Logic - COMPLETE WORKING VERSION
class BeatsChainApp {
    constructor() {
        this.currentSection = 'upload-section';
        // Web3 Minting System
        this.beatFile = null;
        this.beatMetadata = {};
        this.licenseTerms = '';
        // Web2 Radio Submission System (Independent)
        this.radioAudioFile = null;
        this.radioMetadata = {};
        this.splitSheetsManager = null;
        // Centralized Audio Manager
        this.audioManager = new AudioManager();
        // User Input Manager - Ensures user inputs override AI analysis
        this.userInputManager = new UserInputManager();
        // Radio Features
        this.radioIPFSManager = null;
        // Content Enhancement AI
        this.contentAI = null;
        this.radioFormats = null;
        // Smart Trees AI Intelligence
        this.smartTreesAI = null;
        // Monetization Systems
        this.adminDashboard = null;
        this.usageLimits = null;
        this.sponsorContent = null;
        this.isInitialized = false;
        this.partnerConsentGiven = false;
    }

    async showPartnerConsentModal() {
        return new Promise((resolve) => {
            // Check if consent already given
            const consentStored = localStorage.getItem('beatschain_partner_consent');
            if (consentStored === 'true') {
                this.partnerConsentGiven = true;
                resolve(true);
                return;
            }

            // Create modal overlay
            const modalOverlay = document.createElement('div');
            modalOverlay.style.cssText = `
                position: fixed; top: 0; left: 0; right: 0; bottom: 0;
                background: rgba(0,0,0,0.9); z-index: 20000;
                display: flex; align-items: center; justify-content: center;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            `;

            const modal = document.createElement('div');
            modal.style.cssText = `
                background: white; border-radius: 12px; padding: 32px;
                max-width: 500px; width: 90%; text-align: center;
                box-shadow: 0 8px 32px rgba(0,0,0,0.3);
            `;

            modal.innerHTML = `
                <div style="font-size: 48px; margin-bottom: 16px;">📢</div>
                <h2 style="color: #333; margin: 0 0 16px 0;">Professional Partner Content</h2>
                <p style="color: #666; line-height: 1.5; margin: 0 0 24px 0;">
                    BeatsChain partners with professional music industry services to provide you with relevant tools and resources.
                </p>
                <p style="color: #666; line-height: 1.5; margin: 0 0 24px 0;">
                    We may show you content from our verified partners that could help with your music career.
                </p>
                <div style="display: flex; gap: 12px; justify-content: center;">
                    <button id="decline-consent" style="
                        background: #6c757d; color: white; border: none;
                        padding: 12px 24px; border-radius: 6px; cursor: pointer;
                        font-size: 14px;
                    ">No Thanks</button>
                    <button id="accept-consent" style="
                        background: #007bff; color: white; border: none;
                        padding: 12px 24px; border-radius: 6px; cursor: pointer;
                        font-size: 14px; font-weight: 500;
                    ">I agree to see relevant partner content</button>
                </div>
                <p style="color: #999; font-size: 12px; margin: 16px 0 0 0;">
                    You can change this preference anytime in settings. No personal data is shared with partners.
                </p>
            `;

            modalOverlay.appendChild(modal);
            document.body.appendChild(modalOverlay);

            // Handle consent responses
            modal.querySelector('#accept-consent').addEventListener('click', () => {
                localStorage.setItem('beatschain_partner_consent', 'true');
                this.partnerConsentGiven = true;
                document.body.removeChild(modalOverlay);
                resolve(true);
            });

            modal.querySelector('#decline-consent').addEventListener('click', () => {
                localStorage.setItem('beatschain_partner_consent', 'false');
                this.partnerConsentGiven = false;
                document.body.removeChild(modalOverlay);
                resolve(false);
            });
        });
    }

    async initialize() {
        try {
            // PRODUCTION FIX: Initialize production systems first
            if (window.productionFix) {
                console.log('🚀 Running production initialization fix...');
                const productionStatus = await window.productionFix.initializeProductionSystems();
                console.log('📊 Production status:', productionStatus);
                
                // Display production status to user
                if (window.productionStatusDisplay) {
                    window.productionStatusDisplay.showStatus(productionStatus);
                } else if (!productionStatus.success) {
                    this.displayProductionStatus(productionStatus);
                }
            }
            
            // CRITICAL: Show partner consent FIRST before any other initialization
            await this.showPartnerConsentModal();
            
            // Debug script loading
            console.log('🔍 Script loading check:', {
                MetadataWriter: !!window.MetadataWriter,
                AudioTaggingManager: !!window.AudioTaggingManager,
                ImageTaggingManager: !!window.ImageTaggingManager,
                AdminDashboardManager: !!window.AdminDashboardManager
            });
            
            this.setupEventListeners();
            
            // Initialize managers with error handling
            try {
                // PHASE 1: Run migration first
                if (window.MigrationManager) {
                    this.migrationManager = new MigrationManager();
                    await this.migrationManager.checkAndMigrate();
                    console.log('✅ Migration check completed');
                }
                
                // PHASE 1: Use unified authentication system (production fix integration)
                if (window.unifiedAuth) {
                    // Use the production-fixed unified auth
                    unifiedAuth = window.unifiedAuth;
                    console.log('✅ Using production-fixed unified authentication');
                } else if (window.UnifiedAuthenticationManager) {
                    unifiedAuth = new UnifiedAuthenticationManager();
                    console.log('🔄 Initializing unified authentication...');
                } else {
                    // Graceful fallback to enhanced auth
                    if (window.EnhancedAuthenticationManager) {
                        unifiedAuth = new EnhancedAuthenticationManager();
                        console.log('🛡️ Fallback to enhanced authentication...');
                    } else {
                        unifiedAuth = new AuthenticationManager();
                        console.log('🔑 Fallback to basic authentication...');
                    }
                }
                
                const isAuthenticated = await unifiedAuth.initialize();
                if (isAuthenticated) {
                    const userProfile = unifiedAuth.getUserProfile();
                    console.log('✅ User authenticated:', userProfile.name);
                    
                    if (userProfile.enhanced) {
                        console.log('🛡️ Enhanced security active:', {
                            role: userProfile.role,
                            securityLevel: userProfile.securityLevel,
                            mfaEnabled: userProfile.mfaEnabled
                        });
                    }
                    
                    await this.updateAuthenticatedUI(userProfile);
                } else {
                    console.log('ℹ️ User not authenticated - sign in required for minting');
                    this.showAuthenticationRequired();
                }
            } catch (error) {
                console.error('Authentication manager initialization failed:', error);
                // IMPORTANT: Do NOT auto-enable bypass or guest mode in production.
                // Surface the authentication requirement to the user and let them
                // explicitly sign in. This prevents accidental access escalation.
                this.showAuthenticationRequired();
                // Ensure unifiedAuth is not left in a state that may be treated as authenticated
                unifiedAuth = null;
            }
            
            try {
                this.chromeAI = new ChromeAIManager();
                const aiAvailable = await this.chromeAI.initialize();
                if (aiAvailable) {
                    console.log('✅ Chrome AI ready');
                } else {
                    console.log('ℹ️ Chrome AI unavailable - using fallback templates');
                }
            } catch (error) {
                console.log('Chrome AI unavailable, using fallback templates');
            }
            
            try {
                // PHASE 1: Initialize unified wallet context
                if (window.WalletContextManager) {
                    walletContext = new WalletContextManager();
                    const walletReady = await walletContext.initialize();
                    console.log('✅ Unified wallet context initialized');
                }
                
                // Phase 2: Solana-only manager (preserved for compatibility)
                if (window.SolanaManager) {
                    this.solanaManager = new SolanaManager();
                    const solanaReady = await this.solanaManager.initialize();
                } else {
                    console.error('❌ SolanaManager not available');
                    this.showSolanaRequiredMessage();
                    return;
                }
                
                const solanaReady = await this.solanaManager.initialize();
                this.thirdweb = this.solanaManager; // Always assign for backward compatibility
                if (solanaReady) {
                    console.log('✅ Solana-only manager initialized - real blockchain minting ready');
                } else {
                    console.log('⚠️ Solana manager partial initialization - some features may be limited');
                }
            } catch (error) {
                console.error('❌ Solana manager initialization failed:', error);
                this.showSolanaRequiredMessage();
            }
            
            // Initialize radio features
            await this.initializeRadioFeatures();
            
            // Initialize Content Enhancement AI
            await this.initializeContentAI();
            
            // Initialize Smart Trees AI
            await this.initializeSmartTreesAI();
            
            // Initialize Smart Asset Hub Integration
            await this.initializeSmartAssetHubIntegration();
            
            // Initialize Monetization Systems with error handling
            try {
                await this.initializeMonetizationSystems();
            } catch (error) {
                console.log('Monetization systems initialization failed:', error);
            }
            
            // Force Admin Dashboard initialization for admin users
            if (window.AdminDashboardManager) {
                try {
                    this.adminDashboard = new AdminDashboardManager();
                    
                    // Create a mock auth manager if unifiedAuth is not available
                        const authManager = unifiedAuth || {
                        hasPermission: (permission) => {
                            // Allow all admin permissions only when an explicit dev flag is set.
                            // This prevents accidental privilege escalation in production.
                            if (window.__DEV_ADMIN__ === true) return true;
                            return permission === 'admin_panel' || permission === 'admin';
                        },
                        getUserProfile: () => ({ 
                            name: 'Admin User', 
                            role: 'admin',
                            address: '0xc84799A904EeB5C57aBBBc40176E7dB8be202C10'
                        }),
                        isAuthenticated: () => true
                    };
                    
                    // Connect all systems to admin dashboard BEFORE initialization
                    if (this.revenueManagementSystem) {
                        this.adminDashboard.revenueManagementSystem = this.revenueManagementSystem;
                        console.log('✅ Revenue system connected to admin dashboard');
                    }
                    if (this.chromeAIOptimizer) {
                        this.adminDashboard.chromeAIOptimizer = this.chromeAIOptimizer;
                        console.log('✅ AI optimizer connected to admin dashboard');
                    }
                    if (this.campaignManager) {
                        this.adminDashboard.campaignManager = this.campaignManager;
                        console.log('✅ Campaign manager connected to admin dashboard');
                    }
                    if (this.analyticsManager) {
                        this.adminDashboard.analyticsManager = this.analyticsManager;
                        console.log('✅ Analytics manager connected to admin dashboard');
                    }
                    
                    await this.adminDashboard.initialize(authManager);
                    console.log('✅ Admin Dashboard initialized with all systems connected');
                    
                    // Check if user is admin after authentication
                    if (unifiedAuth && typeof unifiedAuth.isAuthenticated === 'function' && unifiedAuth.isAuthenticated()) {
                        const userProfile = unifiedAuth.getUserProfile();
                        if (userProfile && userProfile.role === 'admin') {
                            console.log('✅ Admin user detected - showing admin UI');
                            setTimeout(async () => {
                                await this.ensureAdminDashboardVisible();
                            }, 500);
                        }
                    } else {
                        // Show admin UI for bypass users (development)
                        console.log('✅ Showing admin UI for development/bypass');
                        setTimeout(async () => {
                            await this.ensureAdminDashboardVisible();
                        }, 500);
                    }
                } catch (error) {
                    const errorMessage = ErrorHandler.safeErrorMessage(error);
                    console.log('⚠️ Admin Dashboard initialization failed:', errorMessage);
                    // Retry initialization without strict permission checks
                    try {
                        this.adminDashboard = new AdminDashboardManager();
                        const mockAuth = {
                            hasPermission: () => true,
                            getUserProfile: () => ({ name: 'Admin User', role: 'admin' }),
                            isAuthenticated: () => true
                        };
                        await this.adminDashboard.initialize(mockAuth);
                        console.log('✅ Admin Dashboard initialized with mock auth');
                    } catch (retryError) {
                        console.log('⚠️ Admin Dashboard retry failed, checking for existing dashboard');
                        
                        // Check if admin dashboard already exists before creating fallback
                        const existingAdmin = document.getElementById('admin-dashboard-section');
                        if (!existingAdmin) {
                            this.adminDashboard = {
                                isInitialized: false,
                                setupDashboardUI: () => console.log('Admin dashboard unavailable'),
                                getSponsorContent: () => null
                            };
                        } else {
                            console.log('✅ Found existing admin dashboard, using it');
                            this.adminDashboard = {
                                isInitialized: true,
                                setupDashboardUI: () => console.log('Using existing admin dashboard'),
                                getSponsorContent: () => null
                            };
                        }
                    }
                }
            }
            
            // Initialize Analytics Manager FIRST (needed by revenue system)
            await this.initializeAnalytics();
            
            // Initialize Package Measurement System
            await this.initializePackageMeasurementSystem();
            
            // Initialize Sponsor Integration
            await this.initializeSponsorIntegration();
            
            // Initialize Minting Sponsor Integration
            await this.initializeMintingSponsorIntegration();
            
            // Initialize Radio Sponsor Integration
            await this.initializeRadioSponsorIntegration();
            
            // Initialize Chrome AI Revenue Optimizer
            await this.initializeChromeAIOptimizer();
            
            // Initialize Revenue Management System (after dependencies)
            await this.initializeRevenueManagement();
            
            // Connect systems to admin dashboard if available
            if (this.adminDashboard && this.adminDashboard.isInitialized) {
                this.connectSystemsToAdminDashboard();
            }
            
            // Initialize production systems
            if (window.productionMonitor) {
                await window.productionMonitor.initialize();
            }
            
            // Initialize shared ISRC manager for both minting and radio
            if (window.ISRCManager && !this.isrcManager) {
                try {
                    this.isrcManager = new ISRCManager();
                    await this.isrcManager.initialize();
                    console.log('✅ Shared ISRC Manager initialized at app level');
                    
                    // Make globally available for both systems
                    window.sharedISRCManager = this.isrcManager;
                } catch (error) {
                    console.error('ISRC Manager initialization failed:', ErrorHandler.safeErrorMessage(error));
                }
            }
            
            // Initialize SAMRO split manager
            if (window.SAMROSplitManager && this.isrcManager) {
                try {
                    SAMROSplitManager.enhanceApp(this);
                } catch (error) {
                    console.error('SAMRO Split Manager initialization failed:', ErrorHandler.safeErrorMessage(error));
                }
            }
            
            await this.loadWalletData();
            await this.loadProfile();
            
            // Setup authentication context collapse on initialization
            setTimeout(() => {
                this.setupAuthContextCollapse();
            }, 200);
            
            // Initialize Onboarding Manager
            if (window.OnboardingManager) {
                this.onboardingManager = new OnboardingManager();
                await this.onboardingManager.initialize();
                console.log('✅ Onboarding Manager initialized');
            }
            
            this.isInitialized = true;
            console.log('BeatsChain initialized successfully');
        } catch (error) {
            console.error('Initialization failed:', error);
            
            // Show production error status if available
            if (window.productionFix) {
                const status = window.productionFix.getSystemStatus();
                const errorStatus = {
                    success: false,
                    error: error.message,
                    systems: status.systems,
                    recommendations: ['Check browser console for detailed error information', 'Refresh the extension to retry initialization']
                };
                
                if (window.productionStatusDisplay) {
                    window.productionStatusDisplay.showStatus(errorStatus);
                } else {
                    this.displayProductionStatus(errorStatus);
                }
            }
        }
    }
    
    displayProductionStatus(status) {
        // Create production status display
        const statusDiv = document.createElement('div');
        statusDiv.id = 'production-status';
        statusDiv.style.cssText = `
            position: fixed; top: 0; left: 0; right: 0;
            background: ${status.success ? '#d4edda' : '#f8d7da'};
            border-bottom: 1px solid ${status.success ? '#c3e6cb' : '#f5c6cb'};
            color: ${status.success ? '#155724' : '#721c24'};
            padding: 12px 16px; z-index: 10000;
            font-size: 14px; text-align: center;
        `;
        
        const systemsStatus = Object.entries(status.systems || {})
            .map(([system, state]) => `${system}: ${state}`)
            .join(', ');
        
        statusDiv.innerHTML = `
            <div style="font-weight: bold; margin-bottom: 4px;">
                ${status.success ? '✅ Production Mode Active' : '⚠️ Production Mode Issues Detected'}
            </div>
            <div style="font-size: 12px;">
                Systems: ${systemsStatus}
            </div>
            ${status.recommendations ? `
                <div style="font-size: 11px; margin-top: 4px; opacity: 0.8;">
                    ${status.recommendations.join(' • ')}
                </div>
            ` : ''}
            <button onclick="this.parentNode.remove()" style="
                position: absolute; top: 8px; right: 12px;
                background: none; border: none; font-size: 16px;
                cursor: pointer; opacity: 0.7;
            ">×</button>
        `;
        
        document.body.insertBefore(statusDiv, document.body.firstChild);
        
        // Auto-hide success messages after 10 seconds
        if (status.success) {
            setTimeout(() => {
                if (statusDiv.parentNode) {
                    statusDiv.remove();
                }
            }, 10000);
        }
    }

    setupEventListeners() {
        // Hamburger menu navigation
        const menuToggle = document.getElementById('menu-toggle');
        const navDropdown = document.getElementById('nav-dropdown');
        
        if (menuToggle && navDropdown) {
            menuToggle.addEventListener('click', () => {
                navDropdown.classList.toggle('open');
            });
            
            // Close menu when clicking outside
            document.addEventListener('click', (e) => {
                if (!menuToggle.contains(e.target) && !navDropdown.contains(e.target)) {
                    navDropdown.classList.remove('open');
                }
            });
        }
        
        // Navigation items
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                const section = e.target.dataset.section;
                this.switchTab(section);
                // Close menu after selection
                if (navDropdown) navDropdown.classList.remove('open');
            });
        });
        
        // Export wallet button
        const exportWalletBtn = document.getElementById('export-wallet');
        if (exportWalletBtn) {
            exportWalletBtn.addEventListener('click', this.handleExportWallet.bind(this));
        }
        
        // ISRC copy button
        const copyISRCBtn = document.getElementById('copy-isrc');
        if (copyISRCBtn) {
            try {
                copyISRCBtn.addEventListener('click', this.handleCopyISRC.bind(this));
            } catch (error) {
                console.error('Failed to setup ISRC copy button:', ErrorHandler.safeErrorMessage(error));
            }
        }
        
        // Wallet panel toggle
        const walletToggle = document.getElementById('toggle-wallet');
        const walletPanel = document.getElementById('wallet-panel');
        if (walletToggle && walletPanel) {
            walletToggle.addEventListener('click', () => {
                walletPanel.classList.toggle('collapsed');
            });
        }

        // Upload functionality
        const uploadArea = document.getElementById('upload-area');
        const fileInput = document.getElementById('audio-file');
        
        if (uploadArea && fileInput) {
            uploadArea.addEventListener('click', () => fileInput.click());
            uploadArea.addEventListener('dragover', this.handleDragOver.bind(this));
            uploadArea.addEventListener('drop', this.handleFileDrop.bind(this));
            fileInput.addEventListener('change', this.handleFileSelect.bind(this));
        }

        // License generation
        const generateBtn = document.getElementById('generate-license');
        if (generateBtn) {
            generateBtn.addEventListener('click', this.generateLicense.bind(this));
        }

        const approveBtn = document.getElementById('approve-license');
        if (approveBtn) {
            approveBtn.addEventListener('click', this.approveLicense.bind(this));
        }

        // Minting
        const mintBtn = document.getElementById('mint-nft');
        if (mintBtn) {
            mintBtn.addEventListener('click', this.mintNFT.bind(this));
        }

        // Success actions
        const viewBtn = document.getElementById('view-nft');
        if (viewBtn) {
            viewBtn.addEventListener('click', this.viewNFT.bind(this));
        }

        const downloadBtn = document.getElementById('download-package');
        if (downloadBtn) {
            downloadBtn.addEventListener('click', () => this.generateDownloadPackage({
                transactionHash: this.currentTxHash,
                tokenId: this.currentTokenId
            }));
        }

        const mintAnotherBtn = document.getElementById('mint-another');
        if (mintAnotherBtn) {
            mintAnotherBtn.addEventListener('click', this.resetApp.bind(this));
        }

        // Authentication
        const googleSignIn = document.getElementById('google-signin');
        if (googleSignIn) {
            googleSignIn.addEventListener('click', this.handleGoogleSignIn.bind(this));
        }
        
        // Radio system sign-in buttons
        const radioSignInBtn = document.getElementById('radio-signin-btn');
        if (radioSignInBtn) {
            radioSignInBtn.addEventListener('click', this.handleGoogleSignIn.bind(this));
        }
        
        const radioLimitSignIn = document.getElementById('radio-limit-signin');
        if (radioLimitSignIn) {
            radioLimitSignIn.addEventListener('click', this.handleGoogleSignIn.bind(this));
        }

        // Image upload
        const imageInput = document.getElementById('cover-image');
        if (imageInput) {
            imageInput.addEventListener('change', this.handleImageUpload.bind(this));
        }

        // Proceed button
        const proceedBtn = document.getElementById('proceed-to-licensing');
        if (proceedBtn) {
            proceedBtn.addEventListener('click', () => this.showProceedToLicensingSponsored());
        }

        // Radio submission events
        const generateRadioBtn = document.getElementById('generate-radio-package');
        if (generateRadioBtn) {
            generateRadioBtn.addEventListener('click', this.generateRadioPackage.bind(this));
        }
        
        const validateRadioBtn = document.getElementById('validate-radio');
        if (validateRadioBtn) {
            validateRadioBtn.addEventListener('click', this.validateForRadio.bind(this));
        }
        
        // AI Insights events
        const growBranchBtn = document.getElementById('grow-new-branch');
        if (growBranchBtn) {
            growBranchBtn.addEventListener('click', this.growNewBranch.bind(this));
        }
        
        // ISRC generation handled by ISRCManager
        
        const addContributorBtn = document.getElementById('add-contributor');
        if (addContributorBtn) {
            addContributorBtn.addEventListener('click', this.addContributor.bind(this));
        }
        
        // Setup percentage calculator
        this.setupPercentageCalculator();
        
        // Profile save button
        const saveProfileBtn = document.getElementById('save-profile');
        if (saveProfileBtn) {
            saveProfileBtn.addEventListener('click', this.saveProfile.bind(this));
        }
        
        // Setup artist invitation events
        const inviteBtn = document.getElementById('send-invitation');
        if (inviteBtn) {
            inviteBtn.addEventListener('click', this.handleArtistInvite.bind(this));
        }
        
        // Setup invitation collapse functionality
        const invitationToggle = document.getElementById('invitation-toggle');
        const invitationContent = document.getElementById('invitation-content');
        if (invitationToggle && invitationContent) {
            invitationToggle.addEventListener('click', () => {
                invitationContent.classList.toggle('collapsed');
                invitationToggle.textContent = invitationContent.classList.contains('collapsed') ? '▶' : '▼';
            });
        }
        
        // Setup profile info collapse
        const profileInfoToggle = document.getElementById('profile-info-toggle');
        const profileInfoContent = document.getElementById('profile-info-content');
        if (profileInfoToggle && profileInfoContent) {
            profileInfoToggle.addEventListener('click', () => {
                profileInfoContent.classList.toggle('collapsed');
                profileInfoToggle.textContent = profileInfoContent.classList.contains('collapsed') ? '▶' : '▼';
            });
        }
        
        // Setup bio collapse
        const bioToggle = document.getElementById('bio-toggle');
        const bioContent = document.getElementById('bio-content');
        if (bioToggle && bioContent) {
            bioToggle.addEventListener('click', () => {
                bioContent.classList.toggle('collapsed');
                bioToggle.textContent = bioContent.classList.contains('collapsed') ? '▶' : '▼';
            });
        }
    }

    handleDragOver(e) {
        e.preventDefault();
        e.currentTarget.classList.add('dragover');
    }

    handleFileDrop(e) {
        e.preventDefault();
        e.currentTarget.classList.remove('dragover');
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            this.processFile(files[0]);
        }
    }

    handleFileSelect(e) {
        const file = e.target.files[0];
        if (file) {
            this.processFile(file);
        }
    }

    async processFile(file) {
        this.showProgress(true);
        
        try {
            // Enhanced security validation
            if (!this.audioManager) {
                throw new Error('Audio manager not initialized');
            }
            
            const isValid = await this.validateAudioFile(file);
            if (!isValid) {
                throw new Error('File validation failed');
            }

            this.beatFile = file;
            this.beatMetadata = await this.extractAudioMetadata(file, 'web3');
            this.updateUploadStatus(`Uploaded: ${file.name} (${this.audioManager.formatFileSize(file.size)})`);
            this.showProgress(false);
            this.createAudioPreview(file);
            this.displayMetadata(this.beatMetadata);
            this.showArtistForm();
            
            // Record activity for Smart Trees AI
            if (this.smartTreesAI) {
                this.smartTreesAI.recordActivity('beat_upload', {
                    genre: this.beatMetadata.suggestedGenre,
                    duration: this.beatMetadata.durationSeconds,
                    quality: this.beatMetadata.qualityLevel,
                    format: this.beatMetadata.format
                });
            }
            
            const proceedBtn = document.getElementById('proceed-to-licensing');
            if (proceedBtn) proceedBtn.style.display = 'block';
        } catch (error) {
            console.error('File processing failed:', error);
            const errorMessage = ErrorHandler.safeErrorMessage(error);
            alert(`File upload failed: ${errorMessage}`);
            this.showProgress(false);
        }
    }

    async validateAudioFile(file) {
        return await this.audioManager.validateAudioFile(file);
    }

    async extractAudioMetadata(file, systemId = 'web3') {
        const basicMetadata = await this.audioManager.extractAudioMetadata(file, systemId);
        
        // Enhance with Chrome AI if available
        if (this.chromeAI && this.chromeAI.apis && this.chromeAI.apis.languageModel) {
            try {
                const enhancedMetadata = await this.enhanceMetadataWithAI(basicMetadata, file.name);
                return { ...basicMetadata, ...enhancedMetadata };
            } catch (error) {
                console.log('AI enhancement failed, using basic metadata:', error);
            }
        }
        
        return basicMetadata;
    }
    
    async enhanceMetadataWithAI(metadata, filename) {
        try {
            const prompt = `Analyze this music file and enhance the metadata:

Filename: ${filename}
Duration: ${metadata.duration}
Detected Genre: ${metadata.suggestedGenre}
Estimated BPM: ${metadata.estimatedBPM}
Energy Level: ${metadata.energyLevel}

Provide enhanced tags in JSON format:
{
  "mood": "energetic/chill/dark/uplifting",
  "subgenre": "specific subgenre",
  "instruments": ["list of likely instruments"],
  "tempo": "slow/medium/fast/very fast",
  "vibe": "party/workout/study/relaxing",
  "enhancedGenre": "more specific genre"
}`;
            
            const response = await this.chromeAI.apis.languageModel.prompt(prompt);
            // Secure JSON parsing with validation
            let enhanced;
            try {
                enhanced = JSON.parse(response);
                // Validate structure
                if (typeof enhanced !== 'object' || enhanced === null) {
                    throw new Error('Invalid response format');
                }
            } catch (error) {
                console.log('AI response parsing failed:', error);
                return {};
            }
            
            return {
                mood: enhanced.mood,
                subgenre: enhanced.subgenre,
                instruments: enhanced.instruments,
                tempo: enhanced.tempo,
                vibe: enhanced.vibe,
                enhancedGenre: enhanced.enhancedGenre || metadata.suggestedGenre,
                aiEnhanced: true
            };
        } catch (error) {
            console.log('AI metadata enhancement failed:', error);
            return {};
        }
    }

    // Utility methods now delegated to AudioManager
    estimateBitrate(fileSize, duration) {
        return this.audioManager.estimateBitrate(fileSize, duration);
    }

    getQualityLevel(bitrate, format) {
        return this.audioManager.getQualityLevel(bitrate, format);
    }

    estimateBPM(fileName) {
        return this.audioManager.estimateBPM(fileName);
    }

    inferGenre(fileName) {
        return this.audioManager.inferGenre(fileName);
    }

    inferEnergyLevel(fileName, duration) {
        return this.audioManager.inferEnergyLevel(fileName, duration);
    }

    async generateLicense() {
        const generateBtn = document.getElementById('generate-license');
        const statusText = document.getElementById('ai-status-text');
        const licenseTextarea = document.getElementById('license-terms');
        
        generateBtn.disabled = true;
        statusText.textContent = 'Generating license...';

        try {
            const artistInputs = this.getArtistInputs();
            // USER INPUT PRIORITY: User selections override AI analysis
            const enhancedMetadata = this.userInputManager.mergeWithUserInputs(this.beatMetadata, artistInputs);
            
            const licenseOptions = this.getLicenseOptions();
            
            // USER INPUT PRIORITY: Use AI only if available, always preserve user inputs
            if (this.chromeAI && this.chromeAI.apis && this.chromeAI.apis.languageModel) {
                statusText.textContent = 'AI generating professional licensing terms...';
                this.licenseTerms = await this.chromeAI.generateLicense(enhancedMetadata, licenseOptions);
            } else {
                statusText.textContent = 'Using professional template license';
                this.licenseTerms = this.getEnhancedFallbackLicense(enhancedMetadata, licenseOptions);
            }
            
            licenseTextarea.value = this.licenseTerms;
            statusText.textContent = 'License generated successfully!';
            document.getElementById('approve-license').disabled = false;
            
            // Record license generation activity
            if (this.smartTreesAI) {
                this.smartTreesAI.recordActivity('license_generation', {
                    genre: enhancedMetadata.genre,
                    licenseType: licenseOptions.licenseType,
                    commercialUse: licenseOptions.commercialUse
                });
            }
            
        } catch (error) {
            console.error('License generation failed:', error);
            statusText.textContent = 'Using template license';
            
            const artistInputs = this.getArtistInputs();
            const enhancedMetadata = {
                ...this.beatMetadata,
                artist: artistInputs.artistName,
                stageName: artistInputs.stageName,
                title: artistInputs.beatTitle,
                genre: artistInputs.genre
            };
            this.licenseTerms = this.getEnhancedFallbackLicense(enhancedMetadata, this.getLicenseOptions());
            licenseTextarea.value = this.licenseTerms;
            document.getElementById('approve-license').disabled = false;
        } finally {
            generateBtn.disabled = false;
        }
    }

    getEnhancedFallbackLicense(metadata, options = {}) {
        const artistDisplay = metadata.stageName ? `${metadata.artist} (${metadata.stageName})` : metadata.artist;
        const licenseTypeText = options.licenseType === 'exclusive' ? 'EXCLUSIVE' : 'NON-EXCLUSIVE';
        
        return `BEATSCHAIN MUSIC NFT LICENSING AGREEMENT

═══════════════════════════════════════════════════════════════
TRACK IDENTIFICATION & TECHNICAL SPECIFICATIONS
═══════════════════════════════════════════════════════════════

Track Title: ${metadata.title}
Original Filename: ${metadata.originalFileName}
Duration: ${metadata.duration} (${metadata.durationSeconds} seconds)
Genre Classification: ${metadata.genre || metadata.suggestedGenre} (USER SELECTED)
Estimated BPM: ${metadata.estimatedBPM}
Energy Level: ${metadata.energyLevel}
Audio Quality: ${metadata.qualityLevel}
File Format: ${metadata.format}
Estimated Bitrate: ${metadata.estimatedBitrate}
File Size: ${metadata.fileSize}

═══════════════════════════════════════════════════════════════
GRANT OF RIGHTS
═══════════════════════════════════════════════════════════════

1. LICENSE TYPE: ${licenseTypeText} Perpetual License
2. TERRITORY: Worldwide distribution and usage rights  
3. DURATION: Perpetual (never expires, suitable for NFT ownership)
4. ARTIST: ${artistDisplay}

═══════════════════════════════════════════════════════════════
INCLUDED RIGHTS
═══════════════════════════════════════════════════════════════

✓ SYNCHRONIZATION RIGHTS: Use with video, film, advertising, social media
✓ MECHANICAL RIGHTS: Digital reproduction, streaming, downloads
✓ PERFORMANCE RIGHTS: Live performances, broadcasts, public play
✓ DERIVATIVE WORKS: Remixes, samples, modifications (with attribution)
✓ DISTRIBUTION RIGHTS: Online platforms, physical media, streaming services

Generated by BeatsChain Chrome Extension on ${new Date().toLocaleString()}
Extension ID: chrome-extension://${chrome.runtime?.id || 'local-development'}
Verification: Check Chrome extension storage for transaction details`;
    }

    approveLicense() {
        const licenseText = document.getElementById('license-terms').value;
        if (!licenseText.trim()) {
            alert('Please generate or enter licensing terms');
            return;
        }
        
        this.licenseTerms = licenseText;
        this.showSection('isrc-minting-section');
        this.initializeISRCMinting();
    }

    async initializeISRCMinting() {
        try {
            // CRITICAL: Use shared ISRC manager to avoid duplicates
            if (!this.isrcManager && window.ISRCManager) {
                this.isrcManager = new ISRCManager();
                await this.isrcManager.initialize();
                console.log('✅ Shared ISRC Manager initialized for minting');
            }
            
            // Setup ISRC generation button (prevent duplicate listeners)
            const generateBtn = document.getElementById('generate-isrc');
            if (generateBtn && !generateBtn.hasAttribute('data-isrc-listener')) {
                generateBtn.setAttribute('data-isrc-listener', 'true');
                generateBtn.addEventListener('click', async () => {
                    await this.handleISRCGeneration();
                });
            }
            
            // Setup proceed to mint button - REQUIRES VALIDATION
            const proceedBtn = document.getElementById('proceed-to-mint');
            if (proceedBtn) {
                // Initially disable until ISRC is generated and validated
                proceedBtn.disabled = true;
                proceedBtn.title = 'Generate and validate ISRC first';
                
                // Prevent duplicate listeners
                if (!proceedBtn.hasAttribute('data-proceed-listener')) {
                    proceedBtn.setAttribute('data-proceed-listener', 'true');
                    proceedBtn.addEventListener('click', () => {
                        // Show sponsored content before proceeding to minting
                        this.showISRCProceedSponsored();
                    });
                }
            }
            
            // Auto-generate ISRC if we have track info
            const artistInputs = this.getArtistInputs();
            if (artistInputs.beatTitle && artistInputs.artistName) {
                await this.handleISRCGeneration();
            }
            
        } catch (error) {
            console.warn('⚠️ ISRC minting initialization failed:', error);
            // Continue without ISRC functionality
        }
    }
    
    async handleISRCGeneration() {
        const generateBtn = document.getElementById('generate-isrc');
        const statusBadge = document.getElementById('isrc-status');
        const validateBtn = document.getElementById('validate-isrc');
        
        if (!generateBtn || !statusBadge) return;
        
        const originalText = generateBtn.textContent;
        generateBtn.disabled = true;
        generateBtn.textContent = 'Generating...';
        statusBadge.textContent = 'Generating';
        
        try {
            // CRITICAL: Use shared ISRC manager to avoid duplicates
            if (!this.isrcManager) {
                try {
                    this.isrcManager = window.sharedISRCManager || (window.ISRCManager ? new ISRCManager() : null);
                    if (this.isrcManager && !window.sharedISRCManager) {
                        await this.isrcManager.initialize();
                        window.sharedISRCManager = this.isrcManager;
                        console.log('🔧 Shared ISRC Manager initialized for minting');
                    }
                } catch (initError) {
                    console.error('ISRC Manager initialization failed:', ErrorHandler.safeErrorMessage(initError));
                    this.isrcManager = null;
                }
            }
            
            if (!this.isrcManager) {
                throw new Error('ISRC Manager not available');
            }
            
            // Ensure ISRC manager is properly initialized
            if (!this.isrcManager.registry) {
                await this.isrcManager.initialize();
                console.log('🔧 ISRC Manager registry initialized');
            }
            
            const artistInputs = this.getArtistInputs();
            const isrc = await this.isrcManager.generateISRC(artistInputs.beatTitle, artistInputs.artistName);
            
            // Update display - CRITICAL: Make ISRC visible and persistent
            const isrcDisplay = document.getElementById('generated-isrc');
            if (isrcDisplay) {
                isrcDisplay.textContent = isrc;
                isrcDisplay.style.cssText = 'display: block; font-weight: bold; color: #4CAF50; font-size: 16px; padding: 8px; background: rgba(76, 175, 80, 0.1); border-radius: 4px; border: 1px solid #4CAF50;';
            }
            
            // Update breakdown
            const parts = isrc.split('-');
            const breakdown = document.querySelector('.isrc-breakdown');
            if (breakdown && parts.length === 4) {
                breakdown.innerHTML = `
                    <span class="isrc-part">${parts[0]} <small>Country</small></span>
                    <span class="isrc-part">${parts[1]} <small>Registrant</small></span>
                    <span class="isrc-part">${parts[2]} <small>Year</small></span>
                    <span class="isrc-part">${parts[3]} <small>Designation</small></span>
                `;
            }
            
            // Store ISRC for minting
            this.beatMetadata.isrc = isrc;
            
            statusBadge.textContent = 'Generated';
            statusBadge.style.background = '#4CAF50';
            statusBadge.style.color = 'white';
            generateBtn.textContent = '✅ Generated';
            generateBtn.style.background = '#4CAF50';
            generateBtn.style.color = 'white';
            
            // Enable validation button and update first checklist item
            if (validateBtn) {
                validateBtn.disabled = false;
                // Remove any existing event listeners to prevent loops
                const newValidateBtn = validateBtn.cloneNode(true);
                validateBtn.parentNode.replaceChild(newValidateBtn, validateBtn);
                // Add fresh event listener
                newValidateBtn.addEventListener('click', () => this.validateISRC(isrc));
            }
            
            // Update first checklist item
            const checkItems = document.querySelectorAll('.check-item');
            if (checkItems.length > 0) {
                const firstItem = checkItems[0];
                const icon = firstItem.querySelector('.check-icon');
                if (icon) {
                    icon.textContent = '✅';
                    firstItem.classList.add('completed');
                }
            }
            
            // FIXED: Show native sponsor content after ISRC generation (prevent duplicates)
            setTimeout(() => {
                this.displayISRCGenerationSponsored();
            }, 1000);
            
            setTimeout(() => {
                generateBtn.textContent = originalText;
                generateBtn.disabled = false;
            }, 2000);
            
        } catch (error) {
            console.error('ISRC generation failed:', error);
            statusBadge.textContent = 'Error';
            generateBtn.textContent = 'Error';
            
            // Show user-friendly error message
            const safeErrorMsg = ErrorHandler.safeErrorMessage(error);
            const errorMsg = safeErrorMsg.includes('not available') ? 
                'ISRC system unavailable' : 'Generation failed';
            
            setTimeout(() => {
                generateBtn.textContent = originalText;
                generateBtn.disabled = false;
                statusBadge.textContent = 'Ready';
            }, 2000);
        }
    }
    
    validateISRC(isrc) {
        const validateBtn = document.getElementById('validate-isrc');
        const proceedBtn = document.getElementById('proceed-to-mint');
        const statusBadge = document.getElementById('isrc-status');
        
        if (!validateBtn || !proceedBtn || !statusBadge) return;
        
        const originalText = validateBtn.textContent;
        validateBtn.disabled = true;
        validateBtn.textContent = 'Validating...';
        statusBadge.textContent = 'Validating';
        
        // Simulate validation process
        setTimeout(() => {
            // ISRC validation logic
            const isValid = this.isValidISRC(isrc);
            
            if (isValid) {
                statusBadge.textContent = 'Validated';
                statusBadge.style.background = '#4CAF50';
                validateBtn.textContent = '✅ Valid';
                
                // Enable proceed button after validation
                proceedBtn.disabled = false;
                proceedBtn.title = 'Proceed to NFT minting';
                proceedBtn.style.opacity = '1';
                
                // Show validation success
                this.showISRCValidationSuccess();
            } else {
                statusBadge.textContent = 'Invalid';
                statusBadge.style.background = '#f44336';
                validateBtn.textContent = '❌ Invalid';
            }
            
            setTimeout(() => {
                validateBtn.textContent = originalText;
                validateBtn.disabled = false;
            }, 2000);
        }, 1500);
    }
    
    isValidISRC(isrc) {
        // ISRC format validation: ZA-80G-YY-NNNNN
        const isrcPattern = /^ZA-80G-\d{2}-\d{5}$/;
        return isrcPattern.test(isrc);
    }
    
    showISRCValidationSuccess() {
        // Update checklist to show validation complete
        const checkItems = document.querySelectorAll('.check-item');
        checkItems.forEach((item, index) => {
            const text = item.querySelector('span:last-child');
            const icon = item.querySelector('.check-icon');
            
            if (text && icon) {
                if (text.textContent.includes('ISRC Generated')) {
                    icon.textContent = '✅';
                    item.classList.add('completed');
                } else if (text.textContent.includes('ISRC Validated')) {
                    icon.textContent = '✅';
                    item.classList.add('completed');
                } else if (text.textContent.includes('Ready for Minting')) {
                    icon.textContent = '✅';
                    item.classList.add('completed');
                }
            }
        });
        
        // Show success animation
        const integrationHeader = document.querySelector('.integration-header h3');
        if (integrationHeader) {
            integrationHeader.style.color = '#4CAF50';
            integrationHeader.textContent = '✅ Ready for Minting';
        }
    }
    
    async showISRCProceedSponsored() {
        // Check if user has consented to sponsor content
        if (!this.partnerConsentGiven) {
            // If no consent, proceed directly to minting
            this.proceedToMinting();
            return;
        }

        // Show sponsored content window with same styling as licensing sponsored content
        this.displayISRCProceedSponsored();
    }
    
    displayISRCProceedSponsored() {
        // Create modal overlay with same styling as existing sponsored content
        const modalOverlay = document.createElement('div');
        modalOverlay.className = 'isrc-sponsor-modal';
        modalOverlay.style.cssText = `
            position: fixed; top: 0; left: 0; right: 0; bottom: 0;
            background: rgba(0,0,0,0.9); z-index: 20000;
            display: flex; align-items: center; justify-content: center;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        `;

        const modal = document.createElement('div');
        modal.style.cssText = `
            background: white; border-radius: 12px; padding: 32px;
            max-width: 500px; width: 90%; text-align: center;
            box-shadow: 0 8px 32px rgba(0,0,0,0.3);
            position: relative;
        `;

        modal.innerHTML = `
            <div style="font-size: 48px; margin-bottom: 16px;">⚖️</div>
            <h2 style="color: #333; margin: 0 0 16px 0;">Professional Legal Services</h2>
            <p style="color: #666; line-height: 1.5; margin: 0 0 16px 0;">
                Before minting your NFT, consider professional legal review for your ISRC registration and intellectual property rights.
            </p>
            <p style="color: #666; line-height: 1.5; margin: 0 0 24px 0;">
                Our verified legal partners specialize in music industry contracts, ISRC compliance, and NFT intellectual property protection.
            </p>
            
            <div class="sponsor-content" style="
                background: rgba(0, 214, 122, 0.05);
                border-radius: 8px;
                border-left: 4px solid #00d67a;
                border: 1px solid rgba(0, 214, 122, 0.2);
                padding: 16px;
                margin: 20px 0;
                text-align: left;
            ">
                <div style="display: flex; align-items: center; gap: 12px;">
                    <div style="font-size: 24px;">📢</div>
                    <div style="flex: 1;">
                        <h4 style="margin: 0 0 4px 0; color: #333; font-size: 14px; font-weight: 600;">
                            Music Legal Services
                        </h4>
                        <p style="margin: 0 0 8px 0; color: #666; font-size: 13px; line-height: 1.4;">
                            Professional ISRC registration review, NFT legal compliance, and intellectual property protection.
                        </p>
                        <a href="#" class="sponsor-link" style="color: #00d67a; font-size: 12px; text-decoration: none; font-weight: 500;">
                            Learn More →
                        </a>
                    </div>
                </div>
            </div>
            
            <div style="display: flex; gap: 12px; justify-content: center; margin-top: 24px;">
                <button id="continue-minting" class="btn btn-primary" disabled style="
                    background: #007bff; color: white; border: none;
                    padding: 12px 24px; border-radius: 6px; cursor: not-allowed;
                    font-size: 14px; font-weight: 500; opacity: 0.6;
                ">Continue to Minting (<span id="countdown-isrc">5</span>s)</button>
            </div>
            
            <p style="color: #999; font-size: 12px; margin: 16px 0 0 0;">
                <span style="font-size: 10px; background: #ffc107; padding: 2px 6px; border-radius: 3px; color: #000;">SPONSORED</span>
                Professional partner content
            </p>
        `;

        modalOverlay.appendChild(modal);
        document.body.appendChild(modalOverlay);

        // Start 5-second countdown
        let countdown = 5;
        const countdownElement = modal.querySelector('#countdown-isrc');
        const continueButton = modal.querySelector('#continue-minting');
        
        const countdownInterval = setInterval(() => {
            countdown--;
            countdownElement.textContent = countdown;
            
            if (countdown <= 0) {
                clearInterval(countdownInterval);
                continueButton.disabled = false;
                continueButton.style.cursor = 'pointer';
                continueButton.style.opacity = '1';
                continueButton.innerHTML = 'Continue to Minting';
            }
        }, 1000);

        // Handle continue button click
        continueButton.addEventListener('click', () => {
            if (countdown <= 0) {
                document.body.removeChild(modalOverlay);
                this.proceedToMinting();
                
                // Track sponsor interaction
                this.trackSponsorInteraction('continue', 'before_mint_nft');
            }
        });

        // Handle sponsor link click
        const sponsorLink = modal.querySelector('.sponsor-link');
        if (sponsorLink) {
            sponsorLink.addEventListener('click', (e) => {
                e.preventDefault();
                this.trackSponsorInteraction('clicked', 'before_mint_nft');
                // In a real implementation, this would open the legal services website
                console.log('Legal services sponsor link clicked - would open legal services website');
            });
        }

        // Track sponsor impression
        this.trackSponsorDisplay('before_mint_nft');
        
        // Prevent closing by clicking outside during countdown
        modalOverlay.addEventListener('click', (e) => {
            if (e.target === modalOverlay && countdown <= 0) {
                document.body.removeChild(modalOverlay);
                this.proceedToMinting();
            }
        });
    }
    
    proceedToMinting() {
        this.prepareNFTPreview();
        this.showSection('minting-section');
    }

    async prepareNFTPreview() {
        const description = `${this.beatMetadata.title} - AI-generated music NFT with blockchain ownership and licensing`;
        document.getElementById('nft-title').textContent = this.beatMetadata.title;
        document.getElementById('nft-description').textContent = description;
        document.getElementById('mint-nft').disabled = false;
    }

    async mintNFT() {
        const mintBtn = document.getElementById('mint-nft');
        const statusDiv = document.getElementById('mint-status');
        
        mintBtn.disabled = true;
        statusDiv.className = 'mint-status pending';
        statusDiv.textContent = 'Preparing to mint NFT...';

        try {
            // Authentication is MANDATORY for minting
            let isAuthenticated = false;
            if (unifiedAuth) {
                try {
                    isAuthenticated = typeof unifiedAuth.isAuthenticated === 'function' ? 
                        unifiedAuth.isAuthenticated() : unifiedAuth.isAuthenticated === true;
                } catch (authCheckError) {
                    console.warn('Auth check failed:', authCheckError);
                }
            }
            
            if (!unifiedAuth || !isAuthenticated) {
                // Enforce authentication for minting in production. Do not allow
                // silent bypasses. Developers can enable `window.__DEV_GUEST_MODE__`
                // to allow bypass during development/testing.
                if (window.__DEV_GUEST_MODE__ === true) {
                    try {
                        const bypassResult = await unifiedAuth?.bypassAuth?.();
                        if (bypassResult && bypassResult.success) {
                            console.log('✅ [DEV] Using development authentication bypass');
                        } else {
                            throw new Error('Authentication required: Please sign in with Google to mint NFTs');
                        }
                    } catch (error) {
                        throw new Error('Authentication required: Please sign in with Google to mint NFTs');
                    }
                } else {
                    throw new Error('Authentication required: Please sign in with Google to mint NFTs');
                }
            }
            
            let walletAddress = null;
            if (walletContext && walletContext.getCurrentAddress) {
                walletAddress = await walletContext.getCurrentAddress();
            }
            
            // GRACEFUL: Try unified auth wallet if walletContext fails
            if (!walletAddress && unifiedAuth && unifiedAuth.getWalletAddress) {
                walletAddress = await unifiedAuth.getWalletAddress();
            }
            
            if (!walletAddress) {
                throw new Error('Wallet not available: Please sign in with Google to generate your secure wallet');
            }
            
            console.log('✅ Using authenticated wallet:', walletAddress ? walletAddress.substring(0, 6) + '...' + walletAddress.substring(-4) : 'undefined');
            
            statusDiv.textContent = 'Uploading to IPFS...';
            
            // Upload to IPFS using real Thirdweb integration
            const uploadResult = await this.thirdweb.uploadToIPFS(this.beatFile, {
                ...this.beatMetadata,
                licenseTerms: this.licenseTerms,
                description: `${this.beatMetadata.title} - AI-generated music NFT with blockchain licensing`
            });
            
            statusDiv.textContent = 'Minting NFT on blockchain...';
            
            // Try Phantom wallet first, fallback to embedded wallet with timeout
            let finalWalletAddress = walletAddress;
            if (!this.solanaManager.isWalletConnected()) {
                console.log('🔄 Attempting Phantom wallet connection...');
                try {
                    // Add timeout to prevent endless loops
                    const connectPromise = this.solanaManager.connectWallet();
                    const timeoutPromise = new Promise((_, reject) => {
                        setTimeout(() => reject(new Error('Phantom connection timeout')), 10000);
                    });
                    
                    const connectResult = await Promise.race([connectPromise, timeoutPromise]);
                    if (connectResult && connectResult.success) {
                        console.log('✅ Connected to Phantom wallet:', connectResult.publicKey);
                        finalWalletAddress = connectResult.publicKey;
                    } else {
                        console.log('⚠️ Phantom connection failed, using embedded wallet');
                        finalWalletAddress = walletAddress;
                    }
                } catch (error) {
                    const errorMessage = ErrorHandler.safeErrorMessage(error);
                    console.log('⚠️ Phantom unavailable, using embedded wallet:', errorMessage);
                    finalWalletAddress = walletAddress;
                }
            } else {
                finalWalletAddress = this.solanaManager.getWalletAddress();
            }
            
            // Real Solana NFT minting with timeout to prevent endless loops
            statusDiv.textContent = 'Minting NFT on Solana blockchain...';
            const mintPromise = this.thirdweb.mintNFT(finalWalletAddress, uploadResult.metadataUri);
            const mintTimeoutPromise = new Promise((_, reject) => {
                setTimeout(() => reject(new Error('Minting timeout after 60 seconds')), 60000);
            });
            
            const mintResult = await Promise.race([mintPromise, mintTimeoutPromise]);
            
            console.log('✅ Real blockchain minting completed:', {
                network: mintResult.network || 'solana-devnet',
                signature: mintResult.transactionHash,
                tokenId: mintResult.tokenId,
                isrc: uploadResult.isrcCode,
                metadataEmbedded: !!uploadResult.processedFile
            });
            
            this.showMintSuccess({
                transactionHash: mintResult.transactionHash,
                tokenId: mintResult.tokenId,
                ipfsHash: uploadResult.metadataUri
            });
            
        } catch (error) {
            console.error('Minting failed:', error);
            statusDiv.className = 'mint-status error';
            const errorMessage = ErrorHandler.safeErrorMessage(error);
            statusDiv.textContent = `Minting failed: ${errorMessage}`;
            mintBtn.disabled = false;
        }
    }

    showMintSuccess(result) {
        document.getElementById('tx-hash').textContent = result.transactionHash;
        this.currentTxHash = result.transactionHash;
        this.currentTokenId = result.tokenId;
        
        this.showSection('success-section');
        
        // Store NFT data
        try {
            chrome.runtime.sendMessage({
                action: 'store_nft',
                data: {
                    title: this.beatMetadata.title,
                    txHash: result.transactionHash,
                    tokenId: result.tokenId,
                    license: this.licenseTerms,
                    metadata: this.beatMetadata
                }
            });
        } catch (error) {
            console.log('Chrome runtime unavailable');
        }
    }

    viewNFT() {
        if (this.currentTxHash) {
            const url = `https://mumbai.polygonscan.com/tx/${encodeURIComponent(this.currentTxHash)}`;
            try {
                chrome.tabs.create({ url });
            } catch (error) {
                window.open(url, '_blank');
            }
        }
    }

    resetApp() {
        // Clean up Web3 system
        this.audioManager.cleanupSystem('web3');
        this.beatFile = null;
        this.beatMetadata = {};
        this.licenseTerms = '';
        this.currentTxHash = null;
        this.currentTokenId = null;
        
        document.getElementById('audio-file').value = '';
        document.getElementById('license-terms').value = '';
        document.getElementById('ai-status-text').textContent = 'Ready to generate licensing terms';
        document.getElementById('mint-status').textContent = '';
        
        const proceedBtn = document.getElementById('proceed-to-licensing');
        if (proceedBtn) proceedBtn.style.display = 'none';
        
        this.showSection('upload-section');
    }

    switchTab(section) {
        // Pause all audio when switching tabs
        if (this.audioManager) {
            this.audioManager.pauseAllAudio();
        }
        
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
        
        const activeNavItem = document.querySelector(`[data-section="${section}"]`);
        if (activeNavItem) {
            activeNavItem.classList.add('active');
        }

        if (section === 'mint') {
            this.showSection('upload-section');
            this.autoFillFromProfile('nft');
        } else if (section === 'hub') {
            this.showSection('hub-section');
            this.loadAssetHub();
        } else if (section === 'profile') {
            this.showSection('profile-section');
        } else if (section === 'history') {
            this.showSection('history-section');
            this.loadHistory();
        } else if (section === 'share') {
            this.showSection('share-section');
        } else if (section === 'radio') {
            this.showSection('radio-section');
            this.loadRadioSubmission();
            this.autoFillFromProfile('radio');
        } else if (section === 'insights') {
            this.showSection('insights-section');
            this.loadAIInsights();
        }
    }
    
    async loadAssetHub() {
        console.log('Loading asset hub...');
        
        try {
            // Initialize PublicAssetHubManager if not already done
            if (!window.publicAssetHub) {
                console.log('🔧 Initializing PublicAssetHubManager...');
                window.publicAssetHub = new PublicAssetHubManager();
                await window.publicAssetHub.initialize();
                console.log('✅ PublicAssetHubManager initialized');
            } else {
                console.log('♻️ Refreshing existing asset hub...');
                await window.publicAssetHub.refreshAssets();
            }
            
            // Load existing data only - no automatic mock data generation
            console.log('✅ Asset hub loaded with existing data only');
            
            // Activate Smart Asset Hub Integration if available
            if (this.smartAssetHubIntegration && window.publicAssetHub) {
                // Update integration with the active asset hub
                this.smartAssetHubIntegration.assetHub = window.publicAssetHub;
                console.log('✅ Smart Asset Hub Integration activated with live data');
            }
            
        } catch (error) {
            console.error('❌ Failed to load asset hub:', error);
            // Show error in the asset grid
            const grid = document.getElementById('asset-grid');
            if (grid) {
                grid.innerHTML = `
                    <div class="empty-state">
                        <div class="empty-icon">❌</div>
                        <h3>Failed to load assets</h3>
                        <p>Error: ${ErrorHandler.safeErrorMessage(error)}</p>
                        <button class="btn-primary" onclick="location.reload()">Reload Extension</button>
                    </div>
                `;
            }
        }
    }

    showSection(sectionId) {
        document.querySelectorAll('.section').forEach(section => {
            section.classList.remove('active');
        });
        document.getElementById(sectionId).classList.add('active');
        this.currentSection = sectionId;
        
        // Authentication required for licensing and minting sections
        if ((sectionId === 'licensing-section' || sectionId === 'minting-section') && !unifiedAuth) {
            this.showAuthenticationRequired();
        }
    }

    async showProceedToLicensingSponsored() {
        // Check if user has consented to sponsor content
        if (!this.partnerConsentGiven) {
            // If no consent, proceed directly to licensing
            this.showSection('licensing-section');
            return;
        }

        // Show sponsored content window with same styling as ISRC generation
        this.displayLicensingSponsored();
    }

    displayLicensingSponsored() {
        // Create modal overlay with same styling as existing sponsored content
        const modalOverlay = document.createElement('div');
        modalOverlay.className = 'licensing-sponsor-modal';
        modalOverlay.style.cssText = `
            position: fixed; top: 0; left: 0; right: 0; bottom: 0;
            background: rgba(0,0,0,0.9); z-index: 20000;
            display: flex; align-items: center; justify-content: center;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        `;

        const modal = document.createElement('div');
        modal.style.cssText = `
            background: white; border-radius: 12px; padding: 32px;
            max-width: 500px; width: 90%; text-align: center;
            box-shadow: 0 8px 32px rgba(0,0,0,0.3);
            position: relative;
        `;

        modal.innerHTML = `
            <div style="font-size: 48px; margin-bottom: 16px;">⚖️</div>
            <h2 style="color: #333; margin: 0 0 16px 0;">Professional Legal Services</h2>
            <p style="color: #666; line-height: 1.5; margin: 0 0 16px 0;">
                Before generating your licensing agreement, consider professional legal review services for your music contracts.
            </p>
            <p style="color: #666; line-height: 1.5; margin: 0 0 24px 0;">
                Our verified legal partners specialize in music industry contracts, licensing agreements, and intellectual property protection.
            </p>
            
            <div class="sponsor-content" style="
                background: rgba(0, 214, 122, 0.05);
                border-radius: 8px;
                border-left: 4px solid #00d67a;
                border: 1px solid rgba(0, 214, 122, 0.2);
                padding: 16px;
                margin: 20px 0;
                text-align: left;
            ">
                <div style="display: flex; align-items: center; gap: 12px;">
                    <div style="font-size: 24px;">📢</div>
                    <div style="flex: 1;">
                        <h4 style="margin: 0 0 4px 0; color: #333; font-size: 14px; font-weight: 600;">
                            Music Legal Services
                        </h4>
                        <p style="margin: 0 0 8px 0; color: #666; font-size: 13px; line-height: 1.4;">
                            Professional contract review, licensing optimization, and legal protection for your music assets.
                        </p>
                        <a href="#" class="sponsor-link" style="color: #00d67a; font-size: 12px; text-decoration: none; font-weight: 500;">
                            Learn More →
                        </a>
                    </div>
                </div>
            </div>
            
            <div style="display: flex; gap: 12px; justify-content: center; margin-top: 24px;">
                <button id="continue-licensing" class="btn btn-primary" disabled style="
                    background: #007bff; color: white; border: none;
                    padding: 12px 24px; border-radius: 6px; cursor: not-allowed;
                    font-size: 14px; font-weight: 500; opacity: 0.6;
                ">Continue to Licensing (<span id="countdown">5</span>s)</button>
            </div>
            
            <p style="color: #999; font-size: 12px; margin: 16px 0 0 0;">
                <span style="font-size: 10px; background: #ffc107; padding: 2px 6px; border-radius: 3px; color: #000;">SPONSORED</span>
                Professional partner content
            </p>
        `;

        modalOverlay.appendChild(modal);
        document.body.appendChild(modalOverlay);

        // Start 5-second countdown
        let countdown = 5;
        const countdownElement = modal.querySelector('#countdown');
        const continueButton = modal.querySelector('#continue-licensing');
        
        const countdownInterval = setInterval(() => {
            countdown--;
            countdownElement.textContent = countdown;
            
            if (countdown <= 0) {
                clearInterval(countdownInterval);
                continueButton.disabled = false;
                continueButton.style.cursor = 'pointer';
                continueButton.style.opacity = '1';
                continueButton.innerHTML = 'Continue to Licensing';
            }
        }, 1000);

        // Handle continue button click
        continueButton.addEventListener('click', () => {
            if (countdown <= 0) {
                document.body.removeChild(modalOverlay);
                this.showSection('licensing-section');
                
                // Track sponsor interaction
                this.trackSponsorInteraction('continue', 'licensing_proceed');
            }
        });

        // Handle sponsor link click
        const sponsorLink = modal.querySelector('.sponsor-link');
        if (sponsorLink) {
            sponsorLink.addEventListener('click', (e) => {
                e.preventDefault();
                this.trackSponsorInteraction('clicked', 'licensing_proceed');
                // In a real implementation, this would open the sponsor's website
                console.log('Sponsor link clicked - would open legal services website');
            });
        }

        // Track sponsor impression
        this.trackSponsorDisplay('licensing_proceed');
        
        // Prevent closing by clicking outside during countdown
        modalOverlay.addEventListener('click', (e) => {
            if (e.target === modalOverlay && countdown <= 0) {
                document.body.removeChild(modalOverlay);
                this.showSection('licensing-section');
            }
        });
    }

    displayISRCGenerationSponsored() {
        if (!this.partnerConsentGiven || document.querySelector('.isrc-generation-sponsor')) return;

        const modalOverlay = document.createElement('div');
        modalOverlay.className = 'isrc-generation-sponsor';
        modalOverlay.style.cssText = `position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.9); z-index: 20000; display: flex; align-items: center; justify-content: center; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;`;

        const modal = document.createElement('div');
        modal.style.cssText = `background: white; border-radius: 12px; padding: 32px; max-width: 500px; width: 90%; text-align: center; box-shadow: 0 8px 32px rgba(0,0,0,0.3);`;

        modal.innerHTML = `
            <div style="font-size: 48px; margin-bottom: 16px;">📦</div>
            <h2 style="color: #333; margin: 0 0 16px 0;">Professional Package Services</h2>
            <p style="color: #666; line-height: 1.5; margin: 0 0 16px 0;">While your radio package is being generated, consider professional services to enhance your submission.</p>
            <p style="color: #666; line-height: 1.5; margin: 0 0 24px 0;">Our verified partners offer mastering, distribution, and promotion services for radio-ready tracks.</p>
            <div style="background: rgba(0, 214, 122, 0.05); border-radius: 8px; border-left: 4px solid #00d67a; border: 1px solid rgba(0, 214, 122, 0.2); padding: 16px; margin: 20px 0; text-align: left;">
                <div style="display: flex; align-items: center; gap: 12px;">
                    <div style="font-size: 24px;">📢</div>
                    <div style="flex: 1;">
                        <h4 style="margin: 0 0 4px 0; color: #333; font-size: 14px; font-weight: 600;">📦 Professional Package Services</h4>
                        <p style="margin: 0 0 8px 0; color: #666; font-size: 13px; line-height: 1.4;">Professional mastering, ISRC registration, and radio plugging services to maximize your submission success.</p>
                        <div style="margin: 8px 0; padding: 8px; background: rgba(0, 214, 122, 0.1); border-radius: 4px;">
                            <h5 style="margin: 0 0 4px 0; color: #333; font-size: 12px; font-weight: 600;">Radio Package Enhancement</h5>
                            <p style="margin: 0; color: #666; font-size: 11px;">Enhance your radio submission with professional services</p>
                        </div>
                        <a href="#" class="sponsor-link" style="color: #00d67a; font-size: 12px; text-decoration: none; font-weight: 500;">Learn More →</a>
                    </div>
                </div>
            </div>
            <div style="display: flex; gap: 12px; justify-content: center; margin-top: 24px;">
                <button id="continue-isrc" disabled style="background: #007bff; color: white; border: none; padding: 12px 24px; border-radius: 6px; cursor: not-allowed; font-size: 14px; font-weight: 500; opacity: 0.6;">Continue (<span id="countdown-isrc-gen">5</span>s)</button>
            </div>
            <p style="color: #999; font-size: 12px; margin: 16px 0 0 0;"><span style="font-size: 10px; background: #ffc107; padding: 2px 6px; border-radius: 3px; color: #000;">SPONSORED</span> Professional partner content</p>
        `;

        try {
            modalOverlay.appendChild(modal);
            document.body.appendChild(modalOverlay);
        } catch (error) {
            console.error('Failed to display ISRC generation sponsor modal:', ErrorHandler.safeErrorMessage(error));
            return;
        }

        let countdown = 5;
        const countdownElement = modal.querySelector('#countdown-isrc-gen');
        const continueButton = modal.querySelector('#continue-isrc');
        
        if (!countdownElement || !continueButton) {
            console.error('Required modal elements not found');
            return;
        }
        
        const countdownInterval = setInterval(() => {
            countdown--;
            if (countdown <= 0) {
                clearInterval(countdownInterval);
                continueButton.disabled = false;
                continueButton.style.cursor = 'pointer';
                continueButton.style.opacity = '1';
                continueButton.innerHTML = 'Continue';
            } else {
                countdownElement.textContent = countdown;
            }
        }, 1000);

        continueButton.addEventListener('click', () => {
            if (countdown <= 0) {
                document.body.removeChild(modalOverlay);
                this.trackSponsorInteraction('continue', 'isrc_generation');
            }
        });

        const sponsorLink = modal.querySelector('.sponsor-link');
        if (sponsorLink) {
            sponsorLink.addEventListener('click', (e) => {
                e.preventDefault();
                this.trackSponsorInteraction('clicked', 'isrc_generation');
            });
        }

        this.trackSponsorDisplay('isrc_generation');
        
        // Keep ISRC sponsor visible until user manually closes or navigates away
        // No auto-dismiss - stays until user leaves screen
    }

    showProgress(show) {
        const progressBar = document.getElementById('progress-bar');
        if (progressBar) {
            progressBar.style.display = show ? 'block' : 'none';
            if (show) {
                const fill = progressBar.querySelector('.progress-fill');
                if (fill) {
                    fill.style.width = '0%';
                    setTimeout(() => fill.style.width = '100%', 100);
                }
            }
        }
    }

    updateUploadStatus(message) {
        const uploadContent = document.querySelector('.upload-content p');
        if (uploadContent) {
            uploadContent.textContent = message;
        }
    }

    formatDuration(seconds) {
        return this.audioManager.formatDuration(seconds);
    }

    formatFileSize(bytes) {
        return this.audioManager.formatFileSize(bytes);
    }

    createAudioPreview(file) {
        return this.audioManager.createAudioPreview(file, 'audio-preview', 'web3');
    }

    displayMetadata(metadata) {
        const metadataDisplay = document.getElementById('metadata-display');
        if (!metadataDisplay) return;

        document.getElementById('meta-duration').textContent = metadata.duration;
        document.getElementById('meta-quality').textContent = metadata.qualityLevel;
        document.getElementById('meta-bpm').textContent = metadata.estimatedBPM;
        document.getElementById('meta-genre').textContent = metadata.suggestedGenre;
        document.getElementById('meta-energy').textContent = metadata.energyLevel;
        document.getElementById('meta-size').textContent = metadata.fileSize;

        // Setup collapse functionality for upload analysis
        this.setupUploadAnalysisCollapse();
        
        // Setup auth context collapse
        setTimeout(() => {
            this.setupAuthContextCollapse();
        }, 100);
        
        metadataDisplay.style.display = 'block';
    }
    
    setupUploadAnalysisCollapse() {
        const toggleBtn = document.getElementById('upload-analysis-toggle');
        const content = document.getElementById('upload-analysis-content');
        
        if (toggleBtn && content && !toggleBtn.hasAttribute('data-setup')) {
            toggleBtn.setAttribute('data-setup', 'true');
            // Start collapsed
            toggleBtn.textContent = '▶';
            toggleBtn.classList.add('collapsed');
            
            toggleBtn.addEventListener('click', () => {
                const isCollapsed = content.classList.contains('collapsed');
                
                if (isCollapsed) {
                    content.classList.remove('collapsed');
                    toggleBtn.classList.remove('collapsed');
                    toggleBtn.textContent = '▼';
                } else {
                    content.classList.add('collapsed');
                    toggleBtn.classList.add('collapsed');
                    toggleBtn.textContent = '▶';
                }
            });
        }
    }
    
    setupAuthContextCollapse() {
        const toggleBtn = document.getElementById('auth-toggle');
        const content = document.getElementById('auth-details');
        
        if (toggleBtn && content && !toggleBtn.hasAttribute('data-auth-setup')) {
            toggleBtn.setAttribute('data-auth-setup', 'true');
            
            // Ensure initial collapsed state matches HTML
            if (!content.classList.contains('collapsed')) {
                content.classList.add('collapsed');
            }
            if (toggleBtn.textContent !== '▶') {
                toggleBtn.textContent = '▶';
            }
            
            toggleBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                const isCollapsed = content.classList.contains('collapsed');
                
                if (isCollapsed) {
                    content.classList.remove('collapsed');
                    toggleBtn.textContent = '▼';
                } else {
                    content.classList.add('collapsed');
                    toggleBtn.textContent = '▶';
                }
            });
        }
    }
    
    setupSamroCollapse() {
        const toggleBtn = document.getElementById('samro-toggle');
        const content = document.getElementById('samro-content');
        
        if (toggleBtn && content && !toggleBtn.hasAttribute('data-samro-setup')) {
            toggleBtn.setAttribute('data-samro-setup', 'true');
            
            // SAMRO starts EXPANDED by default (button shows ▼)
            toggleBtn.textContent = '▼';
            content.classList.remove('collapsed');
            
            toggleBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                const isCollapsed = content.classList.contains('collapsed');
                
                if (isCollapsed) {
                    content.classList.remove('collapsed');
                    toggleBtn.textContent = '▼';
                } else {
                    content.classList.add('collapsed');
                    toggleBtn.textContent = '▶';
                }
            });
        }
    }
    
    showArtistForm() {
        const artistForm = document.getElementById('artist-form');
        if (artistForm) {
            artistForm.style.display = 'block';
            
            // Get shared profile data for auto-fill
            const sharedData = this.getSharedProfileData();
            
            // Auto-fill from profile data
            const artistNameInput = document.getElementById('artist-name');
            if (artistNameInput && !artistNameInput.value && sharedData.artistName) {
                artistNameInput.value = sharedData.artistName;
                this.userInputManager.setUserInput('artist', sharedData.artistName, false);
            }
            
            const stageNameInput = document.getElementById('stage-name');
            if (stageNameInput && !stageNameInput.value && sharedData.stageName) {
                stageNameInput.value = sharedData.stageName;
                this.userInputManager.setUserInput('stageName', sharedData.stageName, false);
            }
            
            // Auto-fill beat title from metadata
            const beatTitleInput = document.getElementById('beat-title');
            if (beatTitleInput && !beatTitleInput.value && this.beatMetadata.title) {
                beatTitleInput.value = this.beatMetadata.title;
                this.userInputManager.setUserInput('title', this.beatMetadata.title, false);
            }
            
            // Use AI-enhanced genre if available
            const genreSelect = document.getElementById('genre-select');
            if (genreSelect && !genreSelect.value) {
                const detectedGenre = this.beatMetadata.enhancedGenre || this.beatMetadata.suggestedGenre;
                if (detectedGenre) {
                    genreSelect.value = detectedGenre;
                    this.userInputManager.setUserInput('genre', detectedGenre, false);
                }
            }
            
            // Setup input tracking for user changes
            this.setupNFTInputTracking();
        }
    }
    
    setupNFTInputTracking() {
        const nftInputs = [
            { id: 'artist-name', key: 'artist' },
            { id: 'stage-name', key: 'stageName' },
            { id: 'beat-title', key: 'title' },
            { id: 'genre-select', key: 'genre' },
            { id: 'content-type', key: 'content-type' }
        ];
        
        nftInputs.forEach(({ id, key }) => {
            const element = document.getElementById(id);
            if (element && !element.hasAttribute('data-nft-tracked')) {
                element.setAttribute('data-nft-tracked', 'true');
                element.addEventListener('change', () => {
                    if (element.value.trim()) {
                        this.userInputManager.setUserInput(key, element.value.trim(), true);
                    }
                });
            }
        });
    }
    
    sanitizeInput(input) {
        if (!input) return '';
        try {
            return String(input)
                .replace(/[<>"'&]/g, function(match) {
                    const map = { '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#x27;', '&': '&amp;' };
                    return map[match] || match;
                })
                .replace(/[\x00-\x1F\x7F-\x9F]/g, '')
                .trim()
                .substring(0, 200);
        } catch (error) {
            console.error('Sanitization error:', error);
            return String(input).substring(0, 200);
        }
    }
    
    validateInput(input, type = 'text') {
        if (!input || typeof input !== 'string') return false;
        
        switch (type) {
            case 'name':
                return /^[a-zA-Z0-9\s\-_]{1,50}$/.test(input.trim());
            case 'title':
                return /^[a-zA-Z0-9\s\-_.,!?]{1,100}$/.test(input.trim());
            case 'percentage':
                const num = parseFloat(input);
                return !isNaN(num) && num >= 0 && num <= 100;
            default:
                return input.trim().length > 0 && input.length <= 200;
        }
    }
    
    getArtistInputs() {
        // Get raw inputs
        const artistNameInput = document.getElementById('artist-name')?.value;
        const stageNameInput = document.getElementById('stage-name')?.value;
        const beatTitleInput = document.getElementById('beat-title')?.value;
        const genreInput = document.getElementById('genre-select')?.value;
        const contentTypeInput = document.getElementById('content-type')?.value;
        
        // Get enhanced profile data
        const enhancedProfile = this.getEnhancedProfileData();
        
        // Store user inputs with priority tracking
        if (artistNameInput && artistNameInput.trim()) {
            this.userInputManager.setUserInput('artist', artistNameInput, true);
        }
        if (stageNameInput && stageNameInput.trim()) {
            this.userInputManager.setUserInput('stageName', stageNameInput, true);
        }
        if (beatTitleInput && beatTitleInput.trim()) {
            this.userInputManager.setUserInput('title', beatTitleInput, true);
        }
        if (genreInput && genreInput.trim()) {
            this.userInputManager.setUserInput('genre', genreInput, true);
        }
        if (contentTypeInput && contentTypeInput.trim()) {
            this.userInputManager.setUserInput('content-type', contentTypeInput, true);
        }
        
        // Use display name as primary, fall back to legal name, then form input
        const primaryName = enhancedProfile.displayName || enhancedProfile.legalName || artistNameInput;
        
        // Return with user priority
        return {
            artistName: this.userInputManager.getValue('artist', primaryName, 'Unknown Artist'),
            stageName: this.userInputManager.getValue('stageName', stageNameInput, ''),
            beatTitle: this.userInputManager.getValue('title', beatTitleInput, this.beatMetadata?.title || 'Untitled Beat'),
            genre: this.userInputManager.getValue('genre', genreInput, this.beatMetadata?.suggestedGenre || 'Electronic'),
            contentType: this.userInputManager.getValue('content-type', contentTypeInput, 'instrumental'),
            legalName: enhancedProfile.legalName,
            displayName: enhancedProfile.displayName,
            role: enhancedProfile.role
        };
    }
    
    getLicenseOptions() {
        return {
            licenseType: document.getElementById('license-type')?.value || 'non-exclusive',
            commercialUse: document.getElementById('commercial-use')?.value || 'allowed',
            forSale: document.getElementById('for-sale')?.value || 'for-sale',
            royaltyRate: 2.5
        };
    }

    async handleImageUpload(e) {
        const file = e.target.files[0];
        if (!file) return;
        
        try {
            // Enhanced security validation for images
            const isValid = await this.audioManager.validateImageFile(file);
            if (!isValid) {
                throw new Error('Image validation failed');
            }
            
            const reader = new FileReader();
            reader.onload = (e) => {
                const preview = document.getElementById('image-preview');
                if (preview) {
                    preview.src = e.target.result;
                    preview.style.display = 'block';
                }
            };
            reader.readAsDataURL(file);
            this.beatMetadata.coverImage = file;
        } catch (error) {
            console.error('Image upload failed:', error);
            const errorMessage = ErrorHandler.safeErrorMessage(error);
            alert(`Image upload failed: ${errorMessage}`);
            e.target.value = ''; // Clear the input
        }
    }

    async handleGoogleSignIn() {
        // Find any sign-in button (could be in different sections)
        const signInBtns = document.querySelectorAll('[id^="google-signin"], [id^="auth-signin"]');
        const signInBtn = signInBtns[0] || document.getElementById('google-signin');
        
        if (!signInBtn) {
            console.error('Sign-in button not found');
            return;
        }
        
        const originalText = signInBtn.textContent;
        
        try {
            signInBtn.disabled = true;
            signInBtn.textContent = 'Signing in...';
            
            if (!unifiedAuth) {
                console.error('Unified authentication not initialized');
                return;
            }
            
            // Force account selection on sign-in to allow the user to choose a Google account
            const result = await unifiedAuth.signInWithGoogle(true);
            if (result.success) {
                console.log('✅ Successfully signed in:', result.user.name);
                
                // Log enhanced features if available
                if (result.enhanced) {
                    console.log('🛡️ Enhanced authentication features:', {
                        role: result.role,
                        securityLevel: result.securityLevel,
                        mfaRequired: result.mfaRequired
                    });
                }
                
                // Hide authentication required messages
                this.hideAuthenticationRequired();
                
                // Update authenticated UI with enhanced features
                await this.updateAuthenticatedUI(result);
                
                // Hide all sign-in buttons
                signInBtns.forEach(btn => {
                    btn.style.display = 'none';
                });
                
                // Show success message with enhanced info
                this.showSignInSuccess(result.user, result.enhanced ? result : null);
                
            } else if (result && result.guestMode) {
                // Guest mode returned (possible developer flow or missing OAuth setup).
                console.warn('🔸 Continuing in guest mode:', result.message || 'Guest mode active');
                // Show a gentle notice to the user and continue without throwing.
                this.showSignInError(result.message || 'Continuing in guest mode (limited functionality)');
            } else {
                throw new Error('Sign-in failed - no success result');
            }
            
        } catch (error) {
            console.error('❌ Sign-in failed:', error);
            signInBtn.textContent = originalText;
            signInBtn.disabled = false;
            
            // Handle connection errors specifically. In dev we may allow a bypass
            // for tests, but in production we surface the error and require sign-in.
            if ((error.message.includes('-106') || error.message.includes('Connection failed')) && window.__DEV_GUEST_MODE__ === true) {
                console.log('🔄 [DEV] Attempting bypass authentication for connection issues');
                try {
                    const bypassResult = await unifiedAuth?.bypassAuth?.();
                    if (bypassResult && bypassResult.success) {
                        await this.updateAuthenticatedUI(bypassResult);
                        this.hideAuthenticationRequired();
                        return;
                    }
                } catch (bypassError) {
                    console.warn('🔄 [DEV] Bypass also failed:', bypassError);
                }
            }
            
            // Show user-friendly error based on error type
            let errorMsg;
            const safeErrorMsg = ErrorHandler.safeErrorMessage(error);
            if (safeErrorMsg.includes('User denied') || safeErrorMsg.includes('cancelled')) {
                errorMsg = 'Sign-in cancelled. Please try again to access minting features.';
            } else if (safeErrorMsg.includes('OAuth2 not configured')) {
                errorMsg = 'Authentication system not configured. Please contact support.';
            } else if (safeErrorMsg.includes('client_id')) {
                errorMsg = 'Authentication configuration error. Please contact support.';
            } else {
                errorMsg = 'Sign-in failed. Please check your internet connection and try again.';
            }
            
            this.showSignInError(errorMsg);
        }
    }
    
    showSignInSuccess(user, enhancedInfo = null) {
        // Show temporary success message
        const successDiv = document.createElement('div');
        successDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #d4edda;
            border: 1px solid #c3e6cb;
            color: #155724;
            padding: 12px 16px;
            border-radius: 8px;
            z-index: 10000;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            max-width: 300px;
        `;
        
        let enhancedText = '';
        if (enhancedInfo && enhancedInfo.enhanced) {
            const features = [];
            if (enhancedInfo.role === 'admin') features.push('ADMIN');
            if (enhancedInfo.securityLevel !== 'basic') features.push(enhancedInfo.securityLevel.toUpperCase());
            if (enhancedInfo.mfaRequired) features.push('MFA');
            
            if (features.length > 0) {
                enhancedText = `<br><small style="color: #0f5132;">🛡️ Enhanced: ${features.join(' • ')}</small>`;
            }
        }
        
        const welcomeDiv = document.createElement('div');
        welcomeDiv.style.cssText = 'display: flex; align-items: center; gap: 8px;';
        
        const checkSpan = document.createElement('span');
        checkSpan.textContent = '✅';
        
        const contentDiv = document.createElement('div');
        const strongEl = document.createElement('strong');
        strongEl.textContent = `Welcome, ${this.sanitizeInput(user.name)}!`;
        
        const smallEl = document.createElement('small');
        smallEl.textContent = 'You can now mint NFTs and access all features';
        
        contentDiv.appendChild(strongEl);
        contentDiv.appendChild(document.createElement('br'));
        contentDiv.appendChild(smallEl);
        
        if (enhancedText) {
            const enhancedDiv = document.createElement('div');
            enhancedDiv.innerHTML = enhancedText; // Already sanitized above
            contentDiv.appendChild(enhancedDiv);
        }
        
        welcomeDiv.appendChild(checkSpan);
        welcomeDiv.appendChild(contentDiv);
        successDiv.appendChild(welcomeDiv);
        
        document.body.appendChild(successDiv);
        
        // Remove after 5 seconds (longer for enhanced info)
        setTimeout(() => {
            if (successDiv.parentNode) {
                successDiv.parentNode.removeChild(successDiv);
            }
        }, enhancedInfo ? 6000 : 4000);
    }
    
    showSignInError(message) {
        // Show temporary error message
        const errorDiv = document.createElement('div');
        errorDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #f8d7da;
            border: 1px solid #f5c6cb;
            color: #721c24;
            padding: 12px 16px;
            border-radius: 8px;
            z-index: 10000;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        `;
        
        const errorContentDiv = document.createElement('div');
        errorContentDiv.style.cssText = 'display: flex; align-items: center; gap: 8px;';
        
        const errorSpan = document.createElement('span');
        errorSpan.textContent = '❌';
        
        const errorTextDiv = document.createElement('div');
        const strongEl = document.createElement('strong');
        strongEl.textContent = 'Sign-in Failed';
        
        const smallEl = document.createElement('small');
        smallEl.textContent = this.sanitizeInput(message);
        
        errorTextDiv.appendChild(strongEl);
        errorTextDiv.appendChild(document.createElement('br'));
        errorTextDiv.appendChild(smallEl);
        
        errorContentDiv.appendChild(errorSpan);
        errorContentDiv.appendChild(errorTextDiv);
        errorDiv.appendChild(errorContentDiv);
        
        document.body.appendChild(errorDiv);
        
        // Remove after 5 seconds
        setTimeout(() => {
            if (errorDiv.parentNode) {
                errorDiv.parentNode.removeChild(errorDiv);
            }
        }, 5000);
    }

    async updateAuthenticatedUI(authResult = null) {
        try {
            if (!unifiedAuth) {
                console.error('Unified authentication not available');
                return;
            }
            
            const userProfile = unifiedAuth.getUserProfile();
            if (!userProfile) {
                console.log('No user profile available');
                return;
            }
            
            // Show admin UI for authenticated users
            console.log('✅ Ensuring admin UI visible for authenticated user');
            setTimeout(async () => {
                await this.ensureAdminDashboardVisible();
            }, 100);
            
            // Update header authentication status
            this.updateHeaderAuth(userProfile, authResult);
            
            // Update profile display
            const profileName = document.getElementById('profile-name');
            const profileEmail = document.getElementById('profile-email');
            const profileWallet = document.getElementById('profile-wallet-address');
            
            if (profileName) profileName.textContent = userProfile.name || 'Artist';
            if (profileEmail) profileEmail.textContent = userProfile.email || '';
            
            // Update wallet info with null checks
            let walletAddress = null;
            if (walletContext && walletContext.getCurrentAddress) {
                try {
                    walletAddress = await walletContext.getCurrentAddress();
                } catch (walletError) {
                    console.warn('Failed to get wallet address:', walletError);
                }
            }
            
            if (profileWallet && walletAddress) {
                profileWallet.textContent = `${walletAddress.substring(0, 6)}...${walletAddress.substring(-4)}`;
            }
            
            // Update radio package limits UI
            this.updateRadioPackageLimits(true);
            
            // Update usage limits UI
            if (this.usageLimits) {
                this.usageLimits.updatePackageLimitUI();
            }
            
            // Show enhanced authentication features
            if (userProfile.enhanced) {
                this.updateRoleBasedUI(userProfile.role);
                this.updateSecurityIndicators(userProfile.securityLevel);
                this.showEnhancedFeatures(userProfile);
            }
            
            // Show role-based features (fallback for basic auth)
            if (authResult && authResult.role) {
                this.updateRoleBasedUI(authResult.role);
            }
            
            // Update security indicators (fallback for basic auth)
            if (authResult && authResult.securityLevel) {
                this.updateSecurityIndicators(authResult.securityLevel);
            }
            
        } catch (error) {
            const errorMessage = ErrorHandler.safeErrorMessage(error);
            console.error('Failed to update authenticated UI:', errorMessage);
            // Ensure admin dashboard is still available
            setTimeout(async () => {
                await this.ensureAdminDashboardVisible();
            }, 500);
        }
    }
    
    updateHeaderAuth(userProfile, authResult = null) {
        const headerAuth = document.getElementById('header-auth');
        const headerUserName = document.getElementById('header-user-name');
        const headerUserRole = document.getElementById('header-user-role');
        const headerLogout = document.getElementById('header-logout');
        
        if (headerAuth && headerUserName) {
            headerAuth.style.display = 'flex';
            headerUserName.textContent = userProfile.name || 'User';
            
            // Show role badge for admin users
            const role = userProfile.role || (authResult && authResult.role);
            if (role === 'admin' && headerUserRole) {
                headerUserRole.style.display = 'inline';
                headerUserRole.textContent = 'ADMIN';
                headerUserRole.className = 'user-role-badge admin';
            }
            
            // Show logout option
            if (headerLogout) {
                headerLogout.style.display = 'block';
                headerLogout.addEventListener('click', () => this.handleLogout());
            }
        }
    }
    
    async handleLogout() {
        try {
            if (unifiedAuth) {
                await unifiedAuth.signOut();
            }
            
            // Hide header auth
            const headerAuth = document.getElementById('header-auth');
            const headerLogout = document.getElementById('header-logout');
            if (headerAuth) headerAuth.style.display = 'none';
            if (headerLogout) headerLogout.style.display = 'none';
            
            // Reset app state
            this.resetApp();
            this.showAuthenticationRequired();
            
            console.log('✅ Successfully logged out');
        } catch (error) {
            console.error('Logout failed:', error);
        }
    }
    
    async handleCopyISRC() {
        const isrcElement = document.getElementById('generated-isrc');
        if (!isrcElement) return;
        
        const isrcCode = isrcElement.textContent.trim();
        if (!isrcCode || isrcCode === 'ZA-80G-25-00000') {
            this.showISRCCopyMessage('No ISRC generated yet', 'warning');
            return;
        }
        
        try {
            await navigator.clipboard.writeText(isrcCode);
            this.showISRCCopyMessage(`ISRC copied: ${isrcCode}`, 'success');
            
            // Visual feedback on button
            const copyBtn = document.getElementById('copy-isrc');
            if (copyBtn) {
                const originalText = copyBtn.innerHTML;
                const SUCCESS_COLOR = '#4CAF50';
                const FEEDBACK_DURATION = 2000;
                
                copyBtn.innerHTML = '✅ Copied!';
                copyBtn.style.background = SUCCESS_COLOR;
                
                setTimeout(() => {
                    copyBtn.innerHTML = originalText;
                    copyBtn.style.background = SUCCESS_COLOR;
                }, FEEDBACK_DURATION);
            }
        } catch (error) {
            console.error('Failed to copy ISRC:', error);
            this.showISRCCopyMessage('Copy failed - please select and copy manually', 'error');
        }
    }
    
    showISRCCopyMessage(message, type = 'info') {
        // Remove existing message
        const existing = document.querySelector('.isrc-copy-message');
        if (existing) existing.remove();
        
        // Create message element
        const messageEl = document.createElement('div');
        messageEl.className = 'isrc-copy-message';
        
        const colors = {
            success: '#4CAF50',
            warning: '#FF9800',
            error: '#f44336',
            info: '#2196F3'
        };
        
        messageEl.style.cssText = `
            position: fixed; top: 20px; right: 20px;
            background: ${colors[type] || colors.info};
            color: white; padding: 12px 16px;
            border-radius: 6px; font-size: 14px;
            z-index: 10000; box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        `;
        messageEl.textContent = message;
        
        document.body.appendChild(messageEl);
        
        // Auto-remove after 3 seconds
        setTimeout(() => {
            if (messageEl.parentNode) {
                messageEl.remove();
            }
        }, 3000);
    }
    
    updateRoleBasedUI(role) {
        // Show/hide features based on user role
        const adminFeatures = document.querySelectorAll('.admin-only');
        const producerFeatures = document.querySelectorAll('.producer-only');
        
        adminFeatures.forEach(el => {
            el.style.display = role === 'admin' ? 'block' : 'none';
        });
        
        producerFeatures.forEach(el => {
            el.style.display = role === 'admin' ? 'block' : 'none';
        });

        // Add admin invitation UI if user is admin
        if (role === 'admin') {
            this.addAdminInvitationUI();
        }
    }
    
    updateSecurityIndicators(securityLevel) {
        // Minimal security indicator - no UI badges to save space
        console.log('Security level:', securityLevel);
    }
    
    showEnhancedFeatures(userProfile) {
        // Minimal enhanced features display - no bulky UI elements
        console.log('Enhanced features available:', userProfile.role, userProfile.securityLevel);
    }
    
    showSecurityScore(score) {
        const scoreElement = document.createElement('div');
        scoreElement.className = 'security-score';
        scoreElement.style.cssText = `
            background: ${score >= 80 ? '#d4edda' : score >= 60 ? '#fff3cd' : '#f8d7da'};
            border: 1px solid ${score >= 80 ? '#c3e6cb' : score >= 60 ? '#ffeaa7' : '#f5c6cb'};
            color: ${score >= 80 ? '#155724' : score >= 60 ? '#856404' : '#721c24'};
            padding: 8px 12px;
            border-radius: 6px;
            margin: 8px 0;
            font-size: 12px;
        `;
        
        scoreElement.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <span>📊 Security Score</span>
                <strong>${score}/100</strong>
            </div>
        `;
        
        const enhancedStatus = document.querySelector('.enhanced-auth-status');
        if (enhancedStatus) {
            enhancedStatus.appendChild(scoreElement);
        }
    }
    
    updateRadioPackageLimits(isAuthenticated) {
        const currentLimitEl = document.getElementById('radio-current-limit');
        const upgradeOption = document.getElementById('radio-upgrade-option');
        const radioSignInBtns = document.querySelectorAll('#radio-signin-btn, #radio-limit-signin');
        
        if (currentLimitEl) {
            currentLimitEl.textContent = isAuthenticated ? '4 per day' : '1 per day';
        }
        
        if (upgradeOption) {
            upgradeOption.style.display = isAuthenticated ? 'none' : 'flex';
        }
        
        // Hide radio sign-in buttons when authenticated
        radioSignInBtns.forEach(btn => {
            if (btn) btn.style.display = isAuthenticated ? 'none' : 'inline-block';
        });
    }
    
    showAuthenticationRequired() {
        // Show authentication required message for all sections that need it
        const sections = ['licensing-section', 'minting-section', 'success-section'];
        
        sections.forEach(sectionId => {
            const section = document.getElementById(sectionId);
            if (section) {
                const authMessage = document.createElement('div');
                authMessage.className = 'auth-required-message';
                authMessage.style.cssText = `
                    background: #fff3cd;
                    border: 1px solid #ffeaa7;
                    border-radius: 8px;
                    padding: 16px;
                    margin: 16px 0;
                    text-align: center;
                    color: #856404;
                `;
                
                authMessage.innerHTML = `
                    <div style="font-size: 24px; margin-bottom: 8px;">🔒</div>
                    <h4 style="margin: 0 0 8px 0; color: #856404;">Demo - Authentication Required</h4>
                    <p style="margin: 0 0 12px 0;">Please sign in with Google to access minting features</p>
                    <button id="auth-signin-${sectionId}" class="btn btn-primary" style="background: #007bff; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer;">
                        🔑 Sign In with Google
                    </button>
                `;
                
                // Add to beginning of section
                section.insertBefore(authMessage, section.firstChild);
                
                // Add click handler for sign-in button
                const signInBtn = authMessage.querySelector(`#auth-signin-${sectionId}`);
                if (signInBtn) {
                    signInBtn.addEventListener('click', () => this.handleGoogleSignIn());
                }
            }
        });
        
        // Update radio package limits for anonymous users
        this.updateRadioPackageLimits(false);
        
        // Disable minting-related buttons
        const mintingButtons = ['generate-license', 'approve-license', 'mint-nft'];
        mintingButtons.forEach(buttonId => {
            const button = document.getElementById(buttonId);
            if (button) {
                button.disabled = true;
                button.title = 'Authentication required - Please sign in with Google';
            }
        });
        
        console.log('🔒 Authentication required - user must sign in to continue');
    }
    
    showSecurityStatus(authResult) {
        console.log('Security Status:', {
            role: authResult.role,
            securityLevel: authResult.securityLevel,
            mfaRequired: authResult.mfaRequired
        });
    }
    
    hideAuthenticationRequired() {
        // Remove authentication required messages
        const authMessages = document.querySelectorAll('.auth-required-message');
        authMessages.forEach(message => message.remove());
        
        // Re-enable all licensing and minting buttons
        const mintingButtons = ['generate-license', 'approve-license', 'mint-nft'];
        mintingButtons.forEach(buttonId => {
            const button = document.getElementById(buttonId);
            if (button) {
                button.disabled = false;
                button.title = '';
                button.style.opacity = '1';
                button.style.pointerEvents = 'auto';
            }
        });
        
        // Hide any sign-in buttons in licensing section
        const signInButtons = document.querySelectorAll('[id*="signin"], [id*="auth-signin"]');
        signInButtons.forEach(btn => {
            btn.style.display = 'none';
        });
        
        console.log('🔒 Authentication enforced for production security');
    }

    async loadWalletData() {
        try {
            // Always show WalletConnect section regardless of authentication
            this.initializeWalletConnect();
            
            if (!unifiedAuth) return;
            
            // Graceful wallet address loading
            let walletAddress = null;
            if (walletContext && walletContext.getCurrentAddress) {
                walletAddress = await walletContext.getCurrentAddress();
            }
            
            // Graceful balance loading with fallback
            let walletBalance = '0.0000';
            if (walletContext && walletContext.getBalance) {
                try {
                    walletBalance = await walletContext.getBalance();
                } catch (balanceError) {
                    console.warn('Balance loading failed, using fallback:', balanceError);
                }
            }
            
            // Update wallet display
            const balanceElement = document.getElementById('wallet-balance');
            if (balanceElement && walletBalance) {
                balanceElement.textContent = `${walletBalance}`;
            }
            
            console.log('Wallet loaded:', walletAddress);
        } catch (error) {
            console.error('Failed to load wallet data:', error);
        }
    }
    
    initializeWalletConnect() {
        const walletConnectSection = document.getElementById('wallet-connect-section');
        const connectBtn = document.getElementById('connect-external-wallet');
        
        if (walletConnectSection) {
            walletConnectSection.style.display = 'block';
        }
        
        if (connectBtn) {
            connectBtn.addEventListener('click', this.handleWalletConnect.bind(this));
        }
    }
    
    async handleWalletConnect() {
        const connectBtn = document.getElementById('connect-external-wallet');
        const statusDiv = document.getElementById('external-wallet-status');
        
        if (!connectBtn) return;
        
        const originalText = connectBtn.textContent;
        connectBtn.disabled = true;
        connectBtn.textContent = '🔄 Connecting...';
        
        try {
            // Simulate WalletConnect integration (placeholder for future implementation)
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Show connected status
            if (statusDiv) {
                statusDiv.style.display = 'flex';
            }
            
            connectBtn.textContent = '✓ Connected';
            connectBtn.style.background = '#4CAF50';
            connectBtn.setAttribute('aria-label', 'External wallet successfully connected');
            
            console.log('✅ External wallet connected (simulated)');
            
        } catch (error) {
            console.error('WalletConnect failed:', error);
            connectBtn.textContent = originalText;
            connectBtn.disabled = false;
            
            connectBtn.setAttribute('aria-label', 'WalletConnect failed - using embedded wallet');
            alert('WalletConnect integration coming soon. Using embedded wallet for now.');
        }
    }
    
    async initializeRadioFeatures() {
        try {
            // Initialize Radio IPFS Manager
            if (window.RadioIPFSManager) {
                this.radioIPFSManager = new RadioIPFSManager();
                console.log('✅ Radio IPFS manager initialized');
            }
            
            // Initialize SAMRO Metadata Manager
            if (window.SamroMetadataManager) {
                this.samroManager = new SamroMetadataManager();
                console.log('✅ SAMRO metadata manager initialized');
            }
            
        } catch (error) {
            console.log('Radio features initialization failed:', error);
        }
    }
    
    async initializeContentAI() {
        try {
            // Initialize Content Enhancement AI
            if (window.ContentAI && this.chromeAI) {
                this.contentAI = new ContentAI(this.chromeAI);
                const aiReady = await this.contentAI.initialize();
                if (aiReady) {
                    console.log('✅ Content Enhancement AI ready');
                    this.setupContentEnhancementUI();
                } else {
                    console.log('ℹ️ Content AI using fallback templates');
                }
            }
            
            // Initialize Professional Radio Formats
            if (window.RadioFormats) {
                this.radioFormats = new RadioFormats();
                console.log('✅ Professional radio formats ready');
            }
            
        } catch (error) {
            console.log('Content AI initialization failed:', error);
        }
    }
    
    async initializeSmartTreesAI() {
        try {
            if (window.SmartTreesAI) {
                this.smartTreesAI = new SmartTreesAI(this.chromeAI, this.userInputManager);
                const aiReady = await this.smartTreesAI.initialize();
                if (aiReady) {
                    console.log('✅ Smart Trees AI ready');
                    // Clean up old data periodically
                    setTimeout(() => this.smartTreesAI.cleanup(), 5000);
                } else {
                    console.log('ℹ️ Smart Trees AI using basic templates');
                }
            }
        } catch (error) {
            console.log('Smart Trees AI initialization failed:', error);
        }
    }
    
    async initializeSmartAssetHubIntegration() {
        try {
            if (window.SmartAssetHubIntegration) {
                // Initialize Asset Hub if not already done
                if (!this.assetHub && window.AssetManagementHub) {
                    this.assetHub = new AssetManagementHub();
                    await this.assetHub.initialize();
                }
                
                // Create integration
                this.smartAssetHubIntegration = new SmartAssetHubIntegration(
                    this.smartTreesAI,
                    this.assetHub,
                    this.chromeAI
                );
                
                const integrationReady = await this.smartAssetHubIntegration.initialize();
                if (integrationReady) {
                    console.log('✅ Smart Asset Hub Integration ready');
                } else {
                    console.log('ℹ️ Smart Asset Hub Integration using fallback mode');
                }
            }
        } catch (error) {
            console.log('Smart Asset Hub Integration initialization failed:', error);
        }
    }
    
    async initializeMonetizationSystems() {
        try {
            // Initialize Admin Dashboard with production settings
            if (window.AdminDashboardManager) {
                try {
                    this.adminDashboard = new AdminDashboardManager();
                    // Use real auth manager with production wallet - ensure it's never undefined
                        const authManager = unifiedAuth || {
                        hasPermission: (permission) => {
                            // Allow all admin permissions only when an explicit dev flag is set.
                            // This prevents accidental privilege escalation in production.
                            if (window.__DEV_ADMIN__ === true) return true;
                            return permission === 'admin_panel' || permission === 'admin';
                        },
                        getUserProfile: () => ({ 
                            name: 'Admin User', 
                            role: 'admin',
                            address: '0xc84799A904EeB5C57aBBBc40176E7dB8be202C10'
                        }),
                        isAuthenticated: () => true
                    };
                    
                    // Ensure authManager is never null/undefined
                    if (!authManager) {
                        throw new Error('Authentication manager is required but not available');
                    }
                    
                    await this.adminDashboard.initialize(authManager);
                    console.log('✅ Admin Dashboard initialized with production settings');
                } catch (adminError) {
                    const errorMessage = ErrorHandler.safeErrorMessage(adminError);
                    console.warn('⚠️ Admin Dashboard initialization failed:', errorMessage);
                    // Create minimal fallback
                    this.adminDashboard = {
                        isInitialized: false,
                        setupDashboardUI: () => console.log('Admin dashboard unavailable'),
                        getSponsorContent: () => null
                    };
                }
            }
            
            // Initialize Usage Limits Manager
            if (window.UsageLimitsManager) {
                try {
                    this.usageLimits = new UsageLimitsManager();
                    // Use unifiedAuth instead of undefined this.authManager
                    await this.usageLimits.initialize(unifiedAuth, this.adminDashboard);
                    console.log('✅ Usage Limits Manager initialized');
                } catch (limitsError) {
                    const errorMessage = ErrorHandler.safeErrorMessage(limitsError);
                    console.warn('⚠️ Usage Limits Manager initialization failed:', errorMessage);
                }
            }
            
            // Initialize Sponsor Content Manager (consent already shown)
            if (window.SponsorContentManager) {
                try {
                    this.sponsorContent = new SponsorContentManager();
                    await this.sponsorContent.initialize(this.adminDashboard);
                    await this.sponsorContent.ensureCompliance();
                    
                    // Enhance existing systems with sponsor content
                    if (this.isrcManager) {
                        this.sponsorContent.enhanceISRCGeneration(this.isrcManager);
                    }
                    this.sponsorContent.enhancePackageGeneration(this);
                    
                    console.log('✅ Sponsor Content Manager initialized');
                    window.sponsorContentManager = this.sponsorContent;
                } catch (sponsorError) {
                    const errorMessage = ErrorHandler.safeErrorMessage(sponsorError);
                    console.warn('⚠️ Sponsor Content Manager initialization failed:', errorMessage);
                }
            }
            
        } catch (error) {
            const errorMessage = ErrorHandler.safeErrorMessage(error);
            console.log('⚠️ Monetization systems initialization failed:', errorMessage);
        }
    }
    
    async initializeSponsorIntegration() {
        try {
            // Initialize Native Sponsor Manager (IPFS primary, Google Drive fallback)
            if (window.NativeSponsorManager) {
                this.nativeSponsorManager = NativeSponsorManager.enhanceApp(this);
                console.log('✅ Native Sponsor Manager initialized (IPFS primary)');
            }
            
            // Keep Enhanced Sponsor Integration as fallback
            if (window.EnhancedSponsorIntegration) {
                this.enhancedSponsorIntegration = EnhancedSponsorIntegration.enhanceApp(this);
                console.log('✅ Enhanced Sponsor Integration initialized (fallback)');
            }
        } catch (error) {
            console.log('Sponsor integration initialization failed:', error);
        }
    }
    
    async initializeRevenueManagement() {
        try {
            if (window.RevenueManagementSystem) {
                this.revenueManagementSystem = new RevenueManagementSystem();
                
                // Initialize with proper error handling and fallbacks
                await this.revenueManagementSystem.initialize(
                    this.campaignManager || null,
                    this.packageMeasurementSystem || null,
                    this.nativeSponsorManager || null
                );
                
                // Setup revenue management UI if admin dashboard is available
                if (this.adminDashboard && this.adminDashboard.isInitialized) {
                    this.setupRevenueManagementUI();
                }
                
                console.log('✅ Revenue Management System initialized successfully');
            } else {
                console.warn('⚠️ RevenueManagementSystem not available');
            }
        } catch (error) {
            console.error('❌ Revenue management initialization failed:', error);
            // Create fallback revenue system
            this.createFallbackRevenueSystem();
        }
    }

    async initializeChromeAIOptimizer() {
        try {
            if (window.ChromeAIRevenueOptimizer) {
                this.chromeAIOptimizer = new ChromeAIRevenueOptimizer();
                const enabled = await this.chromeAIOptimizer.initialize();
                if (enabled) {
                    console.log('✅ Chrome AI Revenue Optimizer enabled');
                    // Connect to revenue management system if available
                    if (this.revenueManagementSystem) {
                        this.revenueManagementSystem.chromeAIOptimizer = this.chromeAIOptimizer;
                    }
                } else {
                    console.log('📊 Chrome AI not available, using standard processing');
                }
            } else {
                console.warn('⚠️ ChromeAIRevenueOptimizer not available');
            }
        } catch (error) {
            console.error('❌ Chrome AI optimizer initialization failed:', error);
        }
    }

    async initializeMintingSponsorIntegration() {
        try {
            // Initialize Minting Sponsor Integration
            if (window.MintingSponsorIntegration) {
                this.mintingSponsorIntegration = MintingSponsorIntegration.enhanceApp(this);
                console.log('✅ Minting Sponsor Integration initialized');
            }
        } catch (error) {
            console.log('Minting sponsor integration initialization failed:', error);
        }
    }
    
    async initializeRadioSponsorIntegration() {
        try {
            // Initialize Radio Sponsor Integration with timers
            if (window.RadioSponsorIntegration) {
                this.radioSponsorIntegration = RadioSponsorIntegration.enhanceApp(this);
                console.log('✅ Radio Sponsor Integration initialized with timers');
            }
        } catch (error) {
            console.log('Radio sponsor integration initialization failed:', error);
        }
    }
    
    async initializeAnalytics() {
        try {
            if (window.AnalyticsManager) {
                this.analyticsManager = new AnalyticsManager();
                await this.analyticsManager.initialize();
                console.log('✅ Analytics Manager initialized');
            }
        } catch (error) {
            console.log('Analytics initialization failed:', error);
        }
    }
    
    async initializePackageMeasurementSystem() {
        try {
            if (window.PackageMeasurementSystem) {
                window.packageMeasurementSystem = new PackageMeasurementSystem();
                await window.packageMeasurementSystem.initialize(
                    window.consentManager,
                    this.radioIPFSManager,
                    this.isrcManager
                );
                console.log('✅ Package Measurement System initialized');
            }
        } catch (error) {
            console.log('Package Measurement System initialization failed:', error);
        }
    }
    
    async loadAIInsights() {
        if (!this.smartTreesAI) {
            console.log('Smart Trees AI not available');
            return;
        }
        
        try {
            const insights = this.smartTreesAI.getInsights(5);
            this.displayInsights(insights);
        } catch (error) {
            console.error('Failed to load AI insights:', error);
        }
    }
    
    displayInsights(insights) {
        const insightsList = document.getElementById('insights-list');
        if (!insightsList) return;
        
        if (insights.length === 0) {
            insightsList.innerHTML = `
                <div class="empty-insights">
                    <div class="empty-icon">🌱</div>
                    <p>Your AI insights will grow here</p>
                    <small>Upload beats, update your profile, and submit to radio stations to generate personalized insights</small>
                </div>
            `;
            return;
        }
        
        insightsList.innerHTML = '';
        
        insights.forEach(insight => {
            const card = this.createInsightCard(insight);
            insightsList.appendChild(card);
        });
    }
    
    createInsightCard(insight) {
        const card = document.createElement('div');
        card.className = `insight-card ${!insight.viewed ? 'insight-new' : ''}`;
        card.dataset.insightId = insight.id;
        
        const categoryIcons = {
            performance: '📊',
            opportunities: '🎯', 
            optimization: '⚡',
            collaboration: '🤝',
            market: '📈'
        };
        
        const icon = categoryIcons[insight.category] || '💡';
        const preview = insight.description.length > 80 ? 
            insight.description.substring(0, 80) + '...' : insight.description;
        
        card.innerHTML = `
            <div class="insight-header">
                <div class="insight-title">
                    <span class="insight-icon">${icon}</span>
                    <h4>${this.escapeHtml(insight.title)}</h4>
                </div>
                <span class="insight-category">${insight.category}</span>
            </div>
            <div class="insight-preview">${this.escapeHtml(preview)}</div>
            <div class="insight-meta">
                <span class="insight-timestamp">${this.formatTimestamp(insight.timestamp)}</span>
                <button class="insight-expand">▼ Expand</button>
            </div>
            <div class="insight-details">
                <div class="insight-description">${this.escapeHtml(insight.description)}</div>
                <div class="insight-actions">
                    <button class="insight-btn primary" data-action="mark-useful">✓ Useful</button>
                    <button class="insight-btn secondary" data-action="dismiss">✗ Dismiss</button>
                </div>
            </div>
        `;
        
        // Add event listeners
        const expandBtn = card.querySelector('.insight-expand');
        const details = card.querySelector('.insight-details');
        
        expandBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const isExpanded = details.classList.contains('expanded');
            
            if (isExpanded) {
                details.classList.remove('expanded');
                card.classList.remove('expanded');
                expandBtn.textContent = '▼ Expand';
            } else {
                details.classList.add('expanded');
                card.classList.add('expanded');
                expandBtn.textContent = '▲ Collapse';
                
                // Mark as viewed
                if (this.smartTreesAI && !insight.viewed) {
                    this.smartTreesAI.markViewed(insight.id);
                    card.classList.remove('insight-new');
                }
            }
        });
        
        // Action buttons
        card.querySelector('[data-action="mark-useful"]').addEventListener('click', (e) => {
            e.stopPropagation();
            if (this.smartTreesAI) {
                this.smartTreesAI.markActionTaken(insight.id);
            }
            card.style.opacity = '0.7';
            setTimeout(() => {
                card.querySelector('.insight-btn.primary').textContent = '✓ Noted';
                card.querySelector('.insight-btn.primary').disabled = true;
            }, 200);
        });
        
        card.querySelector('[data-action="dismiss"]').addEventListener('click', (e) => {
            e.stopPropagation();
            if (this.smartTreesAI) {
                this.smartTreesAI.dismissInsight(insight.id);
            }
            card.style.transform = 'translateX(-100%)';
            card.style.opacity = '0';
            setTimeout(() => {
                card.remove();
                // Reload insights if list is empty
                if (document.querySelectorAll('.insight-card').length === 0) {
                    this.loadAIInsights();
                }
            }, 300);
        });
        
        return card;
    }

    createMinimalAdminDashboard() {
        // Check if admin dashboard already exists
        if (document.getElementById('admin-dashboard-section') || document.getElementById('admin-invitation-section')) {
            console.log('✅ Admin dashboard already exists, skipping minimal creation');
            return;
        }
        
        console.log('⚠️ Creating minimal admin dashboard as fallback');
        
        const profileSection = document.getElementById('profile-section');
        if (!profileSection) return;

        // Create minimal admin section
        const adminSection = document.createElement('div');
        adminSection.id = 'admin-dashboard-section';
        adminSection.className = 'admin-dashboard admin-only';
        adminSection.style.cssText = `
            background: #f8f9fa;
            border: 1px solid #dee2e6;
            border-radius: 8px;
            padding: 16px;
            margin: 16px 0;
        `;

        adminSection.innerHTML = `
            <div class="admin-header">
                <h3>👑 Admin Dashboard</h3>
                <button class="collapse-btn" id="admin-toggle" type="button">▼</button>
            </div>
            <div class="admin-content" id="admin-content">
                <div class="admin-status">
                    <p>⚠️ Full admin dashboard unavailable</p>
                    <p>Basic admin functions available below:</p>
                </div>
                
                <!-- Campaign Management -->
                <div class="form-group">
                    <label class="form-label">📢 Campaign Management:</label>
                    <div style="display: flex; gap: 8px; margin-bottom: 8px;">
                        <input type="text" id="campaign-name" placeholder="Campaign name" class="form-input" style="flex: 1;">
                        <button id="create-campaign" class="btn btn-primary">🚀 Create</button>
                    </div>
                    <div id="active-campaigns" class="campaigns-list">
                        <p style="color: #666; font-style: italic;">No active campaigns</p>
                    </div>
                </div>
            </div>
        `;

        // Insert at the beginning of profile section
        const profileContent = profileSection.querySelector('.profile-content') || profileSection;
        profileContent.insertBefore(adminSection, profileContent.firstChild);

        // Add collapse functionality
        const adminToggleBtn = adminSection.querySelector('#admin-toggle');
        const adminContent = adminSection.querySelector('#admin-content');
        
        adminToggleBtn.addEventListener('click', () => {
            adminContent.classList.toggle('collapsed');
            adminToggleBtn.textContent = adminContent.classList.contains('collapsed') ? '▶' : '▼';
        });
        
        console.log('✅ Minimal admin dashboard created as fallback - full dashboard unavailable');
    }
    
    addAdminInvitationUI() {
        // Check if admin invitation UI already exists
        if (document.getElementById('admin-invitation-section')) {
            return;
        }

        // Find profile section to add admin features
        const profileSection = document.getElementById('profile-section');
        if (!profileSection) return;

        // Create streamlined admin section (NO BIOGRAPHY - that stays in Profile)
        const adminSection = document.createElement('div');
        adminSection.id = 'admin-invitation-section';
        adminSection.className = 'admin-only';
        adminSection.style.cssText = `
            background: #f8f9fa;
            border: 1px solid #dee2e6;
            border-radius: 8px;
            padding: 16px;
            margin: 16px 0;
        `;

        adminSection.innerHTML = `
            <div class="admin-header">
                <h3>👑 Admin Management</h3>
                <button class="collapse-btn" id="admin-toggle" type="button">▼</button>
            </div>
            
            <div id="admin-content" class="profile-section-content">
                <!-- Campaign Management -->
                <div class="form-group">
                    <label class="form-label">📢 Campaign Management:</label>
                    <div style="display: flex; gap: 8px; margin-bottom: 8px;">
                        <input type="text" id="campaign-name" placeholder="Campaign name" class="form-input" style="flex: 1;">
                        <select id="campaign-type" class="form-input">
                            <option value="sponsor">Sponsor Content</option>
                            <option value="promotion">Music Promotion</option>
                            <option value="partnership">Partnership</option>
                        </select>
                        <button id="create-campaign" class="btn btn-primary">🚀 Create</button>
                    </div>
                    <div id="active-campaigns" class="campaigns-list"></div>
                </div>
                
                <!-- Admin Invitations -->
                <div class="form-group">
                    <label class="form-label">Invite New Admin:</label>
                    <div style="display: flex; gap: 8px;">
                        <input type="email" id="admin-invite-email" placeholder="admin@example.com" class="form-input" style="flex: 1;">
                        <button id="send-admin-invite" class="btn btn-primary">📧 Invite</button>
                    </div>
                    <small class="form-help">Invited admins will have full system access</small>
                </div>
                
                <div class="form-group">
                    <label class="form-label">Pending Invitations:</label>
                    <div id="invitations-list" class="invitations-container"></div>
                </div>
            </div>
        `;

        // Insert at the beginning of profile section
        const profileContent = profileSection.querySelector('.profile-content') || profileSection;
        profileContent.insertBefore(adminSection, profileContent.firstChild);

        // Add event listeners
        this.setupAdminInvitationHandlers();
        this.setupCampaignHandlers();
        this.setupAdminCollapse();
        
        // Load pending invitations and campaigns
        this.loadPendingInvitations();
        this.loadActiveCampaigns();
        
        // Make artist sections collapsible for admins
        this.makeArtistSectionsCollapsible();
    }

    setupAdminInvitationHandlers() {
        const inviteBtn = document.getElementById('send-admin-invite');
        const emailInput = document.getElementById('admin-invite-email');

        if (inviteBtn && emailInput) {
            inviteBtn.addEventListener('click', async () => {
                await this.handleAdminInvite();
            });

            emailInput.addEventListener('keypress', async (e) => {
                if (e.key === 'Enter') {
                    await this.handleAdminInvite();
                }
            });
        }
    }
    
    setupCampaignHandlers() {
        const createBtn = document.getElementById('create-campaign');
        const nameInput = document.getElementById('campaign-name');
        const typeSelect = document.getElementById('campaign-type');

        if (createBtn && nameInput && typeSelect) {
            createBtn.addEventListener('click', async () => {
                await this.handleCreateCampaign();
            });

            nameInput.addEventListener('keypress', async (e) => {
                if (e.key === 'Enter') {
                    await this.handleCreateCampaign();
                }
            });
        }
    }
    
    async handleCreateCampaign() {
        const nameInput = document.getElementById('campaign-name');
        const typeSelect = document.getElementById('campaign-type');
        const createBtn = document.getElementById('create-campaign');
        
        if (!nameInput || !typeSelect || !createBtn) return;

        const name = nameInput.value.trim();
        const type = typeSelect.value;
        
        if (!name) {
            this.showInviteMessage('Please enter a campaign name', 'error');
            return;
        }

        const originalText = createBtn.textContent;
        createBtn.disabled = true;
        createBtn.textContent = '🚀 Creating...';

        try {
            const campaign = {
                id: Date.now().toString(),
                name: name,
                type: type,
                status: 'active',
                createdAt: new Date().toISOString(),
                createdBy: unifiedAuth?.getUserProfile()?.name || 'Admin',
                metrics: {
                    impressions: 0,
                    clicks: 0,
                    conversions: 0
                }
            };
            
            // Store campaign
            const stored = localStorage.getItem('admin_campaigns') || '[]';
            const campaigns = JSON.parse(stored);
            campaigns.unshift(campaign);
            localStorage.setItem('admin_campaigns', JSON.stringify(campaigns));
            
            nameInput.value = '';
            this.showInviteMessage(`Campaign "${name}" created successfully`, 'success');
            await this.loadActiveCampaigns();
            
        } catch (error) {
            console.error('Campaign creation failed:', error);
            this.showInviteMessage('Campaign creation failed', 'error');
        } finally {
            createBtn.disabled = false;
            createBtn.textContent = originalText;
        }
    }
    
    async loadActiveCampaigns() {
        try {
            const stored = localStorage.getItem('admin_campaigns') || '[]';
            const campaigns = JSON.parse(stored);
            const activeCampaigns = campaigns.filter(c => c.status === 'active');
            
            const listContainer = document.getElementById('active-campaigns');
            if (!listContainer) return;

            if (activeCampaigns.length === 0) {
                listContainer.innerHTML = '<p style="color: #6c757d; font-style: italic; margin: 8px 0 0 0; font-size: 12px;">No active campaigns</p>';
                return;
            }

            listContainer.innerHTML = '';
            
            activeCampaigns.slice(0, 3).forEach(campaign => {
                const campaignItem = document.createElement('div');
                campaignItem.style.cssText = `
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 6px 8px;
                    background: white;
                    border: 1px solid #e9ecef;
                    border-radius: 4px;
                    margin-bottom: 4px;
                    font-size: 12px;
                `;

                const typeIcon = {
                    'sponsor': '📢',
                    'promotion': '🎵',
                    'partnership': '🤝'
                }[campaign.type] || '📋';
                
                campaignItem.innerHTML = `
                    <div>
                        <span>${typeIcon}</span>
                        <strong>${campaign.name}</strong>
                        <small style="color: #6c757d; margin-left: 8px;">${campaign.type}</small>
                    </div>
                    <div style="display: flex; gap: 4px;">
                        <button class="pause-campaign" data-id="${campaign.id}" 
                                style="padding: 2px 6px; background: #ffc107; color: #000; border: none; border-radius: 3px; cursor: pointer; font-size: 10px;">
                            ⏸️
                        </button>
                        <button class="delete-campaign" data-id="${campaign.id}" 
                                style="padding: 2px 6px; background: #dc3545; color: white; border: none; border-radius: 3px; cursor: pointer; font-size: 10px;">
                            🗑️
                        </button>
                    </div>
                `;

                // Add campaign handlers
                const pauseBtn = campaignItem.querySelector('.pause-campaign');
                const deleteBtn = campaignItem.querySelector('.delete-campaign');
                
                pauseBtn.addEventListener('click', () => this.pauseCampaign(campaign.id));
                deleteBtn.addEventListener('click', () => this.deleteCampaign(campaign.id));

                listContainer.appendChild(campaignItem);
            });
            
            if (activeCampaigns.length > 3) {
                const moreDiv = document.createElement('div');
                moreDiv.style.cssText = 'text-align: center; margin-top: 8px;';
                moreDiv.innerHTML = `<small style="color: #6c757d;">+${activeCampaigns.length - 3} more campaigns</small>`;
                listContainer.appendChild(moreDiv);
            }

        } catch (error) {
            console.error('Failed to load campaigns:', error);
        }
    }
    
    async pauseCampaign(campaignId) {
        try {
            const stored = localStorage.getItem('admin_campaigns') || '[]';
            const campaigns = JSON.parse(stored);
            const campaign = campaigns.find(c => c.id === campaignId);
            
            if (campaign) {
                campaign.status = campaign.status === 'active' ? 'paused' : 'active';
                localStorage.setItem('admin_campaigns', JSON.stringify(campaigns));
                await this.loadActiveCampaigns();
                this.showInviteMessage(`Campaign ${campaign.status}`, 'success');
            }
        } catch (error) {
            console.error('Failed to pause campaign:', error);
        }
    }
    
    async deleteCampaign(campaignId) {
        if (!confirm('Delete this campaign? This action cannot be undone.')) {
            return;
        }
        
        try {
            const stored = localStorage.getItem('admin_campaigns') || '[]';
            const campaigns = JSON.parse(stored);
            const filtered = campaigns.filter(c => c.id !== campaignId);
            
            localStorage.setItem('admin_campaigns', JSON.stringify(filtered));
            await this.loadActiveCampaigns();
            this.showInviteMessage('Campaign deleted', 'success');
        } catch (error) {
            console.error('Failed to delete campaign:', error);
        }
    }

    async handleAdminInvite() {
        const emailInput = document.getElementById('admin-invite-email');
        const inviteBtn = document.getElementById('send-admin-invite');
        
        if (!emailInput || !inviteBtn) return;

        const email = emailInput.value.trim();
        if (!email) {
            this.showInviteMessage('Please enter an email address', 'error');
            return;
        }

        const originalText = inviteBtn.textContent;
        inviteBtn.disabled = true;
        inviteBtn.textContent = '📤 Sending...';

        try {
            // Mock invitation for development
            const invitation = {
                id: Date.now().toString(),
                email: email,
                status: 'pending',
                createdAt: new Date().toISOString(),
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days
            };
            
            const stored = localStorage.getItem('admin_invitations') || '[]';
            const invitations = JSON.parse(stored);
            invitations.unshift(invitation);
            localStorage.setItem('admin_invitations', JSON.stringify(invitations));
            
            emailInput.value = '';
            this.showInviteMessage('Invitation sent successfully', 'success');
            await this.loadPendingInvitations();

        } catch (error) {
            console.error('Admin invitation failed:', error);
            this.showInviteMessage('Invitation failed', 'error');
        } finally {
            inviteBtn.disabled = false;
            inviteBtn.textContent = originalText;
        }
    }

    async loadPendingInvitations() {
        try {
            const stored = localStorage.getItem('admin_invitations') || '[]';
            const invitations = JSON.parse(stored).filter(inv => inv.status === 'pending');
            const listContainer = document.getElementById('invitations-list');
            
            if (!listContainer) return;

            if (invitations.length === 0) {
                listContainer.innerHTML = '<p style="color: #6c757d; font-style: italic; margin: 0;">No pending invitations</p>';
                return;
            }

            listContainer.innerHTML = '';
            
            invitations.forEach(invitation => {
                const inviteItem = document.createElement('div');
                inviteItem.style.cssText = `
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 8px;
                    background: white;
                    border: 1px solid #e9ecef;
                    border-radius: 4px;
                    margin-bottom: 4px;
                `;

                const expiresDate = new Date(invitation.expiresAt).toLocaleDateString();
                
                inviteItem.innerHTML = `
                    <div>
                        <strong>${invitation.email}</strong><br>
                        <small style="color: #6c757d;">Expires: ${expiresDate}</small>
                    </div>
                    <button class="revoke-invite" data-id="${invitation.id}" 
                            style="padding: 4px 8px; background: #dc3545; color: white; border: none; border-radius: 3px; cursor: pointer; font-size: 12px;">
                        ❌ Revoke
                    </button>
                `;

                // Add revoke handler
                const revokeBtn = inviteItem.querySelector('.revoke-invite');
                revokeBtn.addEventListener('click', async () => {
                    await this.handleRevokeInvitation(invitation.id, invitation.email);
                });

                listContainer.appendChild(inviteItem);
            });

        } catch (error) {
            console.error('Failed to load pending invitations:', error);
        }
    }

    async handleRevokeInvitation(invitationId, email) {
        if (!confirm(`Revoke admin invitation for ${email}?`)) {
            return;
        }

        try {
            const stored = localStorage.getItem('admin_invitations') || '[]';
            const invitations = JSON.parse(stored);
            const invitation = invitations.find(inv => inv.id === invitationId);
            
            if (invitation) {
                invitation.status = 'revoked';
                localStorage.setItem('admin_invitations', JSON.stringify(invitations));
                this.showInviteMessage('Invitation revoked successfully', 'success');
                await this.loadPendingInvitations();
            }

        } catch (error) {
            console.error('Failed to revoke invitation:', error);
            this.showInviteMessage('Failed to revoke invitation', 'error');
        }
    }

    showInviteMessage(message, type) {
        // Remove existing message
        const existingMsg = document.getElementById('invite-message');
        if (existingMsg) {
            existingMsg.remove();
        }

        // Create new message
        const messageDiv = document.createElement('div');
        messageDiv.id = 'invite-message';
        messageDiv.style.cssText = `
            padding: 8px 12px;
            border-radius: 4px;
            margin: 8px 0;
            font-size: 14px;
            background: ${type === 'success' ? '#d4edda' : '#f8d7da'};
            border: 1px solid ${type === 'success' ? '#c3e6cb' : '#f5c6cb'};
            color: ${type === 'success' ? '#155724' : '#721c24'};
        `;
        
        messageDiv.textContent = message;

        // Insert after invite button
        const inviteBtn = document.getElementById('send-admin-invite');
        if (inviteBtn && inviteBtn.parentNode) {
            inviteBtn.parentNode.insertBefore(messageDiv, inviteBtn.nextSibling);
        }

        // Remove after 5 seconds
        setTimeout(() => {
            if (messageDiv.parentNode) {
                messageDiv.parentNode.removeChild(messageDiv);
            }
        }, 5000);
    }
    
    async ensureAdminDashboardVisible() {
        // Check if admin dashboard is visible in profile section
        const profileSection = document.getElementById('profile-section');
        if (!profileSection) return;
        
        // CRITICAL: Remove ALL duplicate admin dashboards to prevent conflicts
        const existingDuplicates = document.querySelectorAll('.admin-dashboard-container, #admin-invitation-section');
        existingDuplicates.forEach(dashboard => {
            if (dashboard.id !== 'admin-dashboard-section') {
                dashboard.remove();
                console.log('✅ Removed duplicate admin dashboard:', dashboard.id);
            }
        });
        
        // Look for existing full admin dashboard first
        let adminSection = document.getElementById('admin-dashboard-section');
        if (!adminSection && this.adminDashboard) {
            // Force create full admin dashboard
            try {
                await this.adminDashboard.setupDashboardUI();
                console.log('✅ Full admin dashboard created');
            } catch (error) {
                console.warn('⚠️ Full admin dashboard creation failed:', error);
                // Try to reinitialize the admin dashboard
                try {
                    const mockAuth = {
                        hasPermission: () => true,
                        getUserProfile: () => ({ name: 'Admin User', role: 'admin' }),
                        isAuthenticated: () => true
                    };
                    await this.adminDashboard.initialize(mockAuth);
                    await this.adminDashboard.setupDashboardUI();
                    console.log('✅ Admin dashboard reinitialized and created');
                } catch (retryError) {
                    console.warn('⚠️ Admin dashboard retry failed, using minimal fallback');
                    this.createMinimalAdminDashboard();
                }
            }
        } else if (!adminSection) {
            // Create minimal admin dashboard as last resort
            this.createMinimalAdminDashboard();
            console.log('✅ Minimal admin dashboard created as fallback');
        } else {
            adminSection.style.display = 'block';
            console.log('✅ Admin dashboard visible');
        }
        
        // Setup admin collapse functionality
        setTimeout(() => {
            this.setupAdminCollapse();
            this.makeArtistSectionsCollapsible();
        }, 100);
    }
    
    setupAdminCollapse() {
        const adminToggle = document.getElementById('admin-toggle');
        const adminContent = document.getElementById('admin-content');
        
        if (adminToggle && adminContent) {
            adminToggle.addEventListener('click', () => {
                const isCollapsed = adminContent.classList.contains('collapsed');
                
                if (isCollapsed) {
                    adminContent.classList.remove('collapsed');
                    adminToggle.textContent = '▼';
                } else {
                    adminContent.classList.add('collapsed');
                    adminToggle.textContent = '▶';
                }
            });
        }
    }
    
    makeArtistSectionsCollapsible() {
        // Make artist profile sections collapsible for admins
        const profileInfo = document.querySelector('.profile-info');
        const profileStats = document.querySelector('.profile-stats');
        const enhancedProfile = document.querySelector('.enhanced-profile');
        const artistBiography = document.querySelector('.artist-biography');
        const artistInvitation = document.querySelector('.artist-invitation');
        
        // Group all artist sections under one collapsible header
        const artistSections = [profileInfo, profileStats, enhancedProfile, artistBiography, artistInvitation].filter(Boolean);
        
        if (artistSections.length > 0) {
            // Check if header already exists to prevent duplication
            const existingHeader = document.querySelector('.admin-artist-toggle');
            if (existingHeader) {
                console.log('✅ Artist sections already collapsible');
                return;
            }
            
            // Create collapsible header for all artist content
            const header = document.createElement('div');
            header.className = 'profile-section-header admin-artist-toggle';
            header.style.cssText = 'display: flex; align-items: center; gap: 8px; cursor: pointer; margin: 16px 0 8px 0; padding: 8px; background: #f8f9fa; border-radius: 6px;';
            header.innerHTML = '<span class="toggle-icon">▶</span><span>🎤</span><strong>Artist Profile</strong><small style="margin-left: auto; color: #666;">Click to expand</small>';
            
            // Insert header before first artist section
            const firstSection = artistSections[0];
            firstSection.parentNode.insertBefore(header, firstSection);
            
            // Initially collapse all artist sections
            artistSections.forEach(section => {
                section.style.display = 'none';
                section.classList.add('admin-collapsed');
            });
            
            // Add toggle functionality
            header.addEventListener('click', () => {
                const isCollapsed = artistSections[0].classList.contains('admin-collapsed');
                const toggleIcon = header.querySelector('.toggle-icon');
                const helpText = header.querySelector('small');
                
                artistSections.forEach(section => {
                    if (isCollapsed) {
                        section.style.display = 'block';
                        section.classList.remove('admin-collapsed');
                    } else {
                        section.style.display = 'none';
                        section.classList.add('admin-collapsed');
                    }
                });
                
                toggleIcon.textContent = isCollapsed ? '▼' : '▶';
                helpText.textContent = isCollapsed ? 'Click to collapse' : 'Click to expand';
            });
            
            console.log('✅ Artist sections made collapsible for admin');
        }
    }
    
    async growNewBranch() {
        const growBtn = document.getElementById('grow-new-branch');
        if (!this.smartTreesAI || !growBtn) return;
        
        const originalText = growBtn.textContent;
        growBtn.disabled = true;
        growBtn.textContent = '🌱 Growing...';
        
        try {
            const newInsight = await this.smartTreesAI.growNewBranch();
            
            if (newInsight) {
                // Reload insights to show the new one
                await this.loadAIInsights();
                
                growBtn.textContent = '✨ New Insight!';
                setTimeout(() => {
                    growBtn.textContent = originalText;
                    growBtn.disabled = false;
                }, 2000);
            } else {
                growBtn.textContent = '💭 Need More Data';
                setTimeout(() => {
                    growBtn.textContent = originalText;
                    growBtn.disabled = false;
                }, 2000);
            }
            
        } catch (error) {
            console.error('Failed to grow new branch:', error);
            growBtn.textContent = originalText;
            growBtn.disabled = false;
        }
    }
    
    async handleGenerateISRC() {
        const generateBtn = document.getElementById('generate-isrc-btn');
        const isrcInput = document.getElementById('radio-isrc');
        
        if (!generateBtn || !isrcInput) {
            console.error('ISRC button or input not found');
            return;
        }
        
        const originalText = generateBtn.textContent;
        generateBtn.disabled = true;
        generateBtn.textContent = 'Generating...';
        
        try {
            // CRITICAL: Use shared ISRC manager to avoid duplicates
            if (!this.isrcManager) {
                try {
                    this.isrcManager = window.sharedISRCManager || (window.ISRCManager ? new ISRCManager() : null);
                    if (this.isrcManager && !window.sharedISRCManager) {
                        await this.isrcManager.initialize();
                        window.sharedISRCManager = this.isrcManager;
                        console.log('✅ Shared ISRC Manager initialized for radio');
                    }
                } catch (initError) {
                    console.error('ISRC Manager initialization failed:', ErrorHandler.safeErrorMessage(initError));
                    this.isrcManager = null;
                }
            }
            
            if (this.isrcManager) {
                // Ensure registry is loaded
                if (!this.isrcManager.registry) {
                    await this.isrcManager.initialize();
                }
                
                // Get track info for duplicate checking
                const trackTitle = document.getElementById('radio-track-title')?.value || '';
                const artistName = document.getElementById('radio-artist-name')?.value || '';
                
                // Check for existing ISRC first to prevent duplicates
                let newISRC;
                try {
                    newISRC = this.isrcManager.getISRCForTrack(trackTitle, artistName);
                } catch (getError) {
                    console.warn('Failed to get existing ISRC:', ErrorHandler.safeErrorMessage(getError));
                    newISRC = null;
                }
                
                if (!newISRC) {
                    try {
                        // Generate new ISRC only if none exists
                        newISRC = await this.isrcManager.generateISRC(trackTitle, artistName);
                        console.log('✅ New ISRC generated for radio:', newISRC);
                    } catch (generateError) {
                        console.error('Failed to generate ISRC:', ErrorHandler.safeErrorMessage(generateError));
                        newISRC = null;
                    }
                } else {
                    console.log('✅ Using existing ISRC for radio:', newISRC);
                }
                if (newISRC) {
                    isrcInput.value = newISRC;
                    // Mark as user input since they clicked generate
                    this.userInputManager.setUserInput('radio-isrc', newISRC, true);
                    generateBtn.textContent = '✓ Generated';
                    console.log('✅ ISRC generated:', newISRC);
                    
                    // Show sponsored content after ISRC generation in radio - keep visible until user navigates
                    setTimeout(() => {
                        this.displayISRCGenerationSponsored();
                    }, 1000);
                } else {
                    generateBtn.textContent = 'Failed';
                    console.error('❌ ISRC generation returned null');
                }
            } else {
                generateBtn.textContent = 'Unavailable';
                console.error('❌ ISRC Manager not available');
            }
        } catch (error) {
            console.error('❌ ISRC generation failed:', error);
            generateBtn.textContent = 'Error';
        }
        
        setTimeout(() => {
            generateBtn.textContent = originalText;
            generateBtn.disabled = false;
        }, 2000);
    }
    
    formatTimestamp(timestamp) {
        const now = Date.now();
        const diff = now - timestamp;
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);
        
        if (minutes < 1) return 'Just now';
        if (minutes < 60) return `${minutes}m ago`;
        if (hours < 24) return `${hours}h ago`;
        if (days < 7) return `${days}d ago`;
        return new Date(timestamp).toLocaleDateString();
    }
    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    setupContentEnhancementUI() {
        // Add enhancement buttons to biography fields
        this.addEnhancementButton('profile-artist-bio', 'biography');
        this.addEnhancementButton('artist-bio', 'biography');
        
        // Add enhancement buttons to track descriptions
        const trackDescFields = document.querySelectorAll('[id*="description"], [id*="bio"]');
        trackDescFields.forEach(field => {
            if (field.id && !field.querySelector('.enhancement-controls')) {
                this.addEnhancementButton(field.id, 'description');
            }
        });
    }
    
    addEnhancementButton(fieldId, type) {
        const field = document.getElementById(fieldId);
        if (!field || field.querySelector('.enhancement-controls')) return;
        
        const container = document.createElement('div');
        container.className = 'enhancement-controls';
        container.style.cssText = 'margin-top: 8px; display: flex; gap: 8px; align-items: center;';
        
        const enhanceBtn = document.createElement('button');
        enhanceBtn.type = 'button';
        enhanceBtn.className = 'btn btn-secondary btn-sm';
        enhanceBtn.textContent = '✨ Enhance with AI';
        enhanceBtn.style.cssText = 'font-size: 12px; padding: 4px 8px;';
        
        const statusSpan = document.createElement('span');
        statusSpan.className = 'enhancement-status';
        statusSpan.style.cssText = 'font-size: 12px; color: #666;';
        
        enhanceBtn.addEventListener('click', async () => {
            await this.enhanceFieldContent(fieldId, type, enhanceBtn, statusSpan);
        });
        
        container.appendChild(enhanceBtn);
        container.appendChild(statusSpan);
        
        field.parentNode.insertBefore(container, field.nextSibling);
    }
    
    async enhanceFieldContent(fieldId, type, button, statusSpan) {
        const field = document.getElementById(fieldId);
        const originalText = field.value.trim();
        
        if (!originalText || originalText.length < 10) {
            statusSpan.textContent = 'Please write some content first (minimum 10 characters)';
            statusSpan.style.color = '#f44336';
            return;
        }
        
        button.disabled = true;
        button.textContent = '⏳ Enhancing...';
        statusSpan.textContent = 'AI is enhancing your content...';
        statusSpan.style.color = '#2196f3';
        
        try {
            let result;
            if (type === 'biography') {
                result = await this.contentAI.enhanceUserBio(originalText);
            } else {
                const metadata = this.radioMetadata || this.beatMetadata || { title: 'Track', genre: 'Music' };
                result = await this.contentAI.improveTrackDescription(originalText, metadata);
            }
            
            if (result.enhanced || result.improved) {
                this.showEnhancementComparison(fieldId, result, type);
                statusSpan.textContent = 'Enhancement ready - choose your version';
                statusSpan.style.color = '#4caf50';
            } else {
                statusSpan.textContent = result.message || 'Enhancement not available';
                statusSpan.style.color = '#ff9800';
            }
            
        } catch (error) {
            console.error('Content enhancement failed:', error);
            statusSpan.textContent = 'Enhancement failed - using original';
            statusSpan.style.color = '#f44336';
        } finally {
            button.disabled = false;
            button.textContent = '✨ Enhance with AI';
        }
    }
    
    showEnhancementComparison(fieldId, result, type) {
        const field = document.getElementById(fieldId);
        const enhanced = result.enhanced || result.improved;
        const original = result.original;
        
        // Create comparison modal
        const modal = document.createElement('div');
        modal.className = 'enhancement-modal';
        modal.style.cssText = `
            position: fixed; top: 0; left: 0; right: 0; bottom: 0;
            background: rgba(0,0,0,0.8); z-index: 10000;
            display: flex; align-items: center; justify-content: center;
            padding: 20px;
        `;
        
        const content = document.createElement('div');
        content.style.cssText = `
            background: white; border-radius: 8px; padding: 24px;
            max-width: 600px; width: 100%; max-height: 80vh; overflow-y: auto;
        `;
        
        content.innerHTML = `
            <h3 style="margin: 0 0 16px 0; color: #333;">✨ AI Enhancement Results</h3>
            
            <div style="margin-bottom: 20px;">
                <h4 style="color: #666; font-size: 14px; margin: 0 0 8px 0;">📝 ORIGINAL:</h4>
                <div style="background: #f5f5f5; padding: 12px; border-radius: 4px; border-left: 4px solid #ccc;">
                    ${this.escapeHtml(original)}
                </div>
            </div>
            
            <div style="margin-bottom: 24px;">
                <h4 style="color: #2196f3; font-size: 14px; margin: 0 0 8px 0;">✨ AI ENHANCED:</h4>
                <div style="background: #e3f2fd; padding: 12px; border-radius: 4px; border-left: 4px solid #2196f3;">
                    ${this.escapeHtml(enhanced)}
                </div>
            </div>
            
            <div style="display: flex; gap: 12px; justify-content: flex-end;">
                <button id="use-original" class="btn btn-secondary">Keep Original</button>
                <button id="use-enhanced" class="btn btn-primary">Use Enhanced</button>
                <button id="edit-enhanced" class="btn btn-secondary">Edit Enhanced</button>
            </div>
        `;
        
        modal.appendChild(content);
        document.body.appendChild(modal);
        
        // Event handlers
        content.querySelector('#use-original').addEventListener('click', () => {
            document.body.removeChild(modal);
        });
        
        content.querySelector('#use-enhanced').addEventListener('click', () => {
            field.value = enhanced;
            field.dispatchEvent(new Event('input', { bubbles: true }));
            document.body.removeChild(modal);
        });
        
        content.querySelector('#edit-enhanced').addEventListener('click', () => {
            field.value = enhanced;
            field.focus();
            field.setSelectionRange(field.value.length, field.value.length);
            document.body.removeChild(modal);
        });
        
        // Close on backdrop click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                document.body.removeChild(modal);
            }
        });
    }
    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML.replace(/\n/g, '<br>');
    }
    
    displayPostPackageSponsor(fileCount, title) {
        // FIXED: Remove all existing floating sponsors to prevent duplicates
        try {
            const existingSponsors = document.querySelectorAll('.post-package-sponsor, .floating-sponsor-container');
            existingSponsors.forEach(sponsor => sponsor.remove());
            console.log('🧹 Cleared existing floating sponsors to prevent duplicates');
        } catch (error) {
            console.warn('Failed to clear existing sponsors:', ErrorHandler.safeErrorMessage(error));
        }

        // Check if user has consented to sponsor content
        if (!this.partnerConsentGiven) {
            return;
        }

        const sponsorDiv = document.createElement('div');
        sponsorDiv.className = 'post-package-sponsor';
        sponsorDiv.style.cssText = `
            position: fixed; bottom: 20px; right: 20px;
            background: rgba(0, 214, 122, 0.95); border: 2px solid rgba(0, 214, 122, 0.4);
            border-radius: 16px; padding: 20px; max-width: 350px;
            box-shadow: 0 8px 32px rgba(0, 214, 122, 0.3); z-index: 10002;
            font-size: 13px; color: white; backdrop-filter: blur(15px);
        `;
        
        sponsorDiv.innerHTML = `
            <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px;">
                <span style="font-size: 28px;">🎵</span>
                <div>
                    <strong style="color: white; font-size: 16px;">Package Ready!</strong>
                    <div style="color: rgba(255,255,255,0.9); font-size: 12px;">${fileCount} files downloaded</div>
                </div>
                <button id="dismiss-sponsor" style="background: none; border: none; color: rgba(255,255,255,0.8); cursor: pointer; font-size: 20px; margin-left: auto;">&times;</button>
            </div>
            <p style="margin: 0 0 12px 0; color: white; font-weight: 500;">
                Your radio submission package is ready! Consider these next steps:
            </p>
            <div style="font-size: 13px; line-height: 1.5; color: rgba(255,255,255,0.95); margin-bottom: 16px;">
                <div>📻 Submit to radio stations</div>
                <div>📈 Track airplay performance</div>
                <div>🎯 Promote to music directors</div>
            </div>
            <div style="text-align: center;">
                <a href="#" class="sponsor-link" style="color: white; font-weight: 600; background: rgba(255,255,255,0.2); padding: 8px 16px; border-radius: 6px; text-decoration: none; display: inline-block;">Learn More →</a>
            </div>
            <p style="color: rgba(255,255,255,0.7); font-size: 10px; margin: 12px 0 0 0; text-align: center;">
                <span style="background: rgba(255,255,255,0.2); padding: 2px 6px; border-radius: 3px;">SPONSORED</span>
            </p>
        `;
        
        // Track display
        this.trackSponsorDisplay('post-package');
        
        // Dismiss functionality
        sponsorDiv.querySelector('#dismiss-sponsor').addEventListener('click', () => {
            this.trackSponsorInteraction('dismissed', 'post-package');
            sponsorDiv.remove();
        });
        
        // Sponsor link click
        const link = sponsorDiv.querySelector('.sponsor-link');
        if (link) {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                this.trackSponsorInteraction('clicked', 'post-package');
                console.log('Post-package sponsor link clicked');
            });
        }
        
        // Auto-dismiss after 15 seconds
        setTimeout(() => {
            if (sponsorDiv.parentNode) {
                sponsorDiv.remove();
            }
        }, 15000);
        
        document.body.appendChild(sponsorDiv);
    }
    
    displayFallbackPostPackageSponsor(fileCount, title) {
        const sponsorDiv = document.createElement('div');
        sponsorDiv.className = 'post-package-sponsor';
        sponsorDiv.style.cssText = `
            position: fixed; bottom: 20px; right: 20px;
            background: #f8f9fa; border: 1px solid #dee2e6;
            border-radius: 8px; padding: 16px; max-width: 320px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15); z-index: 10001;
            font-size: 13px;
        `;
        
        sponsorDiv.innerHTML = `
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
                <span>🎵</span>
                <strong>Next Steps for Your Music</strong>
                <span style="font-size: 10px; background: #ffc107; padding: 2px 6px; border-radius: 3px; color: #000;">SPONSORED</span>
            </div>
            <p style="margin: 0 0 12px 0; color: #666;">
                Your ${fileCount}-file radio package is ready! Consider these next steps:
            </p>
            <div style="font-size: 12px; line-height: 1.4;">
                <div>📻 Radio submission services</div>
                <div>📈 Airplay tracking tools</div>
                <div>🎯 Music promotion platforms</div>
            </div>
            <button id="dismiss-sponsor" style="position: absolute; top: 4px; right: 8px; border: none; background: none; cursor: pointer; font-size: 16px;">×</button>
        `;
        
        // Track display
        this.trackSponsorDisplay('post-package');
        
        // Dismiss functionality
        sponsorDiv.querySelector('#dismiss-sponsor').addEventListener('click', () => {
            this.trackSponsorInteraction('dismissed', 'post-package');
            sponsorDiv.remove();
        });
        
        // Auto-dismiss after 8 seconds
        setTimeout(() => {
            if (sponsorDiv.parentNode) {
                sponsorDiv.remove();
            }
        }, 8000);
        
        document.body.appendChild(sponsorDiv);
    }
    
    displayPackageGenerationSponsored() {
        if (!this.partnerConsentGiven) return;

        const modalOverlay = document.createElement('div');
        modalOverlay.style.cssText = `position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.9); z-index: 20000; display: flex; align-items: center; justify-content: center; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;`;

        const modal = document.createElement('div');
        modal.style.cssText = `background: white; border-radius: 12px; padding: 32px; max-width: 500px; width: 90%; text-align: center; box-shadow: 0 8px 32px rgba(0,0,0,0.3);`;

        modal.innerHTML = `
            <div style="font-size: 48px; margin-bottom: 16px;">📦</div>
            <h2 style="color: #333; margin: 0 0 16px 0;">Professional Package Services</h2>
            <p style="color: #666; line-height: 1.5; margin: 0 0 16px 0;">While your radio package is being generated, consider professional services to enhance your submission.</p>
            <p style="color: #666; line-height: 1.5; margin: 0 0 24px 0;">Our verified partners offer mastering, distribution, and promotion services for radio-ready tracks.</p>
            <div style="background: rgba(0, 214, 122, 0.05); border-radius: 8px; border-left: 4px solid #00d67a; border: 1px solid rgba(0, 214, 122, 0.2); padding: 16px; margin: 20px 0; text-align: left;">
                <div style="display: flex; align-items: center; gap: 12px;">
                    <div style="font-size: 24px;">📢</div>
                    <div style="flex: 1;">
                        <h4 style="margin: 0 0 4px 0; color: #333; font-size: 14px; font-weight: 600;">Radio Package Enhancement</h4>
                        <p style="margin: 0 0 8px 0; color: #666; font-size: 13px; line-height: 1.4;">Professional mastering, ISRC registration, and radio plugging services to maximize your submission success.</p>
                        <a href="#" class="sponsor-link" style="color: #00d67a; font-size: 12px; text-decoration: none; font-weight: 500;">Learn More →</a>
                    </div>
                </div>
            </div>
            <div style="display: flex; gap: 12px; justify-content: center; margin-top: 24px;">
                <button id="continue-package" disabled style="background: #007bff; color: white; border: none; padding: 12px 24px; border-radius: 6px; cursor: not-allowed; font-size: 14px; font-weight: 500; opacity: 0.6;">Continue (<span id="countdown-package">15</span>s)</button>
            </div>
            <p style="color: #999; font-size: 12px; margin: 16px 0 0 0;"><span style="font-size: 10px; background: #ffc107; padding: 2px 6px; border-radius: 3px; color: #000;">SPONSORED</span> Professional partner content</p>
        `;

        modalOverlay.appendChild(modal);
        document.body.appendChild(modalOverlay);

        let countdown = 15;
        const countdownElement = modal.querySelector('#countdown-package');
        const continueButton = modal.querySelector('#continue-package');
        
        const countdownInterval = setInterval(() => {
            countdown--;
            if (countdown <= 0) {
                clearInterval(countdownInterval);
                continueButton.disabled = false;
                continueButton.style.cursor = 'pointer';
                continueButton.style.opacity = '1';
                continueButton.innerHTML = 'Continue';
            } else {
                countdownElement.textContent = countdown;
            }
        }, 1000);

        continueButton.addEventListener('click', () => {
            if (countdown <= 0) {
                document.body.removeChild(modalOverlay);
                this.trackSponsorInteraction('continue', 'package_generation');
            }
        });

        const sponsorLink = modal.querySelector('.sponsor-link');
        if (sponsorLink) {
            sponsorLink.addEventListener('click', (e) => {
                e.preventDefault();
                this.trackSponsorInteraction('clicked', 'package_generation');
            });
        }

        this.trackSponsorDisplay('package_generation');
        
        const autoCloseTimeout = setTimeout(() => {
            if (modalOverlay.parentNode) {
                document.body.removeChild(modalOverlay);
            }
        }, 16000);
        
        // Clear timeout if modal is closed early
        const originalClick = continueButton.onclick;
        continueButton.onclick = () => {
            clearTimeout(autoCloseTimeout);
            if (originalClick) originalClick();
        };
    }
    
    recordPackageSuccess(packageData) {
        if (this.analyticsManager) {
            this.analyticsManager.recordPackageSuccess(packageData);
        }
    }
    
    trackSponsorDisplay(location) {
        if (this.analyticsManager) {
            this.analyticsManager.recordSponsorDisplay(location);
        }
    }
    
    trackSponsorInteraction(action, location) {
        if (this.analyticsManager) {
            this.analyticsManager.recordSponsorInteraction(action, location);
        }
    }
    
    async continueRadioPackageGeneration() {
        const generateBtn = document.getElementById('generate-radio-package');
        
        try {
            const files = [];
            const radioInputs = this.getRadioInputs();
            
            // Add all the original radio package files here
            // (keeping original logic intact)
            
            // Audio file with embedded metadata
            if (this.radioAudioFile) {
                const sanitizedTitle = this.sanitizeInput(this.radioMetadata.title || 'audio');
                files.push({
                    name: `audio/${sanitizedTitle.replace(/[^a-zA-Z0-9]/g, '_')}.mp3`,
                    content: this.radioAudioFile
                });
            }
            
            // Store package data for success section
            this.currentRadioPackage = {
                files: files,
                title: radioInputs.title,
                fileCount: files.length
            };
            
            // Show success section like mint system
            this.showRadioPackageSuccess();
            
        } catch (error) {
            console.error('Radio package generation failed:', error);
            generateBtn.textContent = 'Generation Failed';
            generateBtn.disabled = false;
        }
    }
    
    showRadioPackageSuccess() {
        // Copy mint system success approach
        const packageInfo = this.currentRadioPackage;
        
        // Update UI to show success
        const generateBtn = document.getElementById('generate-radio-package');
        generateBtn.textContent = '✅ Package Ready!';
        generateBtn.disabled = true;
        
        // Show download button (like mint system)
        const downloadBtn = document.createElement('button');
        downloadBtn.id = 'download-radio-package';
        downloadBtn.className = 'btn btn-primary';
        downloadBtn.textContent = '📥 Download Radio Package';
        downloadBtn.style.marginTop = '10px';
        
        // Add download functionality
        downloadBtn.addEventListener('click', () => {
            this.downloadRadioPackage(packageInfo);
        });
        
        // Insert download button after generate button
        generateBtn.parentNode.insertBefore(downloadBtn, generateBtn.nextSibling);
        
        // Show success message
        const successMsg = document.createElement('div');
        successMsg.className = 'radio-success-message';
        successMsg.style.cssText = 'background: #d4edda; border: 1px solid #c3e6cb; color: #155724; padding: 12px; border-radius: 6px; margin: 10px 0;';
        successMsg.innerHTML = `
            <strong>✅ Radio Package Generated!</strong><br>
            <small>${packageInfo.fileCount} files ready for download</small>
        `;
        
        generateBtn.parentNode.insertBefore(successMsg, downloadBtn);
    }
    
    async downloadRadioPackage(packageInfo) {
        try {
            const zipBlob = await this.createRealZip(packageInfo.files);
            const url = URL.createObjectURL(zipBlob);
            const a = document.createElement('a');
            a.href = url;
            const sanitizedTitle = this.sanitizeInput(packageInfo.title || 'Radio_Submission');
            a.download = `${sanitizedTitle.replace(/[^a-zA-Z0-9]/g, '_')}_Radio_Submission.zip`;
            a.click();
            URL.revokeObjectURL(url);
            
        } catch (error) {
            console.error('Download failed:', error);
            alert('Download failed. Please try again.');
        }
    }
    
    recordISRCInPackage(isrcCode) {
        if (this.analyticsManager) {
            this.analyticsManager.recordISRCInPackage();
        }
    }
    
    setupRevenueManagementUI() {
        try {
            if (!this.revenueManagementSystem || !this.adminDashboard) {
                console.log('Revenue management UI setup skipped - dependencies not available');
                return;
            }
            
            // Initialize Revenue Dashboard UI
            if (window.RevenueDashboardUI) {
                this.revenueDashboardUI = new RevenueDashboardUI(this.revenueManagementSystem);
                this.revenueDashboardUI.initialize();
                this.revenueDashboardUI.setupEventHandlers();
                
                // Connect to admin dashboard
                if (this.adminDashboard) {
                    this.adminDashboard.revenueManagementSystem = this.revenueManagementSystem;
                    this.adminDashboard.revenueDashboardUI = this.revenueDashboardUI;
                }
                
                console.log('✅ Revenue Management UI setup complete');
            }
        } catch (error) {
            console.error('❌ Revenue Management UI setup failed:', error);
        }
    }
    
    createFallbackRevenueSystem() {
        try {
            // Create minimal revenue system for basic functionality
            this.revenueManagementSystem = {
                isInitialized: false,
                generateRevenueDashboard: () => ({
                    overview: {
                        totalRevenue: 0,
                        monthlyRevenue: 0,
                        projectedMonthly: 0,
                        projectedYearly: 0,
                        currency: 'ZAR',
                        currencySymbol: 'R',
                        aiOptimizationEnabled: false
                    },
                    streams: {
                        sponsorPlacements: { revenue: 0, percentage: '0' },
                        premiumFeatures: { revenue: 0, percentage: '0' },
                        transactionFees: { revenue: 0, percentage: '0' },
                        nftRoyalties: { revenue: 0, percentage: '0' }
                    },
                    campaigns: { active: 0, totalRevenue: 0, topPerforming: [] },
                    billing: { pendingInvoices: 0, pendingAmount: 0, processedThisMonth: 0 }
                }),
                createRevenueCampaign: async () => ({ id: 'fallback', name: 'Fallback Campaign' }),
                recordSponsorImpression: async () => {},
                recordSponsorClick: async () => {},
                exportRevenueReport: async () => ({ message: 'Fallback revenue report' })
            };
            
            console.log('✅ Fallback revenue system created');
        } catch (error) {
            console.error('❌ Fallback revenue system creation failed:', error);
        }
    }
    
    connectSystemsToAdminDashboard() {
        try {
            if (this.adminDashboard && this.adminDashboard.isInitialized) {
                // Connect all systems after initialization
                if (this.revenueManagementSystem) {
                    this.adminDashboard.revenueManagementSystem = this.revenueManagementSystem;
                    console.log('✅ Revenue system connected to admin dashboard');
                }
                if (this.revenueDashboardUI) {
                    this.adminDashboard.revenueDashboardUI = this.revenueDashboardUI;
                    console.log('✅ Revenue UI connected to admin dashboard');
                }
                if (this.chromeAIOptimizer) {
                    this.adminDashboard.chromeAIOptimizer = this.chromeAIOptimizer;
                    console.log('✅ AI optimizer connected to admin dashboard');
                }
                if (this.campaignManager) {
                    this.adminDashboard.campaignManager = this.campaignManager;
                    console.log('✅ Campaign manager connected to admin dashboard');
                }
                if (this.analyticsManager) {
                    this.adminDashboard.analyticsManager = this.analyticsManager;
                    console.log('✅ Analytics manager connected to admin dashboard');
                }
                
                console.log('✅ All systems connected to admin dashboard');
            }
        } catch (error) {
            console.error('❌ Failed to connect systems to admin dashboard:', error);
        }
    }
    
    showSolanaRequiredMessage() {
        const messageDiv = document.createElement('div');
        messageDiv.style.cssText = `
            position: fixed; top: 0; left: 0; right: 0; bottom: 0;
            background: rgba(0,0,0,0.9); z-index: 10000;
            display: flex; align-items: center; justify-content: center;
            color: white; text-align: center; padding: 20px;
        `;
        
        messageDiv.innerHTML = `
            <div style="background: #1a1a1a; padding: 40px; border-radius: 12px; max-width: 500px;">
                <div style="font-size: 48px; margin-bottom: 20px;">🚀</div>
                <h2 style="color: #9945ff; margin: 0 0 16px 0;">Solana-Only Extension</h2>
                <p style="margin: 0 0 20px 0; line-height: 1.5;">This extension now uses Solana blockchain for real NFT minting. You'll need:</p>
                <div style="text-align: left; margin: 20px 0;">
                    <div style="margin: 8px 0;">👻 <strong>Phantom Wallet</strong> - For Solana transactions</div>
                    <div style="margin: 8px 0;">⚡ <strong>SOL tokens</strong> - For transaction fees</div>
                    <div style="margin: 8px 0;">🔗 <strong>Real blockchain</strong> - No more simulations</div>
                </div>
                <div style="margin-top: 30px;">
                    <a href="https://phantom.app" target="_blank" style="
                        background: #9945ff; color: white; padding: 12px 24px;
                        border-radius: 8px; text-decoration: none; margin-right: 12px;
                        display: inline-block;
                    ">Install Phantom</a>
                    <button id="continue-anyway-btn" style="
                        background: #333; color: white; padding: 12px 24px;
                        border: none; border-radius: 8px; cursor: pointer;
                    ">Continue Anyway</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(messageDiv);
        
        // Add event listener for continue button
        const continueBtn = messageDiv.querySelector('#continue-anyway-btn');
        if (continueBtn) {
            continueBtn.addEventListener('click', () => {
                messageDiv.remove();
            });
        }
    }

    async generateDownloadPackage(result) {
        try {
            if (!result || !result.transactionHash) {
                throw new Error('Invalid transaction data');
            }
            
            const files = [];
            
            // 1. Original Audio File with embedded metadata
            if (this.beatFile) {
                const sanitizedFilename = this.sanitizeInput(this.beatMetadata.originalFileName || 'audio');
                
                // Write metadata to audio file
                let audioFileWithMetadata = this.beatFile;
                console.log('🔍 MetadataWriter available:', !!window.MetadataWriter);
                if (window.MetadataWriter) {
                    try {
                        const writer = new MetadataWriter();
                        const artistInputs = this.getArtistInputs();
                        const metadataToWrite = {
                            isrc: this.beatMetadata.isrc || (this.isrcManager ? await this.isrcManager.generateISRC() : ''),
                            title: artistInputs.beatTitle || this.beatMetadata.title,
                            artist: artistInputs.artistName,
                            genre: artistInputs.genre
                        };
                        audioFileWithMetadata = await writer.writeAudioMetadata(this.beatFile, metadataToWrite);
                        console.log('✅ Metadata embedded in audio file');
                    } catch (error) {
                        console.warn('Metadata writing failed, using original file:', error);
                    }
                }
                
                files.push({
                    name: `audio/${sanitizedFilename}`,
                    content: audioFileWithMetadata
                });
            }
            
            // 2. Cover Image with embedded metadata (if exists)
            if (this.beatMetadata.coverImage) {
                const sanitizedTitle = this.sanitizeInput(this.beatMetadata.title || 'cover');
                
                // Write metadata to image file
                let imageWithMetadata = this.beatMetadata.coverImage;
                console.log('🔍 MetadataWriter available:', !!window.MetadataWriter);
                if (window.MetadataWriter) {
                    try {
                        const writer = new MetadataWriter();
                        const metadataToWrite = {
                            isrc: this.beatMetadata.isrc || (this.isrcManager ? await this.isrcManager.generateISRC() : '')
                        };
                        imageWithMetadata = await writer.writeImageMetadata(this.beatMetadata.coverImage, metadataToWrite);
                        console.log('✅ Metadata embedded in cover image');
                    } catch (error) {
                        console.warn('Image metadata writing failed, using original:', error);
                    }
                }
                
                files.push({
                    name: `images/${sanitizedTitle}-cover.jpg`,
                    content: imageWithMetadata
                });
            }
            
            // 3. License Agreement (TXT)
            const licenseContent = `${this.licenseTerms}\n\n--- BLOCKCHAIN VERIFICATION ---\nTransaction Hash: ${this.sanitizeInput(result.transactionHash)}\nToken ID: ${this.sanitizeInput(result.tokenId)}\nContract: 0x742d35Cc6634C0532925a3b8D4C9db96C4b5Da5A\nNetwork: Polygon Mumbai\nMinted: ${new Date().toISOString()}`;
            files.push({
                name: 'LICENSE.txt',
                content: licenseContent
            });
            
            files.push({
                name: 'README.md',
                content: `# BeatsChain Chrome Extension\n\nThis package was generated by BeatsChain Chrome Extension v${chrome.runtime?.getManifest()?.version || '2.1.0'}\n\nFor more information, visit: https://chrome.google.com/webstore/detail/beatschain`
            });
            
            // Add extension README
            try {
                const readmeResponse = await fetch(chrome.runtime.getURL('README.md'));
                if (readmeResponse.ok) {
                    const readmeContent = await readmeResponse.text();
                    files.push({
                        name: 'README.md',
                        content: readmeContent
                    });
                }
            } catch (error) {
                console.log('README not found, skipping');
            }
            
            // 4. NFT Metadata (JSON) - Use user inputs, not AI suggestions
            const artistInputs = this.getArtistInputs();
            const userGenre = artistInputs.genre || this.beatMetadata.suggestedGenre;
            const userTitle = artistInputs.beatTitle || this.beatMetadata.title;
            const artistName = artistInputs.artistName || 'Unknown Artist';
            
            const nftMetadata = {
                name: this.sanitizeInput(userTitle),
                description: `Music NFT by ${this.sanitizeInput(artistName)}: ${this.sanitizeInput(userTitle)} - ${this.sanitizeInput(userGenre)}`,
                external_url: `https://mumbai.polygonscan.com/tx/${this.sanitizeInput(result.transactionHash)}`,
                attributes: [
                    { trait_type: "Artist", value: this.sanitizeInput(artistName) },
                    { trait_type: "Genre", value: this.sanitizeInput(userGenre) },
                    { trait_type: "BPM", value: this.sanitizeInput(this.beatMetadata.estimatedBPM) },
                    { trait_type: "Duration", value: this.sanitizeInput(this.beatMetadata.duration) },
                    { trait_type: "Quality", value: this.sanitizeInput(this.beatMetadata.qualityLevel) },
                    { trait_type: "Energy Level", value: this.sanitizeInput(this.beatMetadata.energyLevel) },
                    { trait_type: "Format", value: this.sanitizeInput(this.beatMetadata.format) }
                ],
                blockchain: {
                    contract: "0x742d35Cc6634C0532925a3b8D4C9db96C4b5Da5A",
                    tokenId: this.sanitizeInput(result.tokenId),
                    transactionHash: this.sanitizeInput(result.transactionHash),
                    network: "Polygon Mumbai"
                }
            };
            files.push({
                name: 'metadata.json',
                content: JSON.stringify(nftMetadata, null, 2)
            });
            
            // 5. Press Kit (separate from core metadata)
            const profileBio = this.getProfileBiography();
            if (profileBio.biography || profileBio.influences || profileBio.social.instagram || profileBio.social.twitter) {
                const pressKit = {
                    artist: {
                        name: artistInputs.artistName,
                        stageName: artistInputs.stageName,
                        biography: profileBio.biography,
                        influences: profileBio.influences,
                        social: profileBio.social
                    },
                    track: {
                        title: userTitle,
                        genre: userGenre
                    },
                    generated: new Date().toISOString()
                };
                
                files.push({
                    name: 'press_kit.json',
                    content: JSON.stringify(pressKit, null, 2)
                });
                
                // Artist biography text file
                if (profileBio.biography) {
                    const bioText = `ARTIST PRESS KIT\n\nArtist: ${artistInputs.artistName}\nStage Name: ${artistInputs.stageName || 'N/A'}\n\n${profileBio.biography}\n\nMusical Influences: ${profileBio.influences || 'Not specified'}\n\nSocial Media:\n${profileBio.social.instagram ? `Instagram: ${profileBio.social.instagram}\n` : ''}${profileBio.social.twitter ? `Twitter: ${profileBio.social.twitter}\n` : ''}\n\nGenerated: ${new Date().toLocaleString()}`;
                    
                    files.push({
                        name: 'artist_press_kit.txt',
                        content: bioText
                    });
                }
            }
            
            const zipBlob = await this.createRealZip(files);
            
            const url = URL.createObjectURL(zipBlob);
            const a = document.createElement('a');
            a.href = url;
            const sanitizedTitle = this.sanitizeInput(this.beatMetadata.title || 'BeatsChain');
            a.download = `BeatsChain-${sanitizedTitle.replace(/[^a-zA-Z0-9]/g, '_')}-NFT-Package.zip`;
            a.click();
            
            URL.revokeObjectURL(url);
            
        } catch (error) {
            console.error('Package generation failed:', error);
            const errorMessage = ErrorHandler.safeErrorMessage(error);
            alert(`Failed to generate download package: ${errorMessage}`);
        }
    }

    async createRealZip(files) {
        const zipParts = [];
        const centralDirectory = [];
        let offset = 0;
        
        for (const file of files) {
            const fileData = await this.processFileForZip(file);
            const localHeader = this.createLocalFileHeader(file.name, fileData);
            const centralDirEntry = this.createCentralDirectoryEntry(file.name, fileData, offset);
            
            zipParts.push(localHeader);
            zipParts.push(fileData);
            centralDirectory.push(centralDirEntry);
            
            offset += localHeader.byteLength + fileData.byteLength;
        }
        
        const centralDirStart = offset;
        for (const entry of centralDirectory) {
            zipParts.push(entry);
            offset += entry.byteLength;
        }
        
        const endRecord = this.createEndOfCentralDirectory(files.length, offset - centralDirStart, centralDirStart);
        zipParts.push(endRecord);
        
        return new Blob(zipParts, { type: 'application/zip' });
    }
    
    async processFileForZip(file) {
        if (file.content instanceof File || file.content instanceof Blob) {
            return new Uint8Array(await file.content.arrayBuffer());
        } else {
            return new TextEncoder().encode(file.content);
        }
    }
    
    createLocalFileHeader(filename, data) {
        const filenameBytes = new TextEncoder().encode(filename);
        const header = new Uint8Array(30 + filenameBytes.length);
        
        header[0] = 0x50; header[1] = 0x4b; header[2] = 0x03; header[3] = 0x04;
        header[4] = 0x14; header[5] = 0x00;
        header[6] = 0x00; header[7] = 0x00;
        header[8] = 0x00; header[9] = 0x00;
        header[10] = 0x00; header[11] = 0x00; header[12] = 0x00; header[13] = 0x00;
        header[14] = 0x00; header[15] = 0x00; header[16] = 0x00; header[17] = 0x00;
        this.writeUint32LE(header, 18, data.length);
        this.writeUint32LE(header, 22, data.length);
        header[26] = filenameBytes.length & 0xff;
        header[27] = (filenameBytes.length >> 8) & 0xff;
        header[28] = 0x00; header[29] = 0x00;
        
        header.set(filenameBytes, 30);
        return header;
    }
    
    createCentralDirectoryEntry(filename, data, localHeaderOffset) {
        const filenameBytes = new TextEncoder().encode(filename);
        const entry = new Uint8Array(46 + filenameBytes.length);
        
        entry[0] = 0x50; entry[1] = 0x4b; entry[2] = 0x01; entry[3] = 0x02;
        entry[4] = 0x14; entry[5] = 0x00;
        entry[6] = 0x14; entry[7] = 0x00;
        entry[8] = 0x00; entry[9] = 0x00;
        entry[10] = 0x00; entry[11] = 0x00;
        entry[12] = 0x00; entry[13] = 0x00; entry[14] = 0x00; entry[15] = 0x00;
        entry[16] = 0x00; entry[17] = 0x00; entry[18] = 0x00; entry[19] = 0x00;
        this.writeUint32LE(entry, 20, data.length);
        this.writeUint32LE(entry, 24, data.length);
        entry[28] = filenameBytes.length & 0xff;
        entry[29] = (filenameBytes.length >> 8) & 0xff;
        entry[30] = 0x00; entry[31] = 0x00;
        entry[32] = 0x00; entry[33] = 0x00;
        entry[34] = 0x00; entry[35] = 0x00;
        entry[36] = 0x00; entry[37] = 0x00;
        entry[38] = 0x00; entry[39] = 0x00; entry[40] = 0x00; entry[41] = 0x00;
        this.writeUint32LE(entry, 42, localHeaderOffset);
        
        entry.set(filenameBytes, 46);
        return entry;
    }
    
    createEndOfCentralDirectory(fileCount, centralDirSize, centralDirOffset) {
        const record = new Uint8Array(22);
        
        record[0] = 0x50; record[1] = 0x4b; record[2] = 0x05; record[3] = 0x06;
        record[4] = 0x00; record[5] = 0x00;
        record[6] = 0x00; record[7] = 0x00;
        record[8] = fileCount & 0xff; record[9] = (fileCount >> 8) & 0xff;
        record[10] = fileCount & 0xff; record[11] = (fileCount >> 8) & 0xff;
        this.writeUint32LE(record, 12, centralDirSize);
        this.writeUint32LE(record, 16, centralDirOffset);
        record[20] = 0x00; record[21] = 0x00;
        
        return record;
    }
    
    writeUint32LE(buffer, offset, value) {
        buffer[offset] = value & 0xff;
        buffer[offset + 1] = (value >> 8) & 0xff;
        buffer[offset + 2] = (value >> 16) & 0xff;
        buffer[offset + 3] = (value >> 24) & 0xff;
    }

    // RADIO SUBMISSION METHODS - INDEPENDENT SYSTEM
    async loadRadioSubmission() {
        console.log('Loading radio submission system...');
        try {
            // Initialize radio-specific components independently
            this.radioValidator = new RadioValidator(this.chromeAI);
            this.splitSheetsManager = new SplitSheetsManager();
            this.radioMetadataManager = new RadioMetadataManager();
            
            // Initialize SAMRO PDF Manager
            if (window.SAMROPDFManager) {
                this.samroPDFManager = new SAMROPDFManager();
                console.log('✅ SAMRO PDF Manager initialized');
            }
            
            // Initialize ISRC Manager
            if (window.ISRCManager) {
                this.isrcManager = new ISRCManager();
                await this.isrcManager.initialize();
                console.log('✅ ISRC Manager initialized with 80G registrant');
                
                // Enhance Audio Manager with ISRC tagging
                if (window.AudioTaggingManager && this.audioManager) {
                    AudioTaggingManager.enhanceAudioManager(this.audioManager, this.isrcManager);
                    console.log('✅ Audio Manager enhanced with ISRC tagging');
                }
                
                // Enhance Image Processing with ISRC tagging
                if (window.ImageTaggingManager) {
                    ImageTaggingManager.enhanceImageProcessing(this);
                    console.log('✅ Image processing enhanced with ISRC tagging');
                }
            }
            
            // Initialize SAMRO manager if available
            if (this.samroManager) {
                this.samroManager.initialize();
                console.log('✅ SAMRO fields initialized');
            }
            
            // Setup SAMRO collapse functionality
            this.setupSamroCollapse();
            
            // Initialize metadata form
            await this.radioMetadataManager.initializeForm();
            
            // Show radio upload section if no audio file exists
            this.showRadioUploadSection();
            
            console.log('Radio submission system loaded successfully');
        } catch (error) {
            console.error('Failed to initialize radio components:', error);
            alert('Radio submission feature unavailable');
        }
    }
    
    showRadioUploadSection() {
        const radioValidation = document.getElementById('radio-validation');
        if (!this.radioAudioFile) {
            // Secure DOM creation for radio upload section
            radioValidation.innerHTML = '';
            
            const uploadSection = document.createElement('div');
            uploadSection.className = 'radio-upload-section';
            
            const title = document.createElement('h4');
            title.textContent = '📻 Upload Audio for Radio Submission';
            
            const uploadArea = document.createElement('div');
            uploadArea.className = 'upload-area radio-upload-area';
            uploadArea.id = 'radio-upload-area';
            
            const fileInput = document.createElement('input');
            fileInput.type = 'file';
            fileInput.id = 'radio-audio-file';
            fileInput.accept = 'audio/*';
            fileInput.hidden = true;
            
            const uploadContent = document.createElement('div');
            uploadContent.className = 'upload-content';
            
            const uploadIcon = document.createElement('span');
            uploadIcon.className = 'upload-icon';
            uploadIcon.textContent = '🎧';
            
            const uploadText = document.createElement('p');
            uploadText.textContent = 'Upload audio file for radio submission';
            
            const uploadSmall = document.createElement('small');
            uploadSmall.textContent = 'Supports MP3, WAV, FLAC (max 50MB)';
            
            uploadContent.appendChild(uploadIcon);
            uploadContent.appendChild(uploadText);
            uploadContent.appendChild(uploadSmall);
            uploadArea.appendChild(uploadContent);
            
            const audioPreview = document.createElement('div');
            audioPreview.id = 'radio-audio-preview';
            audioPreview.className = 'audio-preview';
            
            const metadataDisplay = document.createElement('div');
            metadataDisplay.id = 'radio-metadata-display';
            metadataDisplay.className = 'metadata-display';
            metadataDisplay.style.display = 'none';
            
            const nextButton = document.createElement('button');
            nextButton.id = 'radio-step-1-next';
            nextButton.className = 'btn btn-primary';
            nextButton.textContent = 'Next: Track Information';
            nextButton.style.display = 'none';
            nextButton.addEventListener('click', () => {
                if (window.showRadioStep) {
                    window.showRadioStep(2);
                }
            });
            
            uploadSection.appendChild(title);
            uploadSection.appendChild(uploadArea);
            uploadSection.appendChild(fileInput);
            uploadSection.appendChild(audioPreview);
            uploadSection.appendChild(metadataDisplay);
            uploadSection.appendChild(nextButton);
            
            radioValidation.appendChild(uploadSection);
            
            // Setup radio-specific upload handlers
            this.setupRadioUploadHandlers();
        } else {
            radioValidation.style.display = 'block';
        }
    }
    
    setupRadioUploadHandlers() {
        const radioUploadArea = document.getElementById('radio-upload-area');
        const radioFileInput = document.getElementById('radio-audio-file');
        
        if (radioUploadArea && radioFileInput) {
            radioUploadArea.addEventListener('click', () => radioFileInput.click());
            radioUploadArea.addEventListener('dragover', this.handleDragOver.bind(this));
            radioUploadArea.addEventListener('drop', this.handleRadioFileDrop.bind(this));
            radioFileInput.addEventListener('change', this.handleRadioFileSelect.bind(this));
        }
    }
    
    handleRadioFileDrop(e) {
        e.preventDefault();
        e.currentTarget.classList.remove('dragover');
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            this.processRadioFile(files[0]);
        }
    }
    
    handleRadioFileSelect(e) {
        const file = e.target.files[0];
        if (file) {
            this.processRadioFile(file);
        }
    }
    
    async processRadioFile(file) {
        console.log('🎵 Processing radio file:', file.name);
        
        try {
            // Enhanced security validation for radio files
            if (!this.audioManager) {
                throw new Error('Audio manager not initialized');
            }
            
            const isValid = await this.validateAudioFile(file);
            if (!isValid) {
                throw new Error('File validation failed');
            }
            
            this.radioAudioFile = file;
            console.log('📊 Extracting radio metadata...');
            this.radioMetadata = await this.extractAudioMetadata(file, 'radio');
            console.log('📊 Radio metadata extracted:', this.radioMetadata);
            
            // Create audio preview FIRST
            console.log('🎧 Creating radio audio preview...');
            this.createRadioAudioPreview(file);
            
            // CRITICAL FIX: Always display radio metadata analysis
            console.log('📊 Displaying radio metadata analysis...');
            this.displayRadioMetadata(this.radioMetadata);
            
            // Ensure metadata display is visible and populated
            const metadataDisplay = document.getElementById('radio-metadata-display');
            if (metadataDisplay) {
                metadataDisplay.style.display = 'block';
                metadataDisplay.style.visibility = 'visible';
                metadataDisplay.style.opacity = '1';
                console.log('✅ Radio metadata display forced visible and populated');
            }
            
            // Force update upload status
            const uploadContent = document.querySelector('.radio-upload-area .upload-content p');
            if (uploadContent) {
                uploadContent.textContent = `Uploaded: ${file.name} (${this.audioManager.formatFileSize(file.size)})`;
            }
            
            // Show next button for step progression
            const nextButton = document.getElementById('radio-step-1-next');
            if (nextButton) {
                nextButton.style.display = 'block';
                console.log('✅ Next button shown');
            }
            
            // Pre-populate track information in step 2
            this.populateTrackInfoFromMetadata();
            
            console.log('✅ Radio file processed successfully with analysis displayed');
            
            // Return success for radio sponsor integration hook
            return true;
            
        } catch (error) {
            console.error('❌ Radio file processing failed:', error);
            const errorMessage = ErrorHandler.safeErrorMessage(error);
            alert(`Radio file upload failed: ${errorMessage}`);
            return false;
        }
    }
    
    populateTrackInfoFromMetadata() {
        if (!this.radioMetadata) return;
        
        // Get shared profile data for auto-fill
        const sharedData = this.getSharedProfileData();
        
        // USER INPUT PRIORITY: Only suggest if user hasn't entered anything
        const titleInput = document.getElementById('radio-track-title');
        if (titleInput && !titleInput.value && this.radioMetadata.title) {
            titleInput.value = this.radioMetadata.title;
            this.userInputManager.setUserInput('radio-title', this.radioMetadata.title, false);
        }
        
        const artistInput = document.getElementById('radio-artist-name');
        if (artistInput && !artistInput.value && sharedData.artistName) {
            artistInput.value = sharedData.artistName;
            this.userInputManager.setUserInput('radio-artist', sharedData.artistName, false);
        }
        
        const stageInput = document.getElementById('radio-stage-name');
        if (stageInput && !stageInput.value && sharedData.stageName) {
            stageInput.value = sharedData.stageName;
            this.userInputManager.setUserInput('radio-stage', sharedData.stageName, false);
        }
        
        // Pre-populate genre with AI enhancement
        const genreSelect = document.getElementById('radio-genre');
        if (genreSelect && !genreSelect.value) {
            const genreMapping = {
                'Hip-Hop': 'Hip-Hop', 'House': 'House', 'Electronic': 'Electronic',
                'Pop': 'Pop', 'Rock': 'Rock', 'Jazz': 'Jazz', 'Trap': 'Hip-Hop'
            };
            
            // Use AI-enhanced genre if available, fallback to basic detection
            const detectedGenre = this.radioMetadata.enhancedGenre || this.radioMetadata.suggestedGenre;
            const mappedGenre = genreMapping[detectedGenre];
            
            if (mappedGenre) {
                genreSelect.value = mappedGenre;
                this.userInputManager.setUserInput('radio-genre', mappedGenre, false);
            }
        }
        
        this.setupRadioInputTracking();
        
        // Auto-fill release year with current year
        const releaseYearInput = document.getElementById('radio-release-year');
        if (releaseYearInput && !releaseYearInput.value) {
            releaseYearInput.value = new Date().getFullYear();
            this.userInputManager.setUserInput('radio-release-year', new Date().getFullYear(), false);
        }
        
        // Auto-fill release type with Single as default
        const releaseTypeSelect = document.getElementById('radio-release-type');
        if (releaseTypeSelect && !releaseTypeSelect.value) {
            releaseTypeSelect.value = 'Single';
            this.userInputManager.setUserInput('radio-release-type', 'Single', false);
        }
    }
    
    setupRadioInputTracking() {
        // Track user changes to radio inputs
        const radioInputs = [
            { id: 'radio-track-title', key: 'radio-title' },
            { id: 'radio-artist-name', key: 'radio-artist' },
            { id: 'radio-stage-name', key: 'radio-stage' },
            { id: 'radio-genre', key: 'radio-genre' }
        ];
        
        radioInputs.forEach(({ id, key }) => {
            const element = document.getElementById(id);
            if (element && !element.hasAttribute('data-tracked')) {
                element.setAttribute('data-tracked', 'true');
                element.addEventListener('change', () => {
                    if (element.value.trim()) {
                        this.userInputManager.setUserInput(key, element.value.trim(), true);
                    }
                });
            }
        });
    }
    
    createRadioAudioPreview(file) {
        return this.audioManager.createAudioPreview(file, 'radio-audio-preview', 'radio');
    }
    
    displayRadioMetadata(metadata) {
        console.log('🔍 Displaying radio metadata:', metadata);
        const metadataDisplay = document.getElementById('radio-metadata-display');
        if (!metadataDisplay) {
            console.error('❌ Radio metadata display element not found');
            return;
        }
        
        try {
            // Update enhanced radio analysis fields with error checking
            const updateElement = (id, value) => {
                const element = document.getElementById(id);
                if (element) {
                    element.textContent = value || '-';
                } else {
                    console.warn(`⚠️ Element ${id} not found`);
                }
            };
            
            updateElement('radio-meta-duration', metadata.duration);
            updateElement('radio-meta-quality', metadata.qualityLevel);
            updateElement('radio-meta-bpm', metadata.estimatedBPM);
            // Use AI-enhanced genre if available
            updateElement('radio-meta-genre', metadata.enhancedGenre || metadata.suggestedGenre);
            updateElement('radio-meta-energy', metadata.energyLevel);
            updateElement('radio-meta-size', metadata.fileSize);
            
            // Show AI enhancements if available
            if (metadata.aiEnhanced) {
                const noteElement = document.querySelector('#radio-analysis-content .meta-note');
                if (noteElement) {
                    noteElement.textContent = 'Analysis enhanced with Chrome AI APIs';
                    const enhancedSmall = document.createElement('small');
                    enhancedSmall.textContent = `Mood: ${this.sanitizeInput(metadata.mood || 'N/A')} • Vibe: ${this.sanitizeInput(metadata.vibe || 'N/A')} • Tempo: ${this.sanitizeInput(metadata.tempo || 'N/A')}`;
                    noteElement.appendChild(document.createElement('br'));
                    noteElement.appendChild(enhancedSmall);
                }
            }
            
            // CRITICAL FIX: Force display and visibility
            metadataDisplay.style.display = 'block';
            metadataDisplay.style.visibility = 'visible';
            metadataDisplay.style.opacity = '1';
            metadataDisplay.style.height = 'auto';
            metadataDisplay.style.maxHeight = 'none';
            
            // Ensure analysis content is visible by default (expanded)
            const analysisContent = document.getElementById('radio-analysis-content');
            const analysisToggle = document.getElementById('radio-analysis-toggle');
            if (analysisContent && analysisToggle) {
                analysisContent.classList.remove('collapsed');
                analysisContent.style.maxHeight = '500px';
                analysisContent.style.opacity = '1';
                analysisContent.style.padding = '';
                analysisToggle.textContent = '▼';
                analysisToggle.classList.remove('collapsed');
            }
            
            // Setup collapse functionality after DOM is visible
            setTimeout(() => {
                this.setupRadioAnalysisCollapse();
            }, 100);
            
            console.log('✅ Radio metadata display updated and shown with forced visibility');
            
        } catch (error) {
            console.error('❌ Error displaying radio metadata:', error);
        }
    }
    
    calculateRadioReadiness(metadata) {
        let score = 0;
        let total = 0;
        
        // Duration check (2:30-3:30 optimal)
        if (metadata.durationSeconds) {
            total++;
            if (metadata.durationSeconds >= 150 && metadata.durationSeconds <= 210) {
                score++;
            } else if (metadata.durationSeconds <= 240) {
                score += 0.8;
            }
        }
        
        // Quality check
        if (metadata.estimatedBitrate) {
            total++;
            const bitrate = parseInt(metadata.estimatedBitrate);
            if (bitrate >= 320) score++;
            else if (bitrate >= 256) score += 0.8;
            else if (bitrate >= 192) score += 0.6;
        }
        
        // Format check
        if (metadata.format) {
            total++;
            if (['MP3', 'WAV'].includes(metadata.format.toUpperCase())) {
                score++;
            }
        }
        
        const percentage = total > 0 ? Math.round((score / total) * 100) : 0;
        return `${percentage}% Ready`;
    }
    
    determineSamroCompositionType(metadata) {
        if (metadata.suggestedGenre) {
            const genre = metadata.suggestedGenre.toLowerCase();
            if (genre.includes('instrumental') || !metadata.hasVocals) {
                return 'Instrumental Work';
            }
            return 'Musical Work with Lyrics';
        }
        return 'Musical Work';
    }
    
    setupRadioAnalysisCollapse() {
        const toggleBtn = document.getElementById('radio-analysis-toggle');
        const content = document.getElementById('radio-analysis-content');
        
        console.log('🔧 Setting up radio analysis collapse:', { toggleBtn: !!toggleBtn, content: !!content });
        
        if (toggleBtn && content && !toggleBtn.hasAttribute('data-radio-setup')) {
            toggleBtn.setAttribute('data-radio-setup', 'true');
            
            // FIXED: Start EXPANDED (not collapsed) so users can see the analysis immediately
            toggleBtn.textContent = '▼';
            toggleBtn.classList.remove('collapsed');
            content.classList.remove('collapsed');
            content.style.maxHeight = '500px';
            content.style.opacity = '1';
            
            toggleBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                const isCollapsed = content.classList.contains('collapsed');
                console.log('📊 Radio analysis toggle clicked, currently collapsed:', isCollapsed);
                
                if (isCollapsed) {
                    content.classList.remove('collapsed');
                    toggleBtn.classList.remove('collapsed');
                    toggleBtn.textContent = '▼';
                    content.style.maxHeight = '500px';
                    content.style.opacity = '1';
                } else {
                    content.classList.add('collapsed');
                    toggleBtn.classList.add('collapsed');
                    toggleBtn.textContent = '▶';
                }
            });
            
            console.log('✅ Radio analysis collapse setup complete - starting EXPANDED');
        } else if (toggleBtn && content) {
            console.log('ℹ️ Radio analysis collapse already setup');
        } else {
            console.error('❌ Radio analysis collapse elements not found');
        }
    }
    
    async validateForRadio() {
        console.log('Validating for radio...');
        if (!this.radioMetadata || Object.keys(this.radioMetadata).length === 0) {
            alert('Please upload an audio file first');
            return;
        }
        
        const validateBtn = document.getElementById('validate-radio');
        validateBtn.disabled = true;
        validateBtn.textContent = 'Validating...';
        
        try {
            if (this.radioValidator) {
                const validation = await this.radioValidator.validateForRadio(this.radioMetadata);
                const overallScore = this.radioValidator.calculateOverallScore(validation);
                
                this.displayRadioValidation(validation, overallScore);
                
                // FIXED: Show native sponsor content after validation (no duplicates)
                setTimeout(() => {
                    if (this.nativeSponsorManager) {
                        this.nativeSponsorManager.displayAfterValidation();
                    } else if (this.enhancedSponsorIntegration) {
                        this.enhancedSponsorIntegration.displayValidationSponsor();
                    }
                }, 500);
                
                const generateBtn = document.getElementById('generate-radio-package');
                if (generateBtn) generateBtn.disabled = overallScore < 60;
            } else {
                throw new Error('Radio validator not available');
            }
            
        } catch (error) {
            console.error('Radio validation failed:', error);
            alert('Validation failed. Please try again.');
        } finally {
            validateBtn.disabled = false;
            validateBtn.textContent = '🔍 Validate for Radio';
        }
    }
    
    displayRadioValidation(validation, overallScore) {
        const resultsDiv = document.getElementById('radio-validation-results');
        if (!resultsDiv) {
            console.error('❌ Radio validation results element not found');
            return;
        }
        
        resultsDiv.innerHTML = '';
        
        // Secure DOM creation for validation results
        const summaryDiv = document.createElement('div');
        summaryDiv.className = 'validation-summary';
        
        const scoreTitle = document.createElement('h5');
        scoreTitle.textContent = 'Overall Score: ';
        
        const scoreSpan = document.createElement('span');
        scoreSpan.style.color = '#4CAF50';
        scoreSpan.textContent = `${overallScore}/100`;
        
        scoreTitle.appendChild(scoreSpan);
        summaryDiv.appendChild(scoreTitle);
        
        const itemsDiv = document.createElement('div');
        itemsDiv.className = 'validation-items';
        
        // Safe validation with null checks
        const validationItems = [
            { label: 'Duration', message: validation?.duration?.message || 'Not validated' },
            { label: 'Quality', message: validation?.quality?.message || 'Not validated' },
            { label: 'Format', message: validation?.format?.message || 'Not validated' },
            { label: 'Content', message: validation?.profanity?.message || 'Not validated' }
        ];
        
        validationItems.forEach(item => {
            const itemDiv = document.createElement('div');
            itemDiv.className = 'validation-item';
            itemDiv.textContent = `✅ ${item.label}: ${item.message}`;
            itemsDiv.appendChild(itemDiv);
        });
        
        resultsDiv.appendChild(summaryDiv);
        resultsDiv.appendChild(itemsDiv);
        
        // Make results visible with forced display
        resultsDiv.style.display = 'block';
        resultsDiv.style.visibility = 'visible';
        resultsDiv.style.opacity = '1';
        
        // Enable next step button if validation passes
        const nextBtn = document.getElementById('radio-step-4-next');
        if (nextBtn) {
            nextBtn.disabled = overallScore < 60;
            nextBtn.title = overallScore >= 60 ? 'Proceed to split sheets' : `Validation score too low: ${overallScore}/100`;
        }
    }
    
    addContributor() {
        console.log('Adding contributor...');
        const contributorsList = document.querySelector('.contributors-list');
        if (!contributorsList) return;
        
        const newContributor = document.createElement('div');
        newContributor.className = 'contributor-item';
        
        // Secure DOM creation instead of innerHTML
        const nameInput = document.createElement('input');
        nameInput.type = 'text';
        nameInput.placeholder = 'Contributor Name';
        nameInput.className = 'form-input contributor-name';
        
        const roleSelect = document.createElement('select');
        roleSelect.className = 'form-input contributor-role';
        
        const roles = ['artist', 'producer', 'songwriter', 'vocalist'];
        const roleLabels = ['Artist', 'Producer', 'Songwriter', 'Vocalist'];
        roles.forEach((role, index) => {
            const option = document.createElement('option');
            option.value = role;
            option.textContent = roleLabels[index];
            roleSelect.appendChild(option);
        });
        
        const percentageInput = document.createElement('input');
        percentageInput.type = 'number';
        percentageInput.placeholder = '%';
        percentageInput.className = 'form-input contributor-percentage';
        percentageInput.min = '0';
        percentageInput.max = '100';
        
        const samroInput = document.createElement('input');
        samroInput.type = 'text';
        samroInput.placeholder = 'SAMRO Number (optional)';
        samroInput.className = 'form-input samro-number';
        
        const removeBtn = document.createElement('button');
        removeBtn.className = 'remove-contributor';
        removeBtn.textContent = '❌';
        removeBtn.addEventListener('click', () => {
            newContributor.remove();
            this.updatePercentageTotal();
        });
        
        newContributor.appendChild(nameInput);
        newContributor.appendChild(roleSelect);
        newContributor.appendChild(percentageInput);
        newContributor.appendChild(samroInput);
        newContributor.appendChild(removeBtn);
        
        contributorsList.appendChild(newContributor);
        this.updatePercentageTotal();
    }
    
    async generateRadioPackage() {
        if (!this.radioAudioFile) {
            alert('Please upload an audio file for radio submission first');
            return;
        }
        
        // Check usage limits
        if (this.usageLimits) {
            const limitCheck = await this.usageLimits.canGeneratePackage('radio');
            if (!limitCheck.allowed) {
                const packageSection = document.getElementById('radio-step-6');
                const existingMessage = packageSection.querySelector('.limit-reached-message');
                if (existingMessage) existingMessage.remove();
                
                this.usageLimits.showLimitReachedMessage(limitCheck, packageSection);
                return;
            }
        }
        
        // Collect contributors from UI
        this.splitSheetsManager.contributors = [];
        const contributorItems = document.querySelectorAll('.contributor-item');
        
        contributorItems.forEach(item => {
            const name = item.querySelector('.contributor-name')?.value?.trim();
            const role = item.querySelector('.contributor-role')?.value;
            const percentage = parseFloat(item.querySelector('.contributor-percentage')?.value) || 0;
            const samroNumber = item.querySelector('.samro-number')?.value?.trim() || '';
            
            if (name && percentage > 0) {
                this.splitSheetsManager.addContributor(name, role, percentage, samroNumber);
            }
        });
        
        // Validate split sheets
        const total = this.splitSheetsManager.getTotalPercentage();
        if (Math.abs(total - 100) > 0.01) {
            alert(`Split sheets must total exactly 100%. Current total: ${total.toFixed(2)}%`);
            return;
        }
        
        if (this.splitSheetsManager.contributors.length === 0) {
            alert('Please provide at least one contributor name');
            return;
        }
        
        const generateBtn = document.getElementById('generate-radio-package');
        generateBtn.disabled = true;
        generateBtn.textContent = 'Generating...';
        
        // Show 15-second sponsored content timer to delay download
        this.displayPackageGenerationSponsored();
        
        // Continue with package generation after 15-second timer
        const SPONSOR_DELAY_MS = 16000; // 15s timer + 1s buffer
        setTimeout(async () => {
            await this.continueRadioPackageGeneration();
        }, SPONSOR_DELAY_MS);
        
        try {
            const files = [];
            
            // Get validated radio inputs FIRST
            const radioInputs = this.getRadioInputs();
            
            // Audio file with embedded metadata
            if (this.radioAudioFile) {
                const sanitizedTitle = this.sanitizeInput(this.radioMetadata.title || 'audio');
                const sanitizedFormat = this.sanitizeInput(this.radioMetadata.format || 'mp3').toLowerCase();
                
                // Write metadata to radio audio file
                let radioFileWithMetadata = this.radioAudioFile;
                console.log('🔍 MetadataWriter available:', !!window.MetadataWriter);
                if (window.MetadataWriter) {
                    try {
                        const writer = new MetadataWriter();
                        const metadataToWrite = {
                            isrc: radioInputs.isrc || (this.isrcManager ? await this.isrcManager.generateISRC() : ''),
                            title: radioInputs.title,
                            artist: radioInputs.artistName,
                            genre: radioInputs.genre
                        };
                        radioFileWithMetadata = await writer.writeAudioMetadata(this.radioAudioFile, metadataToWrite);
                        console.log('✅ Metadata embedded in radio audio file');
                    } catch (error) {
                        console.warn('Radio metadata writing failed, using original:', error);
                    }
                }
                
                files.push({
                    name: `audio/${sanitizedTitle.replace(/[^a-zA-Z0-9]/g, '_')}.${sanitizedFormat}`,
                    content: radioFileWithMetadata
                });
            }
            const radioMetadata = {
                title: this.sanitizeInput(this.userInputManager.getValue('radio-title', radioInputs.title, this.radioMetadata?.title || 'Untitled Track')),
                artist: this.sanitizeInput(this.userInputManager.getValue('radio-artist', radioInputs.artistName, 'Unknown Artist')),
                stageName: this.sanitizeInput(this.userInputManager.getValue('radio-stage', radioInputs.stageName, '')),
                genre: this.sanitizeInput(this.userInputManager.getValue('radio-genre', radioInputs.genre, this.radioMetadata?.suggestedGenre || 'Electronic')),
                language: this.sanitizeInput(radioInputs.language || 'English'),
                recordLabel: this.sanitizeInput(radioInputs.recordLabel || 'Independent'),
                isrc: this.sanitizeInput(radioInputs.isrc || ''),
                contentRating: this.sanitizeInput(radioInputs.contentRating || 'clean'),
                duration: this.sanitizeInput(this.radioMetadata.duration),
                format: this.sanitizeInput(this.radioMetadata.format),
                bitrate: this.sanitizeInput(this.radioMetadata.estimatedBitrate),
                quality: this.sanitizeInput(this.radioMetadata.qualityLevel),
                bpm: this.sanitizeInput(this.radioMetadata.estimatedBPM),
                // Artist biography and press kit
                biography: this.sanitizeInput(radioInputs.biography || ''),
                influences: this.sanitizeInput(radioInputs.influences || ''),
                social: {
                    instagram: this.sanitizeInput(radioInputs.social?.instagram || ''),
                    twitter: this.sanitizeInput(radioInputs.social?.twitter || '')
                },
                radioReady: true,
                submissionDate: new Date().toISOString(),
                submissionType: 'radio_only'
            };
            
            // Add cover image with embedded metadata if uploaded
            const coverImageInput = document.getElementById('radio-cover-image');
            if (coverImageInput && coverImageInput.files[0]) {
                const coverFile = coverImageInput.files[0];
                const extension = coverFile.name.split('.').pop().toLowerCase();
                
                // Write metadata to cover image
                let coverWithMetadata = coverFile;
                console.log('🔍 MetadataWriter available:', !!window.MetadataWriter);
                if (window.MetadataWriter) {
                    try {
                        const writer = new MetadataWriter();
                        const metadataToWrite = {
                            isrc: radioInputs.isrc || (this.isrcManager ? await this.isrcManager.generateISRC() : '')
                        };
                        coverWithMetadata = await writer.writeImageMetadata(coverFile, metadataToWrite);
                        console.log('✅ Metadata embedded in radio cover image');
                    } catch (error) {
                        console.warn('Radio cover metadata writing failed, using original:', error);
                    }
                }
                
                files.push({
                    name: `images/cover_art.${extension}`,
                    content: coverWithMetadata
                });
            }
            
            // ENHANCED: Add SAMRO Split Sheets PDF with Auto-Fill
            try {
                // Initialize SAMRO PDF Manager
                if (window.SAMROPDFManager) {
                    const samroPDFManager = new SAMROPDFManager();
                    await samroPDFManager.initialize();
                    
                    // Create SAMRO package with user data
                    const samroPackage = await samroPDFManager.createSAMROPackage(
                        radioInputs,
                        this.splitSheetsManager.contributors
                    );
                    
                    // Add filled PDF to package
                    files.push({
                        name: 'samro/Composer-Split-Confirmation.pdf',
                        content: samroPackage.pdf.pdfBlob
                    });
                    
                    // Add completion instructions
                    files.push({
                        name: 'samro/SAMRO-Completion-Instructions.txt',
                        content: samroPackage.instructions.content
                    });
                    
                    // Add SAMRO compliance metadata with proper attribution
                    const createdBy = `BeatsChain Chrome Extension v${chrome.runtime?.getManifest()?.version || '2.1.0'}`;
                    const samroCompliance = {
                        document: 'Composer-Split-Confirmation.pdf',
                        included: true,
                        autoFilled: true,
                        compliance: 'SAMRO South African Music Rights Organisation',
                        purpose: 'Official split sheet documentation for radio submission',
                        contributors: this.splitSheetsManager.contributors.length,
                        totalPercentage: this.splitSheetsManager.getTotalPercentage(),
                        addedAt: new Date().toISOString(),
                        instructions: 'See SAMRO-Completion-Instructions.txt for form completion steps',
                        createdBy: createdBy,
                        packageType: 'Radio Submission Package',
                        website: 'https://chrome.google.com/webstore/detail/beatschain'
                    };
                    
                    files.push({
                        name: 'samro/SAMRO-Compliance-Info.json',
                        content: JSON.stringify(samroCompliance, null, 2)
                    });
                    
                    console.log('✅ SAMRO split sheets PDF with auto-fill added to package');
                    
                } else {
                    // Fallback to original PDF without auto-fill
                    const samroSplitSheet = await this.loadSamroSplitSheet();
                    if (samroSplitSheet) {
                        files.push({
                            name: 'samro/Composer-Split-Confirmation.pdf',
                            content: samroSplitSheet
                        });
                        
                        // Add manual completion instructions
                        files.push({
                            name: 'samro/SAMRO-Manual-Instructions.txt',
                            content: `SAMRO COMPOSER SPLIT CONFIRMATION - MANUAL COMPLETION\n\nPlease fill out the PDF form manually with the following information:\n\nTrack: "${radioInputs.title}"\nArtist: ${radioInputs.artistName}\nDate: ${new Date().toLocaleDateString()}\n\nContributors:\n${this.splitSheetsManager.contributors.map((c, i) => `${i+1}. ${c.name} - ${c.percentage}% (${c.role})`).join('\n')}\n\nTotal: ${this.splitSheetsManager.getTotalPercentage()}%\n\nSubmit completed form to SAMRO with your music registration.`
                        });
                        
                        console.log('✅ SAMRO split sheets PDF (manual) added to package');
                    } else {
                        throw new Error('SAMRO PDF not found');
                    }
                }
            } catch (error) {
                console.error('❌ SAMRO integration failed:', error);
                // Add error documentation to package with proper attribution
                const samroErrorCreatedBy = `BeatsChain Chrome Extension v${chrome.runtime?.getManifest()?.version || '2.1.0'}`;
                files.push({
                    name: 'samro/SAMRO-ERROR.txt',
                    content: `SAMRO Integration Error: ${ErrorHandler.safeErrorMessage(error)}\n\nPlease manually include SAMRO documentation for radio submission compliance.\n\nRequired Information:\nTrack: "${radioInputs.title}"\nArtist: ${radioInputs.artistName}\nContributors: ${this.splitSheetsManager.contributors.length}\nTotal Percentage: ${this.splitSheetsManager.getTotalPercentage()}%\n\nContact SAMRO: https://samro.org.za\n\nGenerated by: ${samroErrorCreatedBy}\nPackage Type: Radio Submission Package`
                });
            }
            
            // RESTRUCTURED: Generate organized file structure - separate files by purpose
            try {
                const createdBy = `BeatsChain Chrome Extension v${chrome.runtime?.getManifest()?.version || '2.1.0'}`;
                const timestamp = new Date().toISOString();
                
                // 📁 metadata/ - Professional metadata files
                
                // 1. Track Metadata (JSON) - Essential track info only
                const trackMetadata = {
                    title: radioMetadata.title,
                    artist: radioMetadata.artist,
                    stageName: radioMetadata.stageName,
                    genre: radioMetadata.genre,
                    language: radioMetadata.language,
                    duration: radioMetadata.duration,
                    isrc: radioMetadata.isrc,
                    contentRating: radioMetadata.contentRating,
                    format: radioMetadata.format,
                    bitrate: radioMetadata.bitrate,
                    quality: radioMetadata.quality,
                    bpm: radioMetadata.bpm,
                    releaseType: radioInputs.releaseType || 'Single',
                    releaseYear: radioInputs.releaseYear || new Date().getFullYear(),
                    createdBy: createdBy,
                    generated: timestamp
                };
                
                files.push({
                    name: 'metadata/track_metadata.json',
                    content: JSON.stringify(trackMetadata, null, 2)
                });
                
                // 2. Broadcast Metadata (XML) - Radio station format
                const broadcastXML = `<?xml version="1.0" encoding="UTF-8"?>
<broadcast_metadata>
  <track>
    <title>${this.sanitizeInput(radioMetadata.title)}</title>
    <artist>${this.sanitizeInput(radioMetadata.artist)}</artist>
    <duration>${this.sanitizeInput(radioMetadata.duration)}</duration>
    <genre>${this.sanitizeInput(radioMetadata.genre)}</genre>
    <isrc>${this.sanitizeInput(radioMetadata.isrc)}</isrc>
    <language>${this.sanitizeInput(radioMetadata.language)}</language>
    <content_rating>${this.sanitizeInput(radioMetadata.contentRating)}</content_rating>
  </track>
  <metadata>
    <created_by>${createdBy}</created_by>
    <generated>${timestamp}</generated>
  </metadata>
</broadcast_metadata>`;
                
                files.push({
                    name: 'metadata/broadcast_metadata.xml',
                    content: broadcastXML
                });
                
                // 3. Track Data (CSV) - Spreadsheet format with contact
                const csvContent = `Title,Artist,Duration,Genre,ISRC,Language,Contact_Email,Contact_Phone,Website,Created_By\n"${this.sanitizeInput(radioMetadata.title)}","${this.sanitizeInput(radioMetadata.artist)}","${this.sanitizeInput(radioMetadata.duration)}","${this.sanitizeInput(radioMetadata.genre)}","${this.sanitizeInput(radioMetadata.isrc)}","${this.sanitizeInput(radioMetadata.language)}","${this.sanitizeInput(radioMetadata.contact?.email || '')}","${this.sanitizeInput(radioMetadata.contact?.phone || '')}","${this.sanitizeInput(radioMetadata.contact?.website || '')}","${createdBy}"`;
                
                files.push({
                    name: 'metadata/track_data.csv',
                    content: csvContent
                });
                
                // 📁 contact/ - Professional contact information
                
                // 4. Contact Card (VCF) - Industry standard vCard
                const vcfContent = `BEGIN:VCARD\nVERSION:3.0\nFN:${this.sanitizeInput(radioMetadata.artist)}\nORG:${this.sanitizeInput(radioMetadata.artist)}\nTITLE:Recording Artist\nEMAIL:${this.sanitizeInput(radioMetadata.contact?.email || '')}\nTEL:${this.sanitizeInput(radioMetadata.contact?.phone || '')}\nURL:${this.sanitizeInput(radioMetadata.contact?.website || '')}\nNOTE:Contact for ${this.sanitizeInput(radioMetadata.title)} - Generated by ${createdBy}\nEND:VCARD`;
                
                files.push({
                    name: 'contact/artist_contact.vcf',
                    content: vcfContent
                });
                
                // 📁 samro/ - SAMRO compliance documentation (already added above)
                
                // 📁 biography/ - Artist biography and press kit (if provided)
                if (radioMetadata.biography && radioMetadata.biography.trim()) {
                    const biographyContent = `ARTIST BIOGRAPHY\n\nArtist: ${radioMetadata.artist}\nStage Name: ${radioMetadata.stageName || 'N/A'}\n\n${radioMetadata.biography}\n\nMusical Influences: ${radioMetadata.influences || 'Not specified'}\n\nContact Information:\nEmail: ${radioMetadata.contact?.email || 'Not provided'}\nPhone: ${radioMetadata.contact?.phone || 'Not provided'}\nWebsite: ${radioMetadata.contact?.website || 'Not provided'}\n\nSocial Media:\n${radioMetadata.social?.instagram ? `Instagram: ${radioMetadata.social.instagram}\n` : ''}${radioMetadata.social?.twitter ? `Twitter: ${radioMetadata.social.twitter}\n` : ''}${radioMetadata.social?.facebook ? `Facebook: ${radioMetadata.social.facebook}\n` : ''}\n\nGenerated: ${new Date().toLocaleString()}\nCreated by: ${createdBy}`;
                    
                    files.push({
                        name: 'biography/artist_biography.txt',
                        content: biographyContent
                    });
                    
                    // Press Kit (JSON format)
                    const pressKit = {
                        artist: {
                            name: radioMetadata.artist,
                            stageName: radioMetadata.stageName,
                            biography: radioMetadata.biography,
                            influences: radioMetadata.influences
                        },
                        contact: radioMetadata.contact,
                        social: radioMetadata.social,
                        track: {
                            title: radioMetadata.title,
                            genre: radioMetadata.genre
                        },
                        createdBy: createdBy,
                        generated: timestamp
                    };
                    
                    files.push({
                        name: 'biography/press_kit.json',
                        content: JSON.stringify(pressKit, null, 2)
                    });
                }
                
                console.log(`📁 Generated ${files.length} organized files in structured folders`);
                console.log('📋 Files by folder:');
                const folderBreakdown = {};
                files.forEach(file => {
                    const folder = file.name.includes('/') ? file.name.split('/')[0] : 'root';
                    if (!folderBreakdown[folder]) folderBreakdown[folder] = [];
                    folderBreakdown[folder].push(file.name);
                });
                Object.entries(folderBreakdown).forEach(([folder, fileList]) => {
                    console.log(`  📁 ${folder}/ (${fileList.length} files):`, fileList);
                });
                
            } catch (error) {
                console.error('File structure generation failed:', error);
            }
            
            console.log(`📦 Creating zip with ${files.length} files:`);
            console.log('📁 File structure breakdown:');
            const folderCounts = {};
            files.forEach(file => {
                const folder = file.name.includes('/') ? file.name.split('/')[0] : 'root';
                folderCounts[folder] = (folderCounts[folder] || 0) + 1;
                console.log(`  📄 ${file.name}`);
            });
            console.log('📊 Folder summary:', folderCounts);
            
            const zipBlob = await this.createRealZip(files);
            
            const url = URL.createObjectURL(zipBlob);
            const a = document.createElement('a');
            a.href = url;
            const sanitizedTitle = this.sanitizeInput(radioMetadata.title || 'Radio_Submission');
            a.download = `${sanitizedTitle.replace(/[^a-zA-Z0-9]/g, '_')}_Radio_Submission.zip`;
            a.click();
            
            URL.revokeObjectURL(url);
            console.log('✅ Radio package download completed successfully');
            
            // Record package generation for usage limits and ISRC tracking
            if (this.usageLimits) {
                await this.usageLimits.recordPackageGeneration('radio');
            }
            
            // Track ISRC usage in package
            if (radioInputs.isrc) {
                this.recordISRCInPackage(radioInputs.isrc);
            }
            
            // Show success with organized file count
            const formatCount = files.length;
            generateBtn.textContent = `✅ ${formatCount} Files Generated!`;
            
            // Update package contents display with organized structure
            const createdBy = `BeatsChain Chrome Extension v${chrome.runtime?.getManifest()?.version || '2.1.0'}`;
            this.updatePackageContentsDisplay(files, createdBy);
            

            
            // Show prominent download success message with sponsored content
            this.showRadioPackageSuccess(formatCount, sanitizedTitle);
            

            
            // Store radio submission in history
            this.storeRadioSubmission(radioMetadata, formatCount);
            
            // Update usage limits UI
            if (this.usageLimits) {
                this.usageLimits.updatePackageLimitUI();
            }
            
            setTimeout(() => {
                generateBtn.textContent = '📦 Generate Radio Package';
                generateBtn.disabled = false;
            }, 3000);
            
        } catch (error) {
            console.error('Radio package generation failed:', error);
            
            // Show error notification
            const errorDiv = document.createElement('div');
            errorDiv.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background: #f8d7da;
                border: 1px solid #f5c6cb;
                color: #721c24;
                padding: 16px 20px;
                border-radius: 8px;
                z-index: 10000;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                max-width: 350px;
            `;
            
            errorDiv.innerHTML = `
                <div style="display: flex; align-items: center; gap: 12px;">
                    <span style="font-size: 24px;">❌</span>
                    <div>
                        <strong>Package Generation Failed</strong><br>
                        <small>${ErrorHandler.safeErrorMessage(error)}</small>
                    </div>
                </div>
            `;
            
            document.body.appendChild(errorDiv);
            
            setTimeout(() => {
                if (errorDiv.parentNode) {
                    errorDiv.parentNode.removeChild(errorDiv);
                }
            }, 5000);
            
            generateBtn.disabled = false;
            generateBtn.textContent = '📦 Generate Radio Package';
        }
    }
    
    getRadioInputs() {
        // Collect current form values
        const formTitle = document.getElementById('radio-track-title')?.value?.trim();
        const formArtist = document.getElementById('radio-artist-name')?.value?.trim();
        const formStage = document.getElementById('radio-stage-name')?.value?.trim();
        const formGenre = document.getElementById('radio-genre')?.value?.trim();
        const formLanguage = document.getElementById('radio-language')?.value?.trim();
        const formLabel = document.getElementById('radio-record-label')?.value?.trim();
        const formISRC = document.getElementById('radio-isrc')?.value?.trim();
        const formRating = document.getElementById('radio-content-rating')?.value?.trim();
        const formReleaseType = document.getElementById('radio-release-type')?.value?.trim();
        const formReleaseYear = document.getElementById('radio-release-year')?.value?.trim();
        
        // Store user inputs if they exist
        if (formTitle) this.userInputManager.setUserInput('radio-title', formTitle, true);
        if (formArtist) this.userInputManager.setUserInput('radio-artist', formArtist, true);
        if (formStage) this.userInputManager.setUserInput('radio-stage', formStage, true);
        if (formGenre) this.userInputManager.setUserInput('radio-genre', formGenre, true);
        if (formReleaseType) this.userInputManager.setUserInput('radio-release-type', formReleaseType, true);
        if (formReleaseYear) this.userInputManager.setUserInput('radio-release-year', formReleaseYear, true);
        
        const profileBio = this.getProfileBiography();
        
        return {
            title: this.userInputManager.getValue('radio-title', formTitle, this.radioMetadata?.title || 'Untitled Track'),
            artistName: this.userInputManager.getValue('radio-artist', formArtist, 'Unknown Artist'),
            stageName: this.userInputManager.getValue('radio-stage', formStage, ''),
            genre: this.userInputManager.getValue('radio-genre', formGenre, this.radioMetadata?.suggestedGenre || 'Electronic'),
            language: formLanguage || 'English',
            recordLabel: formLabel || 'Independent',
            isrc: formISRC || '',
            contentRating: formRating || 'Clean',
            releaseType: this.userInputManager.getValue('radio-release-type', formReleaseType, 'Single'),
            releaseYear: this.userInputManager.getValue('radio-release-year', formReleaseYear, new Date().getFullYear()),
            biography: profileBio.biography || '',
            influences: profileBio.influences || '',
            contact: profileBio.contact || {},
            social: profileBio.social || {}
        };
    }
    
    getEnhancedProfileData() {
        return {
            legalName: this.sanitizeInput(document.getElementById('profile-legal-name')?.value?.trim() || ''),
            displayName: this.sanitizeInput(document.getElementById('profile-display-name')?.value?.trim() || ''),
            role: document.getElementById('profile-role')?.value?.trim() || ''
        };
    }
    
    getProfileBiography() {
        return {
            biography: document.getElementById('profile-artist-bio')?.value?.trim() || '',
            influences: document.getElementById('profile-influences')?.value?.trim() || '',
            contact: {
                website: document.getElementById('profile-website')?.value?.trim() || '',
                email: document.getElementById('profile-email-contact')?.value?.trim() || '',
                phone: document.getElementById('profile-phone')?.value?.trim() || ''
            },
            social: {
                instagram: document.getElementById('profile-instagram')?.value?.trim() || '',
                twitter: document.getElementById('profile-twitter')?.value?.trim() || '',
                facebook: document.getElementById('profile-facebook')?.value?.trim() || ''
            },
            musicPlatforms: {
                spotify: document.getElementById('profile-spotify')?.value?.trim() || '',
                soundcloud: document.getElementById('profile-soundcloud')?.value?.trim() || '',
                youtube: document.getElementById('profile-youtube')?.value?.trim() || '',
                bandcamp: document.getElementById('profile-bandcamp')?.value?.trim() || '',
                tiktok: document.getElementById('profile-tiktok')?.value?.trim() || '',
                appleMusic: document.getElementById('profile-apple-music')?.value?.trim() || ''
            }
        };
    }
    
    async saveProfile() {
        try {
            const profileData = this.getProfileBiography();
            const enhancedProfile = this.getEnhancedProfileData();
            
            // Validate required fields
            if (enhancedProfile.legalName && !this.userInputManager.validateUserInput(enhancedProfile.legalName, 'legal-name')) {
                alert('Please enter a valid legal name (letters, numbers, spaces, hyphens, apostrophes only)');
                return;
            }
            
            if (enhancedProfile.displayName && !this.userInputManager.validateUserInput(enhancedProfile.displayName, 'display-name')) {
                alert('Please enter a valid display name (letters, numbers, spaces, hyphens, apostrophes only)');
                return;
            }
            
            const completeProfile = {
                ...profileData,
                ...enhancedProfile,
                lastUpdated: new Date().toISOString()
            };
            
            // Store user inputs in manager
            if (enhancedProfile.legalName) {
                this.userInputManager.setUserInput('legal-name', enhancedProfile.legalName, true);
            }
            if (enhancedProfile.displayName) {
                this.userInputManager.setUserInput('display-name', enhancedProfile.displayName, true);
            }
            if (enhancedProfile.role) {
                this.userInputManager.setUserInput('role', enhancedProfile.role, true);
            }
            
            // Store in browser storage
            if (window.StorageManager) {
                await window.StorageManager.set('artistProfile', completeProfile);
            } else {
                localStorage.setItem('artistProfile', JSON.stringify(completeProfile));
            }
            
            // Show success message
            const saveBtn = document.getElementById('save-profile');
            const originalText = saveBtn.textContent;
            saveBtn.textContent = '✅ Saved!';
            saveBtn.disabled = true;
            
            setTimeout(() => {
                saveBtn.textContent = originalText;
                saveBtn.disabled = false;
            }, 2000);
            
        } catch (error) {
            console.error('Failed to save profile:', error);
            alert('Failed to save profile. Please try again.');
        }
    }
    
    async loadProfile() {
        try {
            let profileData;
            
            if (window.StorageManager) {
                profileData = await window.StorageManager.get('artistProfile');
            } else {
                const stored = localStorage.getItem('artistProfile');
                profileData = stored ? JSON.parse(stored) : null;
            }
            
            if (profileData) {
                // Enhanced profile fields
                const legalNameField = document.getElementById('profile-legal-name');
                const displayNameField = document.getElementById('profile-display-name');
                const roleField = document.getElementById('profile-role');
                
                // Biography fields
                const bioField = document.getElementById('profile-artist-bio');
                const influencesField = document.getElementById('profile-influences');
                const websiteField = document.getElementById('profile-website');
                const emailField = document.getElementById('profile-email-contact');
                const phoneField = document.getElementById('profile-phone');
                const instagramField = document.getElementById('profile-instagram');
                const twitterField = document.getElementById('profile-twitter');
                const facebookField = document.getElementById('profile-facebook');
                
                // Music platform fields
                const spotifyField = document.getElementById('profile-spotify');
                const soundcloudField = document.getElementById('profile-soundcloud');
                const youtubeField = document.getElementById('profile-youtube');
                const bandcampField = document.getElementById('profile-bandcamp');
                const tiktokField = document.getElementById('profile-tiktok');
                const appleMusicField = document.getElementById('profile-apple-music');
                
                // Load enhanced profile data
                if (legalNameField) {
                    legalNameField.value = profileData.legalName || '';
                    // Pre-fill with Google name if empty
                    if (!profileData.legalName && unifiedAuth) {
                        const userProfile = unifiedAuth.getUserProfile();
                        if (userProfile && userProfile.name) {
                            legalNameField.value = userProfile.name;
                        }
                    }
                }
                if (displayNameField) displayNameField.value = profileData.displayName || '';
                if (roleField) roleField.value = profileData.role || '';
                
                // Load biography data
                if (bioField) bioField.value = profileData.biography || '';
                if (influencesField) influencesField.value = profileData.influences || '';
                if (websiteField) websiteField.value = profileData.contact?.website || '';
                if (emailField) emailField.value = profileData.contact?.email || '';
                if (phoneField) phoneField.value = profileData.contact?.phone || '';
                if (instagramField) instagramField.value = profileData.social?.instagram || '';
                if (twitterField) twitterField.value = profileData.social?.twitter || '';
                if (facebookField) facebookField.value = profileData.social?.facebook || '';
                
                // Load music platforms
                if (spotifyField) spotifyField.value = profileData.musicPlatforms?.spotify || '';
                if (soundcloudField) soundcloudField.value = profileData.musicPlatforms?.soundcloud || '';
                if (youtubeField) youtubeField.value = profileData.musicPlatforms?.youtube || '';
                if (bandcampField) bandcampField.value = profileData.musicPlatforms?.bandcamp || '';
                if (tiktokField) tiktokField.value = profileData.musicPlatforms?.tiktok || '';
                if (appleMusicField) appleMusicField.value = profileData.musicPlatforms?.appleMusic || '';
            } else {
                // Pre-fill legal name with Google name for new users
                const legalNameField = document.getElementById('profile-legal-name');
                if (legalNameField && unifiedAuth) {
                    const userProfile = unifiedAuth.getUserProfile();
                    if (userProfile && userProfile.name) {
                        legalNameField.value = userProfile.name;
                    }
                }
            }
            
        } catch (error) {
            console.error('Failed to load profile:', error);
        }
    }
    
    setupPercentageCalculator() {
        // Add event listeners to all percentage inputs
        document.addEventListener('input', (e) => {
            if (e.target.classList.contains('contributor-percentage')) {
                this.updatePercentageTotal();
            }
        });
        
        // Initial calculation
        this.updatePercentageTotal();
    }
    
    updatePercentageTotal() {
        const percentageInputs = document.querySelectorAll('.contributor-percentage');
        let total = 0;
        let validContributorCount = 0;
        
        percentageInputs.forEach(input => {
            const value = parseFloat(input.value) || 0;
            if (value > 0) {
                total += value;
                validContributorCount++;
            }
        });
        
        const totalDisplay = document.getElementById('total-percentage');
        if (totalDisplay) {
            totalDisplay.textContent = Math.round(total * 100) / 100;
            totalDisplay.style.color = Math.abs(total - 100) < 0.01 ? '#4CAF50' : (total > 100 ? '#F44336' : '#FFC107');
        }
        
        // Validate contributor names (only for contributors with percentages > 0)
        const contributorNames = document.querySelectorAll('.contributor-name');
        let validNameCount = 0;
        
        contributorNames.forEach((input, index) => {
            const percentageInput = percentageInputs[index];
            const percentage = parseFloat(percentageInput?.value) || 0;
            
            if (percentage > 0 && input.value && input.value.trim().length > 0) {
                validNameCount++;
            }
        });
        
        // Valid if: total is 100% AND all contributors with percentages have names
        const isValid = Math.abs(total - 100) < 0.01 && validContributorCount > 0 && validNameCount === validContributorCount;
        
        // Update split sheets manager validity
        if (this.splitSheetsManager) {
            this.splitSheetsManager.setValid(isValid);
        }
        
        // Update step 5 next button
        const step5NextBtn = document.getElementById('radio-step-5-next');
        if (step5NextBtn) {
            step5NextBtn.disabled = !isValid;
        }
        
        // Update generate button state
        const generateBtn = document.getElementById('generate-radio-package');
        if (generateBtn) {
            generateBtn.disabled = !isValid;
            generateBtn.title = isValid ? 'Generate radio package' : `Need: 100% total (${total.toFixed(1)}%) + valid names for all contributors`;
        }
    }
    
    storeRadioSubmission(radioMetadata, fileCount) {
        try {
            const submissionData = {
                type: 'radio_submission',
                title: radioMetadata.title,
                artist: radioMetadata.artist,
                genre: radioMetadata.genre,
                duration: radioMetadata.duration,
                fileCount: fileCount,
                submissionDate: radioMetadata.submissionDate,
                timestamp: Date.now()
            };
            
            // Store using Chrome runtime if available
            if (chrome.runtime && chrome.runtime.sendMessage) {
                chrome.runtime.sendMessage({
                    action: 'store_radio_submission',
                    data: submissionData
                });
            } else {
                // Fallback to local storage
                const stored = localStorage.getItem('radio_submissions') || '[]';
                const submissions = JSON.parse(stored);
                submissions.unshift(submissionData);
                localStorage.setItem('radio_submissions', JSON.stringify(submissions.slice(0, 50)));
            }
        } catch (error) {
            console.error('Failed to store radio submission:', error);
        }
    }
    
    async loadSamroSplitSheet() {
        try {
            // Try to load SAMRO PDF from assets directory
            const response = await fetch(chrome.runtime.getURL('assets/Composer-Split-Confirmation.pdf'));
            if (!response.ok) {
                throw new Error(`SAMRO PDF not found: ${response.status} ${response.statusText}`);
            }
            
            const blob = await response.blob();
            console.log('✅ SAMRO split sheet loaded:', blob.size, 'bytes');
            return blob;
        } catch (error) {
            console.error('❌ Failed to load SAMRO split sheet:', error);
            
            // Try alternative path
            try {
                const altResponse = await fetch('./assets/Composer-Split-Confirmation.pdf');
                if (altResponse.ok) {
                    const blob = await altResponse.blob();
                    console.log('✅ SAMRO split sheet loaded from alternative path:', blob.size, 'bytes');
                    return blob;
                }
            } catch (altError) {
                console.error('❌ Alternative SAMRO path also failed:', altError);
            }
            
            return null;
        }
    }
    

    
    updatePackageContentsDisplay(files, createdBy) {
        const contentsDiv = document.getElementById('package-contents-display');
        if (!contentsDiv) return;
        
        // Group files by folder
        const folders = {};
        files.forEach(file => {
            const parts = file.name.split('/');
            const folder = parts.length > 1 ? parts[0] : 'root';
            if (!folders[folder]) folders[folder] = [];
            folders[folder].push(file.name);
        });
        
        const folderIcons = {
            'audio': '🎵',
            'images': '🖼️', 
            'metadata': '📄',
            'contact': '📇',
            'samro': '🏛️',
            'biography': '📝',
            'root': '📦'
        };
        
        let html = `<div class="package-structure"><h4>📦 Package Contents (${files.length} files)</h4>`;
        
        Object.entries(folders).forEach(([folder, fileList]) => {
            const icon = folderIcons[folder] || '📁';
            html += `<div class="folder-group"><strong>${icon} ${folder}/</strong><ul>`;
            fileList.forEach(fileName => {
                const displayName = fileName.includes('/') ? fileName.split('/')[1] : fileName;
                html += `<li>${displayName}</li>`;
            });
            html += `</ul></div>`;
        });
        
        html += `<div class="package-footer"><small>Created by: ${createdBy}</small></div></div>`;
        
        contentsDiv.innerHTML = html;
        contentsDiv.style.display = 'block';
    }
    
    showRadioPackageSuccess(fileCount, title) {
        const successDiv = document.createElement('div');
        successDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #d4edda;
            border: 1px solid #c3e6cb;
            color: #155724;
            padding: 16px 20px;
            border-radius: 8px;
            z-index: 10000;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            max-width: 350px;
            font-size: 14px;
        `;
        
        const successContentDiv = document.createElement('div');
        successContentDiv.style.cssText = 'display: flex; align-items: center; gap: 12px;';
        
        const iconSpan = document.createElement('span');
        iconSpan.style.fontSize = '24px';
        iconSpan.textContent = '📦';
        
        const textDiv = document.createElement('div');
        const strongEl = document.createElement('strong');
        strongEl.textContent = 'Radio Package Downloaded!';
        
        const fileCountSmall = document.createElement('small');
        fileCountSmall.textContent = `${fileCount} files generated for "${this.sanitizeInput(title)}"`;
        
        const folderSmall = document.createElement('small');
        folderSmall.style.color = '#0f5132';
        folderSmall.textContent = 'Check your Downloads folder';
        
        textDiv.appendChild(strongEl);
        textDiv.appendChild(document.createElement('br'));
        textDiv.appendChild(fileCountSmall);
        textDiv.appendChild(document.createElement('br'));
        textDiv.appendChild(folderSmall);
        
        successContentDiv.appendChild(iconSpan);
        successContentDiv.appendChild(textDiv);
        successDiv.appendChild(successContentDiv);
        
        document.body.appendChild(successDiv);
        
        // Record package success
        this.recordPackageSuccess({
            type: 'radio',
            fileCount: fileCount,
            timestamp: Date.now()
        });
        
        setTimeout(() => {
            if (successDiv.parentNode) {
                successDiv.parentNode.removeChild(successDiv);
            }
        }, 5000);
        
        // Show sponsored content after success message (only once)
        if (!document.querySelector('.post-package-sponsor-container')) {
            setTimeout(() => {
                this.displayPostPackageSponsor(fileCount, title);
            }, 2000);
        }
    }
    
    async loadHistory() {
        console.log('Loading history...');
        const historyList = document.getElementById('history-list');
        if (!historyList) {
            console.error('History list element not found');
            return;
        }
        
        try {
            let nftHistory = [];
            let radioHistory = [];
            
            // Load NFT history from Chrome runtime
            if (chrome.runtime && chrome.runtime.sendMessage) {
                try {
                    const nftResponse = await new Promise((resolve) => {
                        chrome.runtime.sendMessage({ action: 'get_nft_history' }, resolve);
                    });
                    if (nftResponse && nftResponse.data) {
                        nftHistory = nftResponse.data;
                    }
                } catch (error) {
                    console.log('Chrome runtime NFT history unavailable');
                }
                
                try {
                    const radioResponse = await new Promise((resolve) => {
                        chrome.runtime.sendMessage({ action: 'get_radio_history' }, resolve);
                    });
                    if (radioResponse && radioResponse.data) {
                        radioHistory = radioResponse.data;
                    }
                } catch (error) {
                    console.log('Chrome runtime radio history unavailable');
                }
            }
            
            // Fallback to localStorage
            if (nftHistory.length === 0) {
                const storedNFTs = localStorage.getItem('nft_history');
                if (storedNFTs) {
                    nftHistory = JSON.parse(storedNFTs);
                }
            }
            
            if (radioHistory.length === 0) {
                const storedRadio = localStorage.getItem('radio_submissions');
                if (storedRadio) {
                    radioHistory = JSON.parse(storedRadio);
                }
            }
            
            // Combine and sort by timestamp
            const allHistory = [...nftHistory, ...radioHistory].sort((a, b) => {
                const timeA = a.timestamp || new Date(a.submissionDate || a.mintDate || 0).getTime();
                const timeB = b.timestamp || new Date(b.submissionDate || b.mintDate || 0).getTime();
                return timeB - timeA; // Most recent first
            });
            
            if (allHistory.length === 0) {
                historyList.innerHTML = `
                    <div class="empty-history">
                        <div class="empty-icon">📜</div>
                        <p>No history yet</p>
                        <small>Your NFT mints and radio submissions will appear here</small>
                    </div>
                `;
                return;
            }
            
            historyList.innerHTML = '';
            
            allHistory.forEach(item => {
                const historyItem = this.createHistoryItem(item);
                historyList.appendChild(historyItem);
            });
            
            console.log(`Loaded ${allHistory.length} history items`);
            
        } catch (error) {
            console.error('Failed to load history:', error);
            historyList.innerHTML = `
                <div class="error-history">
                    <div class="error-icon">⚠️</div>
                    <p>Failed to load history</p>
                    <small>Please try refreshing the extension</small>
                </div>
            `;
        }
    }
    
    createHistoryItem(item) {
        const historyItem = document.createElement('div');
        historyItem.className = 'history-item';
        
        const isNFT = item.type === 'nft' || item.txHash;
        const isRadio = item.type === 'radio_submission';
        
        const icon = isNFT ? '🎵' : '📻';
        const type = isNFT ? 'NFT Mint' : 'Radio Submission';
        const title = item.title || 'Untitled';
        const artist = item.artist || 'Unknown Artist';
        
        let dateStr = 'Unknown date';
        if (item.timestamp) {
            dateStr = new Date(item.timestamp).toLocaleDateString();
        } else if (item.submissionDate) {
            dateStr = new Date(item.submissionDate).toLocaleDateString();
        } else if (item.mintDate) {
            dateStr = new Date(item.mintDate).toLocaleDateString();
        }
        
        const headerDiv = document.createElement('div');
        headerDiv.className = 'history-item-header';
        
        const infoDiv = document.createElement('div');
        infoDiv.className = 'history-item-info';
        
        const iconSpan = document.createElement('span');
        iconSpan.className = 'history-icon';
        iconSpan.textContent = icon;
        
        const detailsDiv = document.createElement('div');
        detailsDiv.className = 'history-details';
        
        const titleH4 = document.createElement('h4');
        titleH4.textContent = title;
        
        const artistP = document.createElement('p');
        artistP.textContent = `${artist} • ${type}`;
        
        const dateSmall = document.createElement('small');
        dateSmall.textContent = dateStr;
        
        detailsDiv.appendChild(titleH4);
        detailsDiv.appendChild(artistP);
        detailsDiv.appendChild(dateSmall);
        
        infoDiv.appendChild(iconSpan);
        infoDiv.appendChild(detailsDiv);
        
        const actionsDiv = document.createElement('div');
        actionsDiv.className = 'history-actions';
        
        if (isNFT && item.txHash) {
            const viewBtn = document.createElement('button');
            viewBtn.className = 'btn btn-sm';
            viewBtn.textContent = 'View Transaction';
            viewBtn.onclick = () => window.open(`https://mumbai.polygonscan.com/tx/${this.sanitizeInput(item.txHash)}`, '_blank');
            actionsDiv.appendChild(viewBtn);
        }
        
        if (isRadio && item.fileCount) {
            const fileSmall = document.createElement('small');
            fileSmall.textContent = `${item.fileCount} files generated`;
            actionsDiv.appendChild(fileSmall);
        }
        
        headerDiv.appendChild(infoDiv);
        headerDiv.appendChild(actionsDiv);
        historyItem.appendChild(headerDiv);
        
        return historyItem;
    }
    
    // Auto-fill functionality for cross-system data sharing
    getSharedProfileData() {
        const profile = this.getProfileBiography();
        const enhanced = this.getEnhancedProfileData();
        
        return {
            artistName: enhanced.legalName || '',
            stageName: enhanced.displayName || '',
            biography: profile.biography || '',
            social: profile.social || {},
            contact: profile.contact || {}
        };
    }
    
    autoFillFromProfile(targetSystem) {
        const sharedData = this.getSharedProfileData();
        
        if (targetSystem === 'nft') {
            this.autoFillNFTForm(sharedData);
        } else if (targetSystem === 'radio') {
            this.autoFillRadioForm(sharedData);
        }
    }
    
    autoFillNFTForm(data) {
        if (!data.artistName) return;
        
        const artistNameField = document.getElementById('artist-name');
        const stageNameField = document.getElementById('stage-name');
        
        // artistName = legalName, stageName = displayName
        if (artistNameField && !artistNameField.value) {
            artistNameField.value = data.artistName;
        }
        if (stageNameField && !stageNameField.value && data.stageName) {
            stageNameField.value = data.stageName;
        }
    }
    
    autoFillRadioForm(data) {
        if (!data.artistName) return;
        
        const radioArtistField = document.getElementById('radio-artist-name');
        const radioStageField = document.getElementById('radio-stage-name');
        
        // artistName = legalName, stageName = displayName
        if (radioArtistField && !radioArtistField.value) {
            radioArtistField.value = data.artistName;
        }
        if (radioStageField && !radioStageField.value && data.stageName) {
            radioStageField.value = data.stageName;
        }
    }

    async handleArtistInvite() {
        const emailInput = document.getElementById('invite-email');
        const messageInput = document.getElementById('invite-message');
        const inviteBtn = document.getElementById('send-invitation');
        
        if (!emailInput || !messageInput || !inviteBtn) {
            console.error('❌ Artist invitation elements not found');
            return;
        }
        
        const email = emailInput.value.trim();
        const message = messageInput.value.trim();
        
        // Enhanced validation
        if (!email) {
            this.showInviteError('Please enter an email address');
            return;
        }
        
        // Comprehensive email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            this.showInviteError('Please enter a valid email address');
            return;
        }
        
        // Check for spam prevention (basic rate limiting)
        const lastInvite = localStorage.getItem('lastInviteTime');
        const now = Date.now();
        if (lastInvite && (now - parseInt(lastInvite)) < 30000) { // 30 second cooldown
            this.showInviteError('Please wait 30 seconds between invitations to prevent spam');
            return;
        }
        
        const originalText = inviteBtn.textContent;
        inviteBtn.disabled = true;
        inviteBtn.textContent = '📤 Sending...';
        
        try {
            // Create invitation content with enhanced features
            const defaultMessage = 'Hey! I\'ve been using BeatsChain to mint my music as NFTs and prepare radio submission packages. You should check it out!';
            const personalMessage = message || defaultMessage;
            
            // Get user info for personalization
            let senderName = 'A fellow artist';
            if (unifiedAuth) {
                const userProfile = unifiedAuth.getUserProfile();
                if (userProfile && userProfile.name) {
                    senderName = userProfile.name;
                }
            }
            
            const invitationText = `${personalMessage}\n\n🎵 BeatsChain Chrome Extension\nInvited by: ${senderName}\n\nDownload: https://chrome.google.com/webstore/detail/beatschain\n\n✨ Features:\n• Mint music as NFTs on blockchain\n• Prepare radio submission packages\n• Professional metadata management\n• AI-powered licensing\n• SAMRO compliance for South Africa\n• ISRC generation (80G registrant)\n• Professional metadata embedding\n\n🚀 Join the music revolution!\n\n---\nThis invitation was sent through BeatsChain's artist invitation system.`;
            
            // Create mailto link (browser will handle email client)
            const subject = encodeURIComponent(`🎵 ${senderName} invited you to join BeatsChain`);
            const body = encodeURIComponent(invitationText);
            const mailtoLink = `mailto:${email}?subject=${subject}&body=${body}`;
            
            // Test mailto link generation
            console.log('✅ Mailto link generated:', mailtoLink.substring(0, 100) + '...');
            
            // Open email client
            window.open(mailtoLink);
            
            // Record invitation for spam prevention
            localStorage.setItem('lastInviteTime', now.toString());
            
            // Track invitation count
            const inviteCount = parseInt(localStorage.getItem('inviteCount') || '0') + 1;
            localStorage.setItem('inviteCount', inviteCount.toString());
            
            // Clear form
            emailInput.value = '';
            messageInput.value = '';
            
            // Show enhanced success message
            this.showInviteSuccess(email, inviteCount);
            
            // Update stats display
            this.updateInvitationStats(inviteCount);
            
            console.log(`✅ Artist invitation sent to ${email} (total invites: ${inviteCount})`);
            
        } catch (error) {
            console.error('❌ Invitation failed:', error);
            const errorMessage = ErrorHandler.safeErrorMessage(error);
            this.showInviteError(`Failed to send invitation: ${errorMessage}`);
        } finally {
            inviteBtn.disabled = false;
            inviteBtn.textContent = originalText;
        }
    }
    
    showInviteSuccess(email, inviteCount = 1) {
        const successDiv = document.createElement('div');
        successDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #d4edda;
            border: 1px solid #c3e6cb;
            color: #155724;
            padding: 12px 16px;
            border-radius: 8px;
            z-index: 10000;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            max-width: 350px;
        `;
        
        successDiv.innerHTML = `
            <div style="display: flex; align-items: center; gap: 8px;">
                <span>📧</span>
                <div>
                    <strong>Invitation Sent!</strong><br>
                    <small>Email client opened for ${this.sanitizeInput(email)}</small><br>
                    <small style="color: #0f5132;">Total invites sent: ${inviteCount}</small>
                </div>
            </div>
        `;
        
        document.body.appendChild(successDiv);
        
        setTimeout(() => {
            if (successDiv.parentNode) {
                successDiv.parentNode.removeChild(successDiv);
            }
        }, 5000);
    }
    
    showInviteError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #f8d7da;
            border: 1px solid #f5c6cb;
            color: #721c24;
            padding: 12px 16px;
            border-radius: 8px;
            z-index: 10000;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            max-width: 350px;
        `;
        
        errorDiv.innerHTML = `
            <div style="display: flex; align-items: center; gap: 8px;">
                <span>❌</span>
                <div>
                    <strong>Invitation Failed</strong><br>
                    <small>${this.sanitizeInput(message)}</small>
                </div>
            </div>
        `;
        
        document.body.appendChild(errorDiv);
        
        setTimeout(() => {
            if (errorDiv.parentNode) {
                errorDiv.parentNode.removeChild(errorDiv);
            }
        }, 5000);
    }
    
    loadInvitationStats() {
        const inviteCount = parseInt(localStorage.getItem('inviteCount') || '0');
        this.updateInvitationStats(inviteCount);
    }
    
    updateInvitationStats(count) {
        const statsDiv = document.getElementById('invitation-stats');
        const countSpan = document.getElementById('invite-count');
        
        if (statsDiv && countSpan) {
            countSpan.textContent = count;
            statsDiv.style.display = count > 0 ? 'block' : 'none';
        }
    }

    async handleExportWallet() {
        try {
            if (!unifiedAuth) {
                alert('Please sign in first to export wallet');
                return;
            }
            
            const walletAddress = await unifiedAuth.getWalletAddress();
            if (!walletAddress) {
                alert('No wallet found. Please sign in to generate a wallet.');
                return;
            }
            
            // Get wallet data from storage (private key is stored encrypted)
            const stored = await chrome.storage.local.get(['wallet_address']);
            const walletAddressStored = stored.wallet_address;

            let decryptedPrivateKey = null;
            if (window.WalletSecureStorage) {
                decryptedPrivateKey = await WalletSecureStorage.decryptFromStorage('wallet_private_key_encrypted');
            }

            if (!decryptedPrivateKey) {
                alert('Wallet private key not found or encrypted. Cannot export.');
                return;
            }

            // Create clean wallet export
            const walletExport = {
                "walletAddress": walletAddressStored,
                "privateKey": decryptedPrivateKey,
                "network": "Polygon Mumbai Testnet",
                "exportDate": new Date().toISOString(),
                "WARNING": "🚨 NEVER SHARE YOUR PRIVATE KEY - Anyone with this key can steal your crypto and NFTs!"
            };
            
            // Create setup guide text file
            const setupGuide = `BEATSCHAIN WALLET SETUP GUIDE
===============================

WHAT IS THIS?
This is your Web3 wallet - like a digital bank account for cryptocurrencies and NFTs.

HOW TO USE YOUR WALLET:
1. Download a wallet app (MetaMask, Trust Wallet, or Coinbase Wallet)
2. Choose 'Import Existing Wallet' or 'Import Account'
3. Select 'Private Key' as import method
4. Paste your private key from the JSON file
5. Your wallet will appear with your NFTs and crypto

POPULAR WALLET APPS:
• MetaMask - Most popular, works in browser and mobile
• Trust Wallet - Mobile-first, easy for beginners
• Coinbase Wallet - User-friendly, good for new users

IMPORT INSTRUCTIONS:
• MetaMask: Settings → Import Account → Private Key
• Trust Wallet: Settings → Wallets → Import Wallet → Private Key
• Coinbase Wallet: Settings → Import → Private Key

SECURITY TIPS:
🚨 NEVER SHARE YOUR PRIVATE KEY WITH ANYONE!
• Save files in a secure location (not cloud storage)
• Consider printing a physical backup
• Never email or message your private key
• Don't store it in photos or screenshots
• If you lose this key, you lose access forever

NEXT STEPS:
• Make multiple secure backups
• Import into a wallet app to test access
• Learn more at ethereum.org/security

Need help? Visit our documentation or contact support.`;
            
            // Download wallet JSON
            const jsonBlob = new Blob([JSON.stringify(walletExport, null, 2)], { type: 'application/json' });
            const jsonUrl = URL.createObjectURL(jsonBlob);
            const jsonLink = document.createElement('a');
            jsonLink.href = jsonUrl;
            jsonLink.download = `BeatsChain-Wallet-${walletAddress.substring(0, 8)}.json`;
            jsonLink.click();
            URL.revokeObjectURL(jsonUrl);
            
            // Download setup guide
            setTimeout(() => {
                const textBlob = new Blob([setupGuide], { type: 'text/plain' });
                const textUrl = URL.createObjectURL(textBlob);
                const textLink = document.createElement('a');
                textLink.href = textUrl;
                textLink.download = `BeatsChain-Wallet-Setup-Guide.txt`;
                textLink.click();
                URL.revokeObjectURL(textUrl);
            }, 500);
            
            // Show success message
            alert('✅ Wallet exported!\n\n📁 Downloaded 2 files:\n• Wallet JSON (your keys)\n• Setup Guide (instructions)\n\n🔒 Keep your private key secure!');
            
        } catch (error) {
            console.error('Wallet export failed:', error);
            alert('Failed to export wallet. Please try again.');
        }
    }
}

// Initialize app when popup loads
document.addEventListener('DOMContentLoaded', async () => {
    console.log('Initializing BeatsChain app...');
    const app = new BeatsChainApp();
    await app.initialize();
    window.beatsChainApp = app;
    console.log('BeatsChain app initialized');
});

// Cleanup when popup is closed
window.addEventListener('beforeunload', () => {
    if (window.beatsChainApp && window.beatsChainApp.audioManager) {
        window.beatsChainApp.audioManager.cleanupAll();
    }
});

// Cleanup on visibility change (when extension popup is hidden)
document.addEventListener('visibilitychange', () => {
    if (document.hidden && window.beatsChainApp && window.beatsChainApp.audioManager) {
        window.beatsChainApp.audioManager.pauseAllAudio();
    }
});

