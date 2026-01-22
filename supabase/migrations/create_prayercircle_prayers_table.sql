-- Create table to track prayer actions (users praying for prayer requests)
CREATE TABLE IF NOT EXISTS public.prayercircle_prayers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    prayercircle_id UUID NOT NULL REFERENCES public.prayercircles(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(prayercircle_id, user_id)
);

-- Enable RLS
ALTER TABLE public.prayercircle_prayers ENABLE ROW LEVEL SECURITY;

-- Policies for prayercircle_prayers
CREATE POLICY "Anyone can view prayer counts"
    ON public.prayercircle_prayers FOR SELECT
    USING (true);

CREATE POLICY "Authenticated users can add prayers"
    ON public.prayercircle_prayers FOR INSERT
    WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_prayercircle_prayers_prayercircle ON public.prayercircle_prayers(prayercircle_id);
CREATE INDEX IF NOT EXISTS idx_prayercircle_prayers_user ON public.prayercircle_prayers(user_id);

-- Grant permissions
GRANT SELECT, INSERT ON public.prayercircle_prayers TO authenticated;
GRANT SELECT ON public.prayercircle_prayers TO anon;
