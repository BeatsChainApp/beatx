-- Enhanced Schema for App Integration
-- Date: 2025-01-12

-- Add missing columns to isrc_registry if they don't exist
ALTER TABLE isrc_registry 
ADD COLUMN IF NOT EXISTS track_title VARCHAR,
ADD COLUMN IF NOT EXISTS artist_name VARCHAR,
ADD COLUMN IF NOT EXISTS country_code VARCHAR(2),
ADD COLUMN IF NOT EXISTS registrant_code VARCHAR(3),
ADD COLUMN IF NOT EXISTS year VARCHAR(2),
ADD COLUMN IF NOT EXISTS designation_code VARCHAR(5),
ADD COLUMN IF NOT EXISTS generated_at TIMESTAMPTZ DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS used BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS professional_service BOOLEAN DEFAULT FALSE;

-- Create success table if not exists (for analytics)
CREATE TABLE IF NOT EXISTS success (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event VARCHAR NOT NULL,
  status VARCHAR,
  metadata JSONB,
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create sponsored_campaigns table if not exists
CREATE TABLE IF NOT EXISTS sponsored_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR NOT NULL,
  description TEXT,
  budget NUMERIC NOT NULL,
  remaining_budget NUMERIC NOT NULL,
  cost_per_mint NUMERIC DEFAULT 2.50,
  daily_limit INTEGER DEFAULT 100,
  owner VARCHAR,
  active BOOLEAN DEFAULT TRUE,
  total_revenue NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_isrc_registry_isrc ON isrc_registry(isrc);
CREATE INDEX IF NOT EXISTS idx_isrc_registry_used ON isrc_registry(used);
CREATE INDEX IF NOT EXISTS idx_credit_ledger_wallet ON credit_ledger(wallet);
CREATE INDEX IF NOT EXISTS idx_credit_ledger_created_at ON credit_ledger(created_at);
CREATE INDEX IF NOT EXISTS idx_success_event ON success(event);
CREATE INDEX IF NOT EXISTS idx_success_created_at ON success(created_at);

-- Add comments for documentation
COMMENT ON TABLE isrc_registry IS 'Professional ISRC code registry for music industry compliance';
COMMENT ON TABLE credit_ledger IS 'Transaction and credit tracking for user accounts';
COMMENT ON TABLE success IS 'Success events and analytics tracking';
COMMENT ON TABLE sponsored_campaigns IS 'Sponsored content campaigns and revenue tracking';