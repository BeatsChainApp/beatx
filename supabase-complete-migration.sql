-- STEP 1: Safe Migration for Existing Schema
DO $$ 
BEGIN
  -- Add producer_address column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'beats' AND column_name = 'producer_address') THEN
    ALTER TABLE beats ADD COLUMN producer_address text;
    -- Migrate existing data if needed (check which columns exist first)
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'beats' AND column_name = 'producer_id') THEN
      UPDATE beats SET producer_address = producer_id WHERE producer_address IS NULL;
    ELSIF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'beats' AND column_name = 'wallet_address') THEN
      UPDATE beats SET producer_address = wallet_address WHERE producer_address IS NULL;
    END IF;
  END IF;

  -- Add other missing columns
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'beats' AND column_name = 'producer_name') THEN
    ALTER TABLE beats ADD COLUMN producer_name text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'beats' AND column_name = 'is_active') THEN
    ALTER TABLE beats ADD COLUMN is_active boolean DEFAULT true;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'beats' AND column_name = 'play_count') THEN
    ALTER TABLE beats ADD COLUMN play_count integer DEFAULT 0;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'beats' AND column_name = 'pricing') THEN
    ALTER TABLE beats ADD COLUMN pricing jsonb DEFAULT '{"basic": 10, "premium": 25, "exclusive": 100}';
  END IF;
END $$;

-- STEP 2: Complete Commerce Schema
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

-- Enhance beats table
DO $$
BEGIN
  -- Add missing columns to beats table
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'beats' AND column_name = 'description') THEN
    ALTER TABLE beats ADD COLUMN description text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'beats' AND column_name = 'bpm') THEN
    ALTER TABLE beats ADD COLUMN bpm integer;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'beats' AND column_name = 'key_signature') THEN
    ALTER TABLE beats ADD COLUMN key_signature text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'beats' AND column_name = 'duration_seconds') THEN
    ALTER TABLE beats ADD COLUMN duration_seconds integer;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'beats' AND column_name = 'audio_url') THEN
    ALTER TABLE beats ADD COLUMN audio_url text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'beats' AND column_name = 'cover_image_url') THEN
    ALTER TABLE beats ADD COLUMN cover_image_url text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'beats' AND column_name = 'ipfs_cid') THEN
    ALTER TABLE beats ADD COLUMN ipfs_cid text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'beats' AND column_name = 'metadata_cid') THEN
    ALTER TABLE beats ADD COLUMN metadata_cid text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'beats' AND column_name = 'tags') THEN
    ALTER TABLE beats ADD COLUMN tags text[];
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'beats' AND column_name = 'mood') THEN
    ALTER TABLE beats ADD COLUMN mood text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'beats' AND column_name = 'energy_level') THEN
    ALTER TABLE beats ADD COLUMN energy_level integer;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'beats' AND column_name = 'download_count') THEN
    ALTER TABLE beats ADD COLUMN download_count integer DEFAULT 0;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'beats' AND column_name = 'is_featured') THEN
    ALTER TABLE beats ADD COLUMN is_featured boolean DEFAULT false;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'beats' AND column_name = 'source') THEN
    ALTER TABLE beats ADD COLUMN source text DEFAULT 'app';
  END IF;
END $$;

-- Transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  beat_id uuid,
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
  beat_id uuid,
  buyer_address text NOT NULL,
  license_type text NOT NULL,
  download_url text,
  created_at timestamptz DEFAULT now()
);

-- Beat plays tracking
CREATE TABLE IF NOT EXISTS beat_plays (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  beat_id uuid,
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

-- Enhanced indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_wallet ON users(wallet_address);
CREATE INDEX IF NOT EXISTS idx_beats_producer ON beats(producer_address);
CREATE INDEX IF NOT EXISTS idx_beats_active ON beats(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_transactions_buyer ON transactions(buyer_address);
CREATE INDEX IF NOT EXISTS idx_purchases_buyer ON purchases(buyer_address);
CREATE INDEX IF NOT EXISTS idx_beat_plays_beat ON beat_plays(beat_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_address);

-- RPC functions
CREATE OR REPLACE FUNCTION increment_beat_plays(beat_id uuid)
RETURNS void AS $$
BEGIN
  UPDATE beats SET play_count = COALESCE(play_count, 0) + 1, updated_at = now() WHERE id = beat_id;
  UPDATE producer_stats SET total_plays = COALESCE(total_plays, 0) + 1, updated_at = now() 
  WHERE producer_address = (SELECT producer_address FROM beats WHERE id = beat_id);
END;
$$ LANGUAGE plpgsql;

-- Insert super admin user
INSERT INTO users (wallet_address, display_name, role, is_verified) VALUES
('0xc84799a904eeb5c57abbbc40176e7db8be202c10', 'Super Admin', 'super_admin', true)
ON CONFLICT (wallet_address) DO UPDATE SET 
  role = EXCLUDED.role,
  is_verified = EXCLUDED.is_verified,
  updated_at = now();