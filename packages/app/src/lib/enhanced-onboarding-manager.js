/**
 * Enhanced App Onboarding Manager - Extension-Level Features
 * 6-step onboarding with sponsor integration, campaign management, and data pipelines
 */

class EnhancedOnboardingManager {
    constructor() {
        this.currentStep = 0;
        this.userChoices = {};
        this.sponsorManager = null;
        this.campaignManager = null;
        this.analyticsManager = null;
        this.steps = ['welcome', 'account', 'role', 'profile', 'features', 'complete'];
        this.isApp = true;
        this.dataPipeline = null;
        this.templates = new Map();
    }

    async initialize() {
        const completed = localStorage.getItem('beatx_enhanced_onboarding_completed');
        if (completed === 'true') return false;

        await this.initializeCoreSystems();
        return true;
    }

    async initializeCoreSystems() {
        // Initialize sponsor content manager
        if (window.SponsorContentManager) {
            this.sponsorManager = new SponsorContentManager();
            await this.sponsorManager.initialize();
        }

        // Initialize campaign manager
        if (window.EnhancedCampaignManager) {
            this.campaignManager = new EnhancedCampaignManager();
            await this.campaignManager.initialize();
        }

        // Initialize analytics manager
        if (window.EnhancedAnalyticsManager) {
            this.analyticsManager = new EnhancedAnalyticsManager();
            await this.analyticsManager.initialize();
        }

        // Initialize data pipeline
        await this.initializeDataPipeline();
        
        // Load sponsor templates
        await this.loadSponsorTemplates();
    }

    async initializeDataPipeline() {
        this.dataPipeline = {
            events: [],
            analytics: new Map(),
            userJourney: [],
            recommendations: [],
            sponsorInteractions: [],
            campaignMetrics: new Map()
        };
    }

    async loadSponsorTemplates() {
        try {
            const stored = localStorage.getItem('beatx_sponsor_templates');
            if (stored) {
                const templates = JSON.parse(stored);
                Object.entries(templates).forEach(([id, template]) => {
                    this.templates.set(id, template);
                });
            }
        } catch (error) {
            console.error('Failed to load sponsor templates:', error);
        }
    }

    async startOnboarding() {
        // Create enhanced onboarding overlay
        this.createEnhancedOnboardingOverlay();
        
        // Show partner consent first
        if (this.sponsorManager) {
            const consent = await this.sponsorManager.showInitialPartnerConsent();
            this.userChoices.sponsorConsent = consent;
        }

        // Record onboarding start
        await this.recordEvent('enhanced_onboarding_started', {
            timestamp: Date.now(),
            userAgent: navigator.userAgent,
            referrer: document.referrer,
            platform: 'web_app'
        });

        // Start with welcome step
        this.showStep('welcome');
    }

    createEnhancedOnboardingOverlay() {
        const overlay = document.createElement('div');
        overlay.id = 'enhanced-onboarding-overlay';
        overlay.style.cssText = `
            position: fixed; top: 0; left: 0; right: 0; bottom: 0;
            background: rgba(13, 13, 13, 0.95); z-index: 20000;
            display: flex; align-items: center; justify-content: center;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        `;

        const container = document.createElement('div');
        container.id = 'enhanced-onboarding-container';
        container.style.cssText = `
            background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
            border-radius: 16px; padding: 32px; max-width: 700px; width: 90%;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
            border: 1px solid rgba(255, 255, 255, 0.1);
            color: white;
        `;

        overlay.appendChild(container);
        document.body.appendChild(overlay);
    }

    async showStep(stepName) {
        const container = document.getElementById('enhanced-onboarding-container');
        if (!container) return;

        // Record step start
        await this.recordEvent('step_started', { step: stepName });

        // Render step content
        container.innerHTML = this.getEnhancedStepContent(stepName);
        
        // Add event listeners
        this.setupStepListeners(stepName);

        // Show contextual sponsors with campaign tracking
        if (this.sponsorManager && this.userChoices.sponsorConsent) {
            setTimeout(() => {
                this.showStepSponsorsWithCampaigns(stepName);
            }, this.getSponsorTiming(stepName));
        }
    }

