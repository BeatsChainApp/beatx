-- 003_create_thirdweb_jobs.sql
-- Jobs table for queued Thirdweb gasless mint requests
CREATE TABLE IF NOT EXISTS public.thirdweb_jobs (
  id text PRIMARY KEY,
  created_at timestamptz DEFAULT now(),
  to_address text,
  metadata_uri text,
  metadata jsonb,
  client_id text,
  status text DEFAULT 'queued', -- queued | processing | forwarded | failed | done
  processing_by text,
  processing_at timestamptz,
  result jsonb,
  details jsonb
);

CREATE INDEX IF NOT EXISTS idx_thirdweb_jobs_status_created ON public.thirdweb_jobs(status, created_at);
