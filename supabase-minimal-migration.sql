-- Minimal Supabase Migration - Core Tables Only
-- Apply this if you're getting column reference errors

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_address text UNIQUE NOT NULL,
  display_name text,
  email text,
  role text DEFAULT 'user',
  is_verified boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  beat_id uuid,
  buyer_address text NOT NULL,
  producer_address text NOT NULL,
  amount decimal NOT NULL,
  license_type text NOT NULL,
  status text DEFAULT 'pending',
  created_at timestamptz DEFAULT now()
);

-- Create purchases table
CREATE TABLE IF NOT EXISTS purchases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id uuid REFERENCES transactions(id),
  beat_id uuid,
  buyer_address text NOT NULL,
  license_type text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_address text NOT NULL,
  type text NOT NULL,
  title text NOT NULL,
  message text,
  read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Add basic indexes
CREATE INDEX IF NOT EXISTS idx_users_wallet ON users(wallet_address);
CREATE INDEX IF NOT EXISTS idx_transactions_buyer ON transactions(buyer_address);
CREATE INDEX IF NOT EXISTS idx_purchases_buyer ON purchases(buyer_address);

-- Insert super admin
INSERT INTO users (wallet_address, display_name, role, is_verified) VALUES
('0xc84799a904eeb5c57abbbc40176e7db8be202c10', 'Super Admin', 'super_admin', true)
ON CONFLICT (wallet_address) DO UPDATE SET 
  role = EXCLUDED.role,
  is_verified = EXCLUDED.is_verified;