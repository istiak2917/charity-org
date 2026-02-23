-- ============================================
-- COMPLETE FIX SCRIPT - Run this ONCE in Supabase SQL Editor
-- Fixes: missing tables, RLS policies, roles, schema cache
-- ============================================

-- ============================================
-- STEP 1: Create missing tables
-- ============================================

-- volunteers table (missing - returns 404)
CREATE TABLE IF NOT EXISTS public.volunteers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  full_name text NOT NULL,
  email text,
  phone text,
  skills text,
  status text DEFAULT 'pending',
  badge text DEFAULT '',
  hours_logged integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- volunteer_tasks table (missing - returns 404)
CREATE TABLE IF NOT EXISTS public.volunteer_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  volunteer_id uuid REFERENCES public.volunteers(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  status text DEFAULT 'pending',
  due_date date,
  created_at timestamptz DEFAULT now()
);

-- income_records table (used in AdminHome)
CREATE TABLE IF NOT EXISTS public.income_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  amount numeric DEFAULT 0,
  source text,
  description text,
  date date DEFAULT CURRENT_DATE,
  created_at timestamptz DEFAULT now()
);

-- organizations table (if missing)
CREATE TABLE IF NOT EXISTS public.organizations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL DEFAULT 'শিশুফুল',
  logo_url text,
  description text,
  address text,
  phone text,
  email text,
  website text,
  created_at timestamptz DEFAULT now()
);

-- Fix feature_toggles: ensure 'feature' column exists
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'feature_toggles' AND column_name = 'feature'
  ) THEN
    -- Check if there's a 'name' or 'key' column instead
    IF EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema = 'public' AND table_name = 'feature_toggles' AND column_name = 'name'
    ) THEN
      ALTER TABLE public.feature_toggles RENAME COLUMN name TO feature;
    ELSIF EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema = 'public' AND table_name = 'feature_toggles' AND column_name = 'key'
    ) THEN
      ALTER TABLE public.feature_toggles RENAME COLUMN key TO feature;
    ELSE
      ALTER TABLE public.feature_toggles ADD COLUMN feature text;
    END IF;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'feature_toggles' AND column_name = 'enabled'
  ) THEN
    ALTER TABLE public.feature_toggles ADD COLUMN enabled boolean DEFAULT true;
  END IF;
END $$;

-- ============================================
-- STEP 2: Enable RLS on all tables
-- ============================================
ALTER TABLE public.volunteers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.volunteer_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.income_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;

-- Also ensure existing tables have RLS
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feature_toggles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.homepage_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- ============================================
-- STEP 3: Create has_role function (security definer)
-- ============================================
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Helper: check if user is admin or super_admin
CREATE OR REPLACE FUNCTION public.is_admin(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role IN ('admin', 'super_admin')
  )
$$;

-- ============================================
-- STEP 4: RLS Policies - Allow admins full access, public read where needed
-- ============================================

-- Drop existing policies first (ignore errors if they don't exist)
DO $$ 
DECLARE
  tbl text;
  pol record;
BEGIN
  FOR tbl IN SELECT unnest(ARRAY[
    'events', 'donations', 'projects', 'blog_posts', 'volunteers', 
    'volunteer_tasks', 'feature_toggles', 'homepage_sections',
    'income_records', 'organizations', 'profiles', 'user_roles',
    'gallery_items', 'team_members', 'contact_messages', 'expenses',
    'blood_donors', 'donation_campaigns'
  ]) LOOP
    FOR pol IN 
      SELECT policyname FROM pg_policies WHERE tablename = tbl AND schemaname = 'public'
    LOOP
      EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', pol.policyname, tbl);
    END LOOP;
  END LOOP;
END $$;

-- ---- user_roles ----
CREATE POLICY "Users can read own roles" ON public.user_roles
  FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE POLICY "Super admins manage roles" ON public.user_roles
  FOR ALL TO authenticated USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- ---- profiles ----
CREATE POLICY "Users can read own profile" ON public.profiles
  FOR SELECT TO authenticated USING (id = auth.uid());

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE TO authenticated USING (id = auth.uid());

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT TO authenticated WITH CHECK (id = auth.uid());

CREATE POLICY "Admins can read all profiles" ON public.profiles
  FOR SELECT TO authenticated USING (public.is_admin(auth.uid()));

-- ---- events ----
CREATE POLICY "Public can read events" ON public.events
  FOR SELECT USING (true);

CREATE POLICY "Admins manage events" ON public.events
  FOR ALL TO authenticated USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- ---- donations ----
CREATE POLICY "Public can read donations" ON public.donations
  FOR SELECT USING (true);

CREATE POLICY "Admins manage donations" ON public.donations
  FOR ALL TO authenticated USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- ---- projects ----
CREATE POLICY "Public can read projects" ON public.projects
  FOR SELECT USING (true);

CREATE POLICY "Admins manage projects" ON public.projects
  FOR ALL TO authenticated USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- ---- blog_posts ----
CREATE POLICY "Public can read blog posts" ON public.blog_posts
  FOR SELECT USING (true);

CREATE POLICY "Admins manage blog posts" ON public.blog_posts
  FOR ALL TO authenticated USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- ---- volunteers ----
CREATE POLICY "Public can read volunteers" ON public.volunteers
  FOR SELECT USING (true);

CREATE POLICY "Admins manage volunteers" ON public.volunteers
  FOR ALL TO authenticated USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Anyone can apply as volunteer" ON public.volunteers
  FOR INSERT TO authenticated WITH CHECK (true);

-- ---- volunteer_tasks ----
CREATE POLICY "Authenticated read tasks" ON public.volunteer_tasks
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins manage tasks" ON public.volunteer_tasks
  FOR ALL TO authenticated USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- ---- feature_toggles ----
CREATE POLICY "Public can read toggles" ON public.feature_toggles
  FOR SELECT USING (true);

CREATE POLICY "Admins manage toggles" ON public.feature_toggles
  FOR ALL TO authenticated USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- ---- homepage_sections ----
CREATE POLICY "Public can read sections" ON public.homepage_sections
  FOR SELECT USING (true);

CREATE POLICY "Admins manage sections" ON public.homepage_sections
  FOR ALL TO authenticated USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- ---- income_records ----
CREATE POLICY "Admins read income" ON public.income_records
  FOR SELECT TO authenticated USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins manage income" ON public.income_records
  FOR ALL TO authenticated USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- ---- organizations ----
CREATE POLICY "Public can read org" ON public.organizations
  FOR SELECT USING (true);

CREATE POLICY "Admins manage org" ON public.organizations
  FOR ALL TO authenticated USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- ---- gallery_items ----
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='gallery_items') THEN
    EXECUTE 'CREATE POLICY "Public read gallery" ON public.gallery_items FOR SELECT USING (true)';
    EXECUTE 'CREATE POLICY "Admins manage gallery" ON public.gallery_items FOR ALL TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()))';
  END IF;
