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
    console.log('Listing up to 10 rows from isrc_registry:')
    const { data: isrcs, error: e1 } = await sb.from('isrc_registry').select('*').limit(10)
    if(e1) throw e1
    console.log(JSON.stringify(isrcs, null, 2))

    console.log('\nListing up to 10 rows from credit_ledger:')
    const { data: credits, error: e2 } = await sb.from('credit_ledger').select('*').limit(10)
    if(e2) throw e2
    console.log(JSON.stringify(credits, null, 2))
  }catch(err){
    console.error('inspect failed', err && err.message)
    process.exit(2)
  }
}

main()
