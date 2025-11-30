// Admin Campaign Integration - Admin Dashboard Only
class AdminCampaignIntegration {
    static enhanceAdminDashboard(adminDashboard) {
        if (!adminDashboard || !adminDashboard.isInitialized) {
            console.log('Admin dashboard required for campaign management');
            return;
        }

        // Add campaign management section to admin dashboard
        const adminContent = document.getElementById('admin-content');
        if (!adminContent) return;

        const campaignSection = document.createElement('div');
        campaignSection.className = 'admin-campaign-section';
        campaignSection.innerHTML = `
            <div class="form-group">
                <label class="form-label">📊 Campaign Management:</label>
                <div id="campaigns-container" class="admin-only"></div>
            </div>
        `;

        adminContent.appendChild(campaignSection);

        // Initialize enhanced campaign manager for admin only
        if (window.EnhancedCampaignManager) {
            const campaignManager = new EnhancedCampaignManager();
            const mockAuth = {
                hasPermission: () => true,
                getUserProfile: () => ({ role: 'admin' })
            };
            
            campaignManager.initialize(mockAuth);
            window.adminCampaignManager = campaignManager;
            console.log('✅ Admin campaign management integrated');
        }
    }

    static addCampaignStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .admin-campaign-section {
                margin-top: 16px;
                padding-top: 16px;
                border-top: 1px solid #dee2e6;
            }
            
            .admin-only {
                display: block;
            }
            
            @media (max-width: 768px) {
                .campaigns-header {
                    flex-direction: column;
                    gap: 12px;
                }
                
                .campaign-filters {
                    width: 100%;
                    justify-content: center;
                }
                
                .campaign-summary {
                    grid-template-columns: repeat(2, 1fr);
                }
            }
        `;
        document.head.appendChild(style);
    }
}

// Auto-integrate when admin dashboard is available
if (typeof window !== 'undefined') {
    window.AdminCampaignIntegration = AdminCampaignIntegration;
    
    // Wait for admin dashboard initialization
    const checkAdminDashboard = () => {
        const adminSection = document.getElementById('admin-dashboard-section');
        if (adminSection && window.AdminDashboardManager) {
            AdminCampaignIntegration.enhanceAdminDashboard(window.adminDashboard);
            AdminCampaignIntegration.addCampaignStyles();
        } else {
            setTimeout(checkAdminDashboard, 500);
        }
    };
    
    // Start checking after DOM load
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', checkAdminDashboard);
    } else {
        checkAdminDashboard();
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { AdminCampaignIntegration };
}