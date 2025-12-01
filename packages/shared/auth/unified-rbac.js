// Unified RBAC System - Respects App vs Extension Separation
class UnifiedRBAC {
    constructor(context = 'app') {
        this.context = context; // 'app' or 'extension'
        this.roles = this.getRoleHierarchy();
        this.permissions = this.getPermissionMatrix();
    }

    getRoleHierarchy() {
        if (this.context === 'app') {
            return {
                SUPER_ADMIN: 100,
                ADMIN: 90,
                PRODUCER: 50,
                CONTENT_CREATOR: 40,
                COLLECTOR: 30,
                USER: 10
            };
        } else {
            return {
                SUPER_ADMIN: 100,
                ADMIN: 90,
                ARTIST: 50,
                USER: 10
            };
        }
    }

    getPermissionMatrix() {
        if (this.context === 'app') {
            return {
                SUPER_ADMIN: ['*'],
                ADMIN: ['admin_panel', 'user_management', 'producer_management', 'marketplace_admin'],
                PRODUCER: ['beat_upload', 'beat_manage', 'earnings_view', 'analytics_view', 'collaboration'],
                CONTENT_CREATOR: ['license_negotiate', 'beat_license', 'creator_dashboard'],
                COLLECTOR: ['beat_purchase', 'collection_view'],
                USER: ['beat_browse', 'profile_view']
            };
        } else {
            return {
                SUPER_ADMIN: ['*'],
                ADMIN: ['admin_panel', 'user_management', 'extension_admin'],
                ARTIST: ['nft_mint', 'radio_submit', 'isrc_generate', 'wallet_manage'],
                USER: ['nft_mint_limited', 'radio_submit_limited']
            };
        }
    }

    determineRole(email, walletAddress = null) {
        const adminEmails = [
            'admin@beatschain.com',
            'developer@beatschain.com', 
            'info@unamifoundation.org',
            'deannecoole5@gmail.com',
            'sihle.zuma680@gmail.com'
        ];

        if (adminEmails.includes(email)) {
            return 'SUPER_ADMIN';
        }

        // Check for hardcoded admin wallet (temporary)
        if (walletAddress === '0xc84799A904EeB5C57aBBBc40176E7dB8be202C10') {
            return 'ADMIN';
        }

        // Context-specific role determination
        if (this.context === 'app') {
            // App defaults to PRODUCER for verified emails
            return email.includes('@') ? 'PRODUCER' : 'USER';
        } else {
            // Extension defaults to ARTIST for verified emails
            return email.includes('@') ? 'ARTIST' : 'USER';
        }
    }

    hasPermission(userRole, permission) {
        const userPermissions = this.permissions[userRole] || [];
        return userPermissions.includes('*') || userPermissions.includes(permission);
    }

    canAccess(userRole, resource) {
        const roleLevel = this.roles[userRole] || 0;
        
        const resourceRequirements = {
            admin_dashboard: 90,
            producer_dashboard: 50,
            creator_dashboard: 40,
            artist_dashboard: 50,
            marketplace: 10,
            minting: 10
        };

        return roleLevel >= (resourceRequirements[resource] || 0);
    }
}

module.exports = { UnifiedRBAC };