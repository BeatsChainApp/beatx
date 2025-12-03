-- 012_unified_profiles_schema.sql
-- Complete unified profiles schema for all platforms

BEGIN;

-- Create unified profiles table
CREATE TABLE IF NOT EXISTS unified_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text UNIQUE NOT NULL,
  
  -- Identity fields
  email text,
  wallet_address text,
  google_id text,
  whatsapp_id text,
  
  -- Profile data
  display_name text NOT NULL,
  profile_image text,
  bio text DEFAULT '',
  
  -- Role and permissions (context-aware)
  app_role text DEFAULT 'USER',
  extension_role text DEFAULT 'USER',
  
  -- Verification status
  is_verified boolean DEFAULT false,
  email_verified boolean DEFAULT false,
  wallet_verified boolean DEFAULT false,
  
  -- Platform-specific data
  platforms jsonb DEFAULT '{
    "app": {"active": false, "preferences": {}},
    "extension": {"active": false, "preferences": {}},
    "whatsapp": {"active": false, "profile": null}
  }'::jsonb,
  
  -- Timestamps
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  last_sync timestamptz DEFAULT now()
);

-- Create indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_unified_profiles_user_id ON unified_profiles (user_id);
CREATE INDEX IF NOT EXISTS idx_unified_profiles_email ON unified_profiles (email);
CREATE INDEX IF NOT EXISTS idx_unified_profiles_wallet ON unified_profiles (wallet_address);
CREATE INDEX IF NOT EXISTS idx_unified_profiles_google_id ON unified_profiles (google_id);
CREATE INDEX IF NOT EXISTS idx_unified_profiles_whatsapp_id ON unified_profiles (whatsapp_id);
CREATE INDEX IF NOT EXISTS idx_unified_profiles_updated_at ON unified_profiles (updated_at);

-- Create profile sync events table
CREATE TABLE IF NOT EXISTS profile_sync_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL,
  platform text NOT NULL,
  event_type text NOT NULL, -- 'create', 'update', 'sync'
  data jsonb,
  success boolean DEFAULT true,
  error_message text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_profile_sync_events_user_id ON profile_sync_events (user_id);
CREATE INDEX IF NOT EXISTS idx_profile_sync_events_platform ON profile_sync_events (platform);
CREATE INDEX IF NOT EXISTS idx_profile_sync_events_created_at ON profile_sync_events (created_at);

-- Create wallet mappings table for cross-platform wallet management
CREATE TABLE IF NOT EXISTS wallet_mappings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL,
  platform text NOT NULL, -- 'app', 'extension', 'mcp'
  wallet_address text NOT NULL,
  wallet_type text DEFAULT 'generated', -- 'generated', 'connected', 'imported'
  is_primary boolean DEFAULT false,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_wallet_mappings_user_id ON wallet_mappings (user_id);
CREATE INDEX IF NOT EXISTS idx_wallet_mappings_wallet_address ON wallet_mappings (wallet_address);
CREATE INDEX IF NOT EXISTS idx_wallet_mappings_platform ON wallet_mappings (platform);

-- Create authentication sessions table
CREATE TABLE IF NOT EXISTS auth_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL,
  platform text NOT NULL,
  session_token text UNIQUE NOT NULL,
  expires_at timestamptz NOT NULL,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_auth_sessions_user_id ON auth_sessions (user_id);
CREATE INDEX IF NOT EXISTS idx_auth_sessions_token ON auth_sessions (session_token);
CREATE INDEX IF NOT EXISTS idx_auth_sessions_expires_at ON auth_sessions (expires_at);

-- Create cross-platform permissions table
CREATE TABLE IF NOT EXISTS cross_platform_permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL,
  platform text NOT NULL,
  permission text NOT NULL,
  granted_by text,
  granted_at timestamptz DEFAULT now(),
  expires_at timestamptz,
  metadata jsonb DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_cross_platform_permissions_user_id ON cross_platform_permissions (user_id);
CREATE INDEX IF NOT EXISTS idx_cross_platform_permissions_platform ON cross_platform_permissions (platform);

