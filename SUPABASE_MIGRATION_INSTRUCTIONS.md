# Supabase Migration Instructions

## 🎯 Apply Database Migrations

To complete the BeatsChain deployment, you need to apply the database migrations to your Supabase instance.

### Step 1: Access Supabase SQL Editor

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project: `zgdxpsenxjwyiwbbealf`
3. Navigate to **SQL Editor** in the left sidebar

### Step 2: Apply Combined Migrations

Copy and paste the following SQL into the SQL Editor and execute:

```sql
-- Combined migrations for BeatsChain MCP
-- Apply these in the Supabase SQL editor if you prefer a single paste

-- ===== migration: 001_add_used_column.sql =====
-- Add a dedicated `used` boolean column to isrc_registry for faster queries
alter table if exists public.isrc_registry
  add column if not exists used boolean default false;

-- Optional: populate from metadata.used if present (note: requires metadata->>'used' to be 'true'/'false')
update public.isrc_registry
set used = (metadata->>'used')::boolean
where metadata is not null;


-- ===== migration: 002_create_success_table.sql =====
-- Migration: create success table
-- Idempotent: will create extension and table only if they do not exist

-- Enable pgcrypto for gen_random_uuid() if available
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Create the success table for logging short-lived or finalization events
CREATE TABLE IF NOT EXISTS public.success (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NULL,
  user_id uuid NULL,
  event text NOT NULL,
  status text DEFAULT 'pending',
  metadata jsonb DEFAULT '{}'::jsonb,
  details jsonb DEFAULT '{}'::jsonb
);

-- Helpful indexes
CREATE INDEX IF NOT EXISTS idx_success_user_id ON public.success (user_id);
CREATE INDEX IF NOT EXISTS idx_success_created_at ON public.success (created_at);

-- Small comment to document intent
-- Use dollar-quoting to avoid issues if the SQL editor appends metadata or contains single quotes
COMMENT ON TABLE public.success IS $$Generic success/event log table used by MCP for recording finalization and webhook success events.$$;
```

### Step 3: Verify Tables

After running the migrations, verify the tables exist:

1. Go to **Table Editor** in Supabase
2. Check that these tables are present:
   - `isrc_registry` (with new `used` column)
   - `success` (new table for event logging)

### Step 4: Test Admin Access

1. Visit: https://beatx-six.vercel.app/admin
2. Connect with super admin wallet: `0xc84799A904EeB5C57aBBBc40176E7dB8be202C10`
3. Verify admin dashboard loads correctly

## ✅ Deployment Status

- [x] URLs updated to correct Vercel deployment
- [x] Redundant authentication files removed
- [x] Unified authentication system verified
- [x] Migration scripts prepared
- [x] Git changes committed and pushed
- [ ] **Supabase migrations applied** ← **YOU ARE HERE**
- [ ] Admin dashboard access verified

## 🎉 Next Steps

After applying the migrations:

1. Test the admin dashboard at https://beatx-six.vercel.app/admin
2. Verify onboarding flow works for new users
3. Test Chrome extension with updated backend
4. Confirm all authentication flows work correctly

## 🔧 Troubleshooting

If you encounter issues:

1. **Migration errors**: Check Supabase logs in the dashboard
2. **Admin access issues**: Verify wallet address matches exactly
3. **Authentication problems**: Check browser console for errors
4. **Extension issues**: Reload extension and check Chrome developer tools

## 📞 Support

If you need assistance, the verification scripts are available:
- `node comprehensive-verification.js` - Full system check
- `node runtime-verification.js` - Runtime status check
- `node verify-admin-access.js` - Admin access verification