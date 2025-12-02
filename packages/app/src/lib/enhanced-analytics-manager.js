/**
 * Enhanced Analytics Manager - App Version
 * Advanced analytics with campaign tracking, sponsor performance, and data pipelines
 */

class EnhancedAnalyticsManager {
    constructor() {
        this.storageKey = 'beatx_enhanced_analytics';
        this.initialized = false;
        this.campaignMetrics = new Map();
        this.sponsorPerformance = new Map();
        this.userJourneyData = new Map();
        this.realtimeMetrics = new Map();
    }

    async initialize() {
        if (this.initialized) return;
        
        try {
            // Ensure analytics structure exists
            const stats = await this.getStats();
            if (!stats.version || stats.version !== '3.0.0') {
                await this.initializeEnhancedStats();
            }
            
            // Load enhanced data structures
            await this.loadCampaignMetrics();
            await this.loadSponsorPerformance();
            await this.loadUserJourneyData();
            
            // Initialize real-time tracking
            this.initializeRealtimeTracking();
            
            this.initialized = true;
            console.log('✅ Enhanced Analytics Manager initialized (v3.0.0)');
        } catch (error) {
            console.error('❌ Enhanced Analytics Manager initialization failed:', error);
        }
    }

    async initializeEnhancedStats() {
        const defaultStats = {
            version: '3.0.0',
            created: Date.now(),
            
            // Core metrics
            uploads: {
                successful: 0,
                totalFiles: 0,
                withSponsored: 0,
                lastUploaded: null,
                byGenre: {},
                byRole: {}
            },
            
            // NFT & Marketplace metrics
            nft: {
                minted: 0,
                sold: 0,
                totalRevenue: 0,
                averagePrice: 0,
                lastMinted: null,
                gaslessTransactions: 0
            },
            
            // Radio submission metrics
            radio: {
                submissions: 0,
                packagesGenerated: 0,
                samroDocuments: 0,
                lastSubmission: null,
                byGenre: {}
            },
            
            // ISRC metrics
            isrc: {
                generated: 0,
                inPackages: 0,
                inNFTs: 0,
                lastGenerated: null
            },
            
            // Enhanced sponsor metrics
            sponsor: {
                displays: 0,
                interactions: {},
                locations: {},
                locationActions: {},
                campaigns: {},
                revenue: 0,
                conversions: 0
            },
            
            // User journey metrics
            userJourney: {
                onboardingCompletions: 0,
                averageOnboardingTime: 0,
                dropoffPoints: {},
                conversionFunnels: {},
                userRetention: {}
            },
            
            // Professional services metrics
            professionalServices: {
                requests: 0,
                conversions: 0,
                revenue: 0,
                serviceTypes: {}
            },
            
            // Collaboration metrics
            collaboration: {
                invitesSent: 0,
                collaborationsStarted: 0,
                completedProjects: 0
            }
        };
        
        await this.saveStats(defaultStats);
    }

    async getStats() {
        try {
            const stored = localStorage.getItem(this.storageKey);
            return stored ? JSON.parse(stored) : {};
        } catch (error) {
            console.error('Failed to get enhanced analytics stats:', error);
            return {};
        }
    }

    async saveStats(stats) {
        try {
            stats.lastUpdated = Date.now();
            localStorage.setItem(this.storageKey, JSON.stringify(stats));
        } catch (error) {
            console.error('Failed to save enhanced analytics stats:', error);
        }
    }

    async loadCampaignMetrics() {
        try {
            const stored = localStorage.getItem('beatx_campaign_analytics');
            if (stored) {
                const data = JSON.parse(stored);
                Object.entries(data).forEach(([id, metrics]) => {
                    this.campaignMetrics.set(id, metrics);
                });
            }
        } catch (error) {
            console.error('Failed to load campaign metrics:', error);
        }
    }

    async saveCampaignMetrics() {
        try {
            const data = Object.fromEntries(this.campaignMetrics);
            localStorage.setItem('beatx_campaign_analytics', JSON.stringify(data));
        } catch (error) {
            console.error('Failed to save campaign metrics:', error);
        }
    }

