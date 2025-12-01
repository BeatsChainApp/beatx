// Simple RBAC deployment using direct SQL execution
const { createClient } = require('@supabase/supabase-js')

async function deployRBAC() {
  const supabase = createClient(
    'https://zgdxpsenxjwyiwbbealf.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpnZHhwc2VueGp3eWl3YmJlYWxmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI4ODY4OTksImV4cCI6MjA3ODQ2Mjg5OX0.YourAnonKeyHere'
  )
  
  console.log('🚀 Creating RBAC tables...')
  
  // Create users table
  const { error: usersError } = await supabase.rpc('exec_sql', {
    sql: `
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR(255) UNIQUE NOT NULL,
        wallet_address VARCHAR(42),
        role VARCHAR(50) NOT NULL DEFAULT 'USER',
        context VARCHAR(20) NOT NULL DEFAULT 'app',
        verification_status VARCHAR(20) DEFAULT 'pending',
        invited_by UUID,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `
  })
  
  if (usersError && !usersError.message.includes('already exists')) {
    console.warn('⚠️ Users table:', usersError.message)
  } else {
    console.log('✅ Users table ready')
  }
  
  // Insert admin user directly
  const { error: insertError } = await supabase
    .from('users')
    .upsert({
      email: 'info@unamifoundation.org',
      wallet_address: '0xc84799A904EeB5C57aBBBc40176E7dB8be202C10',
      role: 'SUPER_ADMIN',
      context: 'app',
      verification_status: 'verified'
    }, { onConflict: 'email' })
  
  if (insertError) {
    console.warn('⚠️ Admin user:', insertError.message)
  } else {
    console.log('✅ Admin user created')
  }
  
  // Verify admin user exists
  const { data: adminUser, error: checkError } = await supabase
    .from('users')
    .select('*')
    .eq('wallet_address', '0xc84799A904EeB5C57aBBBc40176E7dB8be202C10')
    .single()
  
  if (adminUser) {
    console.log('✅ Admin verification:', adminUser.email, adminUser.role)
  } else {
    console.error('❌ Admin user not found:', checkError?.message)
  }
}

deployRBAC().catch(console.error)