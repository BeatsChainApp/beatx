-- Final Working Migration - No ON CONFLICT

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Insert super admin (will fail if exists, that's fine)
INSERT INTO users (email, username, display_name, role) VALUES
('admin@beatx.app', 'superadmin', 'Super Admin', 'super_admin');

-- Create commerce tables
CREATE TABLE IF NOT EXISTS transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_address text NOT NULL,
  amount decimal NOT NULL,
  status text DEFAULT 'pending',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS purchases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_address text NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_address text NOT NULL,
  type text NOT NULL,
  title text NOT NULL,
  read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);