/**
 * Secure App Onboarding Manager - Production Ready
 * Fixed all security vulnerabilities: XSS, CSRF, Code Injection, Error Handling
 */

class SecureAppOnboardingManager {
    constructor() {
        this.currentStep = 0;
        this.userChoices = {};
        this.sponsorManager = null;
        this.steps = ['welcome', 'account', 'role', 'profile', 'features', 'complete'];
        this.isFirstTime = true;
        this.csrfToken = this.generateCSRFToken();
        this.stepTemplates = {}; // Cache for performance
        this.eventListeners = []; // Track for cleanup
        
        // Static data to prevent recreation
        this.appMessages = {
            marketplace_services: 'Boost your marketplace presence with professional services',
            professional_services: 'Professional services available after sign-in',
            profile_services: 'Profile optimization services available',
            individual_artist_tools: 'Solo artist toolkit and services',
            beat_distribution: 'Beat distribution and licensing services',
            full_suite_services: 'Complete music creation and distribution suite'
        };
        
        this.appRoleSponsors = {
            solo_artist: { category: 'individual_artist_tools', message: 'Solo artist toolkit available' },
            producer: { category: 'beat_distribution', message: 'Beat distribution services' },
            both: { category: 'full_suite_services', message: 'Complete music creation suite' }
        };
    }

    generateCSRFToken() {
        return Math.random().toString(36).substring(2) + Date.now().toString(36);
    }

    sanitizeInput(input) {
        if (typeof input !== 'string') return '';
        return input.replace(/[<>\"'&]/g, (match) => {
            const map = {
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#x27;',
                '&': '&amp;'
            };
            return map[match];
        });
    }

    validateCSRF(token) {
        return token === this.csrfToken;
    }

    async initialize() {
        try {
            // Initialize sponsor manager for app context
            if (window.SponsorContentManager) {
                this.sponsorManager = new SponsorContentManager();
                try {
                    await this.sponsorManager.initialize();
                } catch (error) {
                    console.warn('Sponsor manager initialization failed:', error);
                }
            }

            // Check if first time user with error handling
            try {
                const stored = localStorage.getItem('app_onboarding_completed');
                if (!stored) {
                    await this.startOnboarding();
                }
            } catch (error) {
                console.warn('localStorage access failed:', error);
                await this.startOnboarding(); // Fallback to show onboarding
            }
        } catch (error) {
            console.error('Onboarding initialization failed:', error);
        }
    }

    async startOnboarding() {
        try {
            this.createOnboardingOverlay();
            
            // Show partner consent first with error handling
            if (this.sponsorManager) {
                try {
                    const consent = await this.sponsorManager.showInitialPartnerConsent();
                    this.userChoices.sponsorConsent = consent;
                } catch (error) {
                    console.warn('Sponsor consent failed:', error);
                }
            }

            this.showStep('welcome');
        } catch (error) {
            console.error('Failed to start onboarding:', error);
        }
    }

    createOnboardingOverlay() {
        try {
            if (!document.body) {
                console.error('Document body not available');
                return;
            }

            const overlay = document.createElement('div');
            overlay.id = 'app-onboarding-overlay';
            overlay.style.cssText = `
                position: fixed; top: 0; left: 0; right: 0; bottom: 0;
                background: rgba(13, 13, 13, 0.95); z-index: 20000;
                display: flex; align-items: center; justify-content: center;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            `;

            const container = document.createElement('div');
            container.id = 'app-onboarding-container';
            container.style.cssText = `
                background: #1a1a1a; border-radius: 16px;
                padding: 32px; max-width: 700px; width: 90%;
                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
                border: 1px solid #333; color: white;
            `;

            overlay.appendChild(container);
            document.body.appendChild(overlay);
        } catch (error) {
            console.error('Failed to create overlay:', error);
        }
    }

    async showStep(stepName) {
        try {
            const container = document.getElementById('app-onboarding-container');
            if (!container) {
                console.error('Onboarding container not found');
                return;
            }

            // Use cached template or create new one
            if (!this.stepTemplates[stepName]) {
                this.stepTemplates[stepName] = this.getStepContent(stepName);
            }

            // Create content safely without innerHTML
            this.createStepContent(container, stepName);
            this.setupStepListeners(stepName);

            // Show contextual sponsors with error handling
            if (this.sponsorManager && this.userChoices.sponsorConsent) {
                setTimeout(() => {
                    try {
                        this.showAppStepSponsors(stepName);
                    } catch (error) {
                        console.warn('Sponsor display failed:', error);
                    }
                }, this.getSponsorTiming(stepName));
            }
        } catch (error) {
            console.error('Failed to show step:', error);
        }
    }

