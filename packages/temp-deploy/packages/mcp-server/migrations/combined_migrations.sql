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
