-- Safe Supabase Migration - No Column References
-- Apply this version if existing schema is unknown

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Step 1: Add columns to beats table safely
DO $$ 
BEGIN
  -- Add producer_address column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'beats' AND column_name = 'producer_address') THEN
    ALTER TABLE beats ADD COLUMN producer_address text;
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

  -- Add enhanced columns
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'beats' AND column_name = 'description') THEN
    ALTER TABLE beats ADD COLUMN description text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'beats' AND column_name = 'bpm') THEN
    ALTER TABLE beats ADD COLUMN bpm integer;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'beats' AND column_name = 'audio_url') THEN
    ALTER TABLE beats ADD COLUMN audio_url text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'beats' AND column_name = 'source') THEN
    ALTER TABLE beats ADD COLUMN source text DEFAULT 'app';
  END IF;
END $$;

-- Step 2: Create new tables
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_address text UNIQUE NOT NULL,
  display_name text,
  email text,
  role text DEFAULT 'user' CHECK (role IN ('user', 'producer', 'admin', 'super_admin')),
  profile_image text,
  bio text,
  is_verified boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

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

CREATE TABLE IF NOT EXISTS purchases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id uuid REFERENCES transactions(id),
  beat_id uuid,
  buyer_address text NOT NULL,
  license_type text NOT NULL,
  download_url text,
  created_at timestamptz DEFAULT now()
);

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

CREATE TABLE IF NOT EXISTS analytics_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type text NOT NULL,
  user_address text,
  beat_id uuid,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Step 3: Create indexes (only for tables that exist)
CREATE INDEX IF NOT EXISTS idx_users_wallet ON users(wallet_address);
CREATE INDEX IF NOT EXISTS idx_transactions_buyer ON transactions(buyer_address);
CREATE INDEX IF NOT EXISTS idx_purchases_buyer ON purchases(buyer_address);

-- Step 4: Create RPC function
CREATE OR REPLACE FUNCTION increment_beat_plays(beat_id uuid)
RETURNS void AS $$
BEGIN
  UPDATE beats SET play_count = COALESCE(play_count, 0) + 1 WHERE id = beat_id;
END;
$$ LANGUAGE plpgsql;

-- Step 5: Insert super admin user
INSERT INTO users (wallet_address, display_name, role, is_verified) VALUES
('0xc84799a904eeb5c57abbbc40176e7db8be202c10', 'Super Admin', 'super_admin', true)
ON CONFLICT (wallet_address) DO UPDATE SET 
  role = EXCLUDED.role,
  is_verified = EXCLUDED.is_verified,
  updated_at = now();