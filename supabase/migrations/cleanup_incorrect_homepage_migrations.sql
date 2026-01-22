-- ============================================================================
-- CLEANUP: Remove Incorrect Homepage Migrations
-- ============================================================================
-- 
-- This migration removes the incorrectly created table and function:
-- - prayercircle_prayers table (wrong - should use thread_prayers)
-- - pray_for_request function (wrong - references wrong table)
--
-- The correct schema uses:
-- - communitythreads table for prayer requests (category = 'Prayer')
-- - thread_prayers table for tracking prayers on threads
--
-- Run this in Supabase SQL Editor:
-- https://supabase.com/dashboard/project/fychjnaxljwmgoptjsxn/sql/new
-- ============================================================================

-- Drop the incorrect RPC function first (it references the table)
DROP FUNCTION IF EXISTS public.pray_for_request(UUID);

-- Drop the incorrect table
DROP TABLE IF EXISTS public.prayercircle_prayers CASCADE;

-- ============================================================================
-- Fix get_homepage_stats function to use correct schema
-- ============================================================================

CREATE OR REPLACE FUNCTION get_homepage_stats()
RETURNS JSON AS $$
DECLARE
  result JSON;
  prayer_count INTEGER;
BEGIN
  -- Count prayer requests from communitythreads where category = 'Prayer'
  SELECT COUNT(*) INTO prayer_count 
  FROM communitythreads 
  WHERE category = 'Prayer';
  
  SELECT json_build_object(
    'community_members', (SELECT COUNT(*) FROM users),
    'discussions', (SELECT COUNT(*) FROM communitythreads),
    'prayer_requests', prayer_count,
    'community_support', '24/7'
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated and anon users
GRANT EXECUTE ON FUNCTION get_homepage_stats() TO authenticated, anon;

-- ============================================================================
-- Verification: Confirm cleanup
-- ============================================================================

-- Verify table is dropped (should return 0 rows)
-- SELECT table_name FROM information_schema.tables 
-- WHERE table_schema = 'public' AND table_name = 'prayercircle_prayers';

-- Verify function is dropped (should return 0 rows)
-- SELECT routine_name FROM information_schema.routines 
-- WHERE routine_schema = 'public' AND routine_name = 'pray_for_request';

-- Verify get_homepage_stats function exists and works
-- SELECT get_homepage_stats();
