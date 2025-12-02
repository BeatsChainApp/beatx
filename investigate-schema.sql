-- Investigate existing Supabase schema
-- Run these queries one by one to understand current structure

-- 1. Check what tables exist
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';

-- 2. Check users table structure if it exists
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'users' AND table_schema = 'public'
ORDER BY ordinal_position;

-- 3. Check beats table structure if it exists  
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'beats' AND table_schema = 'public'
ORDER BY ordinal_position;

-- 4. Check constraints on users table
SELECT constraint_name, constraint_type 
FROM information_schema.table_constraints 
WHERE table_name = 'users' AND table_schema = 'public';