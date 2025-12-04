/**
 * App Onboarding Manager - Comprehensive System
 * Handles marketplace-focused onboarding with data pipelines, n8n integration, and MCP support
 */

class AppOnboardingManager {
    constructor() {
        this.currentStep = 0;
        this.userChoices = {};
        this.sponsorManager = null;
        this.steps = ['welcome', 'account', 'role', 'profile', 'features', 'complete'];
        this.isApp = true;
        this.mcpClient = null;
        this.n8nWebhooks = {};
        this.dataPipeline = null;
    }

    async initialize() {
        try {
            // Check completion status
            const completed = await this.checkOnboardingStatus();
            if (completed) {
                return false;
            }

            // Initialize core systems
            await this.initializeCoreSystems();
            
            return true;
        } catch (error) {
            console.warn('AppOnboardingManager initialization failed:', error);
            return false;
        }
    }

    async checkOnboardingStatus() {
        try {
            // Ensure we're in browser environment
            if (typeof window === 'undefined' || !window.localStorage) {
                return false;
            }
            const completed = localStorage.getItem('beatx_onboarding_completed');
            return completed === 'true';
        } catch (error) {
            console.warn('Failed to check onboarding status:', error);
            return false;
        }
    }

    async initializeCoreSystems() {
        try {
            // Initialize sponsor manager
            if (typeof window !== 'undefined' && window.SponsorContentManager) {
                this.sponsorManager = new window.SponsorContentManager();
                await this.sponsorManager.initialize();
            }

            // Initialize MCP client for AI integrations
            await this.initializeMCPClient();

            // Setup n8n webhook endpoints
            await this.setupN8NIntegration();

            // Initialize data pipeline
            await this.initializeDataPipeline();
        } catch (error) {
            console.warn('Core systems initialization failed:', error);
        }
    }

    async initializeMCPClient() {
        try {
            if (window.MCPClient) {
                this.mcpClient = new MCPClient({
                    serverUrl: process.env.NEXT_PUBLIC_MCP_SERVER_URL || 'ws://localhost:3001',
                    capabilities: ['onboarding', 'recommendations', 'analytics']
                });
                await this.mcpClient.connect();
                console.log('✅ MCP Client initialized for onboarding');
            }
        } catch (error) {
            console.warn('MCP Client initialization failed:', error);
        }
    }

    async setupN8NIntegration() {
        // Configure n8n webhooks for different onboarding events
        this.n8nWebhooks = {
            userSignup: process.env.NEXT_PUBLIC_N8N_WEBHOOK_SIGNUP,
            profileComplete: process.env.NEXT_PUBLIC_N8N_WEBHOOK_PROFILE,
            onboardingComplete: process.env.NEXT_PUBLIC_N8N_WEBHOOK_COMPLETE,
            roleSelection: process.env.NEXT_PUBLIC_N8N_WEBHOOK_ROLE
        };

        console.log('✅ n8n webhooks configured for onboarding pipeline');
    }

    async initializeDataPipeline() {
        this.dataPipeline = {
            events: [],
            analytics: new Map(),
            userJourney: [],
            recommendations: []
        };

        // Setup real-time data streaming
        if (window.EventSource && process.env.NEXT_PUBLIC_REALTIME_ENDPOINT) {
            this.setupRealtimeDataStream();
        }
    }

    setupRealtimeDataStream() {
        const eventSource = new EventSource(process.env.NEXT_PUBLIC_REALTIME_ENDPOINT);
        
        eventSource.onmessage = (event) => {
            const data = JSON.parse(event.data);
            this.handleRealtimeData(data);
        };

        eventSource.onerror = (error) => {
            console.warn('Realtime data stream error:', error);
        };
    }

    handleRealtimeData(data) {
        // Process real-time onboarding insights
        if (data.type === 'onboarding_insight') {
            this.dataPipeline.recommendations.push(data.payload);
            this.updateOnboardingRecommendations(data.payload);
        }
    }

