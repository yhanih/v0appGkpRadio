# Payment Integration Setup Guide

This guide explains how to set up Stripe and PayPal payment processing for the donation page.

## Prerequisites

1. **Stripe Account**: Sign up at https://stripe.com
2. **PayPal Account**: Sign up at https://developer.paypal.com
3. **Supabase Project**: Your existing Supabase project

## Step 1: Install Required Packages

Run the following command in the `web-app` directory:

```bash
npm install @stripe/stripe-js @stripe/react-stripe-js stripe
```

## Step 2: Set Up Stripe

### 2.1 Get Your Stripe API Keys

1. Go to https://dashboard.stripe.com/apikeys
2. Copy your **Publishable key** (starts with `pk_test_` for test mode)
3. Copy your **Secret key** (starts with `sk_test_` for test mode)
4. For production, use the live keys (starts with `pk_live_` and `sk_live_`)

### 2.2 Set Up Webhook (For Production)

1. Go to https://dashboard.stripe.com/webhooks
2. Click "Add endpoint"
3. Set endpoint URL to: `https://yourdomain.com/api/payments/webhook`
4. Select events: `payment_intent.succeeded`, `payment_intent.payment_failed`
5. Copy the **Signing secret** (starts with `whsec_`)

### 2.3 Add Environment Variables

Add to your `.env.local` file:

```env
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_key_here
STRIPE_SECRET_KEY=sk_test_your_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
```

For production (Vercel, etc.), add these in your hosting platform's environment variables.

## Step 3: Set Up PayPal

### 3.1 Get Your PayPal Client ID

1. Go to https://developer.paypal.com/dashboard/
2. Create a new app or use an existing one
3. Copy your **Client ID**

### 3.2 Add Environment Variable

Add to your `.env.local` file:

```env
NEXT_PUBLIC_PAYPAL_CLIENT_ID=your_paypal_client_id_here
```

## Step 4: Create Supabase Storage Bucket for Avatars

1. Go to your Supabase Dashboard: https://supabase.com/dashboard/project/fychjnaxljwmgoptjsxn/storage/buckets
2. Click "New bucket"
3. Name: `avatars`
4. Public bucket: **Yes** (checked)
5. Click "Create bucket"

### 4.1 Set Up Storage Policies

Run this SQL in Supabase SQL Editor:

```sql
-- Allow authenticated users to upload their own avatars
CREATE POLICY "Users can upload their own avatars"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Allow users to update their own avatars
CREATE POLICY "Users can update their own avatars"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Allow users to delete their own avatars
CREATE POLICY "Users can delete their own avatars"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Allow public read access to avatars
CREATE POLICY "Public can view avatars"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'avatars');
```

## Step 5: Run Database Migrations

Run the notification preferences migration:

1. Go to: https://supabase.com/dashboard/project/fychjnaxljwmgoptjsxn/sql/new
2. Copy contents of `web-app/supabase/migrations/create_notification_preferences.sql`
3. Paste and run

## Step 6: Test the Integration

### Test Stripe (Test Mode)

1. Use test card: `4242 4242 4242 4242`
2. Any future expiry date (e.g., `12/34`)
3. Any 3-digit CVC (e.g., `123`)
4. Any ZIP code

### Test PayPal (Sandbox)

1. Use PayPal sandbox test accounts
2. Or use the PayPal test card: `4032035495734313`

## Troubleshooting

### Stripe Payment Fails

- Check that `STRIPE_SECRET_KEY` is set correctly
- Verify the API version in `route.ts` matches your Stripe account
- Check browser console for errors

### PayPal Not Loading

- Verify `NEXT_PUBLIC_PAYPAL_CLIENT_ID` is set
- Check browser console for SDK loading errors
- Ensure PayPal SDK script loads correctly

### Avatar Upload Fails

- Verify `avatars` bucket exists in Supabase Storage
- Check storage policies are set correctly
- Ensure user is authenticated
- Check file size (max 2MB) and type (images only)

## Production Checklist

- [ ] Switch to Stripe live keys
- [ ] Set up Stripe webhook endpoint
- [ ] Switch to PayPal live client ID
- [ ] Test payment flow end-to-end
- [ ] Set up donation receipt emails
- [ ] Configure tax-deductible receipt generation
- [ ] Set up database table for donation records (optional)

## Additional Resources

- [Stripe Documentation](https://stripe.com/docs)
- [PayPal Developer Docs](https://developer.paypal.com/docs)
- [Supabase Storage Docs](https://supabase.com/docs/guides/storage)
