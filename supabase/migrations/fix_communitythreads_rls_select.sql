-- ============================================================================
-- Fix communitythreads RLS SELECT Policy
-- ============================================================================
-- 
-- This migration fixes the SELECT policy to allow reading all threads,
-- not just those with privacy_level = 'public'. This ensures the feed
-- works correctly even if privacy_level is NULL or has other values.
--
-- Run this in Supabase SQL Editor:
-- https://supabase.com/dashboard/project/fychjnaxljwmgoptjsxn/sql/new
-- ============================================================================

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Anyone can read public threads" ON public.communitythreads;
DROP POLICY IF EXISTS "Anyone can read threads" ON public.communitythreads;

-- Create a more permissive policy that allows reading all threads
-- (You can restrict this later if needed for private threads)
CREATE POLICY "Anyone can read threads"
    ON public.communitythreads FOR SELECT
    USING (true);

-- Alternative: If you want to allow public threads OR threads where user is the author
-- Uncomment this instead of the above:
/*
CREATE POLICY "Anyone can read threads"
    ON public.communitythreads FOR SELECT
    USING (
        privacy_level = 'public' 
        OR privacy_level IS NULL
        OR auth.uid() = userid
    );
*/
