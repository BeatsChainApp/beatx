-- Complete BeatsChain Commerce Schema
-- Apply this in Supabase SQL Editor

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (unified profiles)
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_address text UNIQUE NOT NULL,
  display_name text,
  email text,
  role text DEFAULT 'user' CHECK (role IN ('user', 'producer', 'admin', 'super_admin')),
  profile_image text,
  bio text,
  social_links jsonb DEFAULT '{}',
  is_verified boolean DEFAULT false,
  last_login timestamptz,
  preferences jsonb DEFAULT '{"notifications": true, "marketing": false}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Beats table (enhanced)
CREATE TABLE IF NOT EXISTS beats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  producer_address text NOT NULL,
  producer_name text,
  genre text DEFAULT 'Hip Hop',
  bpm integer CHECK (bpm > 0 AND bpm < 300),
  key_signature text,
  duration_seconds integer,
  audio_url text,
  cover_image_url text,
  ipfs_cid text,
  metadata_cid text,
  price decimal DEFAULT 0.05 CHECK (price >= 0),
  pricing jsonb DEFAULT '{"basic": 10, "premium": 25, "exclusive": 100}',
  tags text[],
  mood text,
  energy_level integer CHECK (energy_level >= 1 AND energy_level <= 10),
  play_count integer DEFAULT 0,
  download_count integer DEFAULT 0,
  is_active boolean DEFAULT true,
  is_featured boolean DEFAULT false,
  source text DEFAULT 'app' CHECK (source IN ('app', 'extension', 'whatsapp', 'api')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  beat_id uuid REFERENCES beats(id),
  buyer_address text NOT NULL,
  producer_address text NOT NULL,
  amount decimal NOT NULL,
  license_type text NOT NULL,
  payment_method text DEFAULT 'crypto',
  transaction_hash text,
  status text DEFAULT 'pending',
  created_at timestamptz DEFAULT now()
);

-- Purchases table
CREATE TABLE IF NOT EXISTS purchases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id uuid REFERENCES transactions(id),
  beat_id uuid REFERENCES beats(id),
  buyer_address text NOT NULL,
  license_type text NOT NULL,
  download_url text,
  created_at timestamptz DEFAULT now()
);

-- Beat plays tracking
CREATE TABLE IF NOT EXISTS beat_plays (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  beat_id uuid REFERENCES beats(id),
  user_address text,
  source text DEFAULT 'web',
  created_at timestamptz DEFAULT now()
);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_address text NOT NULL,
  type text NOT NULL,
  title text NOT NULL,
  message text,
  read boolean DEFAULT false,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Enhanced indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_wallet ON users(wallet_address);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_beats_producer ON beats(producer_address);
