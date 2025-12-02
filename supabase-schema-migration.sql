-- Supabase Schema Migration - Safe Column Updates
-- Apply this BEFORE the main schema to handle existing data

-- Check if beats table exists and add missing columns safely
DO $$ 
BEGIN
  -- Add producer_address column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'beats' AND column_name = 'producer_address') THEN
    ALTER TABLE beats ADD COLUMN producer_address text;
    -- Migrate existing data if needed
    UPDATE beats SET producer_address = COALESCE(producer_id, creator_address, wallet_address) WHERE producer_address IS NULL;
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

-- Now apply the main schema
-- (Copy the content from supabase-commerce-schema.sql here after this migration)