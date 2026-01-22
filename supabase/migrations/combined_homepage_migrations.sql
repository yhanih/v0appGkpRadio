-- Combined Homepage Backend Migrations
-- Run this entire file in Supabase SQL Editor
-- https://supabase.com/dashboard/project/fychjnaxljwmgoptjsxn/sql/new

-- ============================================================================
-- Migration 1: Create prayercircle_prayers table
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.prayercircle_prayers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    prayercircle_id UUID NOT NULL REFERENCES public.prayercircles(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(prayercircle_id, user_id)
);

ALTER TABLE public.prayercircle_prayers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view prayer counts" ON public.prayercircle_prayers;
CREATE POLICY "Anyone can view prayer counts"
    ON public.prayercircle_prayers FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Authenticated users can add prayers" ON public.prayercircle_prayers;
CREATE POLICY "Authenticated users can add prayers"
    ON public.prayercircle_prayers FOR INSERT
    WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE INDEX IF NOT EXISTS idx_prayercircle_prayers_prayercircle ON public.prayercircle_prayers(prayercircle_id);
CREATE INDEX IF NOT EXISTS idx_prayercircle_prayers_user ON public.prayercircle_prayers(user_id);

GRANT SELECT, INSERT ON public.prayercircle_prayers TO authenticated;
GRANT SELECT ON public.prayercircle_prayers TO anon;

-- ============================================================================
-- Migration 2: Create pray_for_request RPC function
-- ============================================================================

CREATE OR REPLACE FUNCTION pray_for_request(prayercircle_id UUID)
RETURNS JSON AS $$
DECLARE
  current_user_id UUID;
  prayer_count INTEGER;
  result JSON;
BEGIN
  current_user_id := auth.uid();
  
  INSERT INTO prayercircle_prayers (prayercircle_id, user_id)
  VALUES (prayercircle_id, current_user_id)
  ON CONFLICT (prayercircle_id, user_id) DO NOTHING;
  
  SELECT COUNT(*) INTO prayer_count
  FROM prayercircle_prayers
  WHERE prayercircle_id = pray_for_request.prayercircle_id;
  
  SELECT json_build_object(
    'success', true,
    'prayer_count', prayer_count,
    'user_prayed', current_user_id IS NOT NULL
  ) INTO result;
  
  RETURN result;
EXCEPTION
  WHEN OTHERS THEN
    SELECT json_build_object(
      'success', false,
      'error', SQLERRM
    ) INTO result;
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION pray_for_request(UUID) TO authenticated, anon;

-- ============================================================================
-- Migration 3: Create get_homepage_stats RPC function (optional)
-- ============================================================================

CREATE OR REPLACE FUNCTION get_homepage_stats()
RETURNS JSON AS $$
DECLARE
  result JSON;
  prayer_count INTEGER;
BEGIN
  BEGIN
    SELECT COUNT(*) INTO prayer_count 
    FROM prayercircles 
    WHERE is_testimony = false OR is_testimony IS NULL;
  EXCEPTION WHEN undefined_column THEN
    SELECT COUNT(*) INTO prayer_count FROM prayercircles;
  END;
  
  SELECT json_build_object(
    'community_members', (SELECT COUNT(*) FROM users),
    'discussions', (SELECT COUNT(*) FROM communitythreads),
    'prayer_requests', prayer_count,
    'community_support', '24/7'
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION get_homepage_stats() TO authenticated, anon;

-- ============================================================================
-- Verification Queries (run these after migrations to confirm success)
-- ============================================================================

-- Check table exists
-- SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'prayercircle_prayers';

-- Check functions exist
-- SELECT routine_name FROM information_schema.routines WHERE routine_schema = 'public' AND routine_name IN ('pray_for_request', 'get_homepage_stats');

-- Test pray_for_request (will fail if prayercircle_id doesn't exist, but function should exist)
-- SELECT pray_for_request('00000000-0000-0000-0000-000000000000'::UUID);