CREATE INDEX IF NOT EXISTS idx_beats_genre ON beats(genre);
CREATE INDEX IF NOT EXISTS idx_beats_active ON beats(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_beats_featured ON beats(is_featured) WHERE is_featured = true;
CREATE INDEX IF NOT EXISTS idx_beats_created ON beats(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_buyer ON transactions(buyer_address);
CREATE INDEX IF NOT EXISTS idx_transactions_producer ON transactions(producer_address);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
CREATE INDEX IF NOT EXISTS idx_purchases_buyer ON purchases(buyer_address);
CREATE INDEX IF NOT EXISTS idx_beat_plays_beat ON beat_plays(beat_id);
CREATE INDEX IF NOT EXISTS idx_beat_plays_created ON beat_plays(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_address);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON notifications(user_address, read) WHERE read = false;
CREATE INDEX IF NOT EXISTS idx_analytics_events_type ON analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_events_created ON analytics_events(created_at DESC);

-- Row Level Security (RLS) policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE beats ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Users can read their own data
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (wallet_address = current_setting('request.jwt.claims', true)::json->>'wallet_address');

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (wallet_address = current_setting('request.jwt.claims', true)::json->>'wallet_address');

-- Anyone can view active beats
CREATE POLICY "Anyone can view active beats" ON beats
  FOR SELECT USING (is_active = true);

-- Producers can manage their own beats
CREATE POLICY "Producers can manage own beats" ON beats
  FOR ALL USING (producer_address = current_setting('request.jwt.claims', true)::json->>'wallet_address');

-- Users can view their own transactions and purchases
CREATE POLICY "Users can view own transactions" ON transactions
  FOR SELECT USING (
    buyer_address = current_setting('request.jwt.claims', true)::json->>'wallet_address' OR
    producer_address = current_setting('request.jwt.claims', true)::json->>'wallet_address'
  );

CREATE POLICY "Users can view own purchases" ON purchases
  FOR SELECT USING (buyer_address = current_setting('request.jwt.claims', true)::json->>'wallet_address');

-- Users can view their own notifications
CREATE POLICY "Users can view own notifications" ON notifications
  FOR SELECT USING (user_address = current_setting('request.jwt.claims', true)::json->>'wallet_address');

-- Insert sample data for testing
INSERT INTO users (wallet_address, display_name, role, is_verified) VALUES
('0xc84799a904eeb5c57abbbc40176e7db8be202c10', 'Super Admin', 'super_admin', true)
ON CONFLICT (wallet_address) DO UPDATE SET 
  role = EXCLUDED.role,
  is_verified = EXCLUDED.is_verified,
  updated_at = now();

-- Create view for beat analytics
CREATE OR REPLACE VIEW beat_analytics AS
SELECT 
  b.id,
  b.title,
  b.producer_name,
  b.genre,
  b.play_count,
  b.download_count,
  COUNT(t.id) as total_sales,
  COALESCE(SUM(t.amount), 0) as total_revenue,
  AVG(CASE WHEN ae.event_type = 'rating' THEN (ae.metadata->>'rating')::numeric END) as avg_rating
FROM beats b
LEFT JOIN transactions t ON b.id = t.beat_id AND t.status = 'completed'
LEFT JOIN analytics_events ae ON b.id = ae.beat_id
WHERE b.is_active = true
GROUP BY b.id, b.title, b.producer_name, b.genre, b.play_count, b.download_count;

-- Create view for producer dashboard
CREATE OR REPLACE VIEW producer_dashboard AS
SELECT 
  u.wallet_address,
  u.display_name,
  ps.total_beats,
  ps.total_sales,
  ps.total_earnings,
  ps.total_plays,
  COUNT(DISTINCT b.id) FILTER (WHERE b.created_at > now() - interval '30 days') as beats_this_month,
  COUNT(DISTINCT t.id) FILTER (WHERE t.created_at > now() - interval '30 days') as sales_this_month
FROM users u
LEFT JOIN producer_stats ps ON u.wallet_address = ps.producer_address
LEFT JOIN beats b ON u.wallet_address = b.producer_address
LEFT JOIN transactions t ON u.wallet_address = t.producer_address AND t.status = 'completed'
WHERE u.role IN ('producer', 'admin', 'super_admin')
GROUP BY u.wallet_address, u.display_name, ps.total_beats, ps.total_sales, ps.total_earnings, ps.total_plays;

-- Producer stats table
CREATE TABLE IF NOT EXISTS producer_stats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  producer_address text UNIQUE NOT NULL,
  total_beats integer DEFAULT 0,
  total_sales integer DEFAULT 0,
  total_earnings decimal DEFAULT 0,
  total_plays integer DEFAULT 0,
  avg_rating decimal DEFAULT 0,
  followers_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- User preferences table
CREATE TABLE IF NOT EXISTS user_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  notification_settings jsonb DEFAULT '{"web3_events": true, "social_updates": true, "system_alerts": true}',
  privacy_settings jsonb DEFAULT '{"public_profile": true, "show_purchases": false}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Analytics events table
CREATE TABLE IF NOT EXISTS analytics_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type text NOT NULL,
  user_address text,
  beat_id uuid,
  metadata jsonb DEFAULT '{}',
  ip_address inet,
  user_agent text,
  created_at timestamptz DEFAULT now()
);

-- RPC functions
CREATE OR REPLACE FUNCTION increment_beat_plays(beat_id uuid)
RETURNS void AS $$
BEGIN
  UPDATE beats SET play_count = COALESCE(play_count, 0) + 1, updated_at = now() WHERE id = beat_id;
  UPDATE producer_stats SET total_plays = COALESCE(total_plays, 0) + 1, updated_at = now() 
  WHERE producer_address = (SELECT producer_address FROM beats WHERE id = beat_id);
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_producer_stats()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO producer_stats (producer_address, total_beats, updated_at)
    VALUES (NEW.producer_address, 1, now())
    ON CONFLICT (producer_address) 
    DO UPDATE SET total_beats = producer_stats.total_beats + 1, updated_at = now();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_purchase_stats()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE producer_stats SET 
      total_sales = COALESCE(total_sales, 0) + 1,
      total_earnings = COALESCE(total_earnings, 0) + (SELECT amount * 0.85 FROM transactions WHERE id = NEW.transaction_id),
      updated_at = now()
    WHERE producer_address = (SELECT producer_address FROM transactions WHERE id = NEW.transaction_id);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers
CREATE TRIGGER trigger_update_producer_stats
  AFTER INSERT ON beats
  FOR EACH ROW EXECUTE FUNCTION update_producer_stats();

CREATE TRIGGER trigger_update_purchase_stats
  AFTER INSERT ON purchases
  FOR EACH ROW EXECUTE FUNCTION update_purchase_stats();