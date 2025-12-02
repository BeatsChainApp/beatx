/**
 * Sponsor Content Manager - App Version
 * Manages sponsor templates, content delivery, and campaign integration
 */

class SponsorContentManager {
    constructor() {
        this.templates = new Map();
        this.activeSponsors = new Map();
        this.contentCache = new Map();
        this.campaignManager = null;
        this.analyticsManager = null;
        this.initialized = false;
    }

    async initialize() {
        if (this.initialized) return;
        
        try {
            // Load sponsor templates
            await this.loadSponsorTemplates();
            
            // Load active sponsors
            await this.loadActiveSponsors();
            
            // Initialize campaign manager integration
            if (window.EnhancedCampaignManager) {
                this.campaignManager = new EnhancedCampaignManager();
                await this.campaignManager.initialize();
            }
            
            // Initialize analytics integration
            if (window.EnhancedAnalyticsManager) {
                this.analyticsManager = new EnhancedAnalyticsManager();
                await this.analyticsManager.initialize();
            }
            
            this.initialized = true;
            console.log('✅ Sponsor Content Manager initialized');
        } catch (error) {
            console.error('❌ Sponsor Content Manager initialization failed:', error);
        }
    }

    async loadSponsorTemplates() {
        try {
            const stored = localStorage.getItem('beatx_sponsor_templates');
            if (stored) {
                const templates = JSON.parse(stored);
                Object.entries(templates).forEach(([id, template]) => {
                    this.templates.set(id, template);
                });
            } else {
                // Initialize with default templates
                await this.initializeDefaultTemplates();
            }
        } catch (error) {
            console.error('Failed to load sponsor templates:', error);
            await this.initializeDefaultTemplates();
        }
    }

    async initializeDefaultTemplates() {
        const defaultTemplates = {
            'beatschain_marketplace': {
                id: 'beatschain_marketplace',
                name: 'BeatsChain Marketplace',
                category: 'marketplace_services',
                description: 'Official BeatsChain marketplace and trading services',
                active: true,
                priority: 1,
                assets: {
                    logo: '/images/sponsors/beatschain-logo.png',
                    banner: '/images/sponsors/beatschain-banner.png',
                    content: 'Boost your marketplace presence with professional services'
                },
                placements: [
                    'marketplace_entry',
                    'nft_discovery',
                    'onboarding_welcome',
                    'dashboard_sidebar'
                ],
                targeting: {
                    roles: ['solo_artist', 'producer', 'collector', 'both'],
                    genres: ['all'],
                    experience: ['all']
                },
                content: {
                    title: 'BeatsChain Marketplace',
                    subtitle: 'Professional Music NFT Trading',
                    description: 'Discover, buy, and sell unique music NFTs from artists worldwide',
                    cta: 'Explore Marketplace',
                    url: '/beatnfts'
                }
            },
            
            'professional_services': {
                id: 'professional_services',
                name: 'Professional Music Services',
                category: 'professional_services',
                description: 'Professional music industry services and tools',
                active: true,
                priority: 2,
                assets: {
                    logo: '/images/sponsors/pro-services-logo.png',
                    content: 'Professional services available for artists and producers'
                },
                placements: [
                    'professional_services',
                    'onboarding_account',
                    'upload_start',
                    'radio_submission_start'
                ],
                targeting: {
                    roles: ['solo_artist', 'producer', 'both'],
                    genres: ['all'],
                    experience: ['intermediate', 'advanced', 'professional']
                },
                content: {
                    title: 'Professional Services',
                    subtitle: 'Take Your Music Career Further',
                    description: 'Access professional mixing, mastering, and promotion services',
                    cta: 'Learn More',
                    url: '/professional-services'
                }
            },
            
            'radio_promotion': {
                id: 'radio_promotion',
                name: 'SA Radio Promotion',
                category: 'radio_promotion',
                description: 'South African radio promotion and submission services',
                active: true,
                priority: 3,
                assets: {
                    logo: '/images/sponsors/radio-promo-logo.png',
                    content: 'Professional SA radio submission packages with SAMRO documentation'
                },
                placements: [
                    'radio_submission_start',
                    'radio_metadata_complete',
                    'radio_samro_upsell',
                    'onboarding_features'
                ],
                targeting: {
                    roles: ['solo_artist', 'producer', 'both'],
                    genres: ['Hip-Hop', 'House', 'Afrikaans', 'Gospel', 'Jazz'],
                    experience: ['all']
                },
                content: {
                    title: 'SA Radio Promotion',
                    subtitle: 'Get Your Music on South African Radio',
                    description: 'Professional radio submission packages with SAMRO compliance',
                    cta: 'Submit to Radio',
                    url: '/upload?tab=radio'
                }
            },
            
            'collaboration_hub': {
                id: 'collaboration_hub',
                name: 'Collaboration Hub',
                category: 'collaboration_tools',
                description: 'Connect and collaborate with other artists and producers',
                active: true,
                priority: 4,
                assets: {
                    logo: '/images/sponsors/collab-hub-logo.png',
                    content: 'Connect with artists, producers, and industry professionals'
                },
                placements: [
                    'collaboration_hub',
                    'onboarding_features',
                    'dashboard_sidebar',
                    'profile_view'
                ],
                targeting: {
                    roles: ['solo_artist', 'producer', 'both'],
                    genres: ['all'],
                    experience: ['all']
                },
                content: {
                    title: 'Collaboration Hub',
                    subtitle: 'Connect & Create Together',
                    description: 'Find collaborators and work on projects together',
                    cta: 'Start Collaborating',
                    url: '/collaboration'
                }
            },
            
            'licensing_services': {
                id: 'licensing_services',
                name: 'Music Licensing Services',
                category: 'licensing_services',
                description: 'Professional music licensing and rights management',
                active: true,
                priority: 5,
                assets: {
                    logo: '/images/sponsors/licensing-logo.png',
                    content: 'Professional music licensing and rights management services'
                },
                placements: [
                    'licensing_proceed',
                    'mint_success',
                    'nft_discovery',
                    'onboarding_profile'
                ],
                targeting: {
                    roles: ['producer', 'both'],
                    genres: ['all'],
                    experience: ['intermediate', 'advanced', 'professional']
                },
                content: {
                    title: 'Music Licensing',
                    subtitle: 'Monetize Your Music Rights',
                    description: 'Professional licensing services for beats and compositions',
                    cta: 'License Music',
                    url: '/licensing'
                }
            }
        };

        // Save default templates
        Object.entries(defaultTemplates).forEach(([id, template]) => {
            this.templates.set(id, template);
        });

        await this.saveSponsorTemplates();
    }

