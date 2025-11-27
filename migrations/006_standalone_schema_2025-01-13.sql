-- Standalone Schema - No external dependencies
-- Creates all required tables without foreign key constraints

-- Users table (standalone)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  username VARCHAR(100) UNIQUE,
  display_name VARCHAR(255),
  avatar_url TEXT,
  wallet_address VARCHAR(42),
  role VARCHAR(50) DEFAULT 'user',
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Beats table (standalone)
CREATE TABLE IF NOT EXISTS beats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  genre VARCHAR(100),
  bpm INTEGER,
  key_signature VARCHAR(10),
  mood VARCHAR(100),
  energy_level INTEGER CHECK (energy_level BETWEEN 1 AND 10),
  tags TEXT,
  audio_url TEXT,
  cover_image_url TEXT,
  producer_id UUID,
  price DECIMAL(10,4) DEFAULT 0,
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  type VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  data JSONB DEFAULT '{}',
  priority VARCHAR(20) DEFAULT 'medium',
  category VARCHAR(50) DEFAULT 'general',
  read BOOLEAN DEFAULT FALSE,
  delivered BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMP WITH TIME ZONE,
  delivered_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User preferences table
CREATE TABLE IF NOT EXISTS user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  notification_settings JSONB DEFAULT '{"web3_events": true, "social_updates": true, "system_alerts": true}',
  dashboard_settings JSONB DEFAULT '{"default_time_range": "24h", "show_earnings": true}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Upload sessions table
CREATE TABLE IF NOT EXISTS upload_sessions (
  id VARCHAR(255) PRIMARY KEY,
  user_id UUID NOT NULL,
  tus_upload_id VARCHAR(255),
  tus_upload_url TEXT,
  asset_id VARCHAR(255),
  status VARCHAR(50) DEFAULT 'initialized',
  progress INTEGER DEFAULT 0,
  bytes_uploaded BIGINT DEFAULT 0,
  file_info JSONB DEFAULT '{}',
  streaming_urls JSONB DEFAULT '{}',
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  processed_at TIMESTAMP WITH TIME ZONE
);

-- Moderation actions table
CREATE TABLE IF NOT EXISTS moderation_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id UUID NOT NULL,
  content_type VARCHAR(50) NOT NULL,
  action VARCHAR(50) NOT NULL,
  reason TEXT,
  scores JSONB DEFAULT '{}',
  auto_approved BOOLEAN DEFAULT FALSE,
  moderator_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Beat plays table
CREATE TABLE IF NOT EXISTS beat_plays (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  beat_id UUID NOT NULL,
  user_id UUID,
  producer_id UUID,
  play_duration INTEGER DEFAULT 0,
  completed BOOLEAN DEFAULT FALSE,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  beat_id UUID,
  buyer_id UUID,
  producer_id UUID,
  amount DECIMAL(18,8) NOT NULL,
  currency VARCHAR(10) DEFAULT 'ETH',
  transaction_hash VARCHAR(66),
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User sessions table
CREATE TABLE IF NOT EXISTS user_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  session_token VARCHAR(255) UNIQUE,
  device_type VARCHAR(50),
  ip_address INET,
  user_agent TEXT,
  last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Analytics events table
CREATE TABLE IF NOT EXISTS analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  session_id VARCHAR(255),
  event_type VARCHAR(100) NOT NULL,
  event_data JSONB DEFAULT '{}',
  page_url TEXT,
  user_agent TEXT,
  ip_address INET,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Beat search index
CREATE TABLE IF NOT EXISTS beat_search_index (
  beat_id UUID PRIMARY KEY,
  search_vector tsvector,
  tags TEXT[],
  mood VARCHAR(100),
  energy_level INTEGER,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);

CREATE INDEX IF NOT EXISTS idx_upload_sessions_user_id ON upload_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_upload_sessions_status ON upload_sessions(status);

CREATE INDEX IF NOT EXISTS idx_beat_plays_beat_id ON beat_plays(beat_id);
CREATE INDEX IF NOT EXISTS idx_beat_plays_user_id ON beat_plays(user_id);
CREATE INDEX IF NOT EXISTS idx_beat_plays_created_at ON beat_plays(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_transactions_beat_id ON transactions(beat_id);
CREATE INDEX IF NOT EXISTS idx_transactions_buyer_id ON transactions(buyer_id);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_beats_producer_id ON beats(producer_id);
CREATE INDEX IF NOT EXISTS idx_beats_status ON beats(status);
CREATE INDEX IF NOT EXISTS idx_beats_created_at ON beats(created_at DESC);

-- RPC Functions for analytics
CREATE OR REPLACE FUNCTION get_notification_stats(target_user_id UUID)
RETURNS TABLE (
  total BIGINT,
  unread BIGINT,
  categories JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*)::BIGINT as total,
    COUNT(*) FILTER (WHERE read = FALSE)::BIGINT as unread,
    COALESCE(
      jsonb_object_agg(category, category_count) FILTER (WHERE category IS NOT NULL),
      '{}'::jsonb
    ) as categories
  FROM (
    SELECT 
      n.category,
      COUNT(*) as category_count
    FROM notifications n
    WHERE n.user_id = target_user_id
    GROUP BY n.category
  ) category_stats;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_top_beats_by_plays(
  target_producer_id UUID,
  time_filter TIMESTAMP WITH TIME ZONE,
  limit_count INTEGER DEFAULT 5
)
RETURNS TABLE (
  id UUID,
  title VARCHAR,
  plays BIGINT,
  earnings NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    b.id,
    b.title,
    COUNT(bp.id)::BIGINT as plays,
    COALESCE(SUM(t.amount), 0) as earnings
  FROM beats b
  LEFT JOIN beat_plays bp ON b.id = bp.beat_id AND bp.created_at >= time_filter
  LEFT JOIN transactions t ON b.id = t.beat_id AND t.created_at >= time_filter
  WHERE b.producer_id = target_producer_id
  GROUP BY b.id, b.title
  ORDER BY plays DESC, earnings DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION search_beats(
  search_query TEXT DEFAULT '',
  genre_filter TEXT DEFAULT NULL,
  limit_count INTEGER DEFAULT 20,
  offset_count INTEGER DEFAULT 0
)
RETURNS TABLE (
  id UUID,
  title VARCHAR,
  genre VARCHAR,
  bpm INTEGER,
  rank REAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    b.id,
    b.title,
    b.genre,
    b.bpm,
    CASE 
      WHEN search_query = '' THEN 1.0
      ELSE 0.5
    END as rank
  FROM beats b
  WHERE 
    b.status = 'approved' AND
    (search_query = '' OR LOWER(b.title) LIKE LOWER('%' || search_query || '%')) AND
    (genre_filter IS NULL OR b.genre = genre_filter)
  ORDER BY rank DESC, b.created_at DESC
  LIMIT limit_count OFFSET offset_count;
END;
$$ LANGUAGE plpgsql;