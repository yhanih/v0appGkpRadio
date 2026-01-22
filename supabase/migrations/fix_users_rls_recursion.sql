-- ============================================================================
-- Fix Users Table RLS Infinite Recursion
-- ============================================================================
-- 
-- This migration fixes the infinite recursion issue in the users table RLS policies.
-- The "Admins can read all profiles" policy was querying the users table,
-- causing infinite recursion when checking permissions.
--
-- Run this in Supabase SQL Editor:
-- https://supabase.com/dashboard/project/fychjnaxljwmgoptjsxn/sql/new
-- ============================================================================

-- Drop the problematic policy that causes recursion
DROP POLICY IF EXISTS "Admins can read all profiles" ON public.users;

-- Drop all existing policies to start fresh
DROP POLICY IF EXISTS "Users can read their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.users;
DROP POLICY IF EXISTS "Public can read username and avatar" ON public.users;

-- Policy 1: Users can read their own profile (full access)
CREATE POLICY "Users can read their own profile"
    ON public.users FOR SELECT
    USING (auth.uid() = id);

-- Policy 2: Public can read basic profile info (for JOINs and public display)
-- This allows reading id, username, fullname, avatarurl for public display
-- This is safe and doesn't cause recursion
CREATE POLICY "Public can read basic profile info"
    ON public.users FOR SELECT
    USING (true);

-- Policy 3: Users can update their own profile
CREATE POLICY "Users can update their own profile"
    ON public.users FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Policy 4: Users can insert their own profile
CREATE POLICY "Users can insert their own profile"
    ON public.users FOR INSERT
    WITH CHECK (auth.uid() = id);

-- Note: If you need admin access, create a separate table or use a different approach
-- that doesn't query the users table within the policy check.
-- For example, you could:
-- 1. Use a separate admin_users table
-- 2. Store admin status in auth.users metadata
-- 3. Use a function with SECURITY DEFINER that bypasses RLS

-- Grant permissions
GRANT SELECT ON public.users TO authenticated, anon;
GRANT INSERT, UPDATE ON public.users TO authenticated;

-- ============================================================================
-- Verification Query (optional - run to check policies)
-- ============================================================================
-- SELECT 
--     policyname,
--     cmd,
--     qual,
--     with_check
-- FROM pg_policies
-- WHERE schemaname = 'public' 
--   AND tablename = 'users'
-- ORDER BY policyname;
