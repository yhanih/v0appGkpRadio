-- 14_create_dynamic_prayers.sql
-- Separating Prayers from general discussions for a more robust ministry experience

BEGIN;

-- Create prayers table
CREATE TABLE IF NOT EXISTS public.prayers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    is_urgent BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create prayer_actions table (to track who has prayed for whom)
CREATE TABLE IF NOT EXISTS public.prayer_actions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    prayer_id UUID REFERENCES public.prayers(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(prayer_id, user_id)
);

-- Enable RLS
ALTER TABLE public.prayers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prayer_actions ENABLE ROW LEVEL SECURITY;

-- Policies for public.prayers
CREATE POLICY "Anyone can view prayers"
    ON public.prayers FOR SELECT
    USING (true);

CREATE POLICY "Authenticated users can submit prayers"
    ON public.prayers FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can edit their own prayers"
    ON public.prayers FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id);

-- Policies for public.prayer_actions
CREATE POLICY "Anyone can view prayer actions"
    ON public.prayer_actions FOR SELECT
    USING (true);

CREATE POLICY "Authenticated users can join in prayer"
    ON public.prayer_actions FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_prayers_is_urgent ON public.prayers(is_urgent);
CREATE INDEX IF NOT EXISTS idx_prayers_created_at ON public.prayers(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_prayer_actions_prayer_id ON public.prayer_actions(prayer_id);

COMMIT;