    async saveSponsorTemplates() {
        try {
            const templatesData = Object.fromEntries(this.templates);
            localStorage.setItem('beatx_sponsor_templates', JSON.stringify(templatesData));
        } catch (error) {
            console.error('Failed to save sponsor templates:', error);
        }
    }

    async loadActiveSponsors() {
        try {
            const stored = localStorage.getItem('beatx_active_sponsors');
            if (stored) {
                const activeSponsors = JSON.parse(stored);
                Object.entries(activeSponsors).forEach(([id, sponsor]) => {
                    this.activeSponsors.set(id, sponsor);
                });
            }
        } catch (error) {
            console.error('Failed to load active sponsors:', error);
        }
    }

    async saveActiveSponsors() {
        try {
            const activeSponsorsData = Object.fromEntries(this.activeSponsors);
            localStorage.setItem('beatx_active_sponsors', JSON.stringify(activeSponsorsData));
        } catch (error) {
            console.error('Failed to save active sponsors:', error);
        }
    }

    // Get sponsors for specific placement
    async getSponsorsForPlacement(placement, userContext = {}) {
        const availableSponsors = [];
        
        for (const [id, template] of this.templates) {
            if (!template.active) continue;
            
            // Check if sponsor supports this placement
            if (!template.placements.includes(placement)) continue;
            
            // Check targeting criteria
            if (!this.matchesTargeting(template.targeting, userContext)) continue;
            
            // Get active campaigns for this sponsor
            const campaigns = await this.getActiveCampaignsForSponsor(id, placement);
            
            availableSponsors.push({
                ...template,
                campaigns: campaigns
            });
        }
        
        // Sort by priority and campaign budget
        return availableSponsors.sort((a, b) => {
            const aPriority = a.priority || 999;
            const bPriority = b.priority || 999;
            
            if (aPriority !== bPriority) {
                return aPriority - bPriority;
            }
            
            // If same priority, sort by campaign budget (higher budget first)
            const aBudget = a.campaigns.reduce((sum, c) => sum + c.budget, 0);
            const bBudget = b.campaigns.reduce((sum, c) => sum + c.budget, 0);
            
            return bBudget - aBudget;
        });
    }

