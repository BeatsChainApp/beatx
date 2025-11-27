-- Enhanced BeatsChain Schema - Production Ready
-- Date: 2025-01-13
-- Purpose: Complete database foundation for real-time data pipeline

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table with comprehensive profile data
CREATE TABLE IF NOT EXISTS public.users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_address text UNIQUE NOT NULL,
  email text,
  username text,
  display_name text,
  bio text,
  avatar_cid text,
  role text DEFAULT 'user' CHECK (role IN ('user', 'producer', 'admin', 'super_admin')),
  is_verified boolean DEFAULT false,
  is_suspended boolean DEFAULT false,
  suspension_reason text,
  total_beats integer DEFAULT 0,
  total_sales integer DEFAULT 0,
  total_revenue numeric DEFAULT 0,
  last_active timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Beats table with Livepeer integration
CREATE TABLE IF NOT EXISTS public.beats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  artist text NOT NULL,
  producer_address text NOT NULL,
  description text,
  genre text,
  bpm integer,
  key_signature text,
  duration integer, -- in seconds
  price numeric DEFAULT 0,
  
  -- File storage
  audio_cid text,
  artwork_cid text,
  metadata_cid text,
  
  -- Livepeer integration
  livepeer_asset_id text,
  playback_url text,
  thumbnail_url text,
  
  -- Status and moderation
  status text DEFAULT 'processing' CHECK (status IN ('processing', 'ready', 'failed')),
  moderation_status text DEFAULT 'pending' CHECK (moderation_status IN ('pending', 'approved', 'rejected', 'flagged', 'takedown')),
  is_active boolean DEFAULT true,
  
  -- Analytics
  play_count integer DEFAULT 0,
  download_count integer DEFAULT 0,
  like_count integer DEFAULT 0,
  
  -- Timestamps
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  -- Indexes for performance
  CONSTRAINT fk_producer FOREIGN KEY (producer_address) REFERENCES users(wallet_address)
);

-- Moderation actions with audit trail
CREATE TABLE IF NOT EXISTS public.moderation_actions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  beat_id uuid REFERENCES beats(id) ON DELETE CASCADE,
  action text NOT NULL CHECK (action IN ('approve', 'reject', 'flag', 'takedown', 'restore')),
  reason text,
  moderator_id text,
  automated boolean DEFAULT false,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Transactions for financial tracking
CREATE TABLE IF NOT EXISTS public.transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_address text NOT NULL,
  beat_id uuid REFERENCES beats(id),
  transaction_type text NOT NULL CHECK (transaction_type IN ('purchase', 'mint', 'royalty', 'credit_purchase', 'refund')),
  amount numeric NOT NULL,
  currency text DEFAULT 'ETH',
  tx_hash text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'failed', 'cancelled')),
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Beat plays for analytics
CREATE TABLE IF NOT EXISTS public.beat_plays (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  beat_id uuid REFERENCES beats(id) ON DELETE CASCADE,
  user_address text,
  source text DEFAULT 'web', -- 'web', 'mobile', 'extension', 'api'
  duration_played integer, -- seconds played
  completed boolean DEFAULT false,
  ip_address inet,
  user_agent text,
  created_at timestamptz DEFAULT now()
);

-- User sessions for cross-platform sync
CREATE TABLE IF NOT EXISTS public.user_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_address text NOT NULL,
  session_token text UNIQUE NOT NULL,
  device_type text, -- 'web', 'mobile', 'extension'
  expires_at timestamptz NOT NULL,
  last_used timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_wallet ON users(wallet_address);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_beats_producer ON beats(producer_address);
CREATE INDEX IF NOT EXISTS idx_beats_status ON beats(status, moderation_status);
CREATE INDEX IF NOT EXISTS idx_beats_created ON beats(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_user ON transactions(user_address);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(transaction_type);
CREATE INDEX IF NOT EXISTS idx_beat_plays_beat ON beat_plays(beat_id);
CREATE INDEX IF NOT EXISTS idx_beat_plays_created ON beat_plays(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_sessions_token ON user_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_sessions_user ON user_sessions(user_address);

-- RPC Functions for analytics
CREATE OR REPLACE FUNCTION increment_beat_plays(beat_id uuid)
RETURNS void AS $$
BEGIN
  UPDATE beats SET play_count = play_count + 1 WHERE id = beat_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_user_stats(user_wallet text)
RETURNS TABLE(
  total_beats bigint,
  total_plays bigint,
  total_revenue numeric
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(b.id)::bigint as total_beats,
    COALESCE(SUM(b.play_count), 0)::bigint as total_plays,
    COALESCE(SUM(t.amount), 0) as total_revenue
  FROM beats b
  LEFT JOIN transactions t ON b.id = t.beat_id AND t.transaction_type = 'purchase'
  WHERE b.producer_address = user_wallet;
END;
$$ LANGUAGE plpgsql;

-- Row Level Security (RLS) policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE beats ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Users can read all profiles but only update their own
CREATE POLICY users_read_all ON users FOR SELECT USING (true);
CREATE POLICY users_update_own ON users FOR UPDATE USING (wallet_address = current_setting('app.current_user', true));

-- Beats are publicly readable, but only producers can modify their own
CREATE POLICY beats_read_all ON beats FOR SELECT USING (is_active = true);
CREATE POLICY beats_modify_own ON beats FOR ALL USING (producer_address = current_setting('app.current_user', true));

-- Transactions are only visible to the user involved
CREATE POLICY transactions_own_only ON transactions FOR ALL USING (user_address = current_setting('app.current_user', true));

-- Comments for documentation
COMMENT ON TABLE users IS 'User profiles with wallet-based authentication';
COMMENT ON TABLE beats IS 'Beat NFTs with Livepeer streaming integration';
COMMENT ON TABLE moderation_actions IS 'Content moderation audit trail';
COMMENT ON TABLE transactions IS 'Financial transactions and payments';
COMMENT ON TABLE beat_plays IS 'Analytics for beat playback tracking';
COMMENT ON TABLE user_sessions IS 'Cross-platform session management';