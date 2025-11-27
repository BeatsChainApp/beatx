-- 006_reserve_campaign_budget_fn.sql
-- Atomically reserve (decrement) campaign remaining budget if sufficient funds exist.
CREATE OR REPLACE FUNCTION public.reserve_campaign_budget(p_campaign_id text, p_amount numeric)
RETURNS boolean
LANGUAGE plpgsql
AS $$
DECLARE
  cur_remaining numeric;
BEGIN
  SELECT remaining INTO cur_remaining FROM public.sponsored_campaigns WHERE id = p_campaign_id FOR UPDATE;
  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;
  IF cur_remaining < p_amount THEN
    RETURN FALSE;
  END IF;
  UPDATE public.sponsored_campaigns SET remaining = remaining - p_amount WHERE id = p_campaign_id;
  RETURN TRUE;
END;
$$;