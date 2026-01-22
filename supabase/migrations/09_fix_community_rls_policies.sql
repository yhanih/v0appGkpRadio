-- =====================================================
-- Fix Community RLS Policies
-- Created: 2026-01-21
-- Purpose: Fix RLS policies to allow users to see their own likes/bookmarks
-- =====================================================

-- =====================================================
-- Fix COMMUNITY_THREAD_LIKES SELECT Policy
-- =====================================================

-- Drop and recreate the SELECT policy to allow users to see their own likes
DROP POLICY IF EXISTS "Like counts are viewable for public threads" ON community_thread_likes;

CREATE POLICY "Like counts are viewable for public threads"
ON community_thread_likes FOR SELECT
USING (
  -- Users can always see their own likes
  auth.uid() = user_id
  OR
  -- Anyone can see likes on public threads
  EXISTS (
    SELECT 1 FROM communitythreads
    WHERE communitythreads.id = community_thread_likes.thread_id
    AND (communitythreads.privacy_level = 'public' OR communitythreads.userid = auth.uid())
  )
);

-- =====================================================
-- Fix BOOKMARKS Policies (ensure authenticated only)
-- =====================================================

-- Drop and recreate bookmarks policies
DROP POLICY IF EXISTS "Users can view their own bookmarks" ON bookmarks;
DROP POLICY IF EXISTS "Users can create their own bookmarks" ON bookmarks;
DROP POLICY IF EXISTS "Users can delete their own bookmarks" ON bookmarks;

-- Policy: Authenticated users can view their own bookmarks
CREATE POLICY "Users can view their own bookmarks"
ON bookmarks FOR SELECT
USING (auth.uid() = userid);

-- Policy: Authenticated users can create their own bookmarks
CREATE POLICY "Users can create their own bookmarks"
ON bookmarks FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = userid);

-- Policy: Authenticated users can delete their own bookmarks
CREATE POLICY "Users can delete their own bookmarks"
ON bookmarks FOR DELETE
TO authenticated
USING (auth.uid() = userid);
