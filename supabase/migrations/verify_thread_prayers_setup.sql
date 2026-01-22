-- ============================================================================
-- VERIFY: thread_prayers Table Setup
-- ============================================================================
-- 
-- This script verifies that the thread_prayers table exists and has proper
-- RLS policies for the homepage prayer tracking feature.
--
-- Run this in Supabase SQL Editor to check the setup:
-- https://supabase.com/dashboard/project/fychjnaxljwmgoptjsxn/sql/new
-- ============================================================================

-- Check if thread_prayers table exists and show its structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'thread_prayers'
ORDER BY ordinal_position;

-- Check RLS policies on thread_prayers
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE schemaname = 'public' 
  AND tablename = 'thread_prayers';

-- If thread_prayers doesn't have proper RLS, create them:
-- (Uncomment and run if needed)

/*
-- Enable RLS if not already enabled
ALTER TABLE public.thread_prayers ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can view prayer counts
CREATE POLICY IF NOT EXISTS "Anyone can view prayer counts"
    ON public.thread_prayers FOR SELECT
    USING (true);

-- Policy: Authenticated users can add prayers (user_id can be null for anonymous)
CREATE POLICY IF NOT EXISTS "Authenticated users can add prayers"
    ON public.thread_prayers FOR INSERT
    WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Grant permissions
GRANT SELECT, INSERT ON public.thread_prayers TO authenticated;
GRANT SELECT ON public.thread_prayers TO anon;
*/
