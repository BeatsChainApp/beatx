// Enhanced Campaign Manager with Mobile Responsiveness
class EnhancedCampaignManager {
    constructor() {
        this.mcpClient = new MCPClient();
        this.campaigns = new Map();
        this.activeFilters = {
            status: 'all',
            platform: 'all',
            placement: 'all'
        };
        this.isInitialized = false;
    }

    async initialize(authManager) {
        try {
            // Check admin permissions
            if (!authManager || !authManager.hasPermission('admin_panel')) {
                console.log('Campaign management requires admin permissions');
                return false;
            }

            await this.loadCampaigns();
            this.setupUI();
            this.setupEventListeners();
            this.isInitialized = true;
            console.log('✅ Enhanced Campaign Manager initialized (admin only)');
            return true;
        } catch (error) {
            console.error('Campaign Manager initialization failed:', error);
            return false;
        }
    }

    async loadCampaigns() {
        try {
            const extensionCampaigns = await this.mcpClient.getCampaigns('extension');
            const appCampaigns = await this.mcpClient.getCampaigns('app');
            
            [...extensionCampaigns, ...appCampaigns].forEach(campaign => {
                this.campaigns.set(campaign.id, campaign);
            });
            
            console.log(`Loaded ${this.campaigns.size} campaigns`);
        } catch (error) {
            console.error('Failed to load campaigns:', error);
        }
    }

    setupUI() {
        // Only show in admin dashboard
        const adminSection = document.getElementById('admin-dashboard-section');
        if (!adminSection) {
            console.log('Campaign management requires admin access');
            return;
        }

        let container = document.getElementById('campaigns-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'campaigns-container';
            container.className = 'admin-only';
            adminSection.appendChild(container);
        }

        container.innerHTML = `
            <div class="campaigns-header">
                <h6>📊 Campaign Management</h6>
                <div class="campaign-filters">
                    <select id="status-filter" class="form-select">
                        <option value="all">All Status</option>
                        <option value="active">Active</option>
                        <option value="paused">Paused</option>
                        <option value="completed">Completed</option>
                    </select>
                    <select id="platform-filter" class="form-select">
                        <option value="all">All Platforms</option>
                        <option value="extension">Extension</option>
                        <option value="app">App</option>
                    </select>
                </div>
            </div>
            
            <div class="campaign-summary">
                <div class="summary-card">
                    <span class="summary-card-value" id="total-campaigns">0</span>
                    <span class="summary-card-label">Total</span>
                </div>
                <div class="summary-card">
                    <span class="summary-card-value" id="active-campaigns">0</span>
                    <span class="summary-card-label">Active</span>
                </div>
                <div class="summary-card">
                    <span class="summary-card-value" id="total-revenue">R0</span>
                    <span class="summary-card-label">Revenue</span>
                </div>
            </div>
            
            <div class="campaign-actions-row">
                <button id="create-campaign-btn" class="btn btn-primary">
                    <span>➕</span> Create Campaign
                </button>
                <button id="refresh-campaigns-btn" class="btn btn-secondary">
                    <span>🔄</span> Refresh
                </button>
            </div>
            
            <div class="campaigns-list" id="campaigns-list">
                <div class="loading-campaigns">Loading campaigns...</div>
            </div>
        `;

        this.updateSummary();
        this.renderCampaigns();
    }

    setupEventListeners() {
        // Filter listeners
        document.getElementById('status-filter')?.addEventListener('change', (e) => {
            this.activeFilters.status = e.target.value;
            this.renderCampaigns();
        });

        document.getElementById('platform-filter')?.addEventListener('change', (e) => {
            this.activeFilters.platform = e.target.value;
            this.renderCampaigns();
        });

        // Action listeners
        document.getElementById('create-campaign-btn')?.addEventListener('click', () => {
            this.showCreateCampaignModal();
        });

        document.getElementById('refresh-campaigns-btn')?.addEventListener('click', async () => {
            await this.refreshCampaigns();
        });
    }

    renderCampaigns() {
        const listContainer = document.getElementById('campaigns-list');
        if (!listContainer) return;

        const filteredCampaigns = this.getFilteredCampaigns();

        if (filteredCampaigns.length === 0) {
            listContainer.innerHTML = `
                <div class="no-campaigns">
                    <h4>No campaigns found</h4>
                    <p>Create your first campaign to start tracking revenue</p>
                </div>
            `;
            return;
        }

        listContainer.innerHTML = '';
        filteredCampaigns.forEach(campaign => {
            const campaignCard = this.createCampaignCard(campaign);
            listContainer.appendChild(campaignCard);
        });
    }