    matchesTargeting(targeting, userContext) {
        // Check role targeting
        if (targeting.roles && targeting.roles.length > 0 && !targeting.roles.includes('all')) {
            if (!userContext.role || !targeting.roles.includes(userContext.role)) {
                return false;
            }
        }
        
        // Check genre targeting
        if (targeting.genres && targeting.genres.length > 0 && !targeting.genres.includes('all')) {
            if (!userContext.genre || !targeting.genres.includes(userContext.genre)) {
                return false;
            }
        }
        
        // Check experience targeting
        if (targeting.experience && targeting.experience.length > 0 && !targeting.experience.includes('all')) {
            if (!userContext.experience || !targeting.experience.includes(userContext.experience)) {
                return false;
            }
        }
        
        return true;
    }

    async getActiveCampaignsForSponsor(sponsorId, placement) {
        if (!this.campaignManager) return [];
        
        try {
            const allCampaigns = this.campaignManager.getActiveCampaigns();
            return allCampaigns.filter(campaign => 
                campaign.sponsorId === sponsorId &&
                (campaign.placement === placement || 
                 campaign.targeting?.placements?.includes(placement))
            );
        } catch (error) {
            console.error('Failed to get campaigns for sponsor:', error);
            return [];
        }
    }

    // Create sponsor content element
    async createSponsorContent(placement, userContext = {}, options = {}) {
        const sponsors = await this.getSponsorsForPlacement(placement, userContext);
        
        if (sponsors.length === 0) return null;
        
        // Select the best sponsor (first in sorted list)
        const selectedSponsor = sponsors[0];
        const selectedCampaign = selectedSponsor.campaigns.length > 0 ? selectedSponsor.campaigns[0] : null;
        
        // Create content element
        const contentElement = this.buildSponsorContentElement(selectedSponsor, selectedCampaign, placement, options);
        
        // Record impression
        if (this.analyticsManager) {
            await this.analyticsManager.recordSponsorDisplay(placement, selectedCampaign?.id);
        }
        
        return {
            element: contentElement,
            sponsor: selectedSponsor,
            campaign: selectedCampaign
        };
    }

    buildSponsorContentElement(sponsor, campaign, placement, options = {}) {
        const element = document.createElement('div');
        element.className = `sponsor-content sponsor-${sponsor.category}`;
        element.setAttribute('data-sponsor-id', sponsor.id);
        element.setAttribute('data-placement', placement);
        
        if (campaign) {
            element.setAttribute('data-campaign-id', campaign.id);
        }
        
        // Apply styling based on placement and options
        const styling = this.getSponsorStyling(placement, options);
        Object.assign(element.style, styling);
        
        // Build content based on sponsor type and placement
        const content = this.buildSponsorContentHTML(sponsor, campaign, placement, options);
        element.innerHTML = content;
        
        // Add interaction handlers
        this.addSponsorInteractionHandlers(element, sponsor, campaign, placement);
        
        return element;
    }

