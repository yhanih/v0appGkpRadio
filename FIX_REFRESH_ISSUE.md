# Fix: Data Disappears After Refresh

## Problem
- Data loads correctly on first visit
- After page refresh, app shows empty state
- Clearing cookies/site data restores functionality

## Root Causes Fixed

### 1. **CommunityFeed Fetching Before Auth Ready** ✅ FIXED
**Issue:** CommunityFeed was trying to fetch data before authentication finished loading
**Fix:** Added check to wait for `authLoading` to be false before fetching

### 2. **Supabase Client Not Ready on Refresh** ✅ FIXED
**Issue:** On refresh, Supabase client might not be initialized yet
**Fix:** Added retry logic (3 retries with 500ms delay)

### 3. **Session Validation Too Aggressive** ✅ FIXED
**Issue:** Session validation was clearing valid sessions on network errors
**Fix:** Made validation less aggressive - only clears on critical errors, adds 5-minute buffer for expiration

---

## Changes Made

### File: `components/community-feed.tsx`
1. ✅ Added `authLoading` check from `useAuth()`
2. ✅ Wait for auth to finish before fetching threads
3. ✅ Added retry logic for Supabase client initialization
4. ✅ Better logging to track fetch timing

### File: `lib/supabase-browser.ts`
1. ✅ Made session validation less aggressive
2. ✅ Added 5-minute buffer for session expiration
3. ✅ Don't clear session on network errors
4. ✅ Better logging

---

## How to Test

1. **First Load:**
   - Open app → Data should load ✅

2. **Refresh:**
   - Press F5 or Cmd+R
   - Data should still load ✅
   - Check console for: `[CommunityFeed] Fetching threads...`

3. **Multiple Refreshes:**
   - Refresh 3-5 times
   - Data should load every time ✅

4. **Check Console:**
   - Should see: `[AuthContext] Session restored`
   - Should see: `[CommunityFeed] Fetching threads...`
   - Should NOT see: `Supabase client is null`

---

## If Issue Persists

Check browser console for:

1. **Auth Issues:**
   - `[AuthContext] Error restoring session`
   - `[SupabaseClient] Session expired`

2. **Client Issues:**
   - `Supabase client is null`
   - `Supabase client not ready`

3. **Network Issues:**
   - Failed network requests
   - CORS errors

**Share the console output and I'll help fix it!**

---

## Additional Debugging

If still having issues, add this to browser console:

```javascript
// Check session
const { createClient } = await import('@supabase/supabase-js');
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);
const { data: { session } } = await supabase.auth.getSession();
console.log('Session:', session);

// Check localStorage
console.log('localStorage keys:', Object.keys(localStorage).filter(k => k.includes('supabase')));
```

---

**Last Updated:** 2026-01-21
