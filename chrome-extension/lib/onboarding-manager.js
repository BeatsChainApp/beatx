/**
 * Extension Onboarding Manager with Sponsored Content Integration
 */

class OnboardingManager {
    constructor() {
        this.currentStep = 0;
        this.userChoices = {};
        this.sponsorManager = null;
        this.steps = ['welcome', 'account', 'role', 'profile', 'features', 'complete'];
    }

    async initialize() {
        // Initialize sponsor manager
        if (window.SponsorContentManager) {
            this.sponsorManager = new SponsorContentManager();
            await this.sponsorManager.initialize();
        }

        // Check if first time user
        const stored = await chrome.storage.local.get(['onboarding_completed']);
        if (!stored.onboarding_completed) {
            await this.startOnboarding();
        }
    }

    async startOnboarding() {
        // Create onboarding overlay
        this.createOnboardingOverlay();
        
        // Show partner consent first
        if (this.sponsorManager) {
            const consent = await this.sponsorManager.showInitialPartnerConsent();
            this.userChoices.sponsorConsent = consent;
        }

        // Start with welcome step
        this.showStep('welcome');
    }

    createOnboardingOverlay() {
        const overlay = document.createElement('div');
        overlay.id = 'onboarding-overlay';
        overlay.style.cssText = `
            position: fixed; top: 0; left: 0; right: 0; bottom: 0;
            background: rgba(13, 13, 13, 0.95); z-index: 20000;
            display: flex; align-items: center; justify-content: center;
            font-family: var(--bc-font-family);
        `;

        const container = document.createElement('div');
        container.id = 'onboarding-container';
        container.style.cssText = `
            background: var(--bc-surface); border-radius: 16px;
            padding: 32px; max-width: 600px; width: 90%;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
            border: 1px solid var(--bc-border);
        `;

        overlay.appendChild(container);
        document.body.appendChild(overlay);
    }

    async showStep(stepName) {
        const container = document.getElementById('onboarding-container');
        if (!container) return;

        // Render step content
        container.innerHTML = this.getStepContent(stepName);
        
        // Add event listeners
        this.setupStepListeners(stepName);

        // Show contextual sponsors
        if (this.sponsorManager && this.userChoices.sponsorConsent) {
            setTimeout(() => {
                this.showStepSponsors(stepName);
            }, this.getSponsorTiming(stepName));
        }
    }

    getStepContent(stepName) {
        const contents = {
            welcome: `
                <div class="onboarding-step">
                    <div class="step-header">
                        <div style="font-size: 48px; margin-bottom: 16px;">🎵</div>
                        <h2>Welcome to BeatsChain</h2>
                        <p>Transform your music into NFTs, submit to radio stations, and generate professional ISRC codes</p>
                    </div>
                    <div class="step-content">
                        <div class="feature-grid">
                            <div class="feature-item">
                                <span class="feature-icon">🎧</span>
                                <h4>NFT Minting</h4>
                                <p>Turn your music into blockchain assets</p>
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
                <div class="onboarding-step">
                    <div class="step-header">
                        <h2>🔐 Choose Your Google Account</h2>
                        <p>Sign in to access all features and sync your data</p>
                    </div>
                    <div class="step-content">
                        <div class="account-benefits">
                            <div class="benefit-item">✅ Secure wallet generation</div>
                            <div class="benefit-item">✅ Cloud sync across devices</div>
                            <div class="benefit-item">✅ Professional features access</div>
                            <div class="benefit-item">✅ Transaction history</div>
                        </div>
                        <div id="account-sponsors" class="sponsor-placement"></div>
                    </div>
                    <div class="step-actions">
                        <button class="btn btn-primary" data-action="signin">🔑 Sign in with Google</button>
                        <button class="btn btn-secondary" data-action="back">Back</button>
                    </div>
                </div>
            `,
            role: `
                <div class="onboarding-step">
                    <div class="step-header">
                        <h2>🎯 What describes you best?</h2>
                        <p>This helps us customize your experience</p>
                    </div>
                    <div class="step-content">
                        <div class="role-options">
                            <div class="role-option" data-role="solo_artist">
                                <span class="role-icon">🎤</span>
                                <h4>Solo Artist</h4>
                                <p>Create and mint your music as NFTs</p>
                            </div>
                            <div class="role-option" data-role="producer">
                                <span class="role-icon">🎹</span>
                                <h4>Producer/Beat Maker</h4>
                                <p>Create beats and instrumentals</p>
                            </div>
                            <div class="role-option" data-role="both">
                                <span class="role-icon">🎵</span>
                                <h4>Both Artist & Producer</h4>
                                <p>Full music creation suite</p>
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
                <div class="onboarding-step">
                    <div class="step-header">
                        <h2>📝 Set Up Your Artist Profile</h2>
                        <p>Complete your profile to get started</p>
                    </div>
                    <div class="step-content">
                        <div class="profile-form">
                            <div class="form-row">
                                <label>Artist Name *</label>
                                <input type="text" id="artist-name" placeholder="Your artist name" required>
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
                                    <option value="Other">Other</option>
                                </select>
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
                <div class="onboarding-step">
                    <div class="step-header">
                        <h2>🚀 Your BeatsChain Toolkit</h2>
                        <p>Everything you need to succeed in the music industry</p>
                    </div>
                    <div class="step-content">
                        <div class="feature-walkthrough">
                            <div class="feature-detail" data-feature="nft">
                                <span class="feature-icon">🎧</span>
                                <div class="feature-info">
                                    <h4>NFT Minting</h4>
                                    <p>Turn your music into blockchain assets with automatic licensing</p>
                                </div>
                                <div class="feature-sponsors" id="nft-sponsors"></div>
                            </div>
                            <div class="feature-detail" data-feature="radio">
                                <span class="feature-icon">📻</span>
                                <div class="feature-info">
                                    <h4>Radio Submission</h4>
                                    <p>Professional packages for SA radio stations with SAMRO docs</p>
                                </div>
                                <div class="feature-sponsors" id="radio-sponsors"></div>
                            </div>
                            <div class="feature-detail" data-feature="isrc">
                                <span class="feature-icon">🎯</span>
                                <div class="feature-info">
                                    <h4>ISRC Generation</h4>
                                    <p>Industry-standard music codes for professional distribution</p>
                                </div>
                                <div class="feature-sponsors" id="isrc-sponsors"></div>
                            </div>
                        </div>
                    </div>
                    <div class="step-actions">
                        <button class="btn btn-primary" data-action="complete">Start Creating</button>
                        <button class="btn btn-secondary" data-action="tour">Take Tour</button>
                    </div>
                </div>
            `
        };

        return contents[stepName] || '';
    }

