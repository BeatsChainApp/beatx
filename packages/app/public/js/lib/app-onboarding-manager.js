/**
 * App Onboarding Manager - Fixed Version
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

    reset() {
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

if (typeof window !== 'undefined') {
    window.AppOnboardingManager = AppOnboardingManager;
    console.log('✅ AppOnboardingManager constructor verified');
}