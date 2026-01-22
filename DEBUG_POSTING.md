# Quick Debug Guide: Posting Not Working

## Step 1: Check If You're Logged In

1. Open your web app
2. Look at the top right corner
3. Do you see your name/avatar? ✅ = Logged in
4. Do you see "Sign In" button? ❌ = Not logged in

**If not logged in:**
- Click "Sign In"
- Sign in with your account
- Try posting again

---

## Step 2: Check Browser Console for Errors

1. Open your web app
2. Press **F12** (or right-click → "Inspect")
3. Click the **"Console"** tab
4. Try to create a post
5. Look for **red error messages**

**Common errors you might see:**

### Error: "new row violates row-level security policy"
**Meaning:** RLS policy is blocking the insert
**Fix:** See Step 3 below

### Error: "permission denied for table communitythreads"
**Meaning:** RLS policy issue
**Fix:** See Step 3 below

### Error: "JWT expired" or "Invalid JWT"
**Meaning:** Your login session expired
**Fix:** Sign out and sign back in

### Error: "Database connection unavailable"
**Meaning:** Supabase client not initialized
**Fix:** Check environment variables

---

## Step 3: Quick Fix - Test RLS Policy

The RLS policy might be too strict. Let's create a simpler test policy:

1. Go to Supabase Dashboard
2. Go to **SQL Editor**
3. Run this test query:

```sql
-- Test if you can insert (replace YOUR_USER_ID with your actual user ID)
-- First, get your user ID from the users table
SELECT id, email FROM users WHERE email = 'your-email@example.com';

-- Then test insert (replace the userid with your actual ID)
INSERT INTO communitythreads (userid, title, content, category, privacy_level, is_anonymous)
VALUES (
  'YOUR_USER_ID_HERE',
  'Test Post',
  'This is a test post',
  'Prayer Requests',
  'public',
  false
);
```

**If this works:** The issue is in the frontend code
**If this fails:** The RLS policy needs to be fixed

---

## Step 4: Check RLS Policy in Dashboard

1. Go to Supabase Dashboard
2. Go to **Database** → **Policies**
3. Find `communitythreads` table
4. Look for policy: **"Authenticated users can create threads"**
5. Check if it's **Enabled** ✅

**If policy doesn't exist or is disabled:**
- We need to recreate it (I can help with this)

---

## Step 5: Common Issues & Quick Fixes

### Issue: "You don't have permission to create posts"
**Possible causes:**
- Not logged in
- RLS policy blocking
- User ID mismatch

**Quick fix:**
1. Sign out
2. Sign back in
3. Try again

### Issue: Nothing happens when clicking "Post"
**Possible causes:**
- JavaScript error
- Form validation failing
- Network issue

**Quick fix:**
1. Open browser console (F12)
2. Look for errors
3. Check Network tab for failed requests

### Issue: Post appears to work but doesn't show up
**Possible causes:**
- RLS blocking SELECT
- Feed not refreshing
- Wrong category filter

**Quick fix:**
1. Refresh the page
2. Check all categories (not just one)
3. Check browser console for errors

---

## What to Tell Me

When asking for help, please share:

1. **Are you logged in?** ✅/❌
2. **What error message do you see?** (Copy the exact text)
3. **Browser console errors:** (Copy any red errors)
4. **What happens when you click "Post"?**
   - Nothing happens?
   - Error message appears?
   - Loading spinner but then fails?

---

## Quick Test

Try this in your browser console (F12):

```javascript
// Check if you're logged in
const supabase = window.supabase || (await import('./lib/supabase-browser')).getSupabaseBrowserClient();
const { data: { user } } = await supabase.auth.getUser();
console.log('User:', user);

// If user exists, try to insert a test post
if (user) {
  const { data, error } = await supabase
    .from('communitythreads')
    .insert({
      userid: user.id,
      title: 'Test from Console',
      content: 'Testing if posting works',
      category: 'Prayer Requests',
      privacy_level: 'public',
      is_anonymous: false
    })
    .select();
  
  console.log('Result:', { data, error });
}
```

This will tell us exactly what's wrong!
