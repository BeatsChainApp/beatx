#!/usr/bin/env node
const fs = require('fs')
const path = require('path')
const { Client } = require('pg')

async function main(){
  const dbUrl = process.env.SUPABASE_DB_URL
  if(!dbUrl){
    console.log('SUPABASE_DB_URL not provided; skipping migrations')
    process.exit(0)
  }

  const migrationsDir = path.join(__dirname, '..', 'migrations')
  if(!fs.existsSync(migrationsDir)){
    console.log('no migrations directory found; nothing to do')
    process.exit(0)
  }

  const files = fs.readdirSync(migrationsDir).filter(f => f.endsWith('.sql')).sort()
  if(files.length === 0){
    console.log('no .sql migrations found; nothing to do')
    process.exit(0)
  }

  const client = new Client({ connectionString: dbUrl })
  try{
    await client.connect()
    for(const file of files){
      const p = path.join(migrationsDir, file)
      const sql = fs.readFileSync(p, 'utf8')
      try{
        console.log('Applying', file)
        await client.query(sql)
        console.log('Applied', file)
      }catch(err){
        console.error('Failed to apply', file, err && err.message)
        // stop on error
        process.exit(2)
      }
    }
    console.log('All migrations applied')
  }catch(err){
    console.error('Migration runner failed', err && err.message)
    process.exit(2)
  }finally{
    await client.end()
  }
}

main()
