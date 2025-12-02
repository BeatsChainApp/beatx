-- Schema-Aware Migration
-- This works with existing users table structure

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Check if users table exists and what columns it has
DO $$
DECLARE
    email_nullable boolean;
BEGIN
    -- Check if email column exists and if it's nullable
    SELECT is_nullable = 'YES' INTO email_nullable
    FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'email' AND table_schema = 'public';
    
    -- If users table exists with email NOT NULL, insert with email
    IF FOUND AND NOT email_nullable THEN
        INSERT INTO users (wallet_address, display_name, role, email) VALUES
        ('0xc84799a904eeb5c57abbbc40176e7db8be202c10', 'Super Admin', 'super_admin', 'admin@beatx.app')
        ON CONFLICT (wallet_address) DO UPDATE SET 
        role = EXCLUDED.role,
        display_name = EXCLUDED.display_name;
    ELSE
        -- Try without email constraint
        INSERT INTO users (wallet_address, display_name, role) VALUES
        ('0xc84799a904eeb5c57abbbc40176e7db8be202c10', 'Super Admin', 'super_admin')
        ON CONFLICT (wallet_address) DO UPDATE SET 
        role = EXCLUDED.role,
        display_name = EXCLUDED.display_name;
    END IF;
EXCEPTION
    WHEN others THEN
        -- If users table doesn't exist, create it
        CREATE TABLE IF NOT EXISTS users (
            id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
            wallet_address text UNIQUE NOT NULL,
            display_name text,
            role text DEFAULT 'user',
            created_at timestamptz DEFAULT now()
        );
        
        INSERT INTO users (wallet_address, display_name, role) VALUES
        ('0xc84799a904eeb5c57abbbc40176e7db8be202c10', 'Super Admin', 'super_admin');
END $$;

-- Create other essential tables
CREATE TABLE IF NOT EXISTS transactions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    buyer_address text NOT NULL,
    amount decimal NOT NULL,
    status text DEFAULT 'pending',
    created_at timestamptz DEFAULT now()
);