    async startOnboarding() {
        // Record onboarding start
        await this.recordEvent('onboarding_started', {
            timestamp: Date.now(),
            userAgent: navigator.userAgent,
            referrer: document.referrer
        });

        // Trigger n8n workflow
        await this.triggerN8NWorkflow('userSignup', {
            event: 'onboarding_started',
            timestamp: Date.now()
        });

        // Get AI-powered onboarding recommendations
        if (this.mcpClient) {
            const recommendations = await this.getAIOnboardingRecommendations();
            this.dataPipeline.recommendations = recommendations;
        }

        this.dispatchOnboardingEvent('start');
    }

    async getAIOnboardingRecommendations() {
        try {
            const response = await this.mcpClient.request('onboarding/recommendations', {
                userContext: {
                    platform: 'web_app',
                    timestamp: Date.now(),
                    referrer: document.referrer
                }
            });
            return response.recommendations || [];
        } catch (error) {
            console.warn('AI recommendations failed:', error);
            return [];
        }
    }

    async handleStepCompletion(stepName, stepData) {
        // Store step data
        this.userChoices = { ...this.userChoices, ...stepData };

        // Record detailed step analytics
        await this.recordStepCompletion(stepName, stepData);

        // Trigger n8n workflow for step completion
        await this.triggerN8NWorkflow('profileComplete', {
            step: stepName,
            data: stepData,
            userChoices: this.userChoices
        });

        // Get AI insights for next step
        if (this.mcpClient) {
            const insights = await this.getStepInsights(stepName, stepData);
            this.updateUserJourney(stepName, stepData, insights);
        }

        // Show contextual sponsors
        if (this.userChoices.sponsorConsent && this.sponsorManager) {
            setTimeout(() => {
                this.showAppStepSponsors(stepName);
            }, this.getSponsorTiming(stepName));
        }
    }

    async getStepInsights(stepName, stepData) {
        try {
            return await this.mcpClient.request('onboarding/step-insights', {
                step: stepName,
                data: stepData,
                userChoices: this.userChoices,
                journey: this.dataPipeline.userJourney
            });
        } catch (error) {
            console.warn('Step insights failed:', error);
            return null;
        }
    }

