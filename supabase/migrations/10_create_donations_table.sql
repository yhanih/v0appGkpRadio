-- Create donations table for tracking donation records
-- This table stores all donation transactions from Stripe and PayPal

CREATE TABLE IF NOT EXISTS donations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  payment_method VARCHAR(20), -- 'stripe', 'paypal'
  payment_intent_id VARCHAR(255), -- Stripe PaymentIntent ID
  transaction_id VARCHAR(255), -- PayPal transaction ID
  donor_name VARCHAR(255),
  donor_email VARCHAR(255) NOT NULL,
  donor_phone VARCHAR(50),
  message TEXT,
  anonymous BOOLEAN DEFAULT false,
  recurring BOOLEAN DEFAULT false,
  status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'completed', 'failed', 'refunded'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE donations ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can view their own donations
CREATE POLICY "Users can view their own donations"
ON donations FOR SELECT
TO authenticated
USING (auth.uid() = user_id OR anonymous = false);

-- Service role can insert donations (for webhook)
CREATE POLICY "Service role can insert donations"
ON donations FOR INSERT
TO service_role
WITH CHECK (true);

-- Service role can update donations (for webhook updates)
CREATE POLICY "Service role can update donations"
ON donations FOR UPDATE
TO service_role
USING (true)
WITH CHECK (true);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_donations_user_id ON donations(user_id);
CREATE INDEX IF NOT EXISTS idx_donations_payment_intent_id ON donations(payment_intent_id);
CREATE INDEX IF NOT EXISTS idx_donations_transaction_id ON donations(transaction_id);
CREATE INDEX IF NOT EXISTS idx_donations_status ON donations(status);
CREATE INDEX IF NOT EXISTS idx_donations_created_at ON donations(created_at DESC);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_donations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_donations_updated_at
  BEFORE UPDATE ON donations
  FOR EACH ROW
  EXECUTE FUNCTION update_donations_updated_at();

-- Add comments for documentation
COMMENT ON TABLE donations IS 'Stores all donation transactions from payment processors';
COMMENT ON COLUMN donations.payment_intent_id IS 'Stripe PaymentIntent ID for tracking';
COMMENT ON COLUMN donations.transaction_id IS 'PayPal transaction ID for tracking';
COMMENT ON COLUMN donations.anonymous IS 'Whether the donor chose to remain anonymous';
COMMENT ON COLUMN donations.recurring IS 'Whether this is a recurring monthly donation';
