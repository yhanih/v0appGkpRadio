# How to Apply RLS Policies to Your Supabase Database

## Simple Step-by-Step Instructions

### Step 1: Open Supabase SQL Editor

1. Go to https://supabase.com
2. Sign in to your account
3. Select your **GKP Radio** project
4. In the left sidebar, click **"SQL Editor"**
5. Click **"New query"** (green button)

### Step 2: Copy the SQL Code

1. Open the file: `web-app/supabase/migrations/08_community_rls_policies.sql`
2. **Select ALL** the text (Ctrl+A or Cmd+A)
3. **Copy** it (Ctrl+C or Cmd+C)

### Step 3: Paste and Run

1. Go back to Supabase SQL Editor
2. **Paste** the code into the editor (Ctrl+V or Cmd+V)
3. Click **"Run"** button (or press Ctrl+Enter)

### Step 4: Wait for Success

You should see:
- ✅ **Success** message
- ✅ No errors
- ✅ All policies created

### Step 5: Verify It Worked

1. In Supabase Dashboard, go to **"Authentication"** → **"Policies"**
2. You should now see policies for:
   - ✅ `communitythreads` (5 policies)
   - ✅ `communitycomments` (5 policies)
   - ✅ `thread_prayers` (3 policies)
   - ✅ `community_thread_likes` (3 policies)
   - ✅ `bookmarks` (3 policies)

### Step 6: Test in Your App

1. Open your web app
2. Try creating a post → Should work! ✅
3. Try adding a comment → Should work! ✅
4. Try liking a post → Should work! ✅
5. Try bookmarking a post → Should work! ✅

---

## What These Policies Do

### For Everyone (Anonymous Users):
- ✅ Can **read** public posts and comments
- ✅ Can **see** like and prayer counts
- ❌ Cannot create, edit, or delete anything

### For Logged-In Users:
- ✅ Can **read** all public content
- ✅ Can **create** their own posts and comments
- ✅ Can **edit** their own posts and comments
- ✅ Can **delete** their own posts and comments
- ✅ Can **like** and **pray** for posts
- ✅ Can **bookmark** posts
- ❌ Cannot edit or delete other people's content

### For Admins:
- ✅ Can do **everything** (full access)

---

## Troubleshooting

### Error: "Policy already exists"
**Solution:** The policy already exists. You can either:
- Skip that policy (it's already there)
- Or delete the existing policy first, then run again

### Error: "Permission denied"
**Solution:** Make sure you're logged in as the project owner or have admin access

### Error: "Table does not exist"
**Solution:** Make sure all tables exist first. Check in "Table Editor"

### Nothing happens after running
**Solution:** 
1. Check if there are any error messages (scroll down)
2. Refresh the page
3. Check "Authentication" → "Policies" to see if policies were created

---

## What If Something Goes Wrong?

**Don't panic!** 

1. **Copy any error messages** you see
2. **Tell me what happened**
3. I'll help you fix it

The policies are safe to run multiple times - they won't break anything if they already exist.

---

## After Applying Policies

Once everything is working:
1. ✅ Your Community feature will be secure
2. ✅ Users can only edit their own content
3. ✅ Anonymous users can still read public posts
4. ✅ Everything will work correctly

**You're all set!** 🎉

---

## Need Help?

If you get stuck at any step, just tell me:
- What step you're on
- What error message you see (if any)
- What you see in the Supabase dashboard

I'll help you through it! 😊