-- Create user activity log
CREATE TABLE IF NOT EXISTS user_activity_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL,
  platform text NOT NULL,
  activity_type text NOT NULL,
  details jsonb DEFAULT '{}'::jsonb,
  ip_address inet,
  user_agent text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_user_activity_log_user_id ON user_activity_log (user_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_log_platform ON user_activity_log (platform);
CREATE INDEX IF NOT EXISTS idx_user_activity_log_created_at ON user_activity_log (created_at);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for unified_profiles
DROP TRIGGER IF EXISTS update_unified_profiles_updated_at ON unified_profiles;
CREATE TRIGGER update_unified_profiles_updated_at
    BEFORE UPDATE ON unified_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create function to log profile sync events
CREATE OR REPLACE FUNCTION log_profile_sync_event()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO profile_sync_events (user_id, platform, event_type, data)
    VALUES (
        COALESCE(NEW.user_id, OLD.user_id),
        'supabase',
        CASE 
            WHEN TG_OP = 'INSERT' THEN 'create'
            WHEN TG_OP = 'UPDATE' THEN 'update'
            WHEN TG_OP = 'DELETE' THEN 'delete'
        END,
        CASE 
            WHEN TG_OP = 'DELETE' THEN row_to_json(OLD)
            ELSE row_to_json(NEW)
        END
    );
    RETURN COALESCE(NEW, OLD);
END;
$$ language 'plpgsql';

-- Create trigger for profile sync logging
DROP TRIGGER IF EXISTS log_unified_profiles_sync ON unified_profiles;
CREATE TRIGGER log_unified_profiles_sync
    AFTER INSERT OR UPDATE OR DELETE ON unified_profiles
    FOR EACH ROW
    EXECUTE FUNCTION log_profile_sync_event();

-- Create RLS policies for security
ALTER TABLE unified_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE profile_sync_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallet_mappings ENABLE ROW LEVEL SECURITY;
ALTER TABLE auth_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE cross_platform_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_activity_log ENABLE ROW LEVEL SECURITY;

-- Allow service role full access
CREATE POLICY "Service role full access" ON unified_profiles
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access" ON profile_sync_events
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access" ON wallet_mappings
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access" ON auth_sessions
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access" ON cross_platform_permissions
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access" ON user_activity_log
    FOR ALL USING (auth.role() = 'service_role');

-- Create view for active users across platforms
CREATE OR REPLACE VIEW active_users_summary AS
SELECT 
    user_id,
    display_name,
    email,
    wallet_address,
    app_role,
    extension_role,
    is_verified,
    (platforms->'app'->>'active')::boolean as app_active,
    (platforms->'extension'->>'active')::boolean as extension_active,
    (platforms->'whatsapp'->>'active')::boolean as whatsapp_active,
    created_at,
    updated_at,
    last_sync
FROM unified_profiles
WHERE 
    (platforms->'app'->>'active')::boolean = true OR
    (platforms->'extension'->>'active')::boolean = true OR
    (platforms->'whatsapp'->>'active')::boolean = true;

-- Create function to get user profile by any identifier
CREATE OR REPLACE FUNCTION get_unified_profile(
    p_email text DEFAULT NULL,
    p_wallet_address text DEFAULT NULL,
    p_google_id text DEFAULT NULL,
    p_whatsapp_id text DEFAULT NULL,
    p_user_id text DEFAULT NULL
)
RETURNS TABLE (
    user_id text,
    email text,
    wallet_address text,
    google_id text,
    whatsapp_id text,
    display_name text,
    profile_image text,
    bio text,
    app_role text,
    extension_role text,
    is_verified boolean,
    platforms jsonb,
    created_at timestamptz,
    updated_at timestamptz
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        up.user_id,
        up.email,
        up.wallet_address,
        up.google_id,
        up.whatsapp_id,
        up.display_name,
        up.profile_image,
        up.bio,
        up.app_role,
        up.extension_role,
        up.is_verified,
        up.platforms,
        up.created_at,
        up.updated_at
    FROM unified_profiles up
    WHERE 
        (p_email IS NULL OR up.email = p_email) AND
        (p_wallet_address IS NULL OR up.wallet_address = lower(p_wallet_address)) AND
        (p_google_id IS NULL OR up.google_id = p_google_id) AND
        (p_whatsapp_id IS NULL OR up.whatsapp_id = p_whatsapp_id) AND
        (p_user_id IS NULL OR up.user_id = p_user_id)
    LIMIT 1;
END;
$$ LANGUAGE plpgsql;

-- Create function to merge duplicate profiles
CREATE OR REPLACE FUNCTION merge_duplicate_profiles(
    p_primary_user_id text,
    p_duplicate_user_ids text[]
)
RETURNS boolean AS $$
DECLARE
    duplicate_id text;
    primary_profile unified_profiles%ROWTYPE;
BEGIN
    -- Get primary profile
    SELECT * INTO primary_profile FROM unified_profiles WHERE user_id = p_primary_user_id;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Primary profile not found: %', p_primary_user_id;
    END IF;
    
    -- Merge each duplicate profile
    FOREACH duplicate_id IN ARRAY p_duplicate_user_ids
    LOOP
        -- Update related records to point to primary profile
        UPDATE wallet_mappings SET user_id = p_primary_user_id WHERE user_id = duplicate_id;
        UPDATE auth_sessions SET user_id = p_primary_user_id WHERE user_id = duplicate_id;
        UPDATE cross_platform_permissions SET user_id = p_primary_user_id WHERE user_id = duplicate_id;
        UPDATE user_activity_log SET user_id = p_primary_user_id WHERE user_id = duplicate_id;
        
        -- Delete duplicate profile
        DELETE FROM unified_profiles WHERE user_id = duplicate_id;
    END LOOP;
    
    RETURN true;
END;
$$ LANGUAGE plpgsql;

COMMIT;