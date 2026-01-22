-- ============================================================================
-- Create community_thread_likes Table
-- ============================================================================
-- 
-- This migration creates the community_thread_likes table for tracking likes
-- on community threads, similar to Instagram's like functionality.
--
-- Run this in Supabase SQL Editor:
-- https://supabase.com/dashboard/project/fychjnaxljwmgoptjsxn/sql/new
-- ============================================================================

-- Create community_thread_likes table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.community_thread_likes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    thread_id UUID NOT NULL REFERENCES communitythreads(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(thread_id, user_id)
);

-- Enable RLS
ALTER TABLE public.community_thread_likes ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Anyone can view likes" ON public.community_thread_likes;
DROP POLICY IF EXISTS "Users can manage their own likes" ON public.community_thread_likes;

-- Policy: Anyone can view likes
CREATE POLICY "Anyone can view likes"
    ON public.community_thread_likes FOR SELECT
    USING (true);

-- Policy: Users can manage their own likes
CREATE POLICY "Users can manage their own likes"
    ON public.community_thread_likes FOR ALL
    USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_thread_likes_thread ON community_thread_likes(thread_id);
CREATE INDEX IF NOT EXISTS idx_thread_likes_user ON community_thread_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_thread_likes_created ON community_thread_likes(created_at DESC);

-- Grant permissions
GRANT SELECT, INSERT, DELETE ON public.community_thread_likes TO authenticated;
GRANT SELECT ON public.community_thread_likes TO anon;

-- ============================================================================
-- Optional: Create trigger to update like_count on communitythreads
-- ============================================================================
-- This ensures like_count stays in sync automatically

-- Function to update like count
CREATE OR REPLACE FUNCTION update_thread_like_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE communitythreads 
        SET like_count = COALESCE(like_count, 0) + 1 
        WHERE id = NEW.thread_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE communitythreads 
        SET like_count = GREATEST(COALESCE(like_count, 0) - 1, 0) 
        WHERE id = OLD.thread_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger if it doesn't exist
DROP TRIGGER IF EXISTS trigger_update_thread_like_count ON public.community_thread_likes;
CREATE TRIGGER trigger_update_thread_like_count
    AFTER INSERT OR DELETE ON public.community_thread_likes
    FOR EACH ROW
    EXECUTE FUNCTION update_thread_like_count();

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
--   AND tablename = 'community_thread_likes'
-- ORDER BY policyname;
