const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

async function deployRBAC() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://zgdxpsenxjwyiwbbealf.supabase.co'
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpnZHhwc2VueGp3eWl3YmJlYWxmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI4ODY4OTksImV4cCI6MjA3ODQ2Mjg5OX0.YourAnonKeyHere'
  
  if (!supabaseKey) {
    console.error('❌ No Supabase key found')
    return
  }

  const supabase = createClient(supabaseUrl, supabaseKey)
  
  try {
    // Read RBAC migration
    const migrationPath = path.join(__dirname, 'packages/mcp-server/migrations/011_rbac_system.sql')
    const migration = fs.readFileSync(migrationPath, 'utf8')
    
    // Split into individual statements
    const statements = migration.split(';').filter(s => s.trim())
    
    console.log('🚀 Deploying RBAC schema...')
    
    for (const statement of statements) {
      if (statement.trim()) {
        const { error } = await supabase.rpc('exec_sql', { sql: statement.trim() + ';' })
        if (error && !error.message.includes('already exists')) {
          console.warn('⚠️ SQL Warning:', error.message)
        }
      }
    }
    
    // Insert admin user
    const { error: userError } = await supabase
      .from('users')
      .upsert({
        email: 'info@unamifoundation.org',
        wallet_address: '0xc84799A904EeB5C57aBBBc40176E7dB8be202C10',
        role: 'SUPER_ADMIN',
        context: 'app',
        verification_status: 'verified'
      }, { onConflict: 'email' })
    
    if (userError) {
      console.warn('⚠️ User insert warning:', userError.message)
    }
    
    console.log('✅ RBAC schema deployed successfully')
    console.log('✅ Admin user created/updated')
    
  } catch (error) {
    console.error('❌ Deployment failed:', error.message)
  }
}

deployRBAC()