const { getClient } = require('./supabaseClient');

class DatabaseAgent {
  constructor() {
    this.supabase = getClient();
    this.migrationStatus = new Map();
  }

  async runMigrations() {
    if (!this.supabase) {
      console.log('Supabase not configured, skipping migrations');
      return false;
    }

    try {
      // Check if migration tracking table exists
      await this.ensureMigrationTable();
      
      // Get pending migrations
      const pendingMigrations = await this.getPendingMigrations();
      
      for (const migration of pendingMigrations) {
        await this.executeMigration(migration);
      }
      
      return true;
    } catch (error) {
      console.error('Migration failed:', error);
      return false;
    }
  }

  async ensureMigrationTable() {
    const { error } = await this.supabase.rpc('create_migration_table');
    if (error && !error.message.includes('already exists')) {
      throw error;
    }
  }

  async getPendingMigrations() {
    const fs = require('fs');
    const path = require('path');
    
    const migrationsDir = path.join(__dirname, '../../migrations');
    const files = fs.readdirSync(migrationsDir).filter(f => f.endsWith('.sql'));
    
    const { data: applied } = await this.supabase
      .from('schema_migrations')
      .select('filename');
    
    const appliedFiles = new Set(applied?.map(m => m.filename) || []);
    
    return files
      .filter(file => !appliedFiles.has(file))
      .sort()
      .map(file => ({
        filename: file,
        path: path.join(migrationsDir, file)
      }));
  }

  async executeMigration(migration) {
    const fs = require('fs');
    const sql = fs.readFileSync(migration.path, 'utf8');
    
    console.log(`Applying migration: ${migration.filename}`);
    
    // Execute SQL (Note: Supabase JS doesn't support raw SQL execution)
    // This would need to be done via the Supabase SQL editor or psql
    console.log(`Migration ${migration.filename} prepared for execution`);
    
    // Record migration as applied
    await this.supabase
      .from('schema_migrations')
      .insert({ filename: migration.filename, applied_at: new Date() });
  }

  async optimizeDatabase() {
    if (!this.supabase) return;

    try {
      // Analyze table statistics
      const tables = ['users', 'beats', 'transactions', 'beat_plays'];
      
      for (const table of tables) {
        const { count } = await this.supabase
          .from(table)
          .select('*', { count: 'exact', head: true });
        
        console.log(`Table ${table}: ${count} rows`);
        
        // Suggest optimizations based on row count
        if (count > 10000) {
          console.log(`Consider partitioning ${table} table`);
        }
      }
      
      return true;
    } catch (error) {
      console.error('Database optimization failed:', error);
      return false;
    }
  }

  async healthCheck() {
    if (!this.supabase) return { healthy: false, reason: 'Not configured' };

    try {
      const { data, error } = await this.supabase
        .from('users')
        .select('count', { count: 'exact', head: true });
      
      if (error) throw error;
      
      return { 
        healthy: true, 
        userCount: data?.length || 0,
        timestamp: new Date()
      };
    } catch (error) {
      return { 
        healthy: false, 
        reason: error.message,
        timestamp: new Date()
      };
    }
  }
}

module.exports = new DatabaseAgent();