    async loadSponsorPerformance() {
        try {
            const stored = localStorage.getItem('beatx_sponsor_performance');
            if (stored) {
                const data = JSON.parse(stored);
                Object.entries(data).forEach(([id, performance]) => {
                    this.sponsorPerformance.set(id, performance);
                });
            }
        } catch (error) {
            console.error('Failed to load sponsor performance:', error);
        }
    }

    async saveSponsorPerformance() {
        try {
            const data = Object.fromEntries(this.sponsorPerformance);
            localStorage.setItem('beatx_sponsor_performance', JSON.stringify(data));
        } catch (error) {
            console.error('Failed to save sponsor performance:', error);
        }
    }

    async loadUserJourneyData() {
        try {
            const stored = localStorage.getItem('beatx_user_journey_analytics');
            if (stored) {
                const data = JSON.parse(stored);
                Object.entries(data).forEach(([id, journey]) => {
                    this.userJourneyData.set(id, journey);
                });
            }
        } catch (error) {
            console.error('Failed to load user journey data:', error);
        }
    }

    async saveUserJourneyData() {
        try {
            const data = Object.fromEntries(this.userJourneyData);
            localStorage.setItem('beatx_user_journey_analytics', JSON.stringify(data));
        } catch (error) {
            console.error('Failed to save user journey data:', error);
        }
    }

    initializeRealtimeTracking() {
        // Set up real-time metric collection
        this.realtimeInterval = setInterval(() => {
            this.collectRealtimeMetrics();
        }, 30000); // Every 30 seconds

        // Track page visibility changes
        document.addEventListener('visibilitychange', () => {
            this.recordPageVisibility();
        });

        // Track user interactions
        this.setupInteractionTracking();
    }

