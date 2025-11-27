-- Add a dedicated `used` boolean column to isrc_registry for faster queries
alter table if exists public.isrc_registry
  add column if not exists used boolean default false;

-- Optional: populate from metadata.used if present (note: requires metadata->>'used' to be 'true'/'false')
update public.isrc_registry
set used = (metadata->>'used')::boolean
where metadata is not null;