    updateUserJourney(stepName, stepData, insights) {
        this.dataPipeline.userJourney.push({
            step: stepName,
            data: stepData,
            insights: insights,
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

    async recordStepCompletion(stepName, stepData) {
        const event = {
            type: 'step_completed',
            step: stepName,
            data: stepData,
            timestamp: Date.now(),
            sessionId: this.getSessionId(),
            userChoices: this.userChoices
        };

        await this.recordEvent('step_completed', event);
    }

    async completeOnboarding() {
        // Save completion state
        localStorage.setItem('beatx_onboarding_completed', 'true');
        localStorage.setItem('beatx_onboarding_choices', JSON.stringify(this.userChoices));

        // Initialize comprehensive user preferences
        await this.initializeUserPreferences();

        // Trigger completion workflows
        await this.triggerCompletionWorkflows();

        // Generate AI-powered recommendations
        if (this.mcpClient) {
            const recommendations = await this.generatePersonalizedRecommendations();
            localStorage.setItem('beatx_ai_recommendations', JSON.stringify(recommendations));
        }

        // Show first action guidance
        this.showFirstActionGuidance();

        // Complete data pipeline processing
        await this.finalizeDataPipeline();
    }

    async triggerCompletionWorkflows() {
        // Trigger n8n completion workflow
        await this.triggerN8NWorkflow('onboardingComplete', {
            userChoices: this.userChoices,
            journey: this.dataPipeline.userJourney,
            completedAt: Date.now(),
            totalDuration: this.getTotalOnboardingDuration()
        });

        // Record completion event
        await this.recordEvent('onboarding_completed', {
            userChoices: this.userChoices,
            journey: this.dataPipeline.userJourney,
            recommendations: this.dataPipeline.recommendations
        });
    }

    async generatePersonalizedRecommendations() {
        try {
            return await this.mcpClient.request('recommendations/personalized', {
                userProfile: this.userChoices,
                journey: this.dataPipeline.userJourney,
                platform: 'web_app'
            });
        } catch (error) {
            console.warn('Personalized recommendations failed:', error);
            return this.getFallbackRecommendations();
        }
    }

    getFallbackRecommendations() {
        const baseRecommendations = {
            actions: this.getRecommendedActions(),
            features: this.getRecommendedFeatures(),
            content: this.getRecommendedContent()
        };

        return baseRecommendations;
    }

    async finalizeDataPipeline() {
        // Process all collected data
        const pipelineData = {
            events: this.dataPipeline.events,
            analytics: Object.fromEntries(this.dataPipeline.analytics),
            userJourney: this.dataPipeline.userJourney,
            recommendations: this.dataPipeline.recommendations,
            completedAt: Date.now()
        };

        // Send to analytics service
        await this.sendToAnalyticsPipeline(pipelineData);

        // Store for future reference
        localStorage.setItem('beatx_onboarding_pipeline', JSON.stringify(pipelineData));
    }

    async sendToAnalyticsPipeline(data) {
        try {
            await fetch('/api/analytics/onboarding', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
        } catch (error) {
            console.warn('Analytics pipeline failed:', error);
        }
    }

    async triggerN8NWorkflow(webhookType, data) {
        const webhookUrl = this.n8nWebhooks[webhookType];
        if (!webhookUrl) return;

        try {
            await fetch(webhookUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...data,
                    source: 'beatx_app_onboarding',
                    timestamp: Date.now()
                })
            });
        } catch (error) {
            console.warn(`n8n webhook ${webhookType} failed:`, error);
        }
    }

    async recordEvent(eventType, eventData) {
        const event = {
            type: eventType,
            data: eventData,
            timestamp: Date.now(),
            sessionId: this.getSessionId()
        };

        this.dataPipeline.events.push(event);

        // Send to real-time analytics
        if (window.gtag) {
            window.gtag('event', eventType, {
                custom_parameter: JSON.stringify(eventData),
                platform: 'web_app'
            });
        }
    }

    getSessionId() {
        let sessionId = sessionStorage.getItem('beatx_session_id');
        if (!sessionId) {
            sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            sessionStorage.setItem('beatx_session_id', sessionId);
        }
        return sessionId;
    }

    getTotalOnboardingDuration() {
        const journey = this.dataPipeline.userJourney;
        if (journey.length === 0) return 0;
        
        const firstStep = journey[0];
        return Date.now() - firstStep.timestamp;
    }

    dispatchOnboardingEvent(type, data = {}) {
        const event = new CustomEvent('app-onboarding', {
            detail: { type, data, manager: this }
        });
        window.dispatchEvent(event);
    }

    async initializeUserPreferences() {
        const preferences = {
            role: this.userChoices.role,
            artistName: this.userChoices.artistName,
            stageName: this.userChoices.stageName,
            genre: this.userChoices.genre,
            onboardingCompleted: true,
            marketplaceFocus: true,
            aiRecommendationsEnabled: true,
            dataProcessingConsent: this.userChoices.sponsorConsent
        };

        localStorage.setItem('beatx_user_preferences', JSON.stringify(preferences));

        if (this.userChoices.authenticated) {
            await this.syncPreferencesToBackend(preferences);
        }
    }

    async syncPreferencesToBackend(preferences) {
        try {
            const response = await fetch('/api/user/preferences', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(preferences)
            });

            if (!response.ok) {
                throw new Error('Backend sync failed');
            }
        } catch (error) {
            console.warn('Preferences sync failed:', error);
        }
    }

    showFirstActionGuidance() {
        this.dispatchOnboardingEvent('show-guidance', {
            actions: this.getRecommendedActions(),
            recommendations: this.dataPipeline.recommendations
        });
    }

