-- ============================================================================
-- Add Validation Constraints for communitythreads Table
-- ============================================================================
-- 
-- This migration adds server-side validation constraints to enforce data integrity
-- at the database level for title length, content length, and category values.
--
-- Run this in Supabase SQL Editor:
-- https://supabase.com/dashboard/project/fychjnaxljwmgoptjsxn/sql/new
-- ============================================================================

-- Title length validation (1-100 characters)
ALTER TABLE public.communitythreads
DROP CONSTRAINT IF EXISTS check_title_length;

ALTER TABLE public.communitythreads
ADD CONSTRAINT check_title_length 
CHECK (char_length(title) >= 1 AND char_length(title) <= 100);

-- Content length validation (1-1000 characters)
ALTER TABLE public.communitythreads
DROP CONSTRAINT IF EXISTS check_content_length;

ALTER TABLE public.communitythreads
ADD CONSTRAINT check_content_length 
CHECK (char_length(content) >= 1 AND char_length(content) <= 1000);

-- Category validation (must be one of allowed categories)
ALTER TABLE public.communitythreads
DROP CONSTRAINT IF EXISTS check_category_valid;

ALTER TABLE public.communitythreads
ADD CONSTRAINT check_category_valid
CHECK (category IN (
  'Prayers', 
  'Testimonies', 
  'Praise', 
  'Encourage', 
  'Born Again', 
  'Youth', 
  'Hobbies', 
  'Health', 
  'Finances', 
  'Family', 
  'Children', 
  'To My Wife', 
  'To My Husband', 
  'Prayer Requests', 
  'Youth Voices',
  'Pray for Others', 
  'Praise & Worship', 
  'Sharing Hobbies',
  'Words of Encouragement', 
  'Bragging on My Child (ren)'
));

-- ============================================================================
-- Verification Query (optional - run to check constraints)
-- ============================================================================
-- SELECT 
--     conname AS constraint_name,
--     pg_get_constraintdef(oid) AS constraint_definition
-- FROM pg_constraint
-- WHERE conrelid = 'public.communitythreads'::regclass
--   AND conname LIKE 'check_%'
-- ORDER BY conname;