    getSponsorStyling(placement, options = {}) {
        const baseStyles = {
            padding: '12px',
            borderRadius: '8px',
            fontSize: '12px',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
        };
        
        // Placement-specific styles
        const placementStyles = {
            'onboarding_welcome': {
                background: 'rgba(255, 152, 0, 0.05)',
                border: '1px solid rgba(255, 152, 0, 0.2)',
                margin: '16px 0'
            },
            'onboarding_account': {
                background: 'rgba(0, 214, 122, 0.05)',
                border: '1px solid rgba(0, 214, 122, 0.2)',
                margin: '16px 0'
            },
            'dashboard_sidebar': {
                background: 'rgba(59, 130, 246, 0.05)',
                border: '1px solid rgba(59, 130, 246, 0.2)',
                margin: '8px 0',
                fontSize: '11px',
                padding: '8px'
            },
            'marketplace_entry': {
                background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.1), rgba(59, 130, 246, 0.1))',
                border: '1px solid rgba(168, 85, 247, 0.2)',
                margin: '16px 0',
                padding: '16px'
            },
            'upload_start': {
                background: 'rgba(34, 197, 94, 0.05)',
                border: '1px solid rgba(34, 197, 94, 0.2)',
                margin: '12px 0'
            }
        };
        
        return {
            ...baseStyles,
            ...placementStyles[placement],
            ...options.customStyles
        };
    }

    buildSponsorContentHTML(sponsor, campaign, placement, options = {}) {
        const content = sponsor.content;
        const isCompact = options.compact || placement === 'dashboard_sidebar';
        
        if (isCompact) {
            return `
                <div style="display: flex; align-items: center; gap: 8px;">
                    <span style="font-size: 14px;">${this.getSponsorIcon(sponsor.category)}</span>
                    <div style="flex: 1; min-width: 0;">
                        <div style="font-weight: 500; font-size: 11px; color: #374151; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                            ${content.title}
                        </div>
                        <div style="font-size: 9px; color: #6b7280; margin-top: 1px;">
                            ${content.subtitle}
                        </div>
                    </div>
                    <div style="color: #6b7280; font-size: 10px;">→</div>
                </div>
            `;
        }
        
        return `
            <div style="display: flex; align-items: flex-start; gap: 12px;">
                ${sponsor.assets.logo ? `
                    <img src="${sponsor.assets.logo}" alt="${sponsor.name}" 
                         style="width: 32px; height: 32px; border-radius: 4px; flex-shrink: 0;">
                ` : `
                    <div style="width: 32px; height: 32px; background: rgba(0,0,0,0.1); border-radius: 4px; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                        <span style="font-size: 16px;">${this.getSponsorIcon(sponsor.category)}</span>
                    </div>
                `}
                <div style="flex: 1; min-width: 0;">
                    <div style="font-weight: 500; font-size: 13px; color: #374151; margin-bottom: 2px;">
                        ${content.title}
                    </div>
                    <div style="font-size: 11px; color: #6b7280; margin-bottom: 4px;">
                        ${content.subtitle}
                    </div>
                    <div style="font-size: 10px; color: #9ca3af; line-height: 1.3;">
                        ${content.description}
                    </div>
                    ${campaign ? `
                        <div style="font-size: 9px; color: #f59e0b; margin-top: 4px; font-weight: 500;">
                            ${campaign.name}
                        </div>
                    ` : ''}
                </div>
                <div style="flex-shrink: 0;">
                    <div style="background: rgba(59, 130, 246, 0.1); color: #2563eb; padding: 4px 8px; border-radius: 4px; font-size: 10px; font-weight: 500;">
                        ${content.cta}
                    </div>
                </div>
            </div>
        `;
    }

    getSponsorIcon(category) {
        const icons = {
            'marketplace_services': '🏪',
            'professional_services': '🎯',
            'radio_promotion': '📻',
            'collaboration_tools': '🤝',
            'licensing_services': '📄',
            'beat_distribution': '🎵',
            'nft_discovery': '💎',
            'profile_services': '👤'
        };
        
        return icons[category] || '🎵';
    }

    addSponsorInteractionHandlers(element, sponsor, campaign, placement) {
        // Click handler
        element.addEventListener('click', async (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            // Record click
            if (this.analyticsManager) {
                await this.analyticsManager.recordSponsorInteraction('click', placement, campaign?.id);
            }
            
            // Handle sponsor action
            await this.handleSponsorClick(sponsor, campaign, placement);
        });
        
        // Hover effects
        element.addEventListener('mouseenter', () => {
            element.style.transform = 'translateY(-1px)';
            element.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
        });
        
        element.addEventListener('mouseleave', () => {
            element.style.transform = 'translateY(0)';
            element.style.boxShadow = 'none';
        });
    }

    async handleSponsorClick(sponsor, campaign, placement) {
        const content = sponsor.content;
        
        // Navigate to sponsor URL or show modal based on content type
        if (content.url) {
            if (content.url.startsWith('http')) {
                // External URL - open in new tab
                window.open(content.url, '_blank');
            } else {
                // Internal URL - navigate
                window.location.href = content.url;
            }
        } else {
            // Show sponsor modal
            this.showSponsorModal(sponsor, campaign);
        }
        
        // Record conversion if this is a high-value action
        if (this.isConversionAction(sponsor.category, placement)) {
            if (this.analyticsManager) {
                await this.analyticsManager.recordSponsorInteraction('conversion', placement, campaign?.id, this.getConversionValue(sponsor.category));
            }
        }
    }

    isConversionAction(category, placement) {
        const conversionPlacements = [
            'professional_services',
            'radio_submission_start',
            'marketplace_entry',
            'licensing_proceed'
        ];
        
        return conversionPlacements.includes(placement);
    }

    getConversionValue(category) {
        const values = {
            'professional_services': 50,
            'radio_promotion': 30,
            'licensing_services': 40,
            'marketplace_services': 20,
            'collaboration_tools': 15
        };
        
        return values[category] || 10;
    }

    showSponsorModal(sponsor, campaign) {
        // Create modal overlay
        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position: fixed; top: 0; left: 0; right: 0; bottom: 0;
            background: rgba(0, 0, 0, 0.5); z-index: 10000;
            display: flex; align-items: center; justify-content: center;
            padding: 20px;
        `;
        
        // Create modal content
        const modal = document.createElement('div');
        modal.style.cssText = `
            background: white; border-radius: 12px; padding: 24px;
            max-width: 500px; width: 100%; max-height: 80vh; overflow-y: auto;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
        `;
        
        modal.innerHTML = `
            <div style="display: flex; align-items: center; gap: 16px; margin-bottom: 16px;">
                ${sponsor.assets.logo ? `
                    <img src="${sponsor.assets.logo}" alt="${sponsor.name}" 
                         style="width: 48px; height: 48px; border-radius: 8px;">
                ` : `
                    <div style="width: 48px; height: 48px; background: #f3f4f6; border-radius: 8px; display: flex; align-items: center; justify-content: center;">
                        <span style="font-size: 24px;">${this.getSponsorIcon(sponsor.category)}</span>
                    </div>
                `}
                <div>
                    <h3 style="margin: 0; font-size: 18px; font-weight: 600; color: #111827;">
                        ${sponsor.content.title}
                    </h3>
                    <p style="margin: 4px 0 0 0; font-size: 14px; color: #6b7280;">
                        ${sponsor.content.subtitle}
                    </p>
                </div>
                <button onclick="this.closest('.sponsor-modal-overlay').remove()" 
                        style="margin-left: auto; background: none; border: none; font-size: 24px; color: #6b7280; cursor: pointer;">
                    ×
                </button>
            </div>
            
            <div style="margin-bottom: 20px;">
                <p style="font-size: 14px; color: #374151; line-height: 1.5; margin: 0;">
                    ${sponsor.content.description}
                </p>
            </div>
            
            ${campaign ? `
                <div style="background: #f9fafb; border-radius: 8px; padding: 12px; margin-bottom: 20px;">
                    <div style="font-size: 12px; color: #6b7280; margin-bottom: 4px;">Special Offer</div>
                    <div style="font-size: 14px; font-weight: 500; color: #f59e0b;">
                        ${campaign.name}
                    </div>
                </div>
            ` : ''}
            
            <div style="display: flex; gap: 12px; justify-content: flex-end;">
                <button onclick="this.closest('.sponsor-modal-overlay').remove()" 
                        style="padding: 8px 16px; background: #f3f4f6; border: none; border-radius: 6px; color: #374151; cursor: pointer;">
                    Close
                </button>
                <button onclick="window.open('${sponsor.content.url || '#'}', '_blank'); this.closest('.sponsor-modal-overlay').remove();" 
                        style="padding: 8px 16px; background: #2563eb; border: none; border-radius: 6px; color: white; cursor: pointer; font-weight: 500;">
                    ${sponsor.content.cta}
                </button>
            </div>
        `;
        
        overlay.className = 'sponsor-modal-overlay';
        overlay.appendChild(modal);
        document.body.appendChild(overlay);
        
        // Close on overlay click
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                overlay.remove();
            }
        });
    }

    // Partner consent modal
    async showInitialPartnerConsent() {
        return new Promise((resolve) => {
            // Check if consent already given
            const existingConsent = localStorage.getItem('beatx_sponsor_consent');
            if (existingConsent) {
                resolve(existingConsent === 'true');
                return;
            }
            
            // Create consent modal
            const overlay = document.createElement('div');
            overlay.style.cssText = `
                position: fixed; top: 0; left: 0; right: 0; bottom: 0;
                background: rgba(0, 0, 0, 0.8); z-index: 20000;
                display: flex; align-items: center; justify-content: center;
                padding: 20px;
            `;
            
            const modal = document.createElement('div');
            modal.style.cssText = `
                background: white; border-radius: 12px; padding: 24px;
                max-width: 450px; width: 100%;
                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
            `;
            
            modal.innerHTML = `
                <div style="text-align: center; margin-bottom: 20px;">
                    <div style="font-size: 48px; margin-bottom: 12px;">🤝</div>
                    <h3 style="margin: 0 0 8px 0; font-size: 18px; font-weight: 600; color: #111827;">
                        Partner Content & Services
                    </h3>
                    <p style="margin: 0; font-size: 14px; color: #6b7280;">
                        BeatsChain works with trusted partners to provide additional services
                    </p>
                </div>
                
                <div style="background: #f9fafb; border-radius: 8px; padding: 16px; margin-bottom: 20px;">
                    <div style="font-size: 13px; color: #374151; line-height: 1.5;">
                        <strong>What you'll see:</strong><br>
                        • Professional music services<br>
                        • Radio promotion opportunities<br>
                        • Collaboration tools<br>
                        • Licensing services<br><br>
                        
                        <strong>Your privacy:</strong><br>
                        • No personal data shared with partners<br>
                        • You control what services to use<br>
                        • Can opt out anytime in settings
                    </div>
                </div>
                
                <div style="display: flex; gap: 12px;">
                    <button id="consent-decline" 
                            style="flex: 1; padding: 12px; background: #f3f4f6; border: none; border-radius: 6px; color: #374151; cursor: pointer;">
                        No Thanks
                    </button>
                    <button id="consent-accept" 
                            style="flex: 1; padding: 12px; background: #2563eb; border: none; border-radius: 6px; color: white; cursor: pointer; font-weight: 500;">
                        Show Partner Content
                    </button>
                </div>
            `;
            
            overlay.appendChild(modal);
            document.body.appendChild(overlay);
            
            // Handle consent
            modal.querySelector('#consent-accept').addEventListener('click', () => {
                localStorage.setItem('beatx_sponsor_consent', 'true');
                overlay.remove();
                resolve(true);
            });
            
            modal.querySelector('#consent-decline').addEventListener('click', () => {
                localStorage.setItem('beatx_sponsor_consent', 'false');
                overlay.remove();
                resolve(false);
            });
        });
    }

    // Template management methods
    async createSponsorTemplate(templateData) {
        const templateId = templateData.id || `sponsor_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        const template = {
            id: templateId,
            name: templateData.name,
            category: templateData.category,
            description: templateData.description,
            active: templateData.active !== false,
            priority: templateData.priority || 999,
            assets: templateData.assets || {},
            placements: templateData.placements || [],
            targeting: templateData.targeting || {
                roles: ['all'],
                genres: ['all'],
                experience: ['all']
            },
            content: templateData.content || {},
            createdAt: Date.now(),
            updatedAt: Date.now()
        };
        
        this.templates.set(templateId, template);
        await this.saveSponsorTemplates();
        
        return template;
    }

    async updateSponsorTemplate(templateId, updates) {
        const template = this.templates.get(templateId);
        if (!template) {
            throw new Error('Template not found');
        }
        
        const updatedTemplate = {
            ...template,
            ...updates,
            updatedAt: Date.now()
        };
        
        this.templates.set(templateId, updatedTemplate);
        await this.saveSponsorTemplates();
        
        return updatedTemplate;
    }

    async deleteSponsorTemplate(templateId) {
        if (!this.templates.has(templateId)) {
            throw new Error('Template not found');
        }
        
        this.templates.delete(templateId);
        await this.saveSponsorTemplates();
    }

    getSponsorTemplate(templateId) {
        return this.templates.get(templateId);
    }

    getAllSponsorTemplates() {
        return Array.from(this.templates.values());
    }

    // Utility methods
    hasUserConsent() {
        const consent = localStorage.getItem('beatx_sponsor_consent');
        return consent === 'true';
    }

    async clearSponsorData() {
        localStorage.removeItem('beatx_sponsor_templates');
        localStorage.removeItem('beatx_active_sponsors');
        localStorage.removeItem('beatx_sponsor_consent');
        
        this.templates.clear();
        this.activeSponsors.clear();
        this.contentCache.clear();
        
        await this.initializeDefaultTemplates();
    }
}

// Export for app compatibility
window.SponsorContentManager = SponsorContentManager;