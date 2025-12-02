-- Migration for Existing Supabase Schema
-- Works with existing users table that has email/username constraints

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Insert super admin with required fields
INSERT INTO users (wallet_address, display_name, role, email, username) VALUES
('0xc84799a904eeb5c57abbbc40176e7db8be202c10', 'Super Admin', 'super_admin', 'admin@beatx.app', 'superadmin')
ON CONFLICT (wallet_address) DO UPDATE SET 
  role = EXCLUDED.role,
  display_name = EXCLUDED.display_name;

-- Create commerce tables
CREATE TABLE IF NOT EXISTS transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_address text NOT NULL,
  producer_address text,
  amount decimal NOT NULL,
  status text DEFAULT 'pending',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS purchases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id uuid REFERENCES transactions(id),
  buyer_address text NOT NULL,
  license_type text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_address text NOT NULL,
  type text NOT NULL,
  title text NOT NULL,
  message text,
  read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);