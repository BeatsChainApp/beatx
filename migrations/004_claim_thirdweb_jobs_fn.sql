-- 004_claim_thirdweb_jobs_fn.sql
-- Create a Postgres function to atomically claim thirdweb_jobs rows for processing.
CREATE OR REPLACE FUNCTION public.claim_thirdweb_jobs(p_worker_id text, p_limit int)
RETURNS SETOF public.thirdweb_jobs
LANGUAGE plpgsql
AS $$
DECLARE
  rec RECORD;
BEGIN
  FOR rec IN
    SELECT * FROM public.thirdweb_jobs
    WHERE status = 'queued'
    ORDER BY created_at
    FOR UPDATE SKIP LOCKED
    LIMIT p_limit
  LOOP
    UPDATE public.thirdweb_jobs
    SET status = 'processing', processing_by = p_worker_id, processing_at = now()
    WHERE id = rec.id;
    RETURN NEXT (SELECT * FROM public.thirdweb_jobs WHERE id = rec.id);
  END LOOP;
  RETURN;
END;
$$;
