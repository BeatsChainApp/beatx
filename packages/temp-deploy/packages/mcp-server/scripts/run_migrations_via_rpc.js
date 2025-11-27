#!/usr/bin/env node
require('dotenv').config()
const fs = require('fs')
const path = require('path')
const { getClient } = require('../src/services/supabaseClient')

async function main(){
  const sb = getClient()
  if(!sb){
    console.log('SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY missing; cannot run migrations via RPC')
    process.exit(0)
  }

  const migrationsDir = path.join(__dirname, '..', 'migrations')
  if(!fs.existsSync(migrationsDir)){
    console.log('no migrations directory; nothing to do')
    process.exit(0)
  }

  const files = fs.readdirSync(migrationsDir).filter(f => f.endsWith('.sql')).sort()
  for(const file of files){
    const p = path.join(migrationsDir, file)
    const sql = fs.readFileSync(p, 'utf8')
    try{
      console.log('Applying via RPC:', file)
      const { data, error } = await sb.rpc('sql', { sql })
      if(error){
        console.error('RPC error for', file, error && error.message)
        process.exit(2)
      }
      console.log('Applied via RPC:', file)
    }catch(err){
      console.error('RPC failed for', file, err && err.message)
      process.exit(2)
    }
  }

  console.log('All migrations applied via RPC')
}

main()
