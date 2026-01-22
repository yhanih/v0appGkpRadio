# Community Page Quick Start Guide

**Goal:** Get the Community page production-ready ASAP  
**Start Here:** Fix the critical blocker (NewPostModal) first

---

## 🚨 Immediate Action (Do This First - 2-3 hours)

### Step 1: Fix NewPostModal (CRITICAL)

Open `web-app/components/new-post-modal.tsx` and make these changes:

1. **Add missing imports and state:**
```typescript
import { useState, useEffect } from "react";
// ... existing imports ...

export function NewPostModal({ isOpen, onClose, onSuccess }: NewPostModalProps) {
    const { user } = useAuth();
    const supabase = getSupabaseBrowserClient();
    const [selectedCategory, setSelectedCategory] = useState("Prayers");
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [isAnonymous, setIsAnonymous] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null); // ADD THIS LINE
```

2. **Replace the handleSubmit function (lines 31-43):**
```typescript
const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!user) {
        setError("Please sign in to create a post");
        return;
    }
    
    if (!title.trim() || !content.trim()) {
        setError("Title and content are required");
        return;
    }
    
    if (title.trim().length > 100) {
        setError("Title must be 100 characters or less");
        return;
    }
    
    if (content.trim().length > 1000) {
        setError("Content must be 1000 characters or less");
        return;
    }
    
    setIsSubmitting(true);
    setError(null);
    
    try {
        if (!supabase) {
            throw new Error("Database connection unavailable");
        }
        
        const { data, error: insertError } = await supabase
            .from('communitythreads')
            .insert({
                userid: user.id,
                title: title.trim(),
                content: content.trim(),
                category: selectedCategory,
                is_anonymous: isAnonymous,
                privacy_level: 'public'
            })
            .select()
            .single();
        
        if (insertError) {
            throw insertError;
        }
        
        // Success - reset form and close modal
        setTitle("");
        setContent("");
        setIsAnonymous(false);
        setSelectedCategory("Prayers");
        onClose();
        
        // Trigger feed refresh
        if (onSuccess) {
            onSuccess();
        }
    } catch (err: any) {
        console.error("Error creating post:", err);
        
        // User-friendly error messages
        if (err.code === '23505') {
            setError("A post with this title already exists. Please choose a different title.");
        } else if (err.message?.includes('RLS') || err.message?.includes('permission')) {
            setError("You don't have permission to create posts. Please contact support.");
        } else if (err.message?.includes('rate limit')) {
            setError("Too many posts created. Please wait a moment before posting again.");
        } else {
            setError(err.message || "Failed to create post. Please try again.");
        }
    } finally {
        setIsSubmitting(false);
    }
};
```

3. **Add authentication check on modal open:**
Add this useEffect after the state declarations:
```typescript
useEffect(() => {
    if (isOpen && !user) {
        setError("Please sign in to create a post");
    } else if (isOpen) {
        setError(null);
    }
}, [isOpen, user]);
```

4. **Fix the form button type:**
Change line 189 from:
```typescript
<Button onClick={handleSubmit} ...>
```
to:
```typescript
<Button type="submit" onClick={handleSubmit} ...>
```

**Test it:**
1. Open the Community page
2. Click "Global Post" button
3. Fill in title and content
4. Click "Post Prayers"
5. Verify post appears in feed

---

## ✅ Verification Checklist

After implementing Step 1, verify:

- [ ] Can create post when logged in
- [ ] Cannot create post when logged out (shows error)
- [ ] Validation works (empty fields, length limits)
- [ ] Error messages display correctly
- [ ] Post appears in feed after creation
- [ ] Anonymous posts work (if isAnonymous is true)
- [ ] Form resets after successful submission

---

## 🎯 Next Steps (After Critical Fix)

Once NewPostModal is working, proceed in this order:

### Priority 2: Add Database Validation (1-2 hours)
Run the migration to add server-side validation constraints (see roadmap Phase 1, Task 1.2)

### Priority 3: Add Error Monitoring (2-3 hours)
Set up Sentry for error tracking (see roadmap Phase 3, Task 3.1)

### Priority 4: Optimize Queries (3-4 hours)
Create optimized database function (see roadmap Phase 2, Task 2.1)

---

## 🐛 Common Issues & Fixes

### Issue: "error is not defined"
**Fix:** Add `const [error, setError] = useState<string | null>(null);` to state declarations

### Issue: Post doesn't appear in feed
**Fix:** Verify `onSuccess` callback is being called and triggers `fetchThreads()`

### Issue: "RLS policy violation"
**Fix:** Check RLS policies allow authenticated users to insert into `communitythreads`

### Issue: "user is not defined"
**Fix:** Ensure `const { user } = useAuth();` is called at the top of the component

---

## 📞 Need Help?

Refer to the full roadmap: `COMMUNITY_PAGE_PRODUCTION_ROADMAP.md`

---

**Time to Production:** 
- Critical fix: 2-3 hours
- Full production-ready: 2-3 weeks (see roadmap)
