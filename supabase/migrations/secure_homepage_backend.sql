-- ============================================================================
-- Secure Homepage Backend Migration
-- ============================================================================
-- 
-- This migration implements comprehensive security for the homepage backend:
-- - RLS policies for thread_prayers, contactmessages, newslettersubscribers
-- - Rate limiting for prayer tracking
-- - Input validation constraints
-- - Foreign key constraints
-- - Performance indexes
--
-- Run this in Supabase SQL Editor:
-- https://supabase.com/dashboard/project/fychjnaxljwmgoptjsxn/sql/new
-- ============================================================================

-- ============================================================================
-- 1. RLS POLICIES FOR thread_prayers
-- ============================================================================

-- Enable RLS if not already enabled
ALTER TABLE IF EXISTS public.thread_prayers ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Anyone can view prayer counts" ON public.thread_prayers;
DROP POLICY IF EXISTS "Authenticated users can add prayers" ON public.thread_prayers;
DROP POLICY IF EXISTS "Users can only insert prayers with their own user_id or null" ON public.thread_prayers;

-- Policy: Anyone can view prayer counts (SELECT)
CREATE POLICY "Anyone can view prayer counts"
    ON public.thread_prayers FOR SELECT
    USING (true);

-- Policy: Users can only insert prayers with their own user_id or null (INSERT)
CREATE POLICY "Users can only insert prayers with their own user_id or null"
    ON public.thread_prayers FOR INSERT
    WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Grant permissions
GRANT SELECT, INSERT ON public.thread_prayers TO authenticated;
GRANT SELECT ON public.thread_prayers TO anon;

-- Unique constraint: Prevent duplicate prayers per user per thread
-- Note: This assumes thread_prayers has columns: id, thread_id, user_id, created_at
-- If the table structure differs, adjust accordingly
DO $$
BEGIN
    -- Check if unique constraint already exists
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'thread_prayers_thread_user_unique'
    ) THEN
        -- Create unique constraint if user_id is NOT NULL
        -- For anonymous prayers (user_id IS NULL), allow multiple per thread
        CREATE UNIQUE INDEX IF NOT EXISTS thread_prayers_thread_user_unique 
        ON public.thread_prayers (thread_id, user_id) 
        WHERE user_id IS NOT NULL;
    END IF;
END $$;

-- ============================================================================
-- 2. RATE LIMITING FOR PRAYER TRACKING
-- ============================================================================

-- First, ensure thread_prayers has a timestamp column for rate limiting
-- Add created_at column if it doesn't exist
DO $$
BEGIN
    -- Check if created_at exists, if not check for createdat, if neither exists add created_at
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'thread_prayers' 
        AND column_name = 'created_at'
    ) AND NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'thread_prayers' 
        AND column_name = 'createdat'
    ) THEN
        -- Add created_at column with default timestamp
        ALTER TABLE public.thread_prayers 
        ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();
    END IF;
END $$;

-- Function: Check prayer rate limit (max 10 prayers per minute per user)
CREATE OR REPLACE FUNCTION check_prayer_rate_limit(p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    prayer_count INTEGER;
    time_window TIMESTAMPTZ;
    timestamp_col TEXT;
BEGIN
    -- Get time window (1 minute ago)
    time_window := NOW() - INTERVAL '1 minute';
    
    -- Determine which timestamp column to use
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'thread_prayers' 
        AND column_name = 'created_at'
    ) THEN
        timestamp_col := 'created_at';
    ELSIF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'thread_prayers' 
        AND column_name = 'createdat'
    ) THEN
        timestamp_col := 'createdat';
    ELSE
        -- Fallback: no time-based limiting, just count total
        SELECT COUNT(*) INTO prayer_count
        FROM public.thread_prayers
        WHERE (p_user_id IS NULL AND user_id IS NULL OR user_id = p_user_id);
        RETURN prayer_count < 10;
    END IF;
    
    -- Count prayers in the last minute using dynamic SQL
    EXECUTE format('
        SELECT COUNT(*) 
        FROM public.thread_prayers
        WHERE %I >= $1
          AND ($2 IS NULL AND user_id IS NULL OR user_id = $2)',
        timestamp_col
    ) USING time_window, p_user_id INTO prayer_count;
    
    -- Return true if under limit (10), false if over limit
    RETURN prayer_count < 10;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger function: Enforce rate limiting before insert
