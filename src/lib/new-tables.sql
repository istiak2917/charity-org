-- =============================================
-- NEW TABLES FOR PAYMENT, NEWSLETTER, EMAIL
-- Run this in Supabase SQL Editor
-- NO existing tables dropped or renamed
-- =============================================

-- Payment Transactions
CREATE TABLE IF NOT EXISTS payment_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id text UNIQUE,
  amount numeric NOT NULL DEFAULT 0,
  donor_name text,
  donor_email text,
  donor_phone text,
  donation_id uuid REFERENCES donations(id),
  status text DEFAULT 'pending',
  gateway text DEFAULT 'uddoktapay',
  payment_method text,
  metadata jsonb,
  verify_response jsonb,
  webhook_payload jsonb,
  verified_at timestamptz,
  webhook_received_at timestamptz,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE payment_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can insert payments" ON payment_transactions FOR INSERT WITH CHECK (true);
CREATE POLICY "Authenticated can view payments" ON payment_transactions FOR SELECT TO authenticated USING (true);

-- Newsletter Subscribers
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  name text,
  status text DEFAULT 'active',
  unsubscribed_at timestamptz,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can subscribe" ON newsletter_subscribers FOR INSERT WITH CHECK (true);
CREATE POLICY "Public can update own sub" ON newsletter_subscribers FOR UPDATE USING (true);
CREATE POLICY "Admins can view subs" ON newsletter_subscribers FOR SELECT TO authenticated USING (true);

-- Email Queue (for when no email provider is configured)
CREATE TABLE IF NOT EXISTS email_queue (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  to_email text NOT NULL,
  subject text,
  body text,
  type text,
  status text DEFAULT 'queued',
  template_data jsonb,
  sent_at timestamptz,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE email_queue ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can view email queue" ON email_queue FOR SELECT TO authenticated USING (true);
