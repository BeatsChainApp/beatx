-- Fix Supabase RLS for public beat reading
-- This allows unauthenticated users to read beats

-- Option 1: Disable RLS entirely for beats table (simplest)
ALTER TABLE beats DISABLE ROW LEVEL SECURITY;

-- Option 2: Create public read policy (more secure)
-- ALTER TABLE beats ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Public beats are viewable by everyone" ON beats
--   FOR SELECT USING (is_active = true);

-- Option 3: Allow anonymous reads for active beats
-- CREATE POLICY "Anonymous can read active beats" ON beats
--   FOR SELECT TO anon USING (is_active = true);

-- Fix beat_plays table for analytics
ALTER TABLE beat_plays DISABLE ROW LEVEL SECURITY;

-- Or create insert policy for anonymous users
-- CREATE POLICY "Anyone can track plays" ON beat_plays
--   FOR INSERT TO anon WITH CHECK (true);