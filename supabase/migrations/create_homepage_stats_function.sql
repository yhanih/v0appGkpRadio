-- Create RPC function to get homepage stats efficiently
-- Handles case where is_testimony column may not exist
CREATE OR REPLACE FUNCTION get_homepage_stats()
RETURNS JSON AS $$
DECLARE
  result JSON;
  prayer_count INTEGER;
BEGIN
  -- Count prayer requests (handle optional is_testimony column)
  BEGIN
    SELECT COUNT(*) INTO prayer_count 
    FROM prayercircles 
    WHERE is_testimony = false OR is_testimony IS NULL;
  EXCEPTION WHEN undefined_column THEN
    -- If is_testimony doesn't exist, count all prayercircles
    SELECT COUNT(*) INTO prayer_count FROM prayercircles;
  END;
  
  SELECT json_build_object(
    'community_members', (SELECT COUNT(*) FROM users),
    'discussions', (SELECT COUNT(*) FROM communitythreads),
    'prayer_requests', prayer_count,
    'community_support', '24/7'
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated and anon users
GRANT EXECUTE ON FUNCTION get_homepage_stats() TO authenticated, anon;