CREATE OR REPLACE FUNCTION enforce_prayer_rate_limit()
RETURNS TRIGGER AS $$
DECLARE
    current_user_id UUID;
BEGIN
    -- Get current user ID (can be NULL for anonymous)
    current_user_id := COALESCE(NEW.user_id, auth.uid());
    
    -- Check rate limit
    IF NOT check_prayer_rate_limit(current_user_id) THEN
        RAISE EXCEPTION 'Rate limit exceeded: Maximum 10 prayers per minute allowed';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger if it doesn't exist
DROP TRIGGER IF EXISTS prayer_rate_limit_trigger ON public.thread_prayers;
CREATE TRIGGER prayer_rate_limit_trigger
    BEFORE INSERT ON public.thread_prayers
    FOR EACH ROW
    EXECUTE FUNCTION enforce_prayer_rate_limit();

-- ============================================================================
-- 3. INPUT VALIDATION FOR contactmessages
-- ============================================================================

-- Enable RLS if not already enabled
ALTER TABLE IF EXISTS public.contactmessages ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can insert contact messages" ON public.contactmessages;
DROP POLICY IF EXISTS "Admins can view contact messages" ON public.contactmessages;

-- Policy: Anyone can INSERT contact messages
CREATE POLICY "Anyone can insert contact messages"
    ON public.contactmessages FOR INSERT
    WITH CHECK (true);

-- Policy: Only admins can SELECT contact messages
-- Note: Adjust this based on your admin role structure
CREATE POLICY "Admins can view contact messages"
    ON public.contactmessages FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE id = auth.uid()
            AND (role = 'admin' OR role = 'moderator')
        )
    );

-- Add email format validation constraint (if column exists)
DO $$
BEGIN
    -- Add check constraint for email format if email column exists
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'contactmessages' 
        AND column_name = 'email'
    ) THEN
        -- Drop existing constraint if it exists
        ALTER TABLE public.contactmessages 
        DROP CONSTRAINT IF EXISTS contactmessages_email_format_check;
        
        -- Add email format validation
        ALTER TABLE public.contactmessages 
        ADD CONSTRAINT contactmessages_email_format_check 
        CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');
    END IF;
    
    -- Add length constraints if columns exist
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'contactmessages' 
        AND column_name = 'message'
    ) THEN
        ALTER TABLE public.contactmessages 
        DROP CONSTRAINT IF EXISTS contactmessages_message_length_check;
        
        ALTER TABLE public.contactmessages 
        ADD CONSTRAINT contactmessages_message_length_check 
        CHECK (LENGTH(message) <= 5000);
    END IF;
    
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'contactmessages' 
        AND column_name = 'subject'
    ) THEN
        ALTER TABLE public.contactmessages 
        DROP CONSTRAINT IF EXISTS contactmessages_subject_length_check;
        
        ALTER TABLE public.contactmessages 
        ADD CONSTRAINT contactmessages_subject_length_check 
        CHECK (LENGTH(subject) <= 200);
    END IF;
END $$;

-- ============================================================================
-- 4. INPUT VALIDATION FOR newslettersubscribers
-- ============================================================================

-- Enable RLS if not already enabled
ALTER TABLE IF EXISTS public.newslettersubscribers ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can insert newsletter subscriptions" ON public.newslettersubscribers;
DROP POLICY IF EXISTS "Admins can view newsletter subscriptions" ON public.newslettersubscribers;

-- Policy: Anyone can INSERT newsletter subscriptions
CREATE POLICY "Anyone can insert newsletter subscriptions"
    ON public.newslettersubscribers FOR INSERT
    WITH CHECK (true);

-- Policy: Only admins can SELECT newsletter subscriptions
CREATE POLICY "Admins can view newsletter subscriptions"
    ON public.newslettersubscribers FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE id = auth.uid()
            AND (role = 'admin' OR role = 'moderator')
        )
    );

-- Add email format validation and unique constraint
DO $$
BEGIN
    -- Add email format validation if email column exists
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'newslettersubscribers' 
        AND column_name = 'email'
    ) THEN
        -- Drop existing constraints if they exist
        ALTER TABLE public.newslettersubscribers 
        DROP CONSTRAINT IF EXISTS newslettersubscribers_email_format_check;
        ALTER TABLE public.newslettersubscribers 
        DROP CONSTRAINT IF EXISTS newslettersubscribers_email_unique;
        
        -- Add email format validation
        ALTER TABLE public.newslettersubscribers 
        ADD CONSTRAINT newslettersubscribers_email_format_check 
        CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');
        
        -- Add unique constraint to prevent duplicate emails
        ALTER TABLE public.newslettersubscribers 
        ADD CONSTRAINT newslettersubscribers_email_unique 
        UNIQUE (email);
    END IF;
