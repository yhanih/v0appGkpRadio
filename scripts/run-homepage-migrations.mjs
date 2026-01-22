#!/usr/bin/env node
/**
 * Script to run homepage backend migrations via Supabase
 * Requires: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables
 * 
 * Usage:
 *   SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... node scripts/run-homepage-migrations.mjs
 * 
 * Or set in .env file and use: node -r dotenv/config scripts/run-homepage-migrations.mjs
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Error: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set');
  console.error('   SUPABASE_URL:', SUPABASE_URL ? '✓' : '✗');
  console.error('   SUPABASE_SERVICE_ROLE_KEY:', SUPABASE_SERVICE_ROLE_KEY ? '✓ (hidden)' : '✗');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// Read migration files
const migrationsDir = join(__dirname, '../supabase/migrations');

function readMigrationFile(filename) {
  try {
    return readFileSync(join(migrationsDir, filename), 'utf8');
  } catch (error) {
    console.error(`❌ Error reading ${filename}:`, error.message);
    return null;
  }
}

async function executeSQL(sql) {
  // Supabase JS client doesn't support raw SQL execution
  // We need to use the REST API directly or call an RPC function
  // For now, we'll use the REST API with service role key
  
  const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': SUPABASE_SERVICE_ROLE_KEY,
      'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
    },
    body: JSON.stringify({ query: sql }),
  });

  if (!response.ok) {
    // If exec_sql doesn't exist, we need to use a different approach
    // Try calling the edge function instead
    return { success: false, error: 'exec_sql RPC not available, use edge function instead' };
  }

  return { success: true, data: await response.json() };
}

async function runMigrations() {
  console.log('🔄 Running homepage backend migrations...\n');

  const migrations = [
    { name: 'prayercircle_prayers table', file: 'create_prayercircle_prayers_table.sql' },
    { name: 'pray_for_request function', file: 'create_pray_for_request_function.sql' },
    { name: 'get_homepage_stats function', file: 'create_homepage_stats_function.sql' },
  ];

  const results = [];

  for (const migration of migrations) {
    console.log(`📝 Running: ${migration.name}...`);
    
    const sql = readMigrationFile(migration.file);
    if (!sql) {
      results.push({ migration: migration.name, success: false, error: 'File not found' });
      continue;
    }

    // Try to call the edge function instead
    try {
      const functionUrl = `${SUPABASE_URL}/functions/v1/run-homepage-migrations`;
      const response = await fetch(functionUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        },
      });

      if (response.ok) {
        const result = await response.json();
        console.log(`   ✅ ${migration.name}: Success`);
        results.push({ migration: migration.name, success: true });
      } else {
        const error = await response.text();
        console.log(`   ❌ ${migration.name}: ${error}`);
        results.push({ migration: migration.name, success: false, error });
      }
    } catch (error) {
      console.log(`   ⚠️  ${migration.name}: Edge function not available, manual execution required`);
      console.log(`   📋 SQL to run manually:\n${sql}\n`);
      results.push({ 
        migration: migration.name, 
        success: false, 
        error: 'Edge function not deployed. Run SQL manually in Supabase Dashboard.',
        sql 
      });
    }
  }

  console.log('\n📊 Migration Summary:');
  results.forEach((r) => {
    console.log(`   ${r.success ? '✅' : '❌'} ${r.migration}`);
    if (r.error) console.log(`      Error: ${r.error}`);
  });

  const allSuccess = results.every((r) => r.success);
  if (!allSuccess) {
    console.log('\n⚠️  Some migrations failed. Run the SQL manually in Supabase Dashboard:');
    console.log('   https://supabase.com/dashboard/project/fychjnaxljwmgoptjsxn/sql/new\n');
  }

  return allSuccess;
}

// Main execution
runMigrations()
  .then((success) => {
    process.exit(success ? 0 : 1);
  })
  .catch((error) => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  });
