-- ============================================================================
-- Add RLS Policies for communitythreads Table
-- ============================================================================
-- 
-- This migration adds Row Level Security policies for the communitythreads table
-- to ensure authenticated users can create posts and anyone can read public posts.
--
-- Run this in Supabase SQL Editor:
-- https://supabase.com/dashboard/project/fychjnaxljwmgoptjsxn/sql/new
-- ============================================================================

-- Enable RLS if not already enabled
ALTER TABLE IF EXISTS public.communitythreads ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Authenticated users can create threads" ON public.communitythreads;
DROP POLICY IF EXISTS "Anyone can read public threads" ON public.communitythreads;

-- Policy: Authenticated users can create threads
CREATE POLICY "Authenticated users can create threads"
    ON public.communitythreads FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = userid);

-- Policy: Anyone can read public threads
CREATE POLICY "Anyone can read public threads"
    ON public.communitythreads FOR SELECT
    USING (privacy_level = 'public');

-- Grant permissions
GRANT INSERT ON public.communitythreads TO authenticated;
GRANT SELECT ON public.communitythreads TO authenticated, anon;

-- ============================================================================
-- Verification Query (optional - run to check policies)
-- ============================================================================
-- SELECT 
--     schemaname,
--     tablename,
--     policyname,
--     permissive,
--     roles,
--     cmd,
--     qual,
--     with_check
-- FROM pg_policies
-- WHERE schemaname = 'public' 
--   AND tablename = 'communitythreads'
-- ORDER BY policyname;
