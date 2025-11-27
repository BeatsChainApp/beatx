-- 005_sponsored_campaigns.sql
-- Table to store sponsored campaign metadata and budgets
CREATE TABLE IF NOT EXISTS public.sponsored_campaigns (
  id text PRIMARY KEY,
  created_at timestamptz DEFAULT now(),
  name text,
  owner text,
  ipfs_cid text,
  metadata jsonb,
  budget numeric DEFAULT 0,
  remaining numeric DEFAULT 0,
  active boolean DEFAULT true
);

CREATE INDEX IF NOT EXISTS idx_campaigns_owner ON public.sponsored_campaigns(owner);