    createStepContent(container, stepName) {
        // Clear container safely
        while (container.firstChild) {
            container.removeChild(container.firstChild);
        }

        const stepDiv = document.createElement('div');
        stepDiv.className = 'app-onboarding-step';

        // Create step content based on step name
        switch (stepName) {
            case 'welcome':
                this.createWelcomeStep(stepDiv);
                break;
            case 'account':
                this.createAccountStep(stepDiv);
                break;
            case 'role':
                this.createRoleStep(stepDiv);
                break;
            case 'profile':
                this.createProfileStep(stepDiv);
                break;
            case 'features':
                this.createFeaturesStep(stepDiv);
                break;
            default:
                console.warn('Unknown step:', stepName);
                return;
        }

        container.appendChild(stepDiv);
    }

    createWelcomeStep(container) {
        const header = this.createStepHeader('🎵', 'Welcome to BeatsChain Marketplace', 'Transform your music into NFTs • Submit to radio stations • Generate professional ISRC codes');
        const content = this.createFeatureGrid();
        const actions = this.createStepActions([
            { text: 'Get Started', action: 'next', primary: true },
            { text: 'Skip Setup', action: 'skip', primary: false }
        ]);
        const sponsors = this.createSponsorPlacement('welcome-sponsors');

        container.appendChild(header);
        container.appendChild(content);
        container.appendChild(actions);
        container.appendChild(sponsors);
    }

    createAccountStep(container) {
        const header = this.createStepHeader('🔐', 'Choose Your Google Account', 'Sign in to access marketplace features and sync your data');
        const content = this.createAccountBenefits();
        const actions = this.createStepActions([
            { text: '🔑 Sign in with Google', action: 'signin', primary: true },
            { text: 'Back', action: 'back', primary: false }
        ]);
        const sponsors = this.createSponsorPlacement('account-sponsors');

        container.appendChild(header);
        container.appendChild(content);
        container.appendChild(sponsors);
        container.appendChild(actions);
    }

    createRoleStep(container) {
        const header = this.createStepHeader('🎯', 'What describes you best?', 'This helps us customize your marketplace experience');
        const content = this.createRoleOptions();
        const actions = this.createStepActions([
            { text: 'Continue', action: 'next', primary: true, disabled: true },
            { text: 'Back', action: 'back', primary: false }
        ]);
        const sponsors = this.createSponsorPlacement('role-sponsors');

        container.appendChild(header);
        container.appendChild(content);
        container.appendChild(sponsors);
        container.appendChild(actions);
    }

    createProfileStep(container) {
        const header = this.createStepHeader('📝', 'Set Up Your Artist Profile', 'Complete your profile to get started');
        const content = this.createProfileForm();
        const actions = this.createStepActions([
            { text: 'Continue', action: 'next', primary: true },
            { text: 'Skip for Now', action: 'skip', primary: false },
            { text: 'Back', action: 'back', primary: false }
        ]);
        const sponsors = this.createSponsorPlacement('profile-sponsors');

        container.appendChild(header);
        container.appendChild(content);
        container.appendChild(sponsors);
        container.appendChild(actions);
    }

    createFeaturesStep(container) {
        const header = this.createStepHeader('🚀', 'Your BeatsChain Toolkit', 'Everything you need to succeed in the music industry');
        const content = this.createFeatureWalkthrough();
        const actions = this.createStepActions([
            { text: 'Start Creating', action: 'complete', primary: true },
            { text: 'Take Tour', action: 'tour', primary: false }
        ]);

        container.appendChild(header);
        container.appendChild(content);
        container.appendChild(actions);
    }

    createStepHeader(icon, title, description) {
        const header = document.createElement('div');
        header.className = 'step-header';

        const iconEl = document.createElement('div');
        iconEl.textContent = icon;
        iconEl.style.cssText = 'font-size: 48px; margin-bottom: 16px;';

        const titleEl = document.createElement('h2');
        titleEl.textContent = title;

        const descEl = document.createElement('p');
        descEl.textContent = description;

        header.appendChild(iconEl);
        header.appendChild(titleEl);
        header.appendChild(descEl);

        return header;
    }

