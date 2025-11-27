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
