-- Livepeer-First Architecture Migration
-- Date: 2025-01-12

-- Create centralized beats table
CREATE TABLE IF NOT EXISTS beats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  beat_id VARCHAR UNIQUE NOT NULL, -- User-generated beat ID
  title VARCHAR NOT NULL,
  description TEXT,
  producer_address VARCHAR NOT NULL,
  stage_name VARCHAR,
  genre VARCHAR NOT NULL,
  bpm INTEGER,
  key VARCHAR,
  price NUMERIC NOT NULL,
  tags TEXT[],
  
  -- Livepeer integration (primary)
  livepeer_asset_id VARCHAR,
  playback_url VARCHAR,
  optimized_playback BOOLEAN DEFAULT FALSE,
  
  -- IPFS backup
  ipfs_audio_url VARCHAR,
  ipfs_metadata_url VARCHAR,
  cover_image_url VARCHAR,
  
  -- Blockchain integration
  token_id BIGINT,
  transaction_hash VARCHAR,
  is_nft BOOLEAN DEFAULT FALSE,
  mint_pending BOOLEAN DEFAULT FALSE,
  
  -- Professional services
  professional_services JSONB,
  
  -- Analytics
  plays INTEGER DEFAULT 0,
  likes INTEGER DEFAULT 0,
  
  -- Status
  is_active BOOLEAN DEFAULT TRUE,
  source VARCHAR DEFAULT 'livepeer', -- livepeer, ipfs, blockchain
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_beats_producer ON beats(producer_address);
CREATE INDEX IF NOT EXISTS idx_beats_active ON beats(is_active);
CREATE INDEX IF NOT EXISTS idx_beats_genre ON beats(genre);
CREATE INDEX IF NOT EXISTS idx_beats_created_at ON beats(created_at);
CREATE INDEX IF NOT EXISTS idx_beats_livepeer_asset ON beats(livepeer_asset_id);
CREATE INDEX IF NOT EXISTS idx_beats_beat_id ON beats(beat_id);

-- Create beat plays tracking
CREATE TABLE IF NOT EXISTS beat_plays (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  beat_id VARCHAR NOT NULL,
  user_address VARCHAR,
  source VARCHAR, -- marketplace, dashboard, direct
  optimized BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_beat_plays_beat_id ON beat_plays(beat_id);
CREATE INDEX IF NOT EXISTS idx_beat_plays_created_at ON beat_plays(created_at);

-- Update trigger for beats
CREATE OR REPLACE FUNCTION update_beats_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER beats_update_timestamp
  BEFORE UPDATE ON beats
  FOR EACH ROW
  EXECUTE FUNCTION update_beats_timestamp();

COMMENT ON TABLE beats IS 'Centralized beats storage with Livepeer-first architecture';
COMMENT ON TABLE beat_plays IS 'Beat play tracking for analytics';