    createCampaignCard(campaign) {
        const card = document.createElement('div');
        card.className = 'campaign-card';
        card.dataset.status = campaign.status || 'active';

        const statusColors = {
            active: '#28a745',
            paused: '#ffc107',
            completed: '#17a2b8',
            cancelled: '#dc3545'
        };

        card.innerHTML = `
            <div class="campaign-header">
                <div class="campaign-title">
                    <h6>${this.escapeHtml(campaign.name)}</h6>
                    <div class="campaign-subtitle">
                        <span>📱 ${campaign.platform}</span>
                        <span>📍 ${campaign.placement}</span>
                        <span>📅 ${this.formatDate(campaign.created_at)}</span>
                    </div>
                </div>
                <div class="campaign-actions">
                    <button class="btn-small btn-secondary" onclick="campaignManager.editCampaign('${campaign.id}')" title="Edit">
                        ✏️
                    </button>
                    <button class="btn-small btn-info" onclick="campaignManager.viewCampaignDetails('${campaign.id}')" title="Details">
                        👁️
                    </button>
                    <button class="btn-small btn-danger" onclick="campaignManager.deleteCampaign('${campaign.id}')" title="Delete">
                        🗑️
                    </button>
                </div>
            </div>
            
            <div class="campaign-progress">
                <span class="progress-label">Budget Usage</span>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${this.calculateBudgetUsage(campaign)}%"></div>
                </div>
            </div>
            
            <div class="campaign-details">
                <div class="campaign-info">
                    <small>💰 Budget: R${campaign.budget || 0}</small>
                    <small>📊 Remaining: R${campaign.remaining_budget || 0}</small>
                    <small>🎯 Daily Limit: ${campaign.daily_limit || 0}</small>
                </div>
                <div class="campaign-metrics">
                    <div class="metric-item">
                        <span class="metric-value">${campaign.impressions || 0}</span>
                        <span class="metric-label">Views</span>
                    </div>
                    <div class="metric-item">
                        <span class="metric-value">${campaign.clicks || 0}</span>
                        <span class="metric-label">Clicks</span>
                    </div>
                    <div class="metric-item">
                        <span class="metric-value">R${campaign.total_revenue || 0}</span>
                        <span class="metric-label">Revenue</span>
                    </div>
                </div>
            </div>
            
            <div class="campaign-status" style="background: ${statusColors[campaign.status] || '#6c757d'}">
                ${(campaign.status || 'active').toUpperCase()}
            </div>
        `;

        return card;
    }

