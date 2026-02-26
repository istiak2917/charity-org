-- =============================================
-- RECURRING DONATIONS & MULTI-ORG TABLES
-- Run this in Supabase SQL Editor
-- =============================================

-- Recurring Donation Plans/Subscriptions
CREATE TABLE IF NOT EXISTS recurring_donations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  donor_name text NOT NULL,
  donor_email text,
  donor_phone text,
  amount numeric NOT NULL,
  frequency text NOT NULL DEFAULT 'monthly', -- monthly, yearly
  plan_id text,
  status text DEFAULT 'active', -- active, paused, cancelled
  next_charge_date date,
  last_charged_at timestamptz,
  total_charged numeric DEFAULT 0,
  charge_count integer DEFAULT 0,
  metadata jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE recurring_donations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can create recurring" ON recurring_donations FOR INSERT WITH CHECK (true);
CREATE POLICY "Auth can view recurring" ON recurring_donations FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth can update recurring" ON recurring_donations FOR UPDATE TO authenticated USING (true);

-- Add metadata column to donations if not exists
DO $$ BEGIN
  ALTER TABLE donations ADD COLUMN IF NOT EXISTS metadata jsonb;
  ALTER TABLE donations ADD COLUMN IF NOT EXISTS source text;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- Add multi-org support columns to organizations
DO $$ BEGIN
  ALTER TABLE organizations ADD COLUMN IF NOT EXISTS slug text UNIQUE;
  ALTER TABLE organizations ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true;
  ALTER TABLE organizations ADD COLUMN IF NOT EXISTS theme_config jsonb;
  ALTER TABLE organizations ADD COLUMN IF NOT EXISTS branding jsonb;
  ALTER TABLE organizations ADD COLUMN IF NOT EXISTS subscription_plan text DEFAULT 'free';
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- Organization members (multi-tenancy)
CREATE TABLE IF NOT EXISTS organization_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  role text DEFAULT 'member',
  joined_at timestamptz DEFAULT now(),
  UNIQUE(organization_id, user_id)
);
ALTER TABLE organization_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Auth can view org members" ON organization_members FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth can manage org members" ON organization_members FOR ALL TO authenticated USING (true);
