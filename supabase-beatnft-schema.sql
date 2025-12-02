-- BeatNFT Credit System Schema Extension

-- BeatNFT Credit System Tables
CREATE TABLE IF NOT EXISTS beatnft_credit_balances (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_address text UNIQUE NOT NULL,
  credits integer DEFAULT 10,
  has_pro_nft boolean DEFAULT false,
  total_used integer DEFAULT 0,
  total_purchased integer DEFAULT 0,
  pro_nft_upgraded_at timestamptz,
  pro_nft_transaction_hash text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS beatnft_credit_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_address text NOT NULL,
  transaction_type text NOT NULL, -- 'purchase', 'usage', 'grant', 'pro_upgrade'
  credits_amount integer NOT NULL,
  transaction_hash text,
  beat_id text,
  file_size_mb decimal,
  granted_by text, -- for admin grants
  reason text,
  status text DEFAULT 'completed',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS beatnft_credit_packages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  package_name text NOT NULL,
  credits integer NOT NULL,
  price_eth decimal NOT NULL,
  price_usd decimal,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS beatnft_credit_marketplace (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_address text NOT NULL,
  credits integer NOT NULL,
  price_per_credit decimal NOT NULL,
  total_price decimal NOT NULL,
  status text DEFAULT 'active', -- 'active', 'sold', 'cancelled'
  buyer_address text,
  sold_at timestamptz,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS beatnft_system_stats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  stat_date date DEFAULT CURRENT_DATE,
  total_credits_issued integer DEFAULT 0,
  total_credits_used integer DEFAULT 0,
  active_users integer DEFAULT 0,
  pro_nft_holders integer DEFAULT 0,
  revenue_generated decimal DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Insert default credit packages
INSERT INTO beatnft_credit_packages (package_name, credits, price_eth, price_usd) VALUES
('Small Package', 10, 0.01, 18.00),
('Medium Package', 25, 0.02, 36.00),
('Large Package', 50, 0.035, 63.00),
('Bulk Package', 100, 0.06, 108.00)
ON CONFLICT DO NOTHING;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_beatnft_balances_user_address ON beatnft_credit_balances(user_address);
CREATE INDEX IF NOT EXISTS idx_beatnft_transactions_user_address ON beatnft_credit_transactions(user_address);
CREATE INDEX IF NOT EXISTS idx_beatnft_transactions_type ON beatnft_credit_transactions(transaction_type);
CREATE INDEX IF NOT EXISTS idx_beatnft_marketplace_seller ON beatnft_credit_marketplace(seller_address);
CREATE INDEX IF NOT EXISTS idx_beatnft_marketplace_status ON beatnft_credit_marketplace(status);

-- Functions for credit management
CREATE OR REPLACE FUNCTION update_credit_balance()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE beatnft_credit_balances 
  SET updated_at = now()
  WHERE user_address = NEW.user_address;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_credit_balance
  AFTER INSERT OR UPDATE ON beatnft_credit_transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_credit_balance();

-- RLS Policies
ALTER TABLE beatnft_credit_balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE beatnft_credit_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE beatnft_credit_marketplace ENABLE ROW LEVEL SECURITY;

-- Users can only see their own credit data
CREATE POLICY "Users can view own credit balance" ON beatnft_credit_balances
  FOR SELECT USING (user_address = current_setting('request.jwt.claims', true)::json->>'wallet_address');

CREATE POLICY "Users can view own transactions" ON beatnft_credit_transactions
  FOR SELECT USING (user_address = current_setting('request.jwt.claims', true)::json->>'wallet_address');

-- Admins can see all data
CREATE POLICY "Admins can view all credit data" ON beatnft_credit_balances
  FOR ALL USING (current_setting('request.jwt.claims', true)::json->>'role' IN ('admin', 'super_admin'));

CREATE POLICY "Admins can view all transactions" ON beatnft_credit_transactions
  FOR ALL USING (current_setting('request.jwt.claims', true)::json->>'role' IN ('admin', 'super_admin'));