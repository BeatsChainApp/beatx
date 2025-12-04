/**
 * App Onboarding Manager - Fixed Version Based on Extension Pattern
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

    async checkOnboardingStatus() {
        try {
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

    async initialize() {
        try {
            const completed = await this.checkOnboardingStatus();
            if (completed) {
                return false;
            }
            await this.initializeCoreSystems();
            return true;
        } catch (error) {
            console.warn('AppOnboardingManager initialization failed:', error);
            return false;
        }
    }

    async initializeCoreSystems() {
        try {
            if (typeof window !== 'undefined' && window.SponsorContentManager) {
                this.sponsorManager = new window.SponsorContentManager();
                await this.sponsorManager.initialize();
            }
            await this.initializeMCPClient();
            await this.setupN8NIntegration();
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
    }

    async startOnboarding() {
        try {
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

            this.dispatchOnboardingEvent('start');
        } catch (error) {
            console.warn('Failed to start onboarding:', error);
        }
    }

    async recordEvent(eventType, eventData) {
        try {
            const event = {
                type: eventType,
                data: eventData,
                timestamp: Date.now(),
                sessionId: this.getSessionId()
            };

            if (this.dataPipeline && this.dataPipeline.events) {
                this.dataPipeline.events.push(event);
            }

            // Send to real-time analytics
            if (window.gtag) {
                window.gtag('event', eventType, {
                    custom_parameter: JSON.stringify(eventData),
                    platform: 'web_app'
                });
            }
        } catch (error) {
            console.warn('Failed to record event:', error);
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

    getSessionId() {
        try {
            let sessionId = sessionStorage.getItem('beatx_session_id');
            if (!sessionId) {
                sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
                sessionStorage.setItem('beatx_session_id', sessionId);
            }
            return sessionId;
        } catch (error) {
            return 'fallback_session_' + Date.now();
        }
    }

    dispatchOnboardingEvent(type, data = {}) {
        try {
            const event = new CustomEvent('app-onboarding', {
                detail: { type, data, manager: this }
            });
            window.dispatchEvent(event);
        } catch (error) {
            console.warn('Failed to dispatch onboarding event:', error);
        }
    }

    reset() {
        try {
            localStorage.removeItem('beatx_onboarding_completed');
            localStorage.removeItem('beatx_onboarding_choices');
            localStorage.removeItem('beatx_user_preferences');
            localStorage.removeItem('beatx_ai_recommendations');
            localStorage.removeItem('beatx_onboarding_pipeline');
            this.currentStep = 0;
            this.userChoices = {};
            this.dataPipeline = null;
        } catch (error) {
            console.warn('Failed to reset onboarding:', error);
        }
    }
}

// Safe initialization
if (typeof window !== 'undefined') {
    window.AppOnboardingManager = AppOnboardingManager;
    console.log('✅ AppOnboardingManager constructor verified');
}