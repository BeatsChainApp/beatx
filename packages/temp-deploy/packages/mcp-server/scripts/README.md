Supabase scripts

- `inspect_supabase.js` - read up to 10 rows from `isrc_registry` and `credit_ledger` using `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` env vars.
- `run_sql_if_dburl.js` - run SQL migration file `migrations/001_add_used_column.sql` if `SUPABASE_DB_URL` (Postgres connection string) is provided. This requires `pg` to be installed.

Usage examples:

```bash
# inspect (reads, safe)
SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... node scripts/inspect_supabase.js

# run migration (destructive DDL) - only when SUPABASE_DB_URL provided and you are sure
SUPABASE_DB_URL=postgres://... node scripts/run_sql_if_dburl.js
```
