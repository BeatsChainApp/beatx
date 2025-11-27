#!/usr/bin/env node
require('dotenv').config()
const { getClient } = require('../src/services/supabaseClient')

async function main(){
  const sb = getClient()
  if(!sb){
    console.log('Supabase not configured (SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY missing)')
    process.exit(0)
  }

  try{
    console.log("Attempting to select from table 'success' (limit 1)...")
    const { data, error } = await sb.from('success').select('*').limit(1)
    if(error){
      console.error('Query error:', error.message || error)
      process.exit(2)
    }
    console.log('Query returned:', JSON.stringify(data, null, 2))
    process.exit(0)
  }catch(err){
    console.error('Unexpected error:', err && err.message)
    process.exit(3)
  }
}

main()
