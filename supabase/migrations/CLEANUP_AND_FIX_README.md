# Cleanup Incorrect Homepage Migrations

## Problem

The initial homepage migrations were created based on a misunderstanding of the database schema:

- ❌ Created `prayercircle_prayers` table (wrong - `prayercircles` is for follower relationships)
- ❌ Created `pray_for_request()` RPC function (references wrong table)
- ❌ `get_homepage_stats()` function counts from wrong table

## Correct Schema

The actual schema uses:
- ✅ `communitythreads` table for prayer requests (filter by `category = 'Prayer'`)
- ✅ `thread_prayers` table for tracking prayers on threads
- ✅ `prayercircles` table is for follower/following relationships (NOT prayer requests)

## Solution

### Step 1: Run Cleanup Migration

Run `cleanup_incorrect_homepage_migrations.sql` in Supabase SQL Editor:
1. Go to: https://supabase.com/dashboard/project/fychjnaxljwmgoptjsxn/sql/new
2. Copy and paste the contents of `cleanup_incorrect_homepage_migrations.sql`
3. Click "Run"

This will:
- Drop the incorrect `prayercircle_prayers` table
- Drop the incorrect `pray_for_request()` function
- Fix the `get_homepage_stats()` function to use `communitythreads`

### Step 2: Verify thread_prayers Setup

Run `verify_thread_prayers_setup.sql` to check if `thread_prayers` table has proper RLS policies.

If the table doesn't have the required policies, uncomment and run the policy creation statements in that file.

## Files Updated

The following frontend files have been updated to use the correct schema:
- ✅ `web-app/components/quick-prayer-section.tsx` - Now uses `communitythreads` and `thread_prayers`
- ✅ `web-app/components/ministry-fields-section.tsx` - Now counts prayers from `communitythreads`

## Verification

After running the cleanup migration, verify:
1. `prayercircle_prayers` table is dropped
2. `pray_for_request()` function is dropped
3. `get_homepage_stats()` function works correctly
4. Homepage loads prayer requests without errors
