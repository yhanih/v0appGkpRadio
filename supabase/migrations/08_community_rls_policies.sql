-- =====================================================
-- Community Feature RLS Policies
-- Created: 2026-01-21
-- Purpose: Enable Row Level Security for all Community tables
-- Note: This script safely handles existing policies
-- =====================================================

-- =====================================================
-- 1. COMMUNITYTHREADS TABLE
-- =====================================================

-- Enable RLS
ALTER TABLE communitythreads ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (safe to run multiple times)
DROP POLICY IF EXISTS "Public threads are viewable by everyone" ON communitythreads;
DROP POLICY IF EXISTS "Authenticated users can create threads" ON communitythreads;
DROP POLICY IF EXISTS "Users can update their own threads" ON communitythreads;
DROP POLICY IF EXISTS "Users can delete their own threads" ON communitythreads;
DROP POLICY IF EXISTS "Admins have full access to threads" ON communitythreads;

-- Policy: Anyone can read public threads
CREATE POLICY "Public threads are viewable by everyone"
ON communitythreads FOR SELECT
USING (privacy_level = 'public' OR auth.uid() = userid);

-- Policy: Authenticated users can create threads
CREATE POLICY "Authenticated users can create threads"
ON communitythreads FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = userid);

-- Policy: Users can update their own threads
CREATE POLICY "Users can update their own threads"
ON communitythreads FOR UPDATE
TO authenticated
USING (auth.uid() = userid)
WITH CHECK (auth.uid() = userid);

-- Policy: Users can delete their own threads
CREATE POLICY "Users can delete their own threads"
ON communitythreads FOR DELETE
TO authenticated
USING (auth.uid() = userid);

-- Policy: Admins can do everything
CREATE POLICY "Admins have full access to threads"
ON communitythreads FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'admin'
  )
);

-- =====================================================
-- 2. COMMUNITYCOMMENTS TABLE
-- =====================================================

-- Enable RLS
ALTER TABLE communitycomments ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Comments on public threads are viewable" ON communitycomments;
DROP POLICY IF EXISTS "Authenticated users can create comments" ON communitycomments;
DROP POLICY IF EXISTS "Users can update their own comments" ON communitycomments;
DROP POLICY IF EXISTS "Users can delete their own comments" ON communitycomments;
DROP POLICY IF EXISTS "Admins have full access to comments" ON communitycomments;

-- Policy: Anyone can read comments on public threads
CREATE POLICY "Comments on public threads are viewable"
ON communitycomments FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM communitythreads
    WHERE communitythreads.id = communitycomments.threadid
    AND (communitythreads.privacy_level = 'public' OR communitythreads.userid = auth.uid())
  )
);

-- Policy: Authenticated users can create comments
CREATE POLICY "Authenticated users can create comments"
ON communitycomments FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = userid);

-- Policy: Users can update their own comments
CREATE POLICY "Users can update their own comments"
ON communitycomments FOR UPDATE
TO authenticated
USING (auth.uid() = userid)
WITH CHECK (auth.uid() = userid);

-- Policy: Users can delete their own comments
CREATE POLICY "Users can delete their own comments"
ON communitycomments FOR DELETE
TO authenticated
USING (auth.uid() = userid);

-- Policy: Admins can do everything
CREATE POLICY "Admins have full access to comments"
ON communitycomments FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'admin'
  )
);

-- =====================================================
-- 3. THREAD_PRAYERS TABLE
-- =====================================================

-- Enable RLS
ALTER TABLE thread_prayers ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Prayer counts are viewable for public threads" ON thread_prayers;
DROP POLICY IF EXISTS "Authenticated users can add prayers" ON thread_prayers;
DROP POLICY IF EXISTS "Users can remove their own prayers" ON thread_prayers;

-- Policy: Anyone can read prayer counts (for public threads)
CREATE POLICY "Prayer counts are viewable for public threads"
ON thread_prayers FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM communitythreads
    WHERE communitythreads.id = thread_prayers.thread_id
    AND (communitythreads.privacy_level = 'public' OR communitythreads.userid = auth.uid())
  )
);

-- Policy: Authenticated users can add prayers
CREATE POLICY "Authenticated users can add prayers"
ON thread_prayers FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Policy: Users can remove their own prayers
CREATE POLICY "Users can remove their own prayers"
ON thread_prayers FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Policy: Prevent duplicate prayers (enforced by unique constraint if exists)
-- Note: Frontend handles duplicate errors, but we can add a unique constraint
CREATE UNIQUE INDEX IF NOT EXISTS thread_prayers_user_thread_unique 
ON thread_prayers(user_id, thread_id);

-- =====================================================
-- 4. COMMUNITY_THREAD_LIKES TABLE
-- =====================================================

-- Enable RLS
ALTER TABLE community_thread_likes ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Like counts are viewable for public threads" ON community_thread_likes;
DROP POLICY IF EXISTS "Authenticated users can like threads" ON community_thread_likes;
DROP POLICY IF EXISTS "Users can unlike threads" ON community_thread_likes;

-- Policy: Anyone can read like counts (for public threads), users can see their own likes
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

-- Policy: Authenticated users can like threads
CREATE POLICY "Authenticated users can like threads"
ON community_thread_likes FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Policy: Users can unlike threads (remove their own likes)
CREATE POLICY "Users can unlike threads"
ON community_thread_likes FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Policy: Prevent duplicate likes (enforced by unique constraint)
CREATE UNIQUE INDEX IF NOT EXISTS community_thread_likes_user_thread_unique 
ON community_thread_likes(user_id, thread_id);

-- =====================================================
-- 5. BOOKMARKS TABLE
-- =====================================================

-- Enable RLS
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own bookmarks" ON bookmarks;
DROP POLICY IF EXISTS "Users can create their own bookmarks" ON bookmarks;
DROP POLICY IF EXISTS "Users can delete their own bookmarks" ON bookmarks;

-- Policy: Users can only view their own bookmarks (anon can't see any)
CREATE POLICY "Users can view their own bookmarks"
ON bookmarks FOR SELECT
USING (
  -- Authenticated users can see their own bookmarks
  (auth.uid() = userid)
);

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

-- Policy: Prevent duplicate bookmarks for same content
CREATE UNIQUE INDEX IF NOT EXISTS bookmarks_user_content_unique 
ON bookmarks(userid, content_id, content_type);

-- =====================================================
-- VERIFICATION QUERIES (Optional - run these to test)
-- =====================================================

-- Uncomment these to test the policies:

-- Test 1: Check if RLS is enabled
-- SELECT tablename, rowsecurity 
-- FROM pg_tables 
-- WHERE schemaname = 'public' 
-- AND tablename IN ('communitythreads', 'communitycomments', 'thread_prayers', 'community_thread_likes', 'bookmarks');

-- Test 2: Check all policies
-- SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
-- FROM pg_policies 
-- WHERE tablename IN ('communitythreads', 'communitycomments', 'thread_prayers', 'community_thread_likes', 'bookmarks')
-- ORDER BY tablename, policyname;
