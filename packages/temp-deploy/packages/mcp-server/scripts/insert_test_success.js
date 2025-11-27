#!/usr/bin/env node
require('dotenv').config()
const { getClient } = require('../src/services/supabaseClient')

async function main(){
  const sb = getClient()
  if(!sb){
    console.error('Supabase client not configured (set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY)')
    process.exit(2)
  }

  try{
    const payload = { event: 'insert-test', status: 'ok', metadata: { source: 'script' }, details: { note: 'inserted by automation' } }
    const { data, error } = await sb.from('success').insert([payload]).select()
    if(error){
      console.error('insert failed', error && error.message)
      process.exit(2)
    }
    console.log('insert result', JSON.stringify(data, null, 2))
  }catch(err){
    console.error('unexpected error', err && err.message)
    process.exit(2)
  }
}

main()