END $$;

-- ============================================================================
-- 5. PERFORMANCE INDEXES
-- ============================================================================

-- Index for rate limiting queries on thread_prayers
-- Check which timestamp column exists and create index accordingly
DO $$
BEGIN
    -- Check if created_at exists
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'thread_prayers' 
        AND column_name = 'created_at'
    ) THEN
        CREATE INDEX IF NOT EXISTS idx_thread_prayers_user_created 
        ON public.thread_prayers (user_id, created_at DESC) 
        WHERE user_id IS NOT NULL;
        
        CREATE INDEX IF NOT EXISTS idx_thread_prayers_anonymous_created 
        ON public.thread_prayers (created_at DESC) 
        WHERE user_id IS NULL;
    -- Check if createdat exists (no underscore)
    ELSIF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'thread_prayers' 
        AND column_name = 'createdat'
    ) THEN
        CREATE INDEX IF NOT EXISTS idx_thread_prayers_user_created 
        ON public.thread_prayers (user_id, createdat DESC) 
        WHERE user_id IS NOT NULL;
        
        CREATE INDEX IF NOT EXISTS idx_thread_prayers_anonymous_created 
        ON public.thread_prayers (createdat DESC) 
        WHERE user_id IS NULL;
    END IF;
END $$;

-- Index for thread_prayers lookups by thread_id
CREATE INDEX IF NOT EXISTS idx_thread_prayers_thread_id 
ON public.thread_prayers (thread_id);

-- Index for contactmessages admin queries
-- Check which timestamp column exists
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'contactmessages' 
        AND column_name = 'created_at'
    ) THEN
        CREATE INDEX IF NOT EXISTS idx_contactmessages_created 
        ON public.contactmessages (created_at DESC);
    ELSIF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'contactmessages' 
        AND column_name = 'createdat'
    ) THEN
        CREATE INDEX IF NOT EXISTS idx_contactmessages_created 
        ON public.contactmessages (createdat DESC);
    END IF;
END $$;

-- Index for newslettersubscribers email lookups
CREATE INDEX IF NOT EXISTS idx_newslettersubscribers_email 
ON public.newslettersubscribers (email);

-- ============================================================================
-- 6. FOREIGN KEY CONSTRAINTS (if applicable)
-- ============================================================================

-- Add foreign key constraint for thread_prayers.thread_id -> communitythreads.id
-- Only if the columns exist and constraint doesn't already exist
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'thread_prayers' 
        AND column_name = 'thread_id'
    ) AND EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'communitythreads'
    ) THEN
        -- Check if constraint already exists
        IF NOT EXISTS (
            SELECT 1 FROM pg_constraint 
            WHERE conname = 'thread_prayers_thread_id_fkey'
        ) THEN
            ALTER TABLE public.thread_prayers 
            ADD CONSTRAINT thread_prayers_thread_id_fkey 
            FOREIGN KEY (thread_id) 
            REFERENCES public.communitythreads(id) 
            ON DELETE CASCADE;
        END IF;
    END IF;
END $$;

-- ============================================================================
-- VERIFICATION QUERIES (for manual checking)
-- ============================================================================

-- Uncomment to verify RLS policies:
/*
SELECT schemaname, tablename, policyname, cmd 
FROM pg_policies 
WHERE tablename IN ('thread_prayers', 'contactmessages', 'newslettersubscribers')
ORDER BY tablename, policyname;
*/

-- Uncomment to verify constraints:
/*
SELECT conname, contype, conrelid::regclass 
FROM pg_constraint 
WHERE conrelid::regclass::text IN ('thread_prayers', 'contactmessages', 'newslettersubscribers')
ORDER BY conrelid::regclass::text, conname;
*/

-- Uncomment to verify indexes:
/*
SELECT tablename, indexname 
FROM pg_indexes 
WHERE tablename IN ('thread_prayers', 'contactmessages', 'newslettersubscribers')
ORDER BY tablename, indexname;
*/