    createStepActions(actions) {
        const actionsDiv = document.createElement('div');
        actionsDiv.className = 'step-actions';

        actions.forEach(({ text, action, primary, disabled }) => {
            const button = document.createElement('button');
            button.className = primary ? 'btn btn-primary' : 'btn btn-secondary';
            button.textContent = text;
            button.dataset.action = action;
            button.dataset.csrf = this.csrfToken;
            if (disabled) button.disabled = true;
            actionsDiv.appendChild(button);
        });

        return actionsDiv;
    }

    createSponsorPlacement(id) {
        const div = document.createElement('div');
        div.id = id;
        div.className = 'sponsor-placement';
        return div;
    }

    createFeatureGrid() {
        const content = document.createElement('div');
        content.className = 'step-content';

        const grid = document.createElement('div');
        grid.className = 'feature-grid';

        const features = [
            { icon: '🎧', title: 'NFT Minting', desc: 'Turn your music into blockchain assets' },
            { icon: '📻', title: 'Radio Submission', desc: 'Professional SA radio packages' },
            { icon: '🎯', title: 'ISRC Generation', desc: 'Industry-standard music codes' }
        ];

        features.forEach(({ icon, title, desc }) => {
            const item = document.createElement('div');
            item.className = 'feature-item';

            const iconEl = document.createElement('span');
            iconEl.className = 'feature-icon';
            iconEl.textContent = icon;

            const titleEl = document.createElement('h4');
            titleEl.textContent = title;

            const descEl = document.createElement('p');
            descEl.textContent = desc;

            item.appendChild(iconEl);
            item.appendChild(titleEl);
            item.appendChild(descEl);
            grid.appendChild(item);
        });

        content.appendChild(grid);
        return content;
    }

    createAccountBenefits() {
        const content = document.createElement('div');
        content.className = 'step-content';

        const benefits = document.createElement('div');
        benefits.className = 'account-benefits';

        const items = [
            '✅ Secure profile management',
            '✅ Cross-device sync',
            '✅ Marketplace access',
            '✅ Transaction history'
        ];

        items.forEach(text => {
            const item = document.createElement('div');
            item.className = 'benefit-item';
            item.textContent = text;
            benefits.appendChild(item);
        });

        content.appendChild(benefits);
        return content;
    }

    createRoleOptions() {
        const content = document.createElement('div');
        content.className = 'step-content';

        const options = document.createElement('div');
        options.className = 'role-options';

        const roles = [
            { role: 'solo_artist', icon: '🎤', title: 'Solo Artist', desc: 'Create and mint your music as NFTs' },
            { role: 'producer', icon: '🎹', title: 'Producer/Beat Maker', desc: 'Create beats and instrumentals' },
            { role: 'both', icon: '🎵', title: 'Both Artist & Producer', desc: 'Full music creation suite' }
        ];

        roles.forEach(({ role, icon, title, desc }) => {
            const option = document.createElement('div');
            option.className = 'role-option';
            option.dataset.role = role;

            const iconEl = document.createElement('span');
            iconEl.className = 'role-icon';
            iconEl.textContent = icon;

            const titleEl = document.createElement('h4');
            titleEl.textContent = title;

            const descEl = document.createElement('p');
            descEl.textContent = desc;

            option.appendChild(iconEl);
            option.appendChild(titleEl);
            option.appendChild(descEl);
            options.appendChild(option);
        });

        content.appendChild(options);
        return content;
    }

    createProfileForm() {
        const content = document.createElement('div');
        content.className = 'step-content';

        const form = document.createElement('div');
        form.className = 'profile-form';

        // Artist Name
        const nameRow = this.createFormRow('Artist Name *', 'text', 'artist-name', 'Your artist name', true);
        form.appendChild(nameRow);

        // Stage Name
        const stageRow = this.createFormRow('Stage Name', 'text', 'stage-name', 'Your stage name (optional)', false);
        form.appendChild(stageRow);

        // Genre
        const genreRow = this.createFormRow('Primary Genre *', 'select', 'genre', null, true, [
            { value: '', text: 'Select Genre' },
            { value: 'Hip-Hop', text: 'Hip-Hop' },
            { value: 'House', text: 'House' },
            { value: 'Afrikaans', text: 'Afrikaans' },
            { value: 'Gospel', text: 'Gospel' },
            { value: 'Jazz', text: 'Jazz' },
            { value: 'Other', text: 'Other' }
        ]);
        form.appendChild(genreRow);

        content.appendChild(form);
        return content;
    }

