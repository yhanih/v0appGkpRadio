# Verify Database Migrations

## ✅ Migration Status

You've successfully run the migrations! "No rows returned" is normal for DDL statements.

## Verification Steps

Run these queries in Supabase SQL Editor to verify everything is set up correctly:

### 1. Verify Tables Exist

```sql
-- Check if community_thread_likes table exists
SELECT table_name, table_schema 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('community_thread_likes', 'savedthreads');
```

**Expected:** Should return 2 rows (one for each table)

### 2. Verify RLS Policies

```sql
-- Check RLS policies for community_thread_likes
SELECT policyname, cmd, roles
FROM pg_policies
WHERE schemaname = 'public' 
  AND tablename = 'community_thread_likes';
```

**Expected:** Should show 2 policies (SELECT and ALL for authenticated users)

```sql
-- Check RLS policies for savedthreads
SELECT policyname, cmd, roles
FROM pg_policies
WHERE schemaname = 'public' 
  AND tablename = 'savedthreads';
```

**Expected:** Should show 2 policies (SELECT and ALL for authenticated users)

### 3. Verify Indexes

```sql
-- Check indexes on community_thread_likes
SELECT indexname, indexdef
FROM pg_indexes
WHERE schemaname = 'public' 
  AND tablename = 'community_thread_likes';
```

**Expected:** Should show 3 indexes (thread_id, user_id, created_at)

```sql
-- Check indexes on savedthreads
SELECT indexname, indexdef
FROM pg_indexes
WHERE schemaname = 'public' 
  AND tablename = 'savedthreads';
```

**Expected:** Should show 3 indexes (userid, threadid, createdat)

### 4. Verify Triggers

```sql
-- Check if like count trigger exists
SELECT trigger_name, event_manipulation, event_object_table
FROM information_schema.triggers
WHERE trigger_schema = 'public'
  AND trigger_name = 'trigger_update_thread_like_count';
```

**Expected:** Should return 1 row

## Next Steps

### 1. Enable Supabase Realtime (REQUIRED for real-time updates)

1. Go to Supabase Dashboard
2. Navigate to: **Database** → **Replication**
3. Find `community_thread_likes` table
4. Toggle **ON** the replication switch
5. Click **Save**

This enables real-time like count updates across all users.

### 2. Test the Features

Open your Community page and test:

- [ ] **Like Button**: Click heart icon - should toggle and update count
- [ ] **Unlike Button**: Click again - should toggle back
- [ ] **Share Button**: Click share icon - should open share dialog or copy link
- [ ] **Bookmark Button**: Click bookmark icon - icon should fill when saved
- [ ] **Comment Button**: Click comment icon - should navigate
- [ ] **Prayer Button**: Should still work as before

### 3. Test Real-time Updates

1. Open Community page in two different browsers (or incognito + regular)
2. Sign in with different accounts
3. Like a post in one browser
4. Watch the like count update in real-time in the other browser

## Troubleshooting

### If tables don't exist:
- Re-run the migration SQL files
- Check for any error messages

### If RLS policies are missing:
- Re-run the migration SQL files
- Check that RLS is enabled: `ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;`

### If real-time doesn't work:
- Verify Realtime is enabled in Supabase Dashboard
- Check browser console for WebSocket connection errors
- Ensure you're using authenticated Supabase client

### If buttons don't work:
- Check browser console for errors
- Verify user is authenticated
- Check that Supabase client is initialized correctly

## Success Indicators

✅ Tables created successfully  
✅ RLS policies active  
✅ Indexes created  
✅ Triggers working  
✅ Realtime enabled  
✅ All buttons functional  
✅ Real-time updates working  

Your Community page should now work like Instagram! 🎉
