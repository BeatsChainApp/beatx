const { createClient } = require('@supabase/supabase-js');

let client = null;

function getClient() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!url || !key) {
    console.warn('Supabase credentials missing - using mock mode');
    return null;
  }
  
  if (!client) {
    try {
      client = createClient(url, key, {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      });
      console.log('✅ Supabase client initialized');
    } catch (error) {
      console.error('❌ Supabase client initialization failed:', error.message);
      return null;
    }
  }
  
  return client;
}

async function ensureSchema() {
  const sb = getClient();
  if (!sb) {
    console.warn('Supabase not configured - skipping schema creation');
    return false;
  }

  try {
    // Test connection first
    const { data, error } = await sb.from('beats').select('count').limit(1);
    if (!error) {
      console.log('✅ Supabase connection verified');
      return true;
    }
  } catch (e) {
    console.warn('Supabase connection test failed:', e.message);
  }

  return false;
}

module.exports = { getClient, ensureSchema };