    getEnhancedStepContent(stepName) {
        const contents = {
            welcome: `
                <div class="enhanced-onboarding-step">
                    <div class="step-progress">
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: 16.67%"></div>
                        </div>
                        <span class="step-indicator">Step 1 of 6</span>
                    </div>
                    <div class="step-header">
                        <div style="font-size: 48px; margin-bottom: 16px;">🎵</div>
                        <h2>Welcome to BeatsChain Marketplace</h2>
                        <p>Transform your music into NFTs, discover beats, and build your music career</p>
                    </div>
                    <div class="step-content">
                        <div class="feature-grid">
                            <div class="feature-item">
                                <span class="feature-icon">🎧</span>
                                <h4>NFT Marketplace</h4>
                                <p>Buy, sell, and trade music NFTs</p>
                            </div>
                            <div class="feature-item">
                                <span class="feature-icon">📻</span>
                                <h4>Radio Submission</h4>
                                <p>Professional SA radio packages</p>
                            </div>
                            <div class="feature-item">
                                <span class="feature-icon">🎯</span>
                                <h4>ISRC Generation</h4>
                                <p>Industry-standard music codes</p>
                            </div>
                            <div class="feature-item">
                                <span class="feature-icon">🤝</span>
                                <h4>Collaboration Hub</h4>
                                <p>Connect with artists and producers</p>
                            </div>
                        </div>
                    </div>
                    <div class="step-actions">
                        <button class="btn btn-primary" data-action="next">Get Started</button>
                        <button class="btn btn-secondary" data-action="skip">Skip Setup</button>
                    </div>
                    <div id="welcome-sponsors" class="sponsor-placement"></div>
                </div>
            `,
            account: `
                <div class="enhanced-onboarding-step">
                    <div class="step-progress">
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: 33.33%"></div>
                        </div>
                        <span class="step-indicator">Step 2 of 6</span>
                    </div>
                    <div class="step-header">
                        <h2>🔐 Choose Your Account</h2>
                        <p>Sign in to access marketplace features and sync your data</p>
                    </div>
                    <div class="step-content">
                        <div class="account-options">
                            <div class="account-option" data-method="google">
                                <div class="option-icon">🔑</div>
                                <div class="option-content">
                                    <h4>Google Account</h4>
                                    <p>Quick setup with Google OAuth</p>
                                </div>
                            </div>
                            <div class="account-option" data-method="wallet">
                                <div class="option-icon">👛</div>
                                <div class="option-content">
                                    <h4>Web3 Wallet</h4>
                                    <p>Connect with MetaMask or WalletConnect</p>
                                </div>
                            </div>
                        </div>
                        <div class="account-benefits">
                            <div class="benefit-item">✅ Secure marketplace transactions</div>
                            <div class="benefit-item">✅ Cloud sync across devices</div>
                            <div class="benefit-item">✅ Professional features access</div>
                            <div class="benefit-item">✅ NFT collection management</div>
                        </div>
                        <div id="account-sponsors" class="sponsor-placement"></div>
                    </div>
                    <div class="step-actions">
                        <button class="btn btn-primary" data-action="signin" disabled>Continue with Selected</button>
                        <button class="btn btn-secondary" data-action="back">Back</button>
                    </div>
                </div>
            `,
            role: `
                <div class="enhanced-onboarding-step">
                    <div class="step-progress">
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: 50%"></div>
                        </div>
                        <span class="step-indicator">Step 3 of 6</span>
                    </div>
                    <div class="step-header">
                        <h2>🎯 What describes you best?</h2>
                        <p>This helps us customize your marketplace experience</p>
                    </div>
                    <div class="step-content">
                        <div class="role-options">
                            <div class="role-option" data-role="solo_artist">
                                <span class="role-icon">🎤</span>
                                <h4>Solo Artist</h4>
                                <p>Create and sell your music as NFTs</p>
                                <div class="role-features">
                                    <span>• NFT Minting</span>
                                    <span>• Marketplace Listing</span>
                                    <span>• Fan Engagement</span>
                                </div>
                            </div>
                            <div class="role-option" data-role="producer">
                                <span class="role-icon">🎹</span>
                                <h4>Producer/Beat Maker</h4>
                                <p>Create beats and license to artists</p>
                                <div class="role-features">
                                    <span>• Beat Marketplace</span>
                                    <span>• Licensing Tools</span>
                                    <span>• Radio Submission</span>
                                </div>
                            </div>
                            <div class="role-option" data-role="collector">
                                <span class="role-icon">💎</span>
                                <h4>Music Collector</h4>
                                <p>Discover and collect music NFTs</p>
                                <div class="role-features">
                                    <span>• NFT Discovery</span>
                                    <span>• Collection Management</span>
                                    <span>• Artist Support</span>
                                </div>
                            </div>
                            <div class="role-option" data-role="both">
                                <span class="role-icon">🎵</span>
                                <h4>Artist & Producer</h4>
                                <p>Full music creation and marketplace suite</p>
                                <div class="role-features">
                                    <span>• Complete Toolkit</span>
                                    <span>• Advanced Features</span>
                                    <span>• Pro Services</span>
                                </div>
                            </div>
                        </div>
                        <div id="role-sponsors" class="sponsor-placement"></div>
                    </div>
                    <div class="step-actions">
                        <button class="btn btn-primary" data-action="next" disabled>Continue</button>
                        <button class="btn btn-secondary" data-action="back">Back</button>
                    </div>
                </div>
            `,
            profile: `
                <div class="enhanced-onboarding-step">
                    <div class="step-progress">
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: 66.67%"></div>
                        </div>
                        <span class="step-indicator">Step 4 of 6</span>
                    </div>
                    <div class="step-header">
                        <h2>📝 Set Up Your Profile</h2>
                        <p>Complete your profile to get personalized recommendations</p>
                    </div>
                    <div class="step-content">
                        <div class="profile-form">
                            <div class="form-row">
                                <label>Artist/Producer Name *</label>
                                <input type="text" id="artist-name" placeholder="Your professional name" required>
                            </div>
                            <div class="form-row">
                                <label>Stage Name</label>
                                <input type="text" id="stage-name" placeholder="Your stage name (optional)">
                            </div>
                            <div class="form-row">
                                <label>Primary Genre *</label>
                                <select id="genre" required>
                                    <option value="">Select Genre</option>
                                    <option value="Hip-Hop">Hip-Hop</option>
                                    <option value="House">House</option>
                                    <option value="Afrikaans">Afrikaans</option>
                                    <option value="Gospel">Gospel</option>
                                    <option value="Jazz">Jazz</option>
                                    <option value="Electronic">Electronic</option>
                                    <option value="R&B">R&B</option>
                                    <option value="Pop">Pop</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                            <div class="form-row">
                                <label>Experience Level</label>
                                <select id="experience">
                                    <option value="beginner">Beginner (0-1 years)</option>
                                    <option value="intermediate">Intermediate (2-5 years)</option>
                                    <option value="advanced">Advanced (5+ years)</option>
                                    <option value="professional">Professional</option>
                                </select>
                            </div>
                            <div class="form-row">
                                <label>Interests (Select all that apply)</label>
                                <div class="checkbox-group">
                                    <label><input type="checkbox" value="nft_trading"> NFT Trading</label>
                                    <label><input type="checkbox" value="beat_making"> Beat Making</label>
                                    <label><input type="checkbox" value="collaboration"> Collaboration</label>
                                    <label><input type="checkbox" value="radio_submission"> Radio Submission</label>
                                    <label><input type="checkbox" value="licensing"> Music Licensing</label>
                                </div>
                            </div>
                        </div>
                        <div id="profile-sponsors" class="sponsor-placement"></div>
                    </div>
                    <div class="step-actions">
                        <button class="btn btn-primary" data-action="next">Continue</button>
                        <button class="btn btn-secondary" data-action="skip">Skip for Now</button>
                        <button class="btn btn-secondary" data-action="back">Back</button>
                    </div>
                </div>
            `,
            features: `
                <div class="enhanced-onboarding-step">
                    <div class="step-progress">
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: 83.33%"></div>
                        </div>
                        <span class="step-indicator">Step 5 of 6</span>
                    </div>
                    <div class="step-header">
                        <h2>🚀 Your BeatsChain Toolkit</h2>
                        <p>Everything you need to succeed in the music marketplace</p>
                    </div>
                    <div class="step-content">
                        <div class="feature-walkthrough">
                            <div class="feature-detail" data-feature="marketplace">
                                <span class="feature-icon">🏪</span>
                                <div class="feature-info">
                                    <h4>NFT Marketplace</h4>
                                    <p>Buy, sell, and discover unique music NFTs from artists worldwide</p>
                                </div>
                                <div class="feature-sponsors" id="marketplace-sponsors"></div>
                            </div>
                            <div class="feature-detail" data-feature="minting">
                                <span class="feature-icon">🎧</span>
                                <div class="feature-info">
                                    <h4>NFT Minting</h4>
                                    <p>Turn your music into blockchain assets with automatic licensing</p>
                                </div>
                                <div class="feature-sponsors" id="minting-sponsors"></div>
                            </div>
                            <div class="feature-detail" data-feature="radio">
                                <span class="feature-icon">📻</span>
                                <div class="feature-info">
                                    <h4>Radio Submission</h4>
                                    <p>Professional packages for SA radio stations with SAMRO docs</p>
                                </div>
                                <div class="feature-sponsors" id="radio-sponsors"></div>
                            </div>
                            <div class="feature-detail" data-feature="collaboration">
                                <span class="feature-icon">🤝</span>
                                <div class="feature-info">
                                    <h4>Collaboration Hub</h4>
                                    <p>Connect with artists, producers, and industry professionals</p>
                                </div>
                                <div class="feature-sponsors" id="collaboration-sponsors"></div>
                            </div>
                        </div>
                    </div>
                    <div class="step-actions">
                        <button class="btn btn-primary" data-action="complete">Start Creating</button>
                        <button class="btn btn-secondary" data-action="tour">Take Tour</button>
                    </div>
                </div>
            `,
            complete: `
                <div class="enhanced-onboarding-step">
                    <div class="step-progress">
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: 100%"></div>
                        </div>
                        <span class="step-indicator">Complete!</span>
                    </div>
                    <div class="step-header">
                        <div style="font-size: 48px; margin-bottom: 16px;">🎉</div>
                        <h2>Welcome to BeatsChain!</h2>
                        <p>Your account is set up and ready to go</p>
                    </div>
                    <div class="step-content">
                        <div class="completion-summary">
                            <h4>Your Setup Summary:</h4>
                            <div class="summary-item">
                                <span class="summary-label">Role:</span>
                                <span class="summary-value" id="summary-role"></span>
                            </div>
                            <div class="summary-item">
                                <span class="summary-label">Artist Name:</span>
                                <span class="summary-value" id="summary-name"></span>
                            </div>
                            <div class="summary-item">
                                <span class="summary-label">Genre:</span>
                                <span class="summary-value" id="summary-genre"></span>
                            </div>
                        </div>
                        <div class="next-steps">
                            <h4>Recommended Next Steps:</h4>
                            <div class="next-step-item" data-action="upload">
                                <span class="step-icon">🎧</span>
                                <div>
                                    <h5>Upload Your First Track</h5>
                                    <p>Mint your music as an NFT</p>
                                </div>
                            </div>
                            <div class="next-step-item" data-action="browse">
                                <span class="step-icon">🏪</span>
                                <div>
                                    <h5>Explore Marketplace</h5>
                                    <p>Discover amazing music NFTs</p>
                                </div>
                            </div>
                            <div class="next-step-item" data-action="profile">
                                <span class="step-icon">👤</span>
                                <div>
                                    <h5>Complete Profile</h5>
                                    <p>Add more details and photos</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="step-actions">
                        <button class="btn btn-primary" data-action="finish">Enter BeatsChain</button>
                    </div>
                </div>
            `
        };

        return contents[stepName] || '';
    }

