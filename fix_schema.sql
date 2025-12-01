-- Fix ISRC registry table
CREATE TABLE IF NOT EXISTS isrc_registry (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  isrc VARCHAR(50) UNIQUE NOT NULL,
  track_title VARCHAR(255),
  artist_name VARCHAR(255),
  country_code VARCHAR(2) DEFAULT 'ZA',
  registrant_code VARCHAR(3) DEFAULT 'BTC',
  year VARCHAR(2),
  designation_code VARCHAR(5),
  generated_at TIMESTAMPTZ DEFAULT NOW(),
  used BOOLEAN DEFAULT FALSE,
  used_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}'
);

-- Create beats table with all required columns
CREATE TABLE IF NOT EXISTS beats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  beat_id VARCHAR UNIQUE NOT NULL,
  title VARCHAR NOT NULL,
  description TEXT,
  producer_address VARCHAR NOT NULL,
  stage_name VARCHAR,
  genre VARCHAR NOT NULL,
  bpm INTEGER,
  key VARCHAR,
  price NUMERIC NOT NULL,
  tags TEXT[],
  
  -- Livepeer integration
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
  source VARCHAR DEFAULT 'livepeer',
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_beats_producer ON beats(producer_address);
CREATE INDEX IF NOT EXISTS idx_beats_active ON beats(is_active);
CREATE INDEX IF NOT EXISTS idx_beats_genre ON beats(genre);
CREATE INDEX IF NOT EXISTS idx_isrc_registry_isrc ON isrc_registry(isrc);
CREATE INDEX IF NOT EXISTS idx_isrc_registry_used ON isrc_registry(used);