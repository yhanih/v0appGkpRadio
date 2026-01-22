-- ============================================================================
-- Create savedthreads Table
-- ============================================================================
-- 
-- This migration creates the savedthreads table for bookmarking/saving
-- community threads, similar to Instagram's save functionality.
--
-- Run this in Supabase SQL Editor:
-- https://supabase.com/dashboard/project/fychjnaxljwmgoptjsxn/sql/new
-- ============================================================================

-- Create savedthreads table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.savedthreads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    userid UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    threadid UUID NOT NULL REFERENCES communitythreads(id) ON DELETE CASCADE,
    createdat TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(userid, threadid)
);

-- Enable RLS
ALTER TABLE public.savedthreads ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Users can view their own saved threads" ON public.savedthreads;
DROP POLICY IF EXISTS "Users can manage their own saved threads" ON public.savedthreads;

-- Policy: Users can view their own saved threads
CREATE POLICY "Users can view their own saved threads"
    ON public.savedthreads FOR SELECT
    USING (auth.uid() = userid);

-- Policy: Users can manage their own saved threads
CREATE POLICY "Users can manage their own saved threads"
    ON public.savedthreads FOR ALL
    USING (auth.uid() = userid);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_savedthreads_user ON savedthreads(userid);
CREATE INDEX IF NOT EXISTS idx_savedthreads_thread ON savedthreads(threadid);
CREATE INDEX IF NOT EXISTS idx_savedthreads_created ON savedthreads(createdat DESC);

-- Grant permissions
GRANT SELECT, INSERT, DELETE ON public.savedthreads TO authenticated;

-- ============================================================================
-- Verification Query (optional - run to check setup)
-- ============================================================================
-- SELECT 
--     schemaname,
--     tablename,
--     policyname,
--     permissive,
--     roles,
--     cmd
-- FROM pg_policies
-- WHERE schemaname = 'public' 
--   AND tablename = 'savedthreads'
-- ORDER BY policyname;
