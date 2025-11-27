#!/usr/bin/env node
const path = require('path');
const fs = require('fs');
const { ensureSchema, getClient } = require('../src/services/supabaseClient');

async function main() {
  console.log('Supabase migration starting...');
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.log('SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not set. Migration skipped (safe-mode).');
    process.exit(0);
  }

  try {
    await ensureSchema();
    console.log('Schema ensured.');

    // Optional: migrate local file-backed ISRC registry if present
    const localIsrcPath = path.join(__dirname, '..', 'data', 'isrcRegistry.json');
    if (fs.existsSync(localIsrcPath)) {
      const raw = fs.readFileSync(localIsrcPath, 'utf8');
      const data = JSON.parse(raw || '{}');
      const items = data.items || [];
      if (items.length) {
        console.log(`Found ${items.length} local ISRC items; attempting to insert into Supabase...`);
        const sb = getClient();
        if (!sb) throw new Error('Supabase client not available');
        for (const it of items) {
          try {
            await sb.from('isrc_registry').insert({ isrc: it.isrc, created_by: it.createdBy || null, metadata: it.metadata || {} });
          } catch (e) {
            console.warn('insert failed for', it.isrc, e && e.message);
          }
        }
      }
    }

    console.log('Migration complete');
  } catch (err) {
    console.error('Migration failed', err && err.message);
    process.exit(2);
  }
}

main();