    getRecommendedActions() {
        const baseActions = [
            { id: 'upload', icon: '🎧', title: 'Upload & Mint NFT', url: '/upload' },
            { id: 'marketplace', icon: '🏪', title: 'Browse Marketplace', url: '/beatnfts' }
        ];

        if (this.userChoices.role === 'producer') {
            baseActions.unshift({
                id: 'radio', icon: '📻', title: 'Radio Submission', url: '/upload?tab=radio'
            });
        }

        return baseActions;
    }

    getRecommendedFeatures() {
        const features = ['nft_minting', 'marketplace_browsing'];
        
        if (this.userChoices.role === 'producer') {
            features.push('radio_submission', 'beat_creation_tools');
        }
        
        if (this.userChoices.role === 'solo_artist') {
            features.push('collaboration_tools', 'licensing_management');
        }

        return features;
    }

    getRecommendedContent() {
        return {
            tutorials: this.getTutorialRecommendations(),
            genres: this.getGenreRecommendations(),
            artists: this.getArtistRecommendations()
        };
    }

    getTutorialRecommendations() {
        const baseTutorials = ['getting_started', 'marketplace_basics'];
        
        if (this.userChoices.role === 'producer') {
            baseTutorials.push('beat_creation', 'radio_submission_guide');
        }
        
        return baseTutorials;
    }

    getGenreRecommendations() {
        const userGenre = this.userChoices.genre;
        const relatedGenres = {
            'Hip-Hop': ['Trap', 'R&B', 'Rap'],
            'House': ['Electronic', 'Techno', 'Dance'],
            'Afrikaans': ['Gospel', 'Traditional', 'Pop'],
            'Gospel': ['Afrikaans', 'Traditional', 'Soul']
        };
        
        return relatedGenres[userGenre] || ['Pop', 'Electronic', 'Hip-Hop'];
    }

    getArtistRecommendations() {
        // This would typically come from AI/ML recommendations
        return ['trending_artists', 'genre_similar_artists', 'collaborative_artists'];
    }

    // Sponsor integration (adapted from extension)
    showAppStepSponsors(stepName) {
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
    }

    createAppOnboardingSponsor(category, step, customMessage = null) {
        const sponsorEl = document.createElement('div');
        sponsorEl.className = 'app-onboarding-sponsor';
        sponsorEl.style.cssText = `
            margin: 16px 0; padding: 12px;
            background: rgba(255, 152, 0, 0.05);
            border: 1px solid rgba(255, 152, 0, 0.2);
            border-radius: 8px; font-size: 12px;
        `;

        const appMessages = {
            marketplace_services: 'Boost your marketplace presence with professional services',
            professional_services: 'Professional services available after sign-in',
            profile_services: 'Profile optimization services available'
        };

        sponsorEl.innerHTML = `
            <div style="display: flex; align-items: center; gap: 8px;">
                <span style="font-size: 16px;">🏪</span>
                <div style="flex: 1;">
                    <div style="color: #333; font-weight: 500;">
                        ${customMessage || appMessages[category]}
                    </div>
                    <div style="color: #666; font-size: 10px; margin-top: 2px;">
                        Professional marketplace partner
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

    updateOnboardingRecommendations(insight) {
        // Update UI with real-time insights
        this.dispatchOnboardingEvent('update-recommendations', insight);
    }

    // Utility methods
    getOnboardingProgress() {
        const completed = localStorage.getItem('beatx_onboarding_completed');
        const choices = localStorage.getItem('beatx_onboarding_choices');
        
        return {
            completed: completed === 'true',
            choices: choices ? JSON.parse(choices) : {},
            progress: this.currentStep / this.steps.length,
            pipeline: this.dataPipeline
        };
    }



    resetOnboarding() {
        localStorage.removeItem('beatx_onboarding_completed');
        localStorage.removeItem('beatx_onboarding_choices');
        localStorage.removeItem('beatx_user_preferences');
        localStorage.removeItem('beatx_ai_recommendations');
        localStorage.removeItem('beatx_onboarding_pipeline');
        this.currentStep = 0;
        this.userChoices = {};
        this.dataPipeline = null;
    }
}

window.AppOnboardingManager = AppOnboardingManager;