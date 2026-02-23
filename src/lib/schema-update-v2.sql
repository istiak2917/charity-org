-- ============================================
-- SHISHUFUL SCHEMA UPDATE V2
-- New tables for NGO Management System
-- Run this in Supabase SQL Editor
-- ============================================

-- 1. ADD COLUMNS TO ORGANIZATIONS
ALTER TABLE public.organizations
  ADD COLUMN IF NOT EXISTS mission TEXT,
  ADD COLUMN IF NOT EXISTS vision TEXT,
  ADD COLUMN IF NOT EXISTS history TEXT,
  ADD COLUMN IF NOT EXISTS cover_image_url TEXT;

-- 2. ADD COLUMNS TO DONATION_CAMPAIGNS
ALTER TABLE public.donation_campaigns
  ADD COLUMN IF NOT EXISTS image_url TEXT,
  ADD COLUMN IF NOT EXISTS end_date DATE;

-- 3. ADD COLUMNS TO EVENTS
ALTER TABLE public.events
  ADD COLUMN IF NOT EXISTS budget NUMERIC DEFAULT 0,
  ADD COLUMN IF NOT EXISTS collected_amount NUMERIC DEFAULT 0;

-- 4. BLOOD REQUESTS TABLE
CREATE TABLE IF NOT EXISTS public.blood_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_name TEXT NOT NULL,
  blood_group TEXT NOT NULL,
  required_date DATE,
  location TEXT,
  contact TEXT,
  provider_name TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.blood_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view blood requests" ON public.blood_requests FOR SELECT USING (true);
CREATE POLICY "Anyone can create blood request" ON public.blood_requests FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can manage blood requests" ON public.blood_requests FOR ALL USING (public.is_admin(auth.uid()));

-- 5. VOLUNTEER TASKS TABLE
CREATE TABLE IF NOT EXISTS public.volunteer_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  volunteer_id UUID REFERENCES public.volunteers(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'pending',
  due_date DATE,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.volunteer_tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage volunteer tasks" ON public.volunteer_tasks FOR ALL USING (public.is_admin(auth.uid()));
CREATE POLICY "Volunteers can view own tasks" ON public.volunteer_tasks FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.volunteers v WHERE v.id = volunteer_id AND v.user_id = auth.uid())
);

-- 6. EXPENSES TABLE
CREATE TABLE IF NOT EXISTS public.expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  amount NUMERIC NOT NULL DEFAULT 0,
  category TEXT,
  description TEXT,
  expense_date DATE DEFAULT CURRENT_DATE,
  receipt_url TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view expenses" ON public.expenses FOR SELECT USING (true);
CREATE POLICY "Admins can manage expenses" ON public.expenses FOR ALL USING (public.is_admin(auth.uid()));

-- 7. INCOME RECORDS TABLE
CREATE TABLE IF NOT EXISTS public.income_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  amount NUMERIC NOT NULL DEFAULT 0,
  source TEXT,
  description TEXT,
  income_date DATE DEFAULT CURRENT_DATE,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.income_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view income" ON public.income_records FOR SELECT USING (true);
CREATE POLICY "Admins can manage income" ON public.income_records FOR ALL USING (public.is_admin(auth.uid()));

-- 8. REPORTS TABLE
CREATE TABLE IF NOT EXISTS public.reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  report_type TEXT DEFAULT 'annual',
  file_url TEXT,
  year INT,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view reports" ON public.reports FOR SELECT USING (true);
CREATE POLICY "Admins can manage reports" ON public.reports FOR ALL USING (public.is_admin(auth.uid()));

-- ============================================
-- DONE! All new tables and columns added.
-- ============================================
