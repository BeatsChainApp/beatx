-- Notifications and Analytics Schema Extension
-- Phase 2: Advanced Dashboard + Analytics + Notifications

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  data JSONB DEFAULT '{}',
  priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
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
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  notification_settings JSONB DEFAULT '{
    "web3_events": true,
    "social_updates": true,
    "system_alerts": true,
    "email_notifications": false,
    "push_notifications": true
  }',
  dashboard_settings JSONB DEFAULT '{
    "default_time_range": "24h",
    "show_earnings": true,
    "show_analytics": true
  }',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- User follows table for social notifications
CREATE TABLE IF NOT EXISTS user_follows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  following_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(follower_id, following_id),
  CHECK (follower_id != following_id)
);

-- Analytics events table for detailed tracking
CREATE TABLE IF NOT EXISTS analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  session_id VARCHAR(255),
  event_type VARCHAR(100) NOT NULL,
  event_data JSONB DEFAULT '{}',
  page_url TEXT,
  user_agent TEXT,
  ip_address INET,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_category ON notifications(category);

CREATE INDEX IF NOT EXISTS idx_user_follows_follower ON user_follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_user_follows_following ON user_follows(following_id);

CREATE INDEX IF NOT EXISTS idx_analytics_events_user_id ON analytics_events(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_created_at ON analytics_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_events_type ON analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_events_session ON analytics_events(session_id);

-- RLS Policies
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

-- Notifications policies
CREATE POLICY "Users can view their own notifications" ON notifications
  FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update their own notifications" ON notifications
  FOR UPDATE USING (auth.uid()::text = user_id::text);

-- User preferences policies
CREATE POLICY "Users can manage their own preferences" ON user_preferences
  FOR ALL USING (auth.uid()::text = user_id::text);

-- User follows policies
CREATE POLICY "Users can view follows" ON user_follows
  FOR SELECT USING (
    auth.uid()::text = follower_id::text OR 
    auth.uid()::text = following_id::text
  );

CREATE POLICY "Users can manage their own follows" ON user_follows
  FOR ALL USING (auth.uid()::text = follower_id::text);

-- Analytics events policies
CREATE POLICY "Users can view their own analytics" ON analytics_events
  FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Service role can manage analytics" ON analytics_events
  FOR ALL USING (auth.role() = 'service_role');

-- RPC Functions for analytics

-- Get notification stats
CREATE OR REPLACE FUNCTION get_notification_stats(user_id UUID)
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
      jsonb_object_agg(
        category, 
        category_count
      ) FILTER (WHERE category IS NOT NULL),
      '{}'::jsonb
    ) as categories
  FROM (
    SELECT 
      n.category,
      COUNT(*) as category_count
    FROM notifications n
    WHERE n.user_id = get_notification_stats.user_id
    GROUP BY n.category
  ) category_stats;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get top beats by plays with analytics
CREATE OR REPLACE FUNCTION get_top_beats_by_plays(
  producer_id UUID,
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
  LEFT JOIN beat_plays bp ON b.id = bp.beat_id 
    AND bp.created_at >= time_filter
  LEFT JOIN transactions t ON b.id = t.beat_id 
    AND t.created_at >= time_filter
  WHERE b.producer_id = get_top_beats_by_plays.producer_id
  GROUP BY b.id, b.title
  ORDER BY plays DESC, earnings DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get user growth stats
CREATE OR REPLACE FUNCTION get_user_growth_stats(
  time_filter TIMESTAMP WITH TIME ZONE
)
RETURNS TABLE (
  date DATE,
  new_users BIGINT,
  total_users BIGINT
) AS $$
BEGIN
  RETURN QUERY
  WITH daily_signups AS (
    SELECT 
      DATE(created_at) as signup_date,
      COUNT(*) as new_users
    FROM users
    WHERE created_at >= time_filter
    GROUP BY DATE(created_at)
  ),
  running_totals AS (
    SELECT 
      signup_date as date,
      new_users,
      SUM(new_users) OVER (ORDER BY signup_date) as total_users
    FROM daily_signups
  )
  SELECT * FROM running_totals ORDER BY date;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get platform analytics (admin only)
CREATE OR REPLACE FUNCTION get_platform_analytics(
  time_filter TIMESTAMP WITH TIME ZONE
)
RETURNS TABLE (
  total_users BIGINT,
  active_users BIGINT,
  new_users BIGINT,
  total_beats BIGINT,
  total_plays BIGINT,
  total_revenue NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    (SELECT COUNT(*) FROM users)::BIGINT as total_users,
    (SELECT COUNT(DISTINCT user_id) FROM user_sessions 
     WHERE last_activity >= time_filter)::BIGINT as active_users,
    (SELECT COUNT(*) FROM users 
     WHERE created_at >= time_filter)::BIGINT as new_users,
    (SELECT COUNT(*) FROM beats 
     WHERE created_at >= time_filter)::BIGINT as total_beats,
    (SELECT COUNT(*) FROM beat_plays 
     WHERE created_at >= time_filter)::BIGINT as total_plays,
    (SELECT COALESCE(SUM(amount), 0) FROM transactions 
     WHERE created_at >= time_filter) as total_revenue;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_notifications_updated_at 
  BEFORE UPDATE ON notifications 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_preferences_updated_at 
  BEFORE UPDATE ON user_preferences 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Grant permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON notifications TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON user_preferences TO authenticated;
GRANT SELECT, INSERT, DELETE ON user_follows TO authenticated;
GRANT SELECT, INSERT ON analytics_events TO authenticated;

-- Grant RPC function permissions
GRANT EXECUTE ON FUNCTION get_notification_stats(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_top_beats_by_plays(UUID, TIMESTAMP WITH TIME ZONE, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_growth_stats(TIMESTAMP WITH TIME ZONE) TO authenticated;
GRANT EXECUTE ON FUNCTION get_platform_analytics(TIMESTAMP WITH TIME ZONE) TO service_role;