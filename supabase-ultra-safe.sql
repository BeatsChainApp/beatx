-- Ultra Safe Migration - No Indexes, Core Tables Only

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_address text UNIQUE NOT NULL,
  display_name text,
  role text DEFAULT 'user',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_address text NOT NULL,
  amount decimal NOT NULL,
  status text DEFAULT 'pending',
  created_at timestamptz DEFAULT now()
);

INSERT INTO users (wallet_address, display_name, role) VALUES
('0xc84799a904eeb5c57abbbc40176e7db8be202c10', 'Super Admin', 'super_admin');