    setupInteractionTracking() {
        // Track clicks on key elements
        document.addEventListener('click', (event) => {
            this.trackInteraction('click', event);
        });

        // Track form submissions
        document.addEventListener('submit', (event) => {
            this.trackInteraction('form_submit', event);
        });

        // Track scroll depth
        let maxScroll = 0;
        window.addEventListener('scroll', () => {
            const scrollPercent = Math.round((window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100);
            if (scrollPercent > maxScroll) {
                maxScroll = scrollPercent;
                this.trackScrollDepth(scrollPercent);
            }
        });
    }

    async trackInteraction(type, event) {
        const element = event.target;
        const elementInfo = {
            tagName: element.tagName,
            className: element.className,
            id: element.id,
            text: element.textContent?.substring(0, 50)
        };

        await this.recordEvent('user_interaction', {
            type: type,
            element: elementInfo,
            timestamp: Date.now(),
            url: window.location.href
        });
    }

    async trackScrollDepth(percent) {
        if (percent % 25 === 0) { // Track at 25%, 50%, 75%, 100%
            await this.recordEvent('scroll_depth', {
                percent: percent,
                timestamp: Date.now(),
                url: window.location.href
            });
        }
    }

    async recordPageVisibility() {
        await this.recordEvent('page_visibility', {
            visible: !document.hidden,
            timestamp: Date.now(),
            url: window.location.href
        });
    }

    async collectRealtimeMetrics() {
        const metrics = {
            timestamp: Date.now(),
            url: window.location.href,
            userAgent: navigator.userAgent,
            screenResolution: `${screen.width}x${screen.height}`,
            viewportSize: `${window.innerWidth}x${window.innerHeight}`,
            connectionType: navigator.connection?.effectiveType || 'unknown'
        };

        this.realtimeMetrics.set(Date.now(), metrics);

        // Keep only last 100 entries
        if (this.realtimeMetrics.size > 100) {
            const oldestKey = Math.min(...this.realtimeMetrics.keys());
            this.realtimeMetrics.delete(oldestKey);
        }
    }

    // Enhanced Upload Analytics
    async recordUploadSuccess(uploadData) {
        if (!this.hasAnalyticsConsent()) return;
        
        const stats = await this.getStats();
        stats.uploads = stats.uploads || {};
        stats.uploads.successful = (stats.uploads.successful || 0) + 1;
        stats.uploads.totalFiles = (stats.uploads.totalFiles || 0) + (uploadData.fileCount || 1);
        stats.uploads.lastUploaded = uploadData.timestamp;
        
        // Track by genre
        if (uploadData.genre) {
            stats.uploads.byGenre = stats.uploads.byGenre || {};
            stats.uploads.byGenre[uploadData.genre] = (stats.uploads.byGenre[uploadData.genre] || 0) + 1;
        }
        
        // Track by user role
        if (uploadData.userRole) {
            stats.uploads.byRole = stats.uploads.byRole || {};
            stats.uploads.byRole[uploadData.userRole] = (stats.uploads.byRole[uploadData.userRole] || 0) + 1;
        }
        
        if (uploadData.hasSponsoredContent) {
            stats.uploads.withSponsored = (stats.uploads.withSponsored || 0) + 1;
        }
        
        await this.saveStats(stats);
        
        // Record detailed event
        await this.recordEvent('upload_success', uploadData);
    }

    // Enhanced NFT Analytics
    async recordNFTMint(nftData) {
        const stats = await this.getStats();
        stats.nft = stats.nft || {};
        stats.nft.minted = (stats.nft.minted || 0) + 1;
        stats.nft.lastMinted = nftData.timestamp;
        
        if (nftData.gasless) {
            stats.nft.gaslessTransactions = (stats.nft.gaslessTransactions || 0) + 1;
        }
        
        await this.saveStats(stats);
        await this.recordEvent('nft_minted', nftData);
    }

    async recordNFTSale(saleData) {
        const stats = await this.getStats();
        stats.nft = stats.nft || {};
        stats.nft.sold = (stats.nft.sold || 0) + 1;
        stats.nft.totalRevenue = (stats.nft.totalRevenue || 0) + (saleData.price || 0);
        
        // Calculate average price
        if (stats.nft.sold > 0) {
            stats.nft.averagePrice = stats.nft.totalRevenue / stats.nft.sold;
        }
        
        await this.saveStats(stats);
        await this.recordEvent('nft_sold', saleData);
    }

    // Enhanced Radio Analytics
    async recordRadioSubmission(radioData) {
        const stats = await this.getStats();
        stats.radio = stats.radio || {};
        stats.radio.submissions = (stats.radio.submissions || 0) + 1;
        stats.radio.lastSubmission = radioData.timestamp;
        
        if (radioData.genre) {
            stats.radio.byGenre = stats.radio.byGenre || {};
            stats.radio.byGenre[radioData.genre] = (stats.radio.byGenre[radioData.genre] || 0) + 1;
        }
        
        await this.saveStats(stats);
        await this.recordEvent('radio_submission', radioData);
    }

    async recordRadioPackageGeneration(packageData) {
        const stats = await this.getStats();
        stats.radio = stats.radio || {};
        stats.radio.packagesGenerated = (stats.radio.packagesGenerated || 0) + 1;
        
        if (packageData.includeSamro) {
            stats.radio.samroDocuments = (stats.radio.samroDocuments || 0) + 1;
        }
        
        await this.saveStats(stats);
        await this.recordEvent('radio_package_generated', packageData);
    }

    // Enhanced ISRC Analytics
    async recordISRCGeneration(isrcData) {
        const stats = await this.getStats();
        stats.isrc = stats.isrc || {};
        stats.isrc.generated = (stats.isrc.generated || 0) + 1;
        stats.isrc.lastGenerated = isrcData.timestamp;
        
        if (isrcData.context === 'package') {
            stats.isrc.inPackages = (stats.isrc.inPackages || 0) + 1;
        } else if (isrcData.context === 'nft') {
            stats.isrc.inNFTs = (stats.isrc.inNFTs || 0) + 1;
        }
        
        await this.saveStats(stats);
        await this.recordEvent('isrc_generated', isrcData);
    }

    // Enhanced Sponsor Analytics with Campaign Tracking
    async recordSponsorDisplay(location, campaignId = null) {
        const stats = await this.getStats();
        stats.sponsor = stats.sponsor || {};
        stats.sponsor.displays = (stats.sponsor.displays || 0) + 1;
        stats.sponsor.locations = stats.sponsor.locations || {};
        stats.sponsor.locations[location] = (stats.sponsor.locations[location] || 0) + 1;
        
        // Track campaign-specific metrics
        if (campaignId) {
            stats.sponsor.campaigns = stats.sponsor.campaigns || {};
            stats.sponsor.campaigns[campaignId] = stats.sponsor.campaigns[campaignId] || {
                impressions: 0,
                clicks: 0,
                conversions: 0,
                revenue: 0
            };
            stats.sponsor.campaigns[campaignId].impressions += 1;
            
            // Update campaign metrics
            await this.updateCampaignMetrics(campaignId, 'impression', { location });
        }
        
        await this.saveStats(stats);
        await this.recordEvent('sponsor_display', { location, campaignId });
    }

    async recordSponsorInteraction(action, location, campaignId = null, revenue = 0) {
        const stats = await this.getStats();
        stats.sponsor = stats.sponsor || {};
        stats.sponsor.interactions = stats.sponsor.interactions || {};
        stats.sponsor.interactions[action] = (stats.sponsor.interactions[action] || 0) + 1;
        
        const key = `${location}_${action}`;
        stats.sponsor.locationActions = stats.sponsor.locationActions || {};
        stats.sponsor.locationActions[key] = (stats.sponsor.locationActions[key] || 0) + 1;
        
        if (action === 'conversion') {
            stats.sponsor.conversions = (stats.sponsor.conversions || 0) + 1;
            stats.sponsor.revenue = (stats.sponsor.revenue || 0) + revenue;
        }
        
        // Track campaign-specific metrics
        if (campaignId) {
            stats.sponsor.campaigns = stats.sponsor.campaigns || {};
            stats.sponsor.campaigns[campaignId] = stats.sponsor.campaigns[campaignId] || {
                impressions: 0,
                clicks: 0,
                conversions: 0,
                revenue: 0
            };
            
            if (action === 'click') {
                stats.sponsor.campaigns[campaignId].clicks += 1;
            } else if (action === 'conversion') {
                stats.sponsor.campaigns[campaignId].conversions += 1;
                stats.sponsor.campaigns[campaignId].revenue += revenue;
            }
            
            // Update campaign metrics
            await this.updateCampaignMetrics(campaignId, action, { location, revenue });
        }
        
        await this.saveStats(stats);
        await this.recordEvent('sponsor_interaction', { action, location, campaignId, revenue });
    }

    async updateCampaignMetrics(campaignId, action, data) {
        let metrics = this.campaignMetrics.get(campaignId) || {
            impressions: 0,
            clicks: 0,
            conversions: 0,
            revenue: 0,
            locations: {},
            timeline: [],
            lastUpdated: Date.now()
        };
        
        // Update metrics based on action
        if (action === 'impression') {
            metrics.impressions += 1;
        } else if (action === 'click') {
            metrics.clicks += 1;
        } else if (action === 'conversion') {
            metrics.conversions += 1;
            metrics.revenue += (data.revenue || 0);
        }
        
        // Track by location
        if (data.location) {
            metrics.locations[data.location] = (metrics.locations[data.location] || 0) + 1;
        }
        
        // Add to timeline
        metrics.timeline.push({
            action: action,
            timestamp: Date.now(),
            data: data
        });
        
        // Keep only last 1000 timeline entries
        if (metrics.timeline.length > 1000) {
            metrics.timeline = metrics.timeline.slice(-1000);
        }
        
        metrics.lastUpdated = Date.now();
        
        this.campaignMetrics.set(campaignId, metrics);
        await this.saveCampaignMetrics();
    }

    // User Journey Analytics
    async recordOnboardingStart(userData) {
        const journeyId = this.generateJourneyId();
        const journey = {
            id: journeyId,
            startTime: Date.now(),
            steps: [],
            userData: userData,
            completed: false,
            dropoffPoint: null
        };
        
        this.userJourneyData.set(journeyId, journey);
        await this.saveUserJourneyData();
        
        return journeyId;
    }

    async recordOnboardingStep(journeyId, stepName, stepData) {
        const journey = this.userJourneyData.get(journeyId);
        if (!journey) return;
        
        journey.steps.push({
            step: stepName,
            timestamp: Date.now(),
            data: stepData,
            duration: journey.steps.length > 0 ? 
                Date.now() - journey.steps[journey.steps.length - 1].timestamp : 0
        });
        
        this.userJourneyData.set(journeyId, journey);
        await this.saveUserJourneyData();
    }

    async recordOnboardingCompletion(journeyId) {
        const journey = this.userJourneyData.get(journeyId);
        if (!journey) return;
        
        journey.completed = true;
        journey.completionTime = Date.now();
        journey.totalDuration = journey.completionTime - journey.startTime;
        
        // Update global stats
        const stats = await this.getStats();
        stats.userJourney = stats.userJourney || {};
        stats.userJourney.onboardingCompletions = (stats.userJourney.onboardingCompletions || 0) + 1;
        
        // Calculate average onboarding time
        const allJourneys = Array.from(this.userJourneyData.values()).filter(j => j.completed);
        const totalTime = allJourneys.reduce((sum, j) => sum + j.totalDuration, 0);
        stats.userJourney.averageOnboardingTime = totalTime / allJourneys.length;
        
        await this.saveStats(stats);
        this.userJourneyData.set(journeyId, journey);
        await this.saveUserJourneyData();
    }

    async recordOnboardingDropoff(journeyId, stepName) {
        const journey = this.userJourneyData.get(journeyId);
        if (!journey) return;
        
        journey.dropoffPoint = stepName;
        journey.dropoffTime = Date.now();
        
        // Update global dropoff stats
        const stats = await this.getStats();
        stats.userJourney = stats.userJourney || {};
        stats.userJourney.dropoffPoints = stats.userJourney.dropoffPoints || {};
        stats.userJourney.dropoffPoints[stepName] = (stats.userJourney.dropoffPoints[stepName] || 0) + 1;
        
        await this.saveStats(stats);
        this.userJourneyData.set(journeyId, journey);
        await this.saveUserJourneyData();
    }

    // Professional Services Analytics
    async recordProfessionalServiceRequest(serviceData) {
        const stats = await this.getStats();
        stats.professionalServices = stats.professionalServices || {};
        stats.professionalServices.requests = (stats.professionalServices.requests || 0) + 1;
        
        if (serviceData.serviceType) {
            stats.professionalServices.serviceTypes = stats.professionalServices.serviceTypes || {};
            stats.professionalServices.serviceTypes[serviceData.serviceType] = 
                (stats.professionalServices.serviceTypes[serviceData.serviceType] || 0) + 1;
        }
        
        await this.saveStats(stats);
        await this.recordEvent('professional_service_request', serviceData);
    }

    async recordProfessionalServiceConversion(serviceData) {
        const stats = await this.getStats();
        stats.professionalServices = stats.professionalServices || {};
        stats.professionalServices.conversions = (stats.professionalServices.conversions || 0) + 1;
        stats.professionalServices.revenue = (stats.professionalServices.revenue || 0) + (serviceData.revenue || 0);
        
        await this.saveStats(stats);
        await this.recordEvent('professional_service_conversion', serviceData);
    }

    // Collaboration Analytics
    async recordCollaborationInvite(inviteData) {
        const stats = await this.getStats();
        stats.collaboration = stats.collaboration || {};
        stats.collaboration.invitesSent = (stats.collaboration.invitesSent || 0) + 1;
        
        await this.saveStats(stats);
        await this.recordEvent('collaboration_invite', inviteData);
    }

    async recordCollaborationStart(collaborationData) {
        const stats = await this.getStats();
        stats.collaboration = stats.collaboration || {};
        stats.collaboration.collaborationsStarted = (stats.collaboration.collaborationsStarted || 0) + 1;
        
        await this.saveStats(stats);
        await this.recordEvent('collaboration_started', collaborationData);
    }

    async recordCollaborationComplete(collaborationData) {
        const stats = await this.getStats();
        stats.collaboration = stats.collaboration || {};
        stats.collaboration.completedProjects = (stats.collaboration.completedProjects || 0) + 1;
        
        await this.saveStats(stats);
        await this.recordEvent('collaboration_completed', collaborationData);
    }

    // Enhanced Analytics Summary
    async getEnhancedAnalyticsSummary() {
        const stats = await this.getStats();
        
        return {
            overview: {
                totalUploads: stats.uploads?.successful || 0,
                totalNFTs: stats.nft?.minted || 0,
                totalRevenue: (stats.nft?.totalRevenue || 0) + (stats.sponsor?.revenue || 0) + (stats.professionalServices?.revenue || 0),
                totalUsers: this.userJourneyData.size,
                lastActivity: stats.lastUpdated
            },
            
            uploads: {
                total: stats.uploads?.successful || 0,
                withSponsored: stats.uploads?.withSponsored || 0,
                sponsorInclusionRate: this.calculateRate(stats.uploads?.withSponsored, stats.uploads?.successful),
                byGenre: stats.uploads?.byGenre || {},
                byRole: stats.uploads?.byRole || {}
            },
            
            nft: {
                minted: stats.nft?.minted || 0,
                sold: stats.nft?.sold || 0,
                totalRevenue: stats.nft?.totalRevenue || 0,
                averagePrice: stats.nft?.averagePrice || 0,
                gaslessPercentage: this.calculateRate(stats.nft?.gaslessTransactions, stats.nft?.minted)
            },
            
            radio: {
                submissions: stats.radio?.submissions || 0,
                packagesGenerated: stats.radio?.packagesGenerated || 0,
                samroDocuments: stats.radio?.samroDocuments || 0,
                byGenre: stats.radio?.byGenre || {}
            },
            
            isrc: {
                generated: stats.isrc?.generated || 0,
                inPackages: stats.isrc?.inPackages || 0,
                inNFTs: stats.isrc?.inNFTs || 0,
                utilizationRate: this.calculateRate(stats.isrc?.generated, stats.uploads?.successful)
            },
            
            sponsor: {
                displays: stats.sponsor?.displays || 0,
                interactions: stats.sponsor?.interactions || {},
                conversions: stats.sponsor?.conversions || 0,
                revenue: stats.sponsor?.revenue || 0,
                engagementRate: this.calculateEngagementRate(stats.sponsor),
                campaignPerformance: this.getCampaignPerformanceSummary()
            },
            
            userJourney: {
                onboardingCompletions: stats.userJourney?.onboardingCompletions || 0,
                averageOnboardingTime: stats.userJourney?.averageOnboardingTime || 0,
                dropoffPoints: stats.userJourney?.dropoffPoints || {},
                completionRate: this.calculateOnboardingCompletionRate()
            },
            
            professionalServices: {
                requests: stats.professionalServices?.requests || 0,
                conversions: stats.professionalServices?.conversions || 0,
                revenue: stats.professionalServices?.revenue || 0,
                conversionRate: this.calculateRate(stats.professionalServices?.conversions, stats.professionalServices?.requests),
                serviceTypes: stats.professionalServices?.serviceTypes || {}
            },
            
            collaboration: {
                invitesSent: stats.collaboration?.invitesSent || 0,
                collaborationsStarted: stats.collaboration?.collaborationsStarted || 0,
                completedProjects: stats.collaboration?.completedProjects || 0,
                successRate: this.calculateRate(stats.collaboration?.completedProjects, stats.collaboration?.collaborationsStarted)
            }
        };
    }

    getCampaignPerformanceSummary() {
        const campaigns = Array.from(this.campaignMetrics.values());
        
        return {
            totalCampaigns: campaigns.length,
            totalImpressions: campaigns.reduce((sum, c) => sum + c.impressions, 0),
            totalClicks: campaigns.reduce((sum, c) => sum + c.clicks, 0),
            totalConversions: campaigns.reduce((sum, c) => sum + c.conversions, 0),
            totalRevenue: campaigns.reduce((sum, c) => sum + c.revenue, 0),
            averageCTR: this.calculateAverageCTR(campaigns),
            averageConversionRate: this.calculateAverageConversionRate(campaigns)
        };
    }

    calculateRate(numerator, denominator) {
        if (!denominator || denominator === 0) return 0;
        return Math.round((numerator / denominator) * 100);
    }

    calculateEngagementRate(sponsorStats) {
        if (!sponsorStats?.displays) return 0;
        const totalInteractions = Object.values(sponsorStats.interactions || {}).reduce((a, b) => a + b, 0);
        return Math.round((totalInteractions / sponsorStats.displays) * 100);
    }

    calculateOnboardingCompletionRate() {
        const totalJourneys = this.userJourneyData.size;
        if (totalJourneys === 0) return 0;
        
        const completedJourneys = Array.from(this.userJourneyData.values()).filter(j => j.completed).length;
        return Math.round((completedJourneys / totalJourneys) * 100);
    }

    calculateAverageCTR(campaigns) {
        if (campaigns.length === 0) return 0;
        
        const ctrs = campaigns.map(c => c.impressions > 0 ? (c.clicks / c.impressions) * 100 : 0);
        return Math.round((ctrs.reduce((sum, ctr) => sum + ctr, 0) / ctrs.length) * 100) / 100;
    }

    calculateAverageConversionRate(campaigns) {
        if (campaigns.length === 0) return 0;
        
        const rates = campaigns.map(c => c.clicks > 0 ? (c.conversions / c.clicks) * 100 : 0);
        return Math.round((rates.reduce((sum, rate) => sum + rate, 0) / rates.length) * 100) / 100;
    }

    // Utility methods
    generateJourneyId() {
        return 'journey_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    hasAnalyticsConsent() {
        // Check if user has given consent for analytics
        const consent = localStorage.getItem('beatx_analytics_consent');
        return consent === 'true';
    }

    async recordEvent(eventType, eventData) {
        // Store events for detailed analysis
        const events = JSON.parse(localStorage.getItem('beatx_analytics_events') || '[]');
        
        const event = {
            type: eventType,
            data: eventData,
            timestamp: Date.now(),
            sessionId: this.getSessionId(),
            url: window.location.href
        };
        
        events.push(event);
        
        // Keep only last 1000 events
        if (events.length > 1000) {
            events.splice(0, events.length - 1000);
        }
        
        localStorage.setItem('beatx_analytics_events', JSON.stringify(events));
        
        // Send to external analytics if configured
        if (window.gtag) {
            window.gtag('event', eventType, {
                custom_parameter: JSON.stringify(eventData),
                platform: 'web_app_enhanced'
            });
        }
    }

    getSessionId() {
        let sessionId = sessionStorage.getItem('beatx_enhanced_analytics_session');
        if (!sessionId) {
            sessionId = 'analytics_session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            sessionStorage.setItem('beatx_enhanced_analytics_session', sessionId);
        }
        return sessionId;
    }

    // Export enhanced analytics
    async exportEnhancedAnalytics() {
        const stats = await this.getStats();
        const summary = await this.getEnhancedAnalyticsSummary();
        const events = JSON.parse(localStorage.getItem('beatx_analytics_events') || '[]');
        
        return {
            summary: summary,
            rawData: stats,
            campaignMetrics: Object.fromEntries(this.campaignMetrics),
            sponsorPerformance: Object.fromEntries(this.sponsorPerformance),
            userJourneys: Object.fromEntries(this.userJourneyData),
            recentEvents: events.slice(-100), // Last 100 events
            realtimeMetrics: Object.fromEntries(this.realtimeMetrics),
            exportedAt: new Date().toISOString(),
            version: '3.0.0'
        };
    }

    // Clear enhanced analytics
    async clearEnhancedAnalytics() {
        try {
            localStorage.removeItem(this.storageKey);
            localStorage.removeItem('beatx_campaign_analytics');
            localStorage.removeItem('beatx_sponsor_performance');
            localStorage.removeItem('beatx_user_journey_analytics');
            localStorage.removeItem('beatx_analytics_events');
            
            this.campaignMetrics.clear();
            this.sponsorPerformance.clear();
            this.userJourneyData.clear();
            this.realtimeMetrics.clear();
            
            await this.initializeEnhancedStats();
            console.log('✅ Enhanced analytics cleared and reset');
        } catch (error) {
            console.error('❌ Failed to clear enhanced analytics:', error);
        }
    }

    // Cleanup on destroy
    destroy() {
        if (this.realtimeInterval) {
            clearInterval(this.realtimeInterval);
        }
        
        document.removeEventListener('visibilitychange', this.recordPageVisibility);
        document.removeEventListener('click', this.trackInteraction);
        document.removeEventListener('submit', this.trackInteraction);
        window.removeEventListener('scroll', this.trackScrollDepth);
    }
}

// Export for app compatibility
window.EnhancedAnalyticsManager = EnhancedAnalyticsManager;