-- Professional Metadata Schema Enhancement
-- Deploy professional metadata columns to beats table

-- Add professional metadata columns to beats table
ALTER TABLE beats ADD COLUMN IF NOT EXISTS album VARCHAR(255);
ALTER TABLE beats ADD COLUMN IF NOT EXISTS release_year INTEGER;
ALTER TABLE beats ADD COLUMN IF NOT EXISTS record_label VARCHAR(255);
ALTER TABLE beats ADD COLUMN IF NOT EXISTS mood VARCHAR(100);
ALTER TABLE beats ADD COLUMN IF NOT EXISTS energy_level INTEGER CHECK (energy_level BETWEEN 1 AND 10);
ALTER TABLE beats ADD COLUMN IF NOT EXISTS explicit BOOLEAN DEFAULT FALSE;
ALTER TABLE beats ADD COLUMN IF NOT EXISTS language VARCHAR(10) DEFAULT 'en';
ALTER TABLE beats ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE beats ADD COLUMN IF NOT EXISTS tags TEXT[];
ALTER TABLE beats ADD COLUMN IF NOT EXISTS cover_image_url TEXT;
ALTER TABLE beats ADD COLUMN IF NOT EXISTS isrc VARCHAR(50);
ALTER TABLE beats ADD COLUMN IF NOT EXISTS producer VARCHAR(255);
ALTER TABLE beats ADD COLUMN IF NOT EXISTS mixer VARCHAR(255);
ALTER TABLE beats ADD COLUMN IF NOT EXISTS featured_artists TEXT[];
ALTER TABLE beats ADD COLUMN IF NOT EXISTS copyright_holder VARCHAR(255);
ALTER TABLE beats ADD COLUMN IF NOT EXISTS time_signature VARCHAR(10) DEFAULT '4/4';
ALTER TABLE beats ADD COLUMN IF NOT EXISTS duration_seconds INTEGER;
ALTER TABLE beats ADD COLUMN IF NOT EXISTS professional_complete BOOLEAN DEFAULT FALSE;
ALTER TABLE beats ADD COLUMN IF NOT EXISTS distribution_ready BOOLEAN DEFAULT FALSE;

-- Create beat splits table for royalty management
CREATE TABLE IF NOT EXISTS beat_splits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  beat_id UUID NOT NULL REFERENCES beats(id) ON DELETE CASCADE,
  contributor_name VARCHAR(255) NOT NULL,
  contributor_role VARCHAR(100) NOT NULL,
  percentage DECIMAL(5,2) NOT NULL CHECK (percentage >= 0 AND percentage <= 100),
  split_type VARCHAR(50) NOT NULL CHECK (split_type IN ('composition', 'master', 'publishing')),
  samro_number VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create beat credits table for production credits
CREATE TABLE IF NOT EXISTS beat_credits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  beat_id UUID NOT NULL REFERENCES beats(id) ON DELETE CASCADE,
  credit_type VARCHAR(100) NOT NULL,
  credit_name VARCHAR(255) NOT NULL,
  credit_role VARCHAR(100) NOT NULL,
  primary_credit BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create beat analytics table for real-time analytics
CREATE TABLE IF NOT EXISTS beat_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  beat_id UUID NOT NULL REFERENCES beats(id) ON DELETE CASCADE,
  user_id UUID,
  event_type VARCHAR(50) NOT NULL,
  play_duration INTEGER,
  completion_rate DECIMAL(5,2),
  source_platform VARCHAR(50),
  device_type VARCHAR(50),
  location_country VARCHAR(10),
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_beats_album ON beats(album);
CREATE INDEX IF NOT EXISTS idx_beats_release_year ON beats(release_year);
CREATE INDEX IF NOT EXISTS idx_beats_record_label ON beats(record_label);
CREATE INDEX IF NOT EXISTS idx_beats_mood ON beats(mood);
CREATE INDEX IF NOT EXISTS idx_beats_energy_level ON beats(energy_level);
CREATE INDEX IF NOT EXISTS idx_beats_isrc ON beats(isrc);
CREATE INDEX IF NOT EXISTS idx_beats_professional_complete ON beats(professional_complete);
CREATE INDEX IF NOT EXISTS idx_beats_distribution_ready ON beats(distribution_ready);

CREATE INDEX IF NOT EXISTS idx_beat_splits_beat_id ON beat_splits(beat_id);
CREATE INDEX IF NOT EXISTS idx_beat_splits_contributor ON beat_splits(contributor_name);
CREATE INDEX IF NOT EXISTS idx_beat_splits_type ON beat_splits(split_type);

CREATE INDEX IF NOT EXISTS idx_beat_credits_beat_id ON beat_credits(beat_id);
CREATE INDEX IF NOT EXISTS idx_beat_credits_type ON beat_credits(credit_type);

CREATE INDEX IF NOT EXISTS idx_beat_analytics_beat_id ON beat_analytics(beat_id);
CREATE INDEX IF NOT EXISTS idx_beat_analytics_event_type ON beat_analytics(event_type);
CREATE INDEX IF NOT EXISTS idx_beat_analytics_timestamp ON beat_analytics(timestamp DESC);

-- RLS Policies
ALTER TABLE beat_splits ENABLE ROW LEVEL SECURITY;
ALTER TABLE beat_credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE beat_analytics ENABLE ROW LEVEL SECURITY;

-- Beat splits policies
CREATE POLICY "Users can view splits for their beats" ON beat_splits
  FOR SELECT USING (
    beat_id IN (SELECT id FROM beats WHERE producer_id = auth.uid()::text)
  );

CREATE POLICY "Users can manage splits for their beats" ON beat_splits
  FOR ALL USING (
    beat_id IN (SELECT id FROM beats WHERE producer_id = auth.uid()::text)
  );

-- Beat credits policies  
CREATE POLICY "Anyone can view beat credits" ON beat_credits
  FOR SELECT USING (true);

CREATE POLICY "Users can manage credits for their beats" ON beat_credits
  FOR INSERT WITH CHECK (
    beat_id IN (SELECT id FROM beats WHERE producer_id = auth.uid()::text)
  );

-- Beat analytics policies
CREATE POLICY "Users can view analytics for their beats" ON beat_analytics
  FOR SELECT USING (
    beat_id IN (SELECT id FROM beats WHERE producer_id = auth.uid()::text)
  );

CREATE POLICY "Anyone can insert analytics" ON beat_analytics
  FOR INSERT WITH CHECK (true);

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON beat_splits TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON beat_credits TO authenticated;
GRANT SELECT, INSERT ON beat_analytics TO authenticated;