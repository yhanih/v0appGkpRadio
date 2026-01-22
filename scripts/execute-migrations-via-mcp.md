# Executing Homepage Migrations

## MCP Limitation

The Supabase MCP tools (`queryDatabase`, `insertData`, etc.) operate through PostgREST and **do not support raw SQL execution** (CREATE TABLE, CREATE FUNCTION, etc.). 

## Solution: Manual Execution + MCP Verification

### Step 1: Execute Migrations Manually

1. **Open Supabase SQL Editor:**
   - Go to: https://supabase.com/dashboard/project/fychjnaxljwmgoptjsxn/sql/new

2. **Copy and paste the combined migration:**
   - File: `web-app/supabase/migrations/combined_homepage_migrations.sql`
   - Or copy the contents below

3. **Click "Run"** (or press Cmd+Enter / Ctrl+Enter)

4. **Verify success:**
   - You should see: "Success. No rows returned" or similar
   - No error messages

### Step 2: Verify via MCP

After running the SQL, the migrations will be verified using MCP query tools to confirm:
- `prayercircle_prayers` table exists
- `pray_for_request()` function is callable
- `get_homepage_stats()` function is callable

## Alternative: Edge Function (Requires Deployment)

If you have Supabase CLI installed:

```bash
# Deploy the edge function
supabase functions deploy run-homepage-migrations

# Call it
curl -X POST "https://fychjnaxljwmgoptjsxn.supabase.co/functions/v1/run-homepage-migrations" \
  -H "Authorization: Bearer YOUR_SERVICE_ROLE_KEY"
```

The edge function is located at: `supabase/functions/run-homepage-migrations/index.ts`