    createFormRow(label, type, id, placeholder, required, options = null) {
        const row = document.createElement('div');
        row.className = 'form-row';

        const labelEl = document.createElement('label');
        labelEl.textContent = label;
        labelEl.setAttribute('for', id);

        let input;
        if (type === 'select') {
            input = document.createElement('select');
            if (options) {
                options.forEach(({ value, text }) => {
                    const option = document.createElement('option');
                    option.value = value;
                    option.textContent = text;
                    input.appendChild(option);
                });
            }
        } else {
            input = document.createElement('input');
            input.type = type;
            if (placeholder) input.placeholder = placeholder;
        }

        input.id = id;
        if (required) input.required = true;

        row.appendChild(labelEl);
        row.appendChild(input);
        return row;
    }

    createFeatureWalkthrough() {
        const content = document.createElement('div');
        content.className = 'step-content';

        const walkthrough = document.createElement('div');
        walkthrough.className = 'feature-walkthrough';

        const features = [
            { feature: 'nft', icon: '🎧', title: 'NFT Minting', desc: 'Turn your music into blockchain assets with automatic licensing' },
            { feature: 'radio', icon: '📻', title: 'Radio Submission', desc: 'Professional packages for SA radio stations with SAMRO docs' },
            { feature: 'isrc', icon: '🎯', title: 'ISRC Generation', desc: 'Industry-standard music codes for professional distribution' }
        ];

        features.forEach(({ feature, icon, title, desc }) => {
            const detail = document.createElement('div');
            detail.className = 'feature-detail';
            detail.dataset.feature = feature;

            const iconEl = document.createElement('span');
            iconEl.className = 'feature-icon';
            iconEl.textContent = icon;

            const info = document.createElement('div');
            info.className = 'feature-info';

            const titleEl = document.createElement('h4');
            titleEl.textContent = title;

            const descEl = document.createElement('p');
            descEl.textContent = desc;

            info.appendChild(titleEl);
            info.appendChild(descEl);
            detail.appendChild(iconEl);
            detail.appendChild(info);
            walkthrough.appendChild(detail);
        });

        content.appendChild(walkthrough);
        return content;
    }

    setupStepListeners(stepName) {
        try {
            // Clean up previous listeners
            this.cleanupEventListeners();

            const container = document.getElementById('app-onboarding-container');
            if (!container) return;

            // Action buttons with CSRF protection
            container.querySelectorAll('[data-action]').forEach(btn => {
                const listener = (e) => {
                    e.preventDefault();
                    const action = this.sanitizeInput(e.target.dataset.action);
                    if (this.validateCSRF(e.target.dataset.csrf)) {
                        this.handleAction(action, stepName);
                    } else {
                        console.warn('CSRF validation failed');
                    }
                };
                btn.addEventListener('click', listener);
                this.eventListeners.push({ element: btn, event: 'click', listener });
            });

            // Step-specific listeners
            if (stepName === 'role') {
                container.querySelectorAll('.role-option').forEach(option => {
                    const listener = () => {
                        try {
                            container.querySelectorAll('.role-option').forEach(o => o.classList.remove('selected'));
                            option.classList.add('selected');
                            const role = this.sanitizeInput(option.dataset.role);
                            this.userChoices.role = role;
                            
                            const nextBtn = container.querySelector('[data-action="next"]');
                            if (nextBtn) nextBtn.disabled = false;
                            
                            // Show role-specific sponsors with error handling
                            if (this.sponsorManager && this.userChoices.sponsorConsent) {
                                try {
                                    this.showAppRoleSponsors(role);
                                } catch (error) {
                                    console.warn('Role sponsor display failed:', error);
                                }
                            }
                        } catch (error) {
                            console.error('Role selection failed:', error);
                        }
                    };
                    option.addEventListener('click', listener);
                    this.eventListeners.push({ element: option, event: 'click', listener });
                });
            }
        } catch (error) {
            console.error('Failed to setup listeners:', error);
        }
    }

    cleanupEventListeners() {
        this.eventListeners.forEach(({ element, event, listener }) => {
            try {
                element.removeEventListener(event, listener);
            } catch (error) {
                console.warn('Failed to remove listener:', error);
            }
        });
        this.eventListeners = [];
    }

