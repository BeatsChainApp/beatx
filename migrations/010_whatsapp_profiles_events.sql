-- 010_whatsapp_profiles_events.sql
-- Add tables to support WhatsApp channel

BEGIN;

-- Add whatsapp_id to users for optional mapping
ALTER TABLE IF EXISTS users
  ADD COLUMN IF NOT EXISTS whatsapp_id TEXT;

CREATE TABLE IF NOT EXISTS whatsapp_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  whatsapp_id text UNIQUE,
  name text,
  phone text,
  profile_json jsonb,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS whatsapp_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  whatsapp_id text,
  event_type text,
  payload jsonb,
  processed boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS whatsapp_admin_numbers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  whatsapp_id text UNIQUE,
  description text,
  created_at timestamptz DEFAULT now()
);

COMMIT;
