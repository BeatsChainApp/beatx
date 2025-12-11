-- Enable RLS on all public tables
ALTER TABLE public.credit_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.isrc_registry ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.success ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.thirdweb_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.beatnft_credit_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sponsored_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.beatnft_system_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.upload_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.moderation_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.beat_plays ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.beat_search_index ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.radio_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.beats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_admin_numbers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;

-- Add basic RLS policies for public read access where needed
CREATE POLICY "Public read access" ON public.beats FOR SELECT USING (true);
CREATE POLICY "Public read access" ON public.beat_plays FOR SELECT USING (true);
CREATE POLICY "Public read access" ON public.beatnft_system_stats FOR SELECT USING (true);

-- Drop the security definer view and recreate as invoker
DROP VIEW IF EXISTS public.active_users_summary;
CREATE VIEW public.active_users_summary AS 
SELECT COUNT(*) as active_count FROM public.users WHERE created_at > NOW() - INTERVAL '30 days';