    showCreateCampaignModal() {
        const modal = document.createElement('div');
        modal.className = 'campaign-form-overlay';
        
        modal.innerHTML = `
            <div class="campaign-form-modal">
                <div class="form-header">
                    <h5>Create New Campaign</h5>
                    <button class="close-form-btn" onclick="this.closest('.campaign-form-overlay').remove()">&times;</button>
                </div>
                
                <form class="campaign-form" id="create-campaign-form">
                    <div class="form-row">
                        <label for="campaign-name">Campaign Name</label>
                        <input type="text" id="campaign-name" class="form-input" placeholder="Enter campaign name" required>
                    </div>
                    
                    <div class="form-grid-two-col">
                        <div class="form-row">
                            <label for="campaign-platform">Platform</label>
                            <select id="campaign-platform" class="form-input" required>
                                <option value="extension">Chrome Extension</option>
                                <option value="app">Mobile App</option>
                            </select>
                        </div>
                        
                        <div class="form-row">
                            <label for="campaign-placement">Placement</label>
                            <select id="campaign-placement" class="form-input" required>
                                <option value="upload_start">Upload Start</option>
                                <option value="upload_complete">Upload Complete</option>
                                <option value="isrc_generation">ISRC Generation</option>
                                <option value="mint_success">Mint Success</option>
                            </select>
                        </div>
                    </div>
                    
                    <div class="form-grid-two-col">
                        <div class="form-row">
                            <label for="campaign-budget">Budget (ZAR)</label>
                            <input type="number" id="campaign-budget" class="form-input" placeholder="100.00" min="0" step="0.01" required>
                            <small class="field-help">Total campaign budget</small>
                        </div>
                        
                        <div class="form-row">
                            <label for="campaign-daily-limit">Daily Limit</label>
                            <input type="number" id="campaign-daily-limit" class="form-input" placeholder="50" min="1" required>
                            <small class="field-help">Maximum daily impressions</small>
                        </div>
                    </div>
                    
                    <div class="form-actions">
                        <button type="button" class="btn cancel-campaign-btn" onclick="this.closest('.campaign-form-overlay').remove()">
                            Cancel
                        </button>
                        <button type="submit" class="btn btn-primary">
                            Create Campaign
                        </button>
                    </div>
                </form>
            </div>
        `;

        document.body.appendChild(modal);

        // Form submission
        document.getElementById('create-campaign-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.handleCreateCampaign(modal);
        });
    }

    async handleCreateCampaign(modal) {
        const formData = new FormData(document.getElementById('create-campaign-form'));
        const campaignData = {
            name: document.getElementById('campaign-name').value,
            platform: document.getElementById('campaign-platform').value,
            placement: document.getElementById('campaign-placement').value,
            budget: parseFloat(document.getElementById('campaign-budget').value),
            dailyLimit: parseInt(document.getElementById('campaign-daily-limit').value)
        };

        try {
            const result = await this.mcpClient.createCampaign(campaignData);
            if (result.success) {
                this.campaigns.set(result.campaign.id, result.campaign);
                this.renderCampaigns();
                this.updateSummary();
                modal.remove();
                this.showToast('Campaign created successfully!', 'success');
            } else {
                throw new Error(result.message || 'Failed to create campaign');
            }
        } catch (error) {
            console.error('Campaign creation failed:', error);
            this.showToast(`Failed to create campaign: ${error.message}`, 'error');
        }
    }

    async editCampaign(campaignId) {
        const campaign = this.campaigns.get(campaignId);
        if (!campaign) return;

        // Similar modal to create but pre-filled
        console.log('Edit campaign:', campaign.name);
    }

    async viewCampaignDetails(campaignId) {
        const campaign = this.campaigns.get(campaignId);
        if (!campaign) return;

        const modal = document.createElement('div');
        modal.className = 'campaign-form-overlay';
        
        modal.innerHTML = `
            <div class="campaign-form-modal">
                <div class="form-header">
                    <h5>Campaign Details: ${this.escapeHtml(campaign.name)}</h5>
                    <button class="close-form-btn" onclick="this.remove()">&times;</button>
                </div>
                
                <div class="campaign-details-content">
                    <div class="detail-section">
                        <h6>📊 Performance Metrics</h6>
                        <div class="metrics-grid">
                            <div class="metric-card">
                                <span class="metric-number">${campaign.impressions || 0}</span>
                                <span class="metric-label">Impressions</span>
                            </div>
                            <div class="metric-card">
                                <span class="metric-number">${campaign.clicks || 0}</span>
                                <span class="metric-label">Clicks</span>
                            </div>
                            <div class="metric-card">
                                <span class="metric-number">${((campaign.clicks || 0) / (campaign.impressions || 1) * 100).toFixed(1)}%</span>
                                <span class="metric-label">CTR</span>
                            </div>
                            <div class="metric-card">
                                <span class="metric-number">R${campaign.total_revenue || 0}</span>
                                <span class="metric-label">Revenue</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="detail-section">
                        <h6>💰 Budget Information</h6>
                        <div class="budget-info">
                            <div class="budget-row">
                                <span>Total Budget:</span>
                                <span>R${campaign.budget || 0}</span>
                            </div>
                            <div class="budget-row">
                                <span>Remaining:</span>
                                <span>R${campaign.remaining_budget || 0}</span>
                            </div>
                            <div class="budget-row">
                                <span>Daily Limit:</span>
                                <span>${campaign.daily_limit || 0} impressions</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
    }

    async deleteCampaign(campaignId) {
        const campaign = this.campaigns.get(campaignId);
        if (!campaign) return;

        if (!confirm(`Delete campaign "${campaign.name}"? This action cannot be undone.`)) {
            return;
        }

        try {
            const result = await this.mcpClient.deleteCampaign(campaignId);
            if (result.success) {
                this.campaigns.delete(campaignId);
                this.renderCampaigns();
                this.updateSummary();
                this.showToast('Campaign deleted successfully', 'success');
            } else {
                throw new Error(result.message || 'Failed to delete campaign');
            }
        } catch (error) {
            console.error('Campaign deletion failed:', error);
            this.showToast(`Failed to delete campaign: ${error.message}`, 'error');
        }
    }

    async refreshCampaigns() {
        const refreshBtn = document.getElementById('refresh-campaigns-btn');
        if (refreshBtn) {
            refreshBtn.disabled = true;
            refreshBtn.innerHTML = '<span>⏳</span> Refreshing...';
        }

        try {
            this.campaigns.clear();
            await this.loadCampaigns();
            this.renderCampaigns();
            this.updateSummary();
            this.showToast('Campaigns refreshed', 'success');
        } catch (error) {
            console.error('Failed to refresh campaigns:', error);
            this.showToast('Failed to refresh campaigns', 'error');
        } finally {
            if (refreshBtn) {
                refreshBtn.disabled = false;
                refreshBtn.innerHTML = '<span>🔄</span> Refresh';
            }
        }
    }

    getFilteredCampaigns() {
        return Array.from(this.campaigns.values()).filter(campaign => {
            if (this.activeFilters.status !== 'all' && campaign.status !== this.activeFilters.status) {
                return false;
            }
            if (this.activeFilters.platform !== 'all' && campaign.platform !== this.activeFilters.platform) {
                return false;
            }
            return true;
        });
    }

    updateSummary() {
        const campaigns = Array.from(this.campaigns.values());
        const activeCampaigns = campaigns.filter(c => c.status === 'active');
        const totalRevenue = campaigns.reduce((sum, c) => sum + (c.total_revenue || 0), 0);

        document.getElementById('total-campaigns').textContent = campaigns.length;
        document.getElementById('active-campaigns').textContent = activeCampaigns.length;
        document.getElementById('total-revenue').textContent = `R${totalRevenue.toFixed(2)}`;
    }

    calculateBudgetUsage(campaign) {
        const budget = campaign.budget || 0;
        const remaining = campaign.remaining_budget || 0;
        if (budget === 0) return 0;
        return Math.max(0, Math.min(100, ((budget - remaining) / budget) * 100));
    }

    formatDate(dateString) {
        if (!dateString) return 'Unknown';
        return new Date(dateString).toLocaleDateString();
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.style.cssText = `
            position: fixed; top: 20px; right: 20px; z-index: 10000;
            padding: 12px 16px; border-radius: 6px; color: white;
            background: ${type === 'success' ? '#28a745' : type === 'error' ? '#dc3545' : '#17a2b8'};
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        `;
        toast.textContent = message;
        
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
    }
}

// Enhanced MCP Client with additional methods
class MCPClient {
    constructor() {
        this.baseUrl = process.env.MCP_SERVER_URL || 'http://localhost:3001';
    }

    async createCampaign(campaignData) {
        try {
            const response = await fetch(`${this.baseUrl}/api/campaigns/${campaignData.platform}/create`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(campaignData)
            });
            return await response.json();
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async getCampaigns(platform = 'extension') {
        try {
            const response = await fetch(`${this.baseUrl}/api/campaigns/${platform}`);
            const result = await response.json();
            return result.campaigns || [];
        } catch (error) {
            console.error('Get campaigns failed:', error);
            return [];
        }
    }

    async updateCampaign(campaignId, updates) {
        try {
            const response = await fetch(`${this.baseUrl}/api/campaigns/${campaignId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updates)
            });
            return await response.json();
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async deleteCampaign(campaignId) {
        try {
            const response = await fetch(`${this.baseUrl}/api/campaigns/${campaignId}`, {
                method: 'DELETE'
            });
            return await response.json();
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async trackRevenue(data) {
        try {
            const response = await fetch(`${this.baseUrl}/api/campaigns/track-revenue`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            return await response.json();
        } catch (error) {
            console.error('Revenue tracking failed:', error);
            throw error;
        }
    }

    async getCampaignStats() {
        try {
            const response = await fetch(`${this.baseUrl}/api/campaigns/stats`);
            return await response.json();
        } catch (error) {
            return { success: false, error: error.message };
        }
    }
}

// Export for use
if (typeof window !== 'undefined') {
    window.EnhancedCampaignManager = EnhancedCampaignManager;
    window.MCPClient = MCPClient;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { EnhancedCampaignManager, MCPClient };
}