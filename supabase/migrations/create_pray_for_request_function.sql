-- Create RPC function to track prayer actions atomically
-- This function inserts a prayer action for a prayer request
-- and returns the updated prayer count
CREATE OR REPLACE FUNCTION pray_for_request(prayercircle_id UUID)
RETURNS JSON AS $$
DECLARE
  current_user_id UUID;
  prayer_count INTEGER;
  result JSON;
BEGIN
  -- Get current user ID (can be NULL for anonymous users)
  current_user_id := auth.uid();
  
  -- Insert prayer action (idempotent via UNIQUE constraint)
  -- Allow NULL user_id for anonymous prayers
  INSERT INTO prayercircle_prayers (prayercircle_id, user_id)
  VALUES (prayercircle_id, current_user_id)
  ON CONFLICT (prayercircle_id, user_id) DO NOTHING;
  
  -- Count total prayers for this request
  SELECT COUNT(*) INTO prayer_count
  FROM prayercircle_prayers
  WHERE prayercircle_id = pray_for_request.prayercircle_id;
  
  -- Return result
  SELECT json_build_object(
    'success', true,
    'prayer_count', prayer_count,
    'user_prayed', current_user_id IS NOT NULL
  ) INTO result;
  
  RETURN result;
EXCEPTION
  WHEN OTHERS THEN
    -- Return error
    SELECT json_build_object(
      'success', false,
      'error', SQLERRM
    ) INTO result;
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated and anon users
GRANT EXECUTE ON FUNCTION pray_for_request(UUID) TO authenticated, anon;
