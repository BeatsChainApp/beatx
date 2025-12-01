-- RBAC System Migration - Context-Aware Roles
-- Respects App (Producers) vs Extension (Artists) separation

-- Users table with context-aware roles
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    wallet_address VARCHAR(42),
    role VARCHAR(50) NOT NULL DEFAULT 'USER',
    context VARCHAR(20) NOT NULL DEFAULT 'app', -- 'app' or 'extension'
    verification_status VARCHAR(20) DEFAULT 'pending',
    invited_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Role permissions matrix
CREATE TABLE IF NOT EXISTS role_permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role VARCHAR(50) NOT NULL,
    permission VARCHAR(100) NOT NULL,
    context VARCHAR(20) NOT NULL DEFAULT 'app',
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(role, permission, context)
);

-- User sessions with role caching
CREATE TABLE IF NOT EXISTS user_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    session_token VARCHAR(255) UNIQUE NOT NULL,
    role VARCHAR(50) NOT NULL,
    context VARCHAR(20) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Insert default permissions for App context (Producers)
INSERT INTO role_permissions (role, permission, context) VALUES
('SUPER_ADMIN', '*', 'app'),
('ADMIN', 'admin_panel', 'app'),
('ADMIN', 'user_management', 'app'),
('ADMIN', 'producer_management', 'app'),
('ADMIN', 'marketplace_admin', 'app'),
('PRODUCER', 'beat_upload', 'app'),
('PRODUCER', 'beat_manage', 'app'),
('PRODUCER', 'earnings_view', 'app'),
('PRODUCER', 'analytics_view', 'app'),
('PRODUCER', 'collaboration', 'app'),
('CONTENT_CREATOR', 'license_negotiate', 'app'),
('CONTENT_CREATOR', 'beat_license', 'app'),
('CONTENT_CREATOR', 'creator_dashboard', 'app'),
('COLLECTOR', 'beat_purchase', 'app'),
('COLLECTOR', 'collection_view', 'app'),
('USER', 'beat_browse', 'app'),
('USER', 'profile_view', 'app');

-- Insert default permissions for Extension context (Artists)
INSERT INTO role_permissions (role, permission, context) VALUES
('SUPER_ADMIN', '*', 'extension'),
('ADMIN', 'admin_panel', 'extension'),
('ADMIN', 'user_management', 'extension'),
('ADMIN', 'extension_admin', 'extension'),
('ARTIST', 'nft_mint', 'extension'),
('ARTIST', 'radio_submit', 'extension'),
('ARTIST', 'isrc_generate', 'extension'),
('ARTIST', 'wallet_manage', 'extension'),
('USER', 'nft_mint_limited', 'extension'),
('USER', 'radio_submit_limited', 'extension');

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_wallet ON users(wallet_address);
CREATE INDEX IF NOT EXISTS idx_users_role_context ON users(role, context);
CREATE INDEX IF NOT EXISTS idx_sessions_token ON user_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_sessions_user ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_permissions_role_context ON role_permissions(role, context);

-- Function to get user permissions
CREATE OR REPLACE FUNCTION get_user_permissions(user_email VARCHAR, user_context VARCHAR DEFAULT 'app')
RETURNS TABLE(permission VARCHAR) AS $$
BEGIN
    RETURN QUERY
    SELECT rp.permission
    FROM users u
    JOIN role_permissions rp ON u.role = rp.role AND u.context = rp.context
    WHERE u.email = user_email AND u.context = user_context;
END;
$$ LANGUAGE plpgsql;

-- Function to check user permission
CREATE OR REPLACE FUNCTION has_permission(user_email VARCHAR, check_permission VARCHAR, user_context VARCHAR DEFAULT 'app')
RETURNS BOOLEAN AS $$
DECLARE
    has_perm BOOLEAN := FALSE;
BEGIN
    SELECT EXISTS(
        SELECT 1 FROM users u
        JOIN role_permissions rp ON u.role = rp.role AND u.context = rp.context
        WHERE u.email = user_email 
        AND u.context = user_context
        AND (rp.permission = check_permission OR rp.permission = '*')
    ) INTO has_perm;
    
    RETURN has_perm;
END;
$$ LANGUAGE plpgsql;