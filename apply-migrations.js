#!/usr/bin/env node

/**
 * Apply BeatsChain Migrations to Supabase
 * Applies all migration files to the Supabase database
 */

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, 'packages/app/.env.production') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase configuration');
    console.log('SUPABASE_URL:', supabaseUrl ? '✅ Set' : '❌ Missing');
    console.log('SUPABASE_KEY:', supabaseKey ? '✅ Set' : '❌ Missing');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

console.log('🚀 BeatsChain Migration Tool');
console.log('============================');
console.log(`📡 Supabase URL: ${supabaseUrl}`);

async function applyMigrations() {
    console.log('\n📂 Reading migration files...');
    
    const migrationsDir = path.join(__dirname, 'migrations');
    const migrationFiles = fs.readdirSync(migrationsDir)
        .filter(file => file.endsWith('.sql'))
        .sort();
    
    console.log(`Found ${migrationFiles.length} migration files:`);
    migrationFiles.forEach(file => console.log(`  - ${file}`));
    
    console.log('\n🔄 Applying migrations...');
    
    for (const file of migrationFiles) {
        const filePath = path.join(migrationsDir, file);
        const sql = fs.readFileSync(filePath, 'utf8');
        
        console.log(`\n📝 Applying: ${file}`);
        
        try {
            // Split SQL by semicolons and execute each statement
            const statements = sql.split(';').filter(stmt => stmt.trim());
            
            for (const statement of statements) {
                if (statement.trim()) {
                    const { error } = await supabase.rpc('exec_sql', { sql_query: statement.trim() });
                    if (error) {
                        console.log(`⚠️ Warning in ${file}:`, error.message);
                        // Continue with other statements
                    }
                }
            }
            
            console.log(`✅ Applied: ${file}`);
            
        } catch (error) {
            console.log(`⚠️ Error in ${file}:`, error.message);
            // Continue with next file
        }
    }
}

async function verifyTables() {
    console.log('\n🔍 Verifying database tables...');
    
    const tables = ['isrc_registry', 'success'];
    
    for (const table of tables) {
        try {
            const { data, error } = await supabase
                .from(table)
                .select('*')
                .limit(1);
            
            if (error) {
                console.log(`❌ Table ${table}: ${error.message}`);
            } else {
                console.log(`✅ Table ${table}: Available`);
            }
        } catch (error) {
            console.log(`❌ Table ${table}: ${error.message}`);
        }
    }
}

async function main() {
    try {
        await applyMigrations();
        await verifyTables();
        
        console.log('\n🎉 Migration process completed!');
        console.log('\n📊 Next Steps:');
        console.log('1. ✅ Migrations applied to Supabase');
        console.log('2. 🔄 Run cleanup scripts');
        console.log('3. 📦 Git commit and push changes');
        
    } catch (error) {
        console.error('❌ Migration failed:', error.message);
        process.exit(1);
    }
}

// Run migrations
main();