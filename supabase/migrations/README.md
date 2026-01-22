# Homepage Backend Integration Migrations

## ⚠️ IMPORTANT: Cleanup Required

**If you ran the initial migrations (`combined_homepage_migrations.sql`), you MUST run the cleanup migration first!**

The initial migrations were created based on a schema misunderstanding. See `CLEANUP_AND_FIX_README.md` for details.

## Correct Schema

The homepage uses these existing tables:
- ✅ `communitythreads` - Prayer requests are stored here with `category = 'Prayer'`
- ✅ `thread_prayers` - Tracks prayers on threads (already exists in database)
- ✅ `users` - User profiles
- ✅ `schedule` - Program schedule

## Required Actions

### Step 1: Cleanup (If Needed)

If you ran `combined_homepage_migrations.sql`, run:
**File:** `cleanup_incorrect_homepage_migrations.sql`

This removes:
- ❌ `prayercircle_prayers` table (incorrect)
- ❌ `pray_for_request()` function (incorrect)
- ✅ Fixes `get_homepage_stats()` function

### Step 2: Verify thread_prayers Setup

Run `verify_thread_prayers_setup.sql` to check if `thread_prayers` has proper RLS policies.

### Step 3: Optional - Fix Stats Function

The `get_homepage_stats()` function is fixed in the cleanup migration. If you didn't run the initial migrations, you can run just the function creation part from `cleanup_incorrect_homepage_migrations.sql`.

## How to Run

1. Go to your Supabase Dashboard: https://supabase.com/dashboard/project/fychjnaxljwmgoptjsxn/sql/new
2. Copy and paste the cleanup migration file's contents
3. Run the migration
4. Verify cleanup: Check that `prayercircle_prayers` table is dropped

## Verification

After cleanup, verify:
- ✅ `prayercircle_prayers` table is dropped (should not exist)
- ✅ `pray_for_request()` function is dropped (should not exist)
- ✅ `get_homepage_stats()` function works correctly
- ✅ `thread_prayers` table exists and has proper RLS policies
- ✅ Homepage loads prayer requests from `communitythreads` without errors

## Notes

- The homepage frontend has been updated to use the correct schema
- Prayer requests come from `communitythreads` where `category = 'Prayer'`
- Prayer tracking uses the existing `thread_prayers` table
- The `get_homepage_stats()` function now correctly counts from `communitythreads`
