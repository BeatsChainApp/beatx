#!/usr/bin/env node
// Run migration SQL if SUPABASE_DB_URL (Postgres connection string) is provided
const fs = require('fs')
const path = require('path')
const { Client } = require('pg')

async function main(){
  const dbUrl = process.env.SUPABASE_DB_URL
  if(!dbUrl){
    console.log('SUPABASE_DB_URL not provided; skipping SQL run')
    process.exit(0)
  }
  const sqlPath = path.join(__dirname, '..', 'migrations', '001_add_used_column.sql')
  if(!fs.existsSync(sqlPath)){
    console.error('migration file missing', sqlPath)
    process.exit(2)
  }
  const sql = fs.readFileSync(sqlPath, 'utf8')
  const client = new Client({ connectionString: dbUrl })
  try{
    await client.connect()
    console.log('Running migration...')
    await client.query(sql)
    console.log('Migration applied')
  }catch(err){
    console.error('Migration failed', err && err.message)
    process.exit(2)
  }finally{
    await client.end()
  }
}

main()