    setupStepListeners(stepName) {
        const container = document.getElementById('onboarding-container');
        
        // Action buttons
        container.querySelectorAll('[data-action]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.handleAction(e.target.dataset.action, stepName);
            });
        });

        // Step-specific listeners
        if (stepName === 'role') {
            container.querySelectorAll('.role-option').forEach(option => {
                option.addEventListener('click', () => {
                    container.querySelectorAll('.role-option').forEach(o => o.classList.remove('selected'));
                    option.classList.add('selected');
                    this.userChoices.role = option.dataset.role;
                    container.querySelector('[data-action="next"]').disabled = false;
                    
                    // Show role-specific sponsors
                    if (this.sponsorManager && this.userChoices.sponsorConsent) {
                        this.showRoleSponsors(option.dataset.role);
                    }
                });
            });
        }
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
                await this.handleGoogleSignIn();
                break;
            case 'complete':
                await this.completeOnboarding();
                break;
            case 'tour':
                await this.startTour();
                break;
        }
    }

    async nextStep(currentStep) {
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

    async handleGoogleSignIn() {
        try {
            // Use existing unified auth
            if (window.unifiedAuth) {
                const result = await window.unifiedAuth.signInWithGoogle(true);
                if (result.success) {
                    this.userChoices.authenticated = true;
                    this.userChoices.userProfile = result.user;
                    this.nextStep('account');
                }
            }
        } catch (error) {
            console.error('Sign-in failed:', error);
        }
    }

    async completeOnboarding() {
        // Save choices
        await chrome.storage.local.set({
            onboarding_completed: true,
            onboarding_choices: this.userChoices
        });

        // Remove overlay
        const overlay = document.getElementById('onboarding-overlay');
        if (overlay) overlay.remove();

        // Show first action guidance
        this.showFirstActionGuidance();
    }

    async skipOnboarding() {
        await chrome.storage.local.set({ onboarding_completed: true });
        const overlay = document.getElementById('onboarding-overlay');
        if (overlay) overlay.remove();
    }

    showFirstActionGuidance() {
        // Create first action modal
        const modal = document.createElement('div');
        modal.style.cssText = `
            position: fixed; top: 20px; right: 20px;
            background: var(--bc-surface); border-radius: 12px;
            padding: 20px; max-width: 300px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
            border: 1px solid var(--bc-border); z-index: 10000;
        `;

        modal.innerHTML = `
            <h4 style="margin: 0 0 12px 0; color: var(--bc-text-primary);">🎵 Ready to get started?</h4>
            <div class="first-actions">
                <button class="btn btn-sm" data-action="mint">🎧 Upload & Mint NFT</button>
                <button class="btn btn-sm" data-action="radio">📻 Radio Submission</button>
                <button class="btn btn-sm" data-action="isrc">🎯 Generate ISRC</button>
            </div>
            <button class="close-btn" style="position: absolute; top: 8px; right: 8px; background: none; border: none; color: var(--bc-text-secondary); cursor: pointer;">&times;</button>
        `;

        document.body.appendChild(modal);

        // Auto-remove after 10 seconds
        setTimeout(() => {
            if (modal.parentNode) modal.remove();
        }, 10000);

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

    handleFirstAction(action) {
        // Navigate to appropriate section
        const sections = {
            mint: 'upload-section',
            radio: 'radio-section', 
            isrc: 'isrc-minting-section'
        };

        if (window.app && window.app.switchTab) {
            const sectionMap = { mint: 'mint', radio: 'radio', isrc: 'mint' };
            window.app.switchTab(sectionMap[action]);
        }
    }

    // Sponsor integration methods
    showStepSponsors(stepName) {
        if (!this.sponsorManager) return;

        const sponsorPlacements = {
            welcome: { container: '#welcome-sponsors', category: 'partner_ecosystem' },
            account: { container: '#account-sponsors', category: 'professional_services' },
            profile: { container: '#profile-sponsors', category: 'profile_services' }
        };

        const placement = sponsorPlacements[stepName];
        if (placement) {
            const container = document.querySelector(placement.container);
            if (container) {
                const sponsorContent = this.createOnboardingSponsor(placement.category, stepName);
                if (sponsorContent) container.appendChild(sponsorContent);
            }
        }
    }

    showRoleSponsors(role) {
        const roleSponsors = {
            solo_artist: { category: 'individual_artist_tools', message: 'Solo artist toolkit available' },
            producer: { category: 'beat_distribution', message: 'Beat distribution services' },
            both: { category: 'full_suite_services', message: 'Complete music creation suite' }
        };

        const sponsor = roleSponsors[role];
        if (sponsor) {
            const container = document.querySelector('#role-sponsors');
            if (container) {
                container.innerHTML = '';
                const sponsorEl = this.createOnboardingSponsor(sponsor.category, 'role', sponsor.message);
                if (sponsorEl) container.appendChild(sponsorEl);
            }
        }
    }

    createOnboardingSponsor(category, step, customMessage = null) {
        const sponsorEl = document.createElement('div');
        sponsorEl.className = 'onboarding-sponsor';
        sponsorEl.style.cssText = `
            margin: 16px 0; padding: 12px;
            background: rgba(0, 214, 122, 0.05);
            border: 1px solid rgba(0, 214, 122, 0.2);
            border-radius: 8px; font-size: 12px;
        `;

        const messages = {
            partner_ecosystem: 'Powered by professional music industry partners',
            professional_services: 'Professional services available after sign-in',
            profile_services: 'Profile optimization services available',
            individual_artist_tools: 'Solo artist toolkit and services',
            beat_distribution: 'Beat distribution and licensing services',
            full_suite_services: 'Complete music creation and distribution suite'
        };

        sponsorEl.innerHTML = `
            <div style="display: flex; align-items: center; gap: 8px;">
                <span style="font-size: 16px;">📢</span>
                <div style="flex: 1;">
                    <div style="color: var(--bc-text-primary); font-weight: 500;">
                        ${customMessage || messages[category]}
                    </div>
                    <div style="color: var(--bc-text-secondary); font-size: 10px; margin-top: 2px;">
                        Professional partner content
                    </div>
                </div>
            </div>
        `;

        return sponsorEl;
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
        // Close onboarding and start interactive tour
        await this.completeOnboarding();
        
        // Start tour of main interface
        if (window.app && window.app.startInteractiveTour) {
            window.app.startInteractiveTour();
        }
    }
}

// CSS for onboarding
const onboardingCSS = `
.onboarding-step {
    text-align: center;
    color: var(--bc-text-primary);
}

.step-header h2 {
    margin: 0 0 8px 0;
    font-size: 24px;
    font-weight: 600;
}

.step-header p {
    margin: 0 0 24px 0;
    color: var(--bc-text-secondary);
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
    border: 1px solid var(--bc-border);
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
    color: var(--bc-text-secondary);
}

.account-benefits {
    margin: 20px 0;
    text-align: left;
}

.benefit-item {
    padding: 8px 0;
    color: var(--bc-text-secondary);
    font-size: 14px;
}

.role-options {
    display: grid;
    gap: 12px;
    margin: 20px 0;
}

.role-option {
    padding: 16px;
    background: rgba(255, 255, 255, 0.05);
    border: 2px solid var(--bc-border);
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s ease;
}

.role-option:hover {
    border-color: var(--bc-accent-green);
}

.role-option.selected {
    border-color: var(--bc-accent-green);
    background: rgba(0, 214, 122, 0.1);
}

.role-icon {
    font-size: 24px;
    display: block;
    margin-bottom: 8px;
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
    background: var(--bc-surface-light);
    border: 1px solid var(--bc-border);
    border-radius: 6px;
    color: var(--bc-text-primary);
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
    color: var(--bc-text-secondary);
}

.step-actions {
    margin-top: 24px;
    display: flex;
    gap: 12px;
    justify-content: center;
}

.first-actions {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-bottom: 12px;
}

.btn-sm {
    padding: 8px 12px;
    font-size: 12px;
}
`;

// Inject CSS
const style = document.createElement('style');
style.textContent = onboardingCSS;
document.head.appendChild(style);

// Export
window.OnboardingManager = OnboardingManager;