END $$;

-- ---- team_members ----
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='team_members') THEN
    EXECUTE 'CREATE POLICY "Public read team" ON public.team_members FOR SELECT USING (true)';
    EXECUTE 'CREATE POLICY "Admins manage team" ON public.team_members FOR ALL TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()))';
  END IF;
END $$;

-- ---- contact_messages ----
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='contact_messages') THEN
    EXECUTE 'CREATE POLICY "Anyone can send message" ON public.contact_messages FOR INSERT WITH CHECK (true)';
    EXECUTE 'CREATE POLICY "Admins read messages" ON public.contact_messages FOR SELECT TO authenticated USING (public.is_admin(auth.uid()))';
    EXECUTE 'CREATE POLICY "Admins manage messages" ON public.contact_messages FOR ALL TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()))';
  END IF;
END $$;

-- ---- expenses ----
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='expenses') THEN
    EXECUTE 'CREATE POLICY "Admins read expenses" ON public.expenses FOR SELECT TO authenticated USING (public.is_admin(auth.uid()))';
    EXECUTE 'CREATE POLICY "Admins manage expenses" ON public.expenses FOR ALL TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()))';
  END IF;
END $$;

-- ---- blood_donors ----
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='blood_donors') THEN
    EXECUTE 'CREATE POLICY "Public read donors" ON public.blood_donors FOR SELECT USING (true)';
    EXECUTE 'CREATE POLICY "Admins manage donors" ON public.blood_donors FOR ALL TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()))';
  END IF;
END $$;

-- ---- donation_campaigns ----
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='donation_campaigns') THEN
    EXECUTE 'CREATE POLICY "Public read campaigns" ON public.donation_campaigns FOR SELECT USING (true)';
    EXECUTE 'CREATE POLICY "Admins manage campaigns" ON public.donation_campaigns FOR ALL TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()))';
  END IF;
END $$;

-- ============================================
-- STEP 5: Insert super_admin role for your account
-- ============================================
INSERT INTO public.profiles (id, full_name)
SELECT id, COALESCE(raw_user_meta_data->>'full_name', 'Istiak Ahmed')
FROM auth.users
WHERE email = 'istiakahmed.2163@gmail.com'
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.user_roles (user_id, role)
SELECT id, 'super_admin'::app_role
FROM auth.users
WHERE email = 'istiakahmed.2163@gmail.com'
ON CONFLICT (user_id, role) DO NOTHING;

-- ============================================
-- STEP 6: Seed feature toggles (if empty)
-- ============================================
INSERT INTO public.feature_toggles (feature, enabled)
SELECT feature, true FROM unnest(ARRAY[
  'projects', 'donations', 'blood_donation', 'events', 
  'blog', 'gallery', 'transparency', 'volunteer', 'documents'
]) AS feature
WHERE NOT EXISTS (SELECT 1 FROM public.feature_toggles LIMIT 1);

-- ============================================
-- STEP 7: Seed organization (if empty)
-- ============================================
INSERT INTO public.organizations (name, description)
SELECT 'শিশুফুল', 'শিশুদের জন্য একটি উন্নত ভবিষ্যৎ গড়তে কাজ করছে।'
WHERE NOT EXISTS (SELECT 1 FROM public.organizations LIMIT 1);

-- ============================================
-- STEP 8: Reload PostgREST schema cache
-- ============================================
NOTIFY pgrst, 'reload schema';