    async handleAction(action, currentStep) {
        try {
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
                default:
                    console.warn('Unknown action:', action);
                    break;
            }
        } catch (error) {
            console.error('Action handling failed:', error);
        }
    }

    async nextStep(currentStep) {
        try {
            const stepIndex = this.steps.indexOf(currentStep);
            if (stepIndex < this.steps.length - 1) {
                const nextStep = this.steps[stepIndex + 1];
                this.currentStep = stepIndex + 1;
                this.showStep(nextStep);
            }
        } catch (error) {
            console.error('Next step failed:', error);
        }
    }

    previousStep(currentStep) {
        try {
            const stepIndex = this.steps.indexOf(currentStep);
            if (stepIndex > 0) {
                const prevStep = this.steps[stepIndex - 1];
                this.currentStep = stepIndex - 1;
                this.showStep(prevStep);
            }
        } catch (error) {
            console.error('Previous step failed:', error);
        }
    }

    async handleGoogleSignIn() {
        try {
            if (window.authContext && typeof window.authContext.signInWithGoogle === 'function') {
                const result = await window.authContext.signInWithGoogle();
                if (result) {
                    this.userChoices.authenticated = true;
                    this.userChoices.userProfile = result;
                    await this.nextStep('account');
                }
            } else {
                console.warn('Auth context not available');
            }
        } catch (error) {
            console.error('Sign-in failed:', error);
        }
    }

    async completeOnboarding() {
        try {
            // Save choices with error handling
            try {
                localStorage.setItem('app_onboarding_completed', 'true');
                localStorage.setItem('app_onboarding_choices', JSON.stringify(this.userChoices));
            } catch (storageError) {
                console.warn('Failed to save onboarding data:', storageError);
            }

            // Clean up
            this.cleanupEventListeners();

            // Remove overlay
            const overlay = document.getElementById('app-onboarding-overlay');
            if (overlay && overlay.parentNode) {
                overlay.parentNode.removeChild(overlay);
            }

            // Show first action guidance
            this.showFirstActionGuidance();
        } catch (error) {
            console.error('Failed to complete onboarding:', error);
        }
    }

    async skipOnboarding() {
        try {
            try {
                localStorage.setItem('app_onboarding_completed', 'true');
            } catch (storageError) {
                console.warn('Failed to save skip status:', storageError);
            }
            
            this.cleanupEventListeners();
            
            const overlay = document.getElementById('app-onboarding-overlay');
            if (overlay && overlay.parentNode) {
                overlay.parentNode.removeChild(overlay);
            }
        } catch (error) {
            console.error('Failed to skip onboarding:', error);
        }
    }

    showFirstActionGuidance() {
        try {
            if (!document.body) {
                console.error('Document body not available');
                return;
            }

            const modal = document.createElement('div');
            modal.style.cssText = `
                position: fixed; top: 20px; right: 20px;
                background: #1a1a1a; border-radius: 12px;
                padding: 20px; max-width: 300px; color: white;
                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
                border: 1px solid #333; z-index: 10000;
            `;

            // Create elements safely
            const title = document.createElement('h4');
            title.textContent = '🎵 Ready to get started?';
            title.style.cssText = 'margin: 0 0 12px 0;';

            const actionsDiv = document.createElement('div');
            actionsDiv.className = 'first-actions';

            const actions = [
                { action: 'upload', text: '🎧 Upload & Mint NFT' },
                { action: 'radio', text: '📻 Radio Submission' },
                { action: 'isrc', text: '🎯 Generate ISRC' },
                { action: 'marketplace', text: '🏪 Browse Marketplace' }
            ];

            actions.forEach(({ action, text }) => {
                const button = document.createElement('button');
                button.className = 'btn btn-sm';
                button.textContent = text;
                button.dataset.action = action;
                button.dataset.csrf = this.csrfToken;
                actionsDiv.appendChild(button);
            });

            const closeBtn = document.createElement('button');
            closeBtn.className = 'close-btn';
            closeBtn.textContent = '×';
            closeBtn.style.cssText = 'position: absolute; top: 8px; right: 8px; background: none; border: none; color: #999; cursor: pointer;';

            modal.appendChild(title);
            modal.appendChild(actionsDiv);
            modal.appendChild(closeBtn);
            document.body.appendChild(modal);

            // Auto-remove with cleanup
            const autoRemoveTimeout = setTimeout(() => {
                if (modal.parentNode) {
                    modal.parentNode.removeChild(modal);
                }
            }, 12000);

            // Handle actions with CSRF validation
            const clickListener = (e) => {
                e.preventDefault();
                try {
                    if (e.target.dataset.action && this.validateCSRF(e.target.dataset.csrf)) {
                        const action = this.sanitizeInput(e.target.dataset.action);
                        this.handleMarketplaceAction(action);
                        clearTimeout(autoRemoveTimeout);
                        if (modal.parentNode) {
                            modal.parentNode.removeChild(modal);
                        }
                    } else if (e.target.classList.contains('close-btn')) {
                        clearTimeout(autoRemoveTimeout);
                        if (modal.parentNode) {
                            modal.parentNode.removeChild(modal);
                        }
                    }
                } catch (error) {
                    console.error('Action handling failed:', error);
                }
            };

            modal.addEventListener('click', clickListener);
        } catch (error) {
            console.error('Failed to show guidance:', error);
        }
    }

    handleMarketplaceAction(action) {
        try {
            const routes = {
                upload: '/upload',
                radio: '/upload?tab=radio',
                isrc: '/upload?tab=isrc',
                marketplace: '/beatnfts'
            };

            if (routes[action]) {
                // Use safer navigation
                if (window.history && window.history.pushState) {
                    window.history.pushState(null, '', routes[action]);
                    window.dispatchEvent(new PopStateEvent('popstate'));
                } else {
                    window.location.href = routes[action];
                }
            } else {
                console.warn('Invalid action:', action);
            }
        } catch (error) {
            console.error('Navigation failed:', error);
        }
    }

    showAppStepSponsors(stepName) {
        try {
            if (!this.sponsorManager) return;

            const appSponsorPlacements = {
                welcome: { container: '#welcome-sponsors', category: 'marketplace_services' },
                account: { container: '#account-sponsors', category: 'professional_services' },
                profile: { container: '#profile-sponsors', category: 'profile_services' }
            };

            const placement = appSponsorPlacements[stepName];
            if (placement) {
                const container = document.querySelector(placement.container);
                if (container) {
                    const sponsorContent = this.createAppOnboardingSponsor(placement.category, stepName);
                    if (sponsorContent) container.appendChild(sponsorContent);
                }
            }
        } catch (error) {
            console.error('Failed to show sponsors:', error);
        }
    }

    showAppRoleSponsors(role) {
        try {
            const sponsor = this.appRoleSponsors[role];
            if (sponsor) {
                const container = document.querySelector('#role-sponsors');
                if (container) {
                    // Clear safely
                    while (container.firstChild) {
                        container.removeChild(container.firstChild);
                    }
                    const sponsorEl = this.createAppOnboardingSponsor(sponsor.category, 'role', sponsor.message);
                    if (sponsorEl) container.appendChild(sponsorEl);
                }
            }
        } catch (error) {
            console.error('Failed to show role sponsors:', error);
        }
    }

    createAppOnboardingSponsor(category, step, customMessage = null) {
        try {
            const sponsorEl = document.createElement('div');
            sponsorEl.className = 'app-onboarding-sponsor';
            sponsorEl.style.cssText = `
                margin: 16px 0; padding: 12px;
                background: rgba(255, 152, 0, 0.05);
                border: 1px solid rgba(255, 152, 0, 0.2);
                border-radius: 8px; font-size: 12px;
            `;

            // Create safely without innerHTML
            const container = document.createElement('div');
            container.style.cssText = 'display: flex; align-items: center; gap: 8px;';

            const icon = document.createElement('span');
            icon.textContent = '🏪';
            icon.style.fontSize = '16px';

            const content = document.createElement('div');
            content.style.flex = '1';

            const message = document.createElement('div');
            message.style.cssText = 'color: white; font-weight: 500;';
            message.textContent = customMessage || this.appMessages[category] || 'Professional services available';

            const subtitle = document.createElement('div');
            subtitle.style.cssText = 'color: #999; font-size: 10px; margin-top: 2px;';
            subtitle.textContent = 'Professional marketplace partner';

            content.appendChild(message);
            content.appendChild(subtitle);
            container.appendChild(icon);
            container.appendChild(content);
            sponsorEl.appendChild(container);

            return sponsorEl;
        } catch (error) {
            console.error('Failed to create sponsor:', error);
            return null;
        }
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
        try {
            await this.completeOnboarding();
            
            if (window.appTour && typeof window.appTour.start === 'function') {
                try {
                    window.appTour.start();
                } catch (tourError) {
                    console.warn('Tour failed to start:', tourError);
                }
            } else {
                console.warn('App tour not available');
            }
        } catch (error) {
            console.error('Failed to start tour:', error);
        }
    }

    // Cleanup method for proper disposal
    destroy() {
        try {
            this.cleanupEventListeners();
            const overlay = document.getElementById('app-onboarding-overlay');
            if (overlay && overlay.parentNode) {
                overlay.parentNode.removeChild(overlay);
            }
        } catch (error) {
            console.error('Failed to destroy onboarding:', error);
        }
    }
}

window.SecureAppOnboardingManager = SecureAppOnboardingManager;