    setupStepListeners(stepName) {
        const container = document.getElementById('enhanced-onboarding-container');
        
        // Action buttons
        container.querySelectorAll('[data-action]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.handleAction(e.target.dataset.action, stepName);
            });
        });

        // Step-specific listeners
        if (stepName === 'account') {
            container.querySelectorAll('.account-option').forEach(option => {
                option.addEventListener('click', () => {
                    container.querySelectorAll('.account-option').forEach(o => o.classList.remove('selected'));
                    option.classList.add('selected');
                    this.userChoices.authMethod = option.dataset.method;
                    container.querySelector('[data-action="signin"]').disabled = false;
                });
            });
        }

        if (stepName === 'role') {
            container.querySelectorAll('.role-option').forEach(option => {
                option.addEventListener('click', () => {
                    container.querySelectorAll('.role-option').forEach(o => o.classList.remove('selected'));
                    option.classList.add('selected');
                    this.userChoices.role = option.dataset.role;
                    container.querySelector('[data-action="next"]').disabled = false;
                    
                    // Show role-specific sponsors with campaign tracking
                    if (this.sponsorManager && this.userChoices.sponsorConsent) {
                        this.showRoleSponsorsWithCampaigns(option.dataset.role);
                    }
                });
            });
        }

        if (stepName === 'profile') {
            // Form validation
            const requiredFields = container.querySelectorAll('input[required], select[required]');
            requiredFields.forEach(field => {
                field.addEventListener('change', () => {
                    this.validateProfileForm();
                });
            });

            // Interest checkboxes
            container.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
                checkbox.addEventListener('change', () => {
                    this.updateUserInterests();
                });
            });
        }

        if (stepName === 'complete') {
            // Update summary
            this.updateCompletionSummary();
            
            // Next step actions
            container.querySelectorAll('.next-step-item').forEach(item => {
                item.addEventListener('click', () => {
                    const action = item.dataset.action;
                    this.handleFirstAction(action);
                });
            });
        }
    }

    validateProfileForm() {
        const container = document.getElementById('enhanced-onboarding-container');
        const artistName = container.querySelector('#artist-name').value;
        const genre = container.querySelector('#genre').value;
        
        if (artistName && genre) {
            this.userChoices.artistName = artistName;
            this.userChoices.stageName = container.querySelector('#stage-name').value;
            this.userChoices.genre = genre;
            this.userChoices.experience = container.querySelector('#experience').value;
        }
    }

    updateUserInterests() {
        const container = document.getElementById('enhanced-onboarding-container');
        const interests = [];
        container.querySelectorAll('input[type="checkbox"]:checked').forEach(checkbox => {
            interests.push(checkbox.value);
        });
        this.userChoices.interests = interests;
    }

    updateCompletionSummary() {
        const container = document.getElementById('enhanced-onboarding-container');
        
        const roleMap = {
            solo_artist: 'Solo Artist',
            producer: 'Producer/Beat Maker',
            collector: 'Music Collector',
            both: 'Artist & Producer'
        };

        container.querySelector('#summary-role').textContent = roleMap[this.userChoices.role] || 'Not specified';
        container.querySelector('#summary-name').textContent = this.userChoices.artistName || 'Not specified';
        container.querySelector('#summary-genre').textContent = this.userChoices.genre || 'Not specified';
    }

    async handleAction(action, currentStep) {
        switch (action) {
            case 'next':
                await this.nextStep(currentStep);
                break;
            case 'back':
                this.previousStep(currentStep);
                break;
            case 'skip':
                await this.skipOnboarding();
                break;
            case 'signin':
                await this.handleAuthentication();
                break;
            case 'complete':
                await this.completeOnboarding();
                break;
            case 'tour':
                await this.startTour();
                break;
            case 'finish':
                await this.finishOnboarding();
                break;
        }
    }

    async nextStep(currentStep) {
        // Record step completion
        await this.recordStepCompletion(currentStep);
        
        const stepIndex = this.steps.indexOf(currentStep);
        if (stepIndex < this.steps.length - 1) {
            this.showStep(this.steps[stepIndex + 1]);
        }
    }

    previousStep(currentStep) {
        const stepIndex = this.steps.indexOf(currentStep);
        if (stepIndex > 0) {
            this.showStep(this.steps[stepIndex - 1]);
        }
    }

    async handleAuthentication() {
        try {
            const method = this.userChoices.authMethod;
            
            if (method === 'google') {
                // Use existing Google auth
                if (window.unifiedAuth) {
                    const result = await window.unifiedAuth.signInWithGoogle(true);
                    if (result.success) {
                        this.userChoices.authenticated = true;
                        this.userChoices.userProfile = result.user;
                        await this.nextStep('account');
                    }
                }
            } else if (method === 'wallet') {
                // Use Web3 wallet connection
                if (window.connectWallet) {
                    const result = await window.connectWallet();
                    if (result.success) {
                        this.userChoices.authenticated = true;
                        this.userChoices.walletAddress = result.address;
                        await this.nextStep('account');
                    }
                }
            }
        } catch (error) {
            console.error('Authentication failed:', error);
        }
    }

    async completeOnboarding() {
        // Save completion state
        localStorage.setItem('beatx_enhanced_onboarding_completed', 'true');
        localStorage.setItem('beatx_enhanced_onboarding_choices', JSON.stringify(this.userChoices));

        // Initialize user preferences
        await this.initializeEnhancedUserPreferences();

        // Record completion
        await this.recordEvent('enhanced_onboarding_completed', {
            userChoices: this.userChoices,
            journey: this.dataPipeline.userJourney,
            completedAt: Date.now(),
            totalDuration: this.getTotalOnboardingDuration()
        });

        // Show completion step
        this.showStep('complete');
    }

    async finishOnboarding() {
        // Remove overlay
        const overlay = document.getElementById('enhanced-onboarding-overlay');
        if (overlay) overlay.remove();

        // Show first action guidance
        this.showEnhancedFirstActionGuidance();

        // Finalize data pipeline
        await this.finalizeEnhancedDataPipeline();

        // Dispatch completion event
        this.dispatchOnboardingEvent('enhanced-complete', {
            userChoices: this.userChoices,
            recommendations: this.dataPipeline.recommendations
        });
    }

    async skipOnboarding() {
        localStorage.setItem('beatx_enhanced_onboarding_completed', 'true');
        const overlay = document.getElementById('enhanced-onboarding-overlay');
        if (overlay) overlay.remove();
    }

    showEnhancedFirstActionGuidance() {
        const modal = document.createElement('div');
        modal.style.cssText = `
            position: fixed; top: 20px; right: 20px;
            background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
            border-radius: 12px; padding: 20px; max-width: 350px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
            border: 1px solid rgba(255, 255, 255, 0.1);
            z-index: 10000; color: white;
        `;

        const actions = this.getEnhancedRecommendedActions();
        
        modal.innerHTML = `
            <h4 style="margin: 0 0 12px 0; color: white;">🎵 Ready to get started?</h4>
            <div class="enhanced-first-actions">
                ${actions.map(action => `
                    <button class="btn btn-sm" data-action="${action.id}" style="
                        display: flex; align-items: center; gap: 8px; margin-bottom: 8px;
                        background: rgba(255, 255, 255, 0.1); border: 1px solid rgba(255, 255, 255, 0.2);
                        color: white; padding: 8px 12px; border-radius: 6px; width: 100%;
                        text-align: left; cursor: pointer;
                    ">
                        <span>${action.icon}</span>
                        <span>${action.title}</span>
                    </button>
                `).join('')}
            </div>
            <button class="close-btn" style="
                position: absolute; top: 8px; right: 8px; 
                background: none; border: none; color: rgba(255, 255, 255, 0.6); 
                cursor: pointer; font-size: 18px;
            ">&times;</button>
        `;

        document.body.appendChild(modal);

        // Auto-remove after 15 seconds
        setTimeout(() => {
            if (modal.parentNode) modal.remove();
        }, 15000);

        // Handle actions
        modal.addEventListener('click', (e) => {
            if (e.target.dataset.action) {
                this.handleFirstAction(e.target.dataset.action);
                modal.remove();
            } else if (e.target.classList.contains('close-btn')) {
                modal.remove();
            }
        });
    }

    getEnhancedRecommendedActions() {
        const baseActions = [
            { id: 'upload', icon: '🎧', title: 'Upload & Mint NFT', url: '/upload' },
            { id: 'marketplace', icon: '🏪', title: 'Browse Marketplace', url: '/beatnfts' },
            { id: 'profile', icon: '👤', title: 'Complete Profile', url: '/profile' }
        ];

        if (this.userChoices.role === 'producer') {
            baseActions.unshift({
                id: 'radio', icon: '📻', title: 'Radio Submission', url: '/upload?tab=radio'
            });
        }

        if (this.userChoices.role === 'collector') {
            baseActions.unshift({
                id: 'discover', icon: '🔍', title: 'Discover Music', url: '/browse'
            });
        }

        return baseActions;
    }

    handleFirstAction(action) {
        const actionMap = {
            upload: '/upload',
            marketplace: '/beatnfts',
            profile: '/profile',
            radio: '/upload?tab=radio',
            discover: '/browse',
            browse: '/beatnfts'
        };

        const url = actionMap[action];
        if (url) {
            window.location.href = url;
        }
    }

    // Enhanced sponsor integration with campaign tracking
    async showStepSponsorsWithCampaigns(stepName) {
        if (!this.sponsorManager || !this.campaignManager) return;

        const sponsorPlacements = {
            welcome: { container: '#welcome-sponsors', category: 'marketplace_welcome' },
            account: { container: '#account-sponsors', category: 'professional_services' },
            profile: { container: '#profile-sponsors', category: 'profile_services' }
        };

        const placement = sponsorPlacements[stepName];
        if (placement) {
            const container = document.querySelector(placement.container);
            if (container) {
                // Get active campaigns for this placement
                const campaigns = await this.getActiveCampaignsForPlacement(placement.category);
                
                if (campaigns.length > 0) {
                    const campaign = campaigns[0]; // Use first active campaign
                    const sponsorContent = this.createEnhancedOnboardingSponsor(
                        placement.category, 
                        stepName, 
                        campaign
                    );
                    
                    if (sponsorContent) {
                        container.appendChild(sponsorContent);
                        
                        // Record impression
                        await this.recordCampaignImpression(campaign.id, stepName);
                    }
                }
            }
        }
    }

    async showRoleSponsorsWithCampaigns(role) {
        const roleSponsors = {
            solo_artist: { category: 'individual_artist_tools', message: 'Solo artist marketplace tools' },
            producer: { category: 'beat_distribution', message: 'Beat distribution and licensing' },
            collector: { category: 'nft_discovery', message: 'NFT discovery and collection tools' },
            both: { category: 'full_suite_services', message: 'Complete music marketplace suite' }
        };

        const sponsor = roleSponsors[role];
        if (sponsor && this.campaignManager) {
            const container = document.querySelector('#role-sponsors');
            if (container) {
                container.innerHTML = '';
                
                // Get campaigns for this role
                const campaigns = await this.getActiveCampaignsForPlacement(sponsor.category);
                
                if (campaigns.length > 0) {
                    const campaign = campaigns[0];
                    const sponsorEl = this.createEnhancedOnboardingSponsor(
                        sponsor.category, 
                        'role', 
                        campaign,
                        sponsor.message
                    );
                    
                    if (sponsorEl) {
                        container.appendChild(sponsorEl);
                        await this.recordCampaignImpression(campaign.id, 'role');
                    }
                }
            }
        }
    }

    async getActiveCampaignsForPlacement(placement) {
        if (!this.campaignManager) return [];
        
        try {
            const allCampaigns = this.campaignManager.getActiveCampaigns();
            return allCampaigns.filter(campaign => 
                campaign.placement === placement || 
                campaign.targeting?.placements?.includes(placement)
            );
        } catch (error) {
            console.error('Failed to get campaigns for placement:', error);
            return [];
        }
    }

    createEnhancedOnboardingSponsor(category, step, campaign = null, customMessage = null) {
        const sponsorEl = document.createElement('div');
        sponsorEl.className = 'enhanced-onboarding-sponsor';
        sponsorEl.style.cssText = `
            margin: 16px 0; padding: 12px;
            background: rgba(255, 152, 0, 0.05);
            border: 1px solid rgba(255, 152, 0, 0.2);
            border-radius: 8px; font-size: 12px;
            cursor: pointer; transition: all 0.2s ease;
        `;

        const messages = {
            marketplace_welcome: 'Boost your marketplace presence with professional services',
            professional_services: 'Professional services available after sign-in',
            profile_services: 'Profile optimization and marketing services',
            individual_artist_tools: 'Solo artist marketplace and promotion tools',
            beat_distribution: 'Beat distribution and licensing services',
            nft_discovery: 'NFT discovery and collection management tools',
            full_suite_services: 'Complete music marketplace and creation suite'
        };

        const campaignName = campaign ? campaign.name : 'Professional Services';
        const message = customMessage || messages[category] || 'Professional marketplace services';

        sponsorEl.innerHTML = `
            <div style="display: flex; align-items: center; gap: 8px;">
                <span style="font-size: 16px;">🏪</span>
                <div style="flex: 1;">
                    <div style="color: #ff9800; font-weight: 500; font-size: 11px;">
                        ${campaignName}
                    </div>
                    <div style="color: rgba(255, 255, 255, 0.8); font-size: 10px; margin-top: 2px;">
                        ${message}
                    </div>
                    <div style="color: rgba(255, 255, 255, 0.5); font-size: 9px; margin-top: 2px;">
                        Professional marketplace partner
                    </div>
                </div>
                <div style="color: rgba(255, 255, 255, 0.6); font-size: 10px;">
                    Learn More →
                </div>
            </div>
        `;

        // Add click handler for campaign tracking
        if (campaign) {
            sponsorEl.addEventListener('click', async () => {
                await this.recordCampaignClick(campaign.id, step);
                // Handle sponsor action (could open modal, navigate, etc.)
                this.handleSponsorClick(campaign, category);
            });

            sponsorEl.addEventListener('mouseenter', () => {
                sponsorEl.style.background = 'rgba(255, 152, 0, 0.1)';
                sponsorEl.style.borderColor = 'rgba(255, 152, 0, 0.4)';
            });

            sponsorEl.addEventListener('mouseleave', () => {
                sponsorEl.style.background = 'rgba(255, 152, 0, 0.05)';
                sponsorEl.style.borderColor = 'rgba(255, 152, 0, 0.2)';
            });
        }

        return sponsorEl;
    }

    async recordCampaignImpression(campaignId, placement) {
        if (this.campaignManager) {
            await this.campaignManager.recordImpression(campaignId);
        }

        if (this.analyticsManager) {
            await this.analyticsManager.recordSponsorDisplay(placement);
        }

        // Record in data pipeline
        this.dataPipeline.sponsorInteractions.push({
            type: 'impression',
            campaignId: campaignId,
            placement: placement,
            timestamp: Date.now()
        });
    }

    async recordCampaignClick(campaignId, placement) {
        if (this.campaignManager) {
            await this.campaignManager.recordClick(campaignId);
        }

        if (this.analyticsManager) {
            await this.analyticsManager.recordSponsorInteraction('click', placement);
        }

        // Record in data pipeline
        this.dataPipeline.sponsorInteractions.push({
            type: 'click',
            campaignId: campaignId,
            placement: placement,
            timestamp: Date.now()
        });
    }

    handleSponsorClick(campaign, category) {
        // This could open a modal, navigate to a page, etc.
        console.log('Sponsor clicked:', campaign.name, category);
        
        // Example: Show sponsor modal or navigate
        if (category === 'professional_services') {
            // Could open professional services modal
            this.showProfessionalServicesModal(campaign);
        }
    }

    showProfessionalServicesModal(campaign) {
        // Implementation for showing professional services modal
        console.log('Show professional services modal for campaign:', campaign.name);
    }

    // Data pipeline and analytics methods
    async recordEvent(eventType, eventData) {
        const event = {
            type: eventType,
            data: eventData,
            timestamp: Date.now(),
            sessionId: this.getSessionId()
        };

        this.dataPipeline.events.push(event);

        // Send to analytics if available
        if (window.gtag) {
            window.gtag('event', eventType, {
                custom_parameter: JSON.stringify(eventData),
                platform: 'web_app_enhanced'
            });
        }
    }

    async recordStepCompletion(stepName) {
        const event = {
            type: 'enhanced_step_completed',
            step: stepName,
            userChoices: this.userChoices,
            timestamp: Date.now(),
            sessionId: this.getSessionId()
        };

        await this.recordEvent('enhanced_step_completed', event);
        
        this.dataPipeline.userJourney.push({
            step: stepName,
            timestamp: Date.now(),
            duration: this.getStepDuration(stepName)
        });
    }

    getStepDuration(stepName) {
        const journey = this.dataPipeline.userJourney;
        if (journey.length === 0) return 0;
        
        const lastStep = journey[journey.length - 1];
        return Date.now() - lastStep.timestamp;
    }

    getTotalOnboardingDuration() {
        const journey = this.dataPipeline.userJourney;
        if (journey.length === 0) return 0;
        
        const firstStep = journey[0];
        return Date.now() - firstStep.timestamp;
    }

    getSessionId() {
        let sessionId = sessionStorage.getItem('beatx_enhanced_session_id');
        if (!sessionId) {
            sessionId = 'enhanced_session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            sessionStorage.setItem('beatx_enhanced_session_id', sessionId);
        }
        return sessionId;
    }

    async initializeEnhancedUserPreferences() {
        const preferences = {
            role: this.userChoices.role,
            artistName: this.userChoices.artistName,
            stageName: this.userChoices.stageName,
            genre: this.userChoices.genre,
            experience: this.userChoices.experience,
            interests: this.userChoices.interests || [],
            authMethod: this.userChoices.authMethod,
            onboardingCompleted: true,
            enhancedOnboarding: true,
            marketplaceFocus: true,
            aiRecommendationsEnabled: true,
            dataProcessingConsent: this.userChoices.sponsorConsent,
            campaignTrackingEnabled: true
        };

        localStorage.setItem('beatx_enhanced_user_preferences', JSON.stringify(preferences));

        if (this.userChoices.authenticated) {
            await this.syncPreferencesToBackend(preferences);
        }
    }

    async syncPreferencesToBackend(preferences) {
        try {
            const response = await fetch('/api/user/enhanced-preferences', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(preferences)
            });

            if (!response.ok) {
                throw new Error('Backend sync failed');
            }
        } catch (error) {
            console.warn('Enhanced preferences sync failed:', error);
        }
    }

    async finalizeEnhancedDataPipeline() {
        const pipelineData = {
            events: this.dataPipeline.events,
            analytics: Object.fromEntries(this.dataPipeline.analytics),
            userJourney: this.dataPipeline.userJourney,
            recommendations: this.dataPipeline.recommendations,
            sponsorInteractions: this.dataPipeline.sponsorInteractions,
            campaignMetrics: Object.fromEntries(this.dataPipeline.campaignMetrics),
            completedAt: Date.now(),
            enhanced: true
        };

        // Send to analytics service
        await this.sendToEnhancedAnalyticsPipeline(pipelineData);

        // Store for future reference
        localStorage.setItem('beatx_enhanced_onboarding_pipeline', JSON.stringify(pipelineData));
    }

    async sendToEnhancedAnalyticsPipeline(data) {
        try {
            await fetch('/api/analytics/enhanced-onboarding', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
        } catch (error) {
            console.warn('Enhanced analytics pipeline failed:', error);
        }
    }

    dispatchOnboardingEvent(type, data = {}) {
        const event = new CustomEvent('enhanced-app-onboarding', {
            detail: { type, data, manager: this }
        });
        window.dispatchEvent(event);
    }

    getSponsorTiming(stepName) {
        const timings = {
            welcome: 0,
            account: 2000,
            role: 1000,
            profile: 3000,
            features: 1500
        };
        return timings[stepName] || 1000;
    }

    async startTour() {
        await this.completeOnboarding();
        
        // Start interactive tour of the app
        if (window.startInteractiveTour) {
            window.startInteractiveTour();
        }
    }

    // Utility methods
    getOnboardingProgress() {
        const completed = localStorage.getItem('beatx_enhanced_onboarding_completed');
        const choices = localStorage.getItem('beatx_enhanced_onboarding_choices');
        
        return {
            completed: completed === 'true',
            choices: choices ? JSON.parse(choices) : {},
            progress: this.currentStep / this.steps.length,
            pipeline: this.dataPipeline,
            enhanced: true
        };
    }

    resetOnboarding() {
        localStorage.removeItem('beatx_enhanced_onboarding_completed');
        localStorage.removeItem('beatx_enhanced_onboarding_choices');
        localStorage.removeItem('beatx_enhanced_user_preferences');
        localStorage.removeItem('beatx_enhanced_onboarding_pipeline');
        this.currentStep = 0;
        this.userChoices = {};
        this.dataPipeline = null;
    }
}

// Enhanced CSS for the onboarding system
const enhancedOnboardingCSS = `
.enhanced-onboarding-step {
    text-align: center;
    color: white;
}

.step-progress {
    margin-bottom: 24px;
}

.progress-bar {
    width: 100%;
    height: 4px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 2px;
    overflow: hidden;
    margin-bottom: 8px;
}

.progress-fill {
    height: 100%;
    background: linear-gradient(90deg, #ff9800, #ff5722);
    transition: width 0.3s ease;
}

.step-indicator {
    font-size: 12px;
    color: rgba(255, 255, 255, 0.7);
}

.step-header h2 {
    margin: 0 0 8px 0;
    font-size: 24px;
    font-weight: 600;
}

.step-header p {
    margin: 0 0 24px 0;
    color: rgba(255, 255, 255, 0.8);
}

.feature-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 16px;
    margin: 24px 0;
}

.feature-item {
    padding: 16px;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 8px;
    border: 1px solid rgba(255, 255, 255, 0.1);
}

.feature-icon {
    font-size: 32px;
    display: block;
    margin-bottom: 8px;
}

.feature-item h4 {
    margin: 0 0 4px 0;
    font-size: 14px;
}

.feature-item p {
    margin: 0;
    font-size: 12px;
    color: rgba(255, 255, 255, 0.7);
}

.account-options {
    display: grid;
    gap: 12px;
    margin: 20px 0;
}

.account-option {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 16px;
    background: rgba(255, 255, 255, 0.05);
    border: 2px solid rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s ease;
}

.account-option:hover {
    border-color: #ff9800;
}

.account-option.selected {
    border-color: #ff9800;
    background: rgba(255, 152, 0, 0.1);
}

.option-icon {
    font-size: 24px;
}

.option-content h4 {
    margin: 0 0 4px 0;
    font-size: 14px;
}

.option-content p {
    margin: 0;
    font-size: 12px;
    color: rgba(255, 255, 255, 0.7);
}

.account-benefits {
    margin: 20px 0;
    text-align: left;
}

.benefit-item {
    padding: 8px 0;
    color: rgba(255, 255, 255, 0.8);
    font-size: 14px;
}

.role-options {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 12px;
    margin: 20px 0;
}

.role-option {
    padding: 16px;
    background: rgba(255, 255, 255, 0.05);
    border: 2px solid rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s ease;
    text-align: left;
}

.role-option:hover {
    border-color: #ff9800;
}

.role-option.selected {
    border-color: #ff9800;
    background: rgba(255, 152, 0, 0.1);
}

.role-icon {
    font-size: 24px;
    display: block;
    margin-bottom: 8px;
}

.role-features {
    margin-top: 8px;
    display: flex;
    flex-direction: column;
    gap: 2px;
}

.role-features span {
    font-size: 10px;
    color: rgba(255, 255, 255, 0.6);
}

.profile-form {
    text-align: left;
    margin: 20px 0;
}

.form-row {
    margin-bottom: 16px;
}

.form-row label {
    display: block;
    margin-bottom: 4px;
    font-size: 12px;
    font-weight: 500;
}

.form-row input, .form-row select {
    width: 100%;
    padding: 8px 12px;
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 6px;
    color: white;
}

.checkbox-group {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 8px;
    margin-top: 8px;
}

.checkbox-group label {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 12px;
    cursor: pointer;
}

.feature-walkthrough {
    margin: 20px 0;
}

.feature-detail {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 16px;
    margin-bottom: 12px;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 8px;
    text-align: left;
}

.feature-detail .feature-icon {
    font-size: 24px;
    flex-shrink: 0;
}

.feature-info h4 {
    margin: 0 0 4px 0;
    font-size: 14px;
}

.feature-info p {
    margin: 0;
    font-size: 12px;
    color: rgba(255, 255, 255, 0.7);
}

.completion-summary {
    background: rgba(255, 255, 255, 0.05);
    border-radius: 8px;
    padding: 16px;
    margin: 20px 0;
    text-align: left;
}

.completion-summary h4 {
    margin: 0 0 12px 0;
    font-size: 14px;
}

.summary-item {
    display: flex;
    justify-content: space-between;
    margin-bottom: 8px;
    font-size: 12px;
}

.summary-label {
    color: rgba(255, 255, 255, 0.7);
}

.summary-value {
    color: #ff9800;
    font-weight: 500;
}

.next-steps {
    margin: 20px 0;
    text-align: left;
}

.next-steps h4 {
    margin: 0 0 12px 0;
    font-size: 14px;
}

.next-step-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 8px;
    margin-bottom: 8px;
    cursor: pointer;
    transition: all 0.2s ease;
}

.next-step-item:hover {
    background: rgba(255, 152, 0, 0.1);
}

.step-icon {
    font-size: 20px;
}

.next-step-item h5 {
    margin: 0 0 2px 0;
    font-size: 12px;
}

.next-step-item p {
    margin: 0;
    font-size: 10px;
    color: rgba(255, 255, 255, 0.7);
}

.step-actions {
    margin-top: 24px;
    display: flex;
    gap: 12px;
    justify-content: center;
}

.btn {
    padding: 12px 24px;
    border-radius: 6px;
    border: none;
    cursor: pointer;
    font-weight: 500;
    transition: all 0.2s ease;
}

.btn-primary {
    background: linear-gradient(135deg, #ff9800, #ff5722);
    color: white;
}

.btn-primary:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(255, 152, 0, 0.3);
}

.btn-primary:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
}

.btn-secondary {
    background: rgba(255, 255, 255, 0.1);
    color: white;
    border: 1px solid rgba(255, 255, 255, 0.2);
}

.btn-secondary:hover {
    background: rgba(255, 255, 255, 0.2);
}

.sponsor-placement {
    margin-top: 16px;
}

.enhanced-onboarding-sponsor {
    animation: fadeInUp 0.3s ease;
}

@keyframes fadeInUp {
    from {
        opacity: 0;
        transform: translateY(10px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}
`;

// Inject CSS
const style = document.createElement('style');
style.textContent = enhancedOnboardingCSS;
document.head.appendChild(style);

// Export
window.EnhancedOnboardingManager = EnhancedOnboardingManager;