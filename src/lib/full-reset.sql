-- ============================================
-- SHISHUFUL FULL DATABASE RESET
-- Run this ENTIRE script in Supabase SQL Editor
-- This drops everything and rebuilds cleanly
-- ============================================

-- ========== STEP 1: DROP ALL TABLES ==========
DROP TABLE IF EXISTS public.notifications CASCADE;
DROP TABLE IF EXISTS public.activity_logs CASCADE;
DROP TABLE IF EXISTS public.homepage_sections CASCADE;
DROP TABLE IF EXISTS public.feature_toggles CASCADE;
DROP TABLE IF EXISTS public.settings CASCADE;
DROP TABLE IF EXISTS public.documents CASCADE;
DROP TABLE IF EXISTS public.contact_messages CASCADE;
DROP TABLE IF EXISTS public.team_members CASCADE;
DROP TABLE IF EXISTS public.gallery_items CASCADE;
DROP TABLE IF EXISTS public.blog_posts CASCADE;
DROP TABLE IF EXISTS public.blog_categories CASCADE;
DROP TABLE IF EXISTS public.event_attendees CASCADE;
DROP TABLE IF EXISTS public.events CASCADE;
DROP TABLE IF EXISTS public.volunteer_tasks CASCADE;
DROP TABLE IF EXISTS public.volunteers CASCADE;
DROP TABLE IF EXISTS public.blood_requests CASCADE;
DROP TABLE IF EXISTS public.blood_donors CASCADE;
DROP TABLE IF EXISTS public.donations CASCADE;
DROP TABLE IF EXISTS public.donation_campaigns CASCADE;
DROP TABLE IF EXISTS public.project_updates CASCADE;
DROP TABLE IF EXISTS public.projects CASCADE;
DROP TABLE IF EXISTS public.reports CASCADE;
DROP TABLE IF EXISTS public.income_records CASCADE;
DROP TABLE IF EXISTS public.expenses CASCADE;
DROP TABLE IF EXISTS public.user_roles CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;
DROP TABLE IF EXISTS public.organizations CASCADE;

-- Drop enum if exists
DROP TYPE IF EXISTS public.app_role CASCADE;

-- Drop functions
DROP FUNCTION IF EXISTS public.has_role CASCADE;
DROP FUNCTION IF EXISTS public.is_admin CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_user CASCADE;

-- ========== STEP 2: CREATE ENUM ==========
CREATE TYPE public.app_role AS ENUM ('super_admin', 'admin', 'editor', 'volunteer', 'member');

-- ========== STEP 3: CREATE ALL TABLES ==========

-- PROFILES
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  phone TEXT,
  address TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Public profiles viewable" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "System can insert profiles" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- USER ROLES
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'member',
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- SECURITY DEFINER FUNCTIONS
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE OR REPLACE FUNCTION public.is_admin(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role IN ('super_admin', 'admin')
  )
$$;

-- USER ROLES RLS
CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all roles" ON public.user_roles FOR SELECT USING (public.is_admin(auth.uid()));
CREATE POLICY "Admins can insert roles" ON public.user_roles FOR INSERT WITH CHECK (public.is_admin(auth.uid()));
CREATE POLICY "Admins can update roles" ON public.user_roles FOR UPDATE USING (public.is_admin(auth.uid()));
CREATE POLICY "Admins can delete roles" ON public.user_roles FOR DELETE USING (public.is_admin(auth.uid()));

-- TRIGGER: Auto-create profile + assign roles on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name');
  IF NEW.email = 'istiakahmed.2163@gmail.com' THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'super_admin');
  ELSE
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'member');
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ORGANIZATIONS
CREATE TABLE public.organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  mission TEXT,
  vision TEXT,
  history TEXT,
  logo_url TEXT,
  cover_image_url TEXT,
  email TEXT,
  phone TEXT,
  address TEXT,
  website TEXT,
  facebook TEXT,
  youtube TEXT,
  founded_year INT,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view organizations" ON public.organizations FOR SELECT USING (true);
CREATE POLICY "Admins can manage organizations" ON public.organizations FOR ALL USING (public.is_admin(auth.uid()));

-- PROJECTS
CREATE TABLE public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  category TEXT,
  status TEXT DEFAULT 'active',
  funding_target NUMERIC DEFAULT 0,
  funding_current NUMERIC DEFAULT 0,
  is_urgent BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view projects" ON public.projects FOR SELECT USING (true);
CREATE POLICY "Admins can manage projects" ON public.projects FOR ALL USING (public.is_admin(auth.uid()));

-- PROJECT UPDATES
CREATE TABLE public.project_updates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  title TEXT,
  content TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.project_updates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view project updates" ON public.project_updates FOR SELECT USING (true);
CREATE POLICY "Admins can manage project updates" ON public.project_updates FOR ALL USING (public.is_admin(auth.uid()));

-- DONATION CAMPAIGNS
CREATE TABLE public.donation_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  target_amount NUMERIC DEFAULT 0,
  current_amount NUMERIC DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  image_url TEXT,
  end_date DATE,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.donation_campaigns ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view campaigns" ON public.donation_campaigns FOR SELECT USING (true);
CREATE POLICY "Admins can manage campaigns" ON public.donation_campaigns FOR ALL USING (public.is_admin(auth.uid()));

-- DONATIONS
CREATE TABLE public.donations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  donor_name TEXT,
  donor_email TEXT,
  amount NUMERIC NOT NULL,
  campaign_id UUID REFERENCES public.donation_campaigns(id),
  user_id UUID REFERENCES auth.users(id),
  method TEXT,
  status TEXT DEFAULT 'pending',
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.donations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can view all donations" ON public.donations FOR SELECT USING (public.is_admin(auth.uid()));
CREATE POLICY "Users can view own donations" ON public.donations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Anyone can insert donations" ON public.donations FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can manage donations" ON public.donations FOR ALL USING (public.is_admin(auth.uid()));

-- EVENTS
CREATE TABLE public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  location TEXT,
  event_date TIMESTAMPTZ,
  image_url TEXT,
  is_featured BOOLEAN DEFAULT false,
  budget NUMERIC DEFAULT 0,
  collected_amount NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view events" ON public.events FOR SELECT USING (true);
CREATE POLICY "Admins can manage events" ON public.events FOR ALL USING (public.is_admin(auth.uid()));

-- EVENT ATTENDEES
CREATE TABLE public.event_attendees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'registered',
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.event_attendees ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own attendance" ON public.event_attendees FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can register for events" ON public.event_attendees FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can manage attendees" ON public.event_attendees FOR ALL USING (public.is_admin(auth.uid()));

-- VOLUNTEERS
CREATE TABLE public.volunteers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  skills TEXT,
  status TEXT DEFAULT 'pending',
  badge TEXT,
  hours_logged NUMERIC DEFAULT 0,
  availability TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.volunteers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view approved volunteers" ON public.volunteers FOR SELECT USING (status = 'approved' OR auth.uid() = user_id OR public.is_admin(auth.uid()));
CREATE POLICY "Users can apply as volunteer" ON public.volunteers FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can manage volunteers" ON public.volunteers FOR ALL USING (public.is_admin(auth.uid()));
CREATE POLICY "Users can update own volunteer" ON public.volunteers FOR UPDATE USING (auth.uid() = user_id);

-- VOLUNTEER TASKS
CREATE TABLE public.volunteer_tasks (
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

-- BLOOD DONORS
CREATE TABLE public.blood_donors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  name TEXT NOT NULL,
  blood_group TEXT NOT NULL,
  phone TEXT,
  location TEXT,
  last_donation_date DATE,
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.blood_donors ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view blood donors" ON public.blood_donors FOR SELECT USING (true);
CREATE POLICY "Users can manage own donor record" ON public.blood_donors FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage blood donors" ON public.blood_donors FOR ALL USING (public.is_admin(auth.uid()));

-- BLOOD REQUESTS
CREATE TABLE public.blood_requests (
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

-- BLOG CATEGORIES
CREATE TABLE public.blog_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE
);
ALTER TABLE public.blog_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view categories" ON public.blog_categories FOR SELECT USING (true);
CREATE POLICY "Admins can manage categories" ON public.blog_categories FOR ALL USING (public.is_admin(auth.uid()));

-- BLOG POSTS
CREATE TABLE public.blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT,
  excerpt TEXT,
  image_url TEXT,
  category_id UUID REFERENCES public.blog_categories(id),
  author_id UUID REFERENCES auth.users(id),
  is_published BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view published posts" ON public.blog_posts FOR SELECT USING (is_published = true OR public.is_admin(auth.uid()));
CREATE POLICY "Admins can manage posts" ON public.blog_posts FOR ALL USING (public.is_admin(auth.uid()));

-- GALLERY ITEMS
CREATE TABLE public.gallery_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT,
  image_url TEXT NOT NULL,
  category TEXT,
  caption TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.gallery_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view gallery" ON public.gallery_items FOR SELECT USING (true);
CREATE POLICY "Admins can manage gallery" ON public.gallery_items FOR ALL USING (public.is_admin(auth.uid()));

-- TEAM MEMBERS
CREATE TABLE public.team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  role TEXT,
  image_url TEXT,
  bio TEXT,
  facebook TEXT,
  twitter TEXT,
  linkedin TEXT,
  display_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view team" ON public.team_members FOR SELECT USING (true);
CREATE POLICY "Admins can manage team" ON public.team_members FOR ALL USING (public.is_admin(auth.uid()));

-- CONTACT MESSAGES
CREATE TABLE public.contact_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  reply TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can send messages" ON public.contact_messages FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can view messages" ON public.contact_messages FOR SELECT USING (public.is_admin(auth.uid()));
CREATE POLICY "Admins can manage messages" ON public.contact_messages FOR ALL USING (public.is_admin(auth.uid()));

-- DOCUMENTS
CREATE TABLE public.documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  file_url TEXT,
  category TEXT,
  uploaded_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view documents" ON public.documents FOR SELECT USING (true);
CREATE POLICY "Admins can manage documents" ON public.documents FOR ALL USING (public.is_admin(auth.uid()));

-- SETTINGS
CREATE TABLE public.settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  value JSONB,
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view settings" ON public.settings FOR SELECT USING (true);
CREATE POLICY "Admins can manage settings" ON public.settings FOR ALL USING (public.is_admin(auth.uid()));

-- FEATURE TOGGLES
CREATE TABLE public.feature_toggles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  feature TEXT UNIQUE NOT NULL,
  enabled BOOLEAN DEFAULT true,
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.feature_toggles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view feature toggles" ON public.feature_toggles FOR SELECT USING (true);
CREATE POLICY "Admins can manage feature toggles" ON public.feature_toggles FOR ALL USING (public.is_admin(auth.uid()));

-- HOMEPAGE SECTIONS
CREATE TABLE public.homepage_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section_key TEXT UNIQUE NOT NULL,
  title TEXT,
  is_visible BOOLEAN DEFAULT true,
  display_order INT DEFAULT 0,
  config JSONB DEFAULT '{}'
);
ALTER TABLE public.homepage_sections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view homepage sections" ON public.homepage_sections FOR SELECT USING (true);
CREATE POLICY "Admins can manage homepage sections" ON public.homepage_sections FOR ALL USING (public.is_admin(auth.uid()));

-- ACTIVITY LOGS
CREATE TABLE public.activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can view logs" ON public.activity_logs FOR SELECT USING (public.is_admin(auth.uid()));
CREATE POLICY "System can insert logs" ON public.activity_logs FOR INSERT WITH CHECK (auth.uid() = user_id);

-- NOTIFICATIONS
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own notifications" ON public.notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own notifications" ON public.notifications FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Admins can insert notifications" ON public.notifications FOR INSERT WITH CHECK (public.is_admin(auth.uid()));

-- EXPENSES
CREATE TABLE public.expenses (
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

-- INCOME RECORDS
CREATE TABLE public.income_records (
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

-- REPORTS
CREATE TABLE public.reports (
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

-- ========== STEP 4: INSERT SEED DATA ==========

-- Organization
INSERT INTO public.organizations (name, description, mission, vision, history, email, phone, address, facebook, youtube, founded_year) VALUES
('শিশুফুল', 'প্রতিটি শিশুর মুখে হাসি আমাদের অঙ্গীকার। শিশুফুল একটি মানবিক সংগঠন।',
 'প্রতিটি শিশুর শিক্ষা, স্বাস্থ্য ও সুরক্ষা নিশ্চিত করা।',
 'একটি সুন্দর ভবিষ্যৎ যেখানে প্রতিটি শিশু সমান সুযোগ পাবে।',
 'শিশুফুল ২০১০ সালে প্রতিষ্ঠিত হয়। শুরু থেকেই আমরা সুবিধাবঞ্চিত শিশুদের পাশে দাঁড়িয়ে আসছি।',
 'info@shishuful.org', '+880-1700-000000', 'ঢাকা, বাংলাদেশ',
 'https://facebook.com/shishuful', 'https://youtube.com/shishuful', 2010);

-- Feature Toggles
INSERT INTO public.feature_toggles (feature, enabled) VALUES
('projects', true), ('donations', true), ('blood_donation', true),
('events', true), ('blog', true), ('gallery', true),
('transparency', true), ('volunteer', true), ('documents', true);

-- Homepage Sections
INSERT INTO public.homepage_sections (section_key, title, is_visible, display_order) VALUES
('hero', 'হিরো সেকশন', true, 1),
('about', 'আমাদের সম্পর্কে', true, 2),
('projects', 'প্রকল্পসমূহ', true, 3),
('impact', 'আমাদের প্রভাব', true, 4),
('donation', 'অনুদান', true, 5),
('events', 'ইভেন্ট', true, 6),
('team', 'আমাদের টিম', true, 7),
('blog', 'ব্লগ', true, 8),
('gallery', 'গ্যালারি', true, 9),
('transparency', 'স্বচ্ছতা', true, 10),
('contact', 'যোগাযোগ', true, 11);

-- Settings
INSERT INTO public.settings (key, value) VALUES
('site_title', '"শিশুফুল"'),
('hero_headline', '"প্রতিটি শিশুর মুখে হাসি আমাদের অঙ্গীকার"'),
('hero_subtext', '"আমরা একসাথে গড়ি মানবতার সুন্দর ভবিষ্যৎ।"'),
('primary_color', '"330 80% 55%"'),
('accent_color', '"340 70% 60%"'),
('footer_text', '"© ২০২৪ শিশুফুল। সর্বস্বত্ব সংরক্ষিত।"'),
('social_facebook', '"https://facebook.com/shishuful"'),
('social_youtube', '"https://youtube.com/shishuful"');

-- Blog Categories
INSERT INTO public.blog_categories (name, slug) VALUES
('সাধারণ', 'general'), ('ইভেন্ট', 'events'),
('প্রকল্প', 'projects'), ('শিক্ষা', 'education');

-- Projects
INSERT INTO public.projects (title, description, category, status, funding_target, funding_current, is_urgent) VALUES
('শীতবস্ত্র বিতরণ কর্মসূচি', 'শীতকালে সুবিধাবঞ্চিত পরিবারগুলোকে উষ্ণ কাপড় বিতরণ করা হবে।', 'সেবা', 'active', 100000, 45000, true),
('স্কুল ব্যাগ বিতরণ', 'গরিব শিশুদের জন্য স্কুল ব্যাগ ও শিক্ষা উপকরণ বিতরণ।', 'শিক্ষা', 'completed', 50000, 50000, false);

-- Donation Campaigns
INSERT INTO public.donation_campaigns (title, description, target_amount, current_amount, is_active, end_date) VALUES
('শিশু পুষ্টি সহায়তা', 'অপুষ্টিতে ভুগছে এমন শিশুদের জন্য পুষ্টিকর খাবার সরবরাহ।', 200000, 80000, true, '2025-12-31');

-- Donations
INSERT INTO public.donations (donor_name, donor_email, amount, method, status) VALUES
('আব্দুর রহিম', 'rahim@example.com', 5000, 'বিকাশ', 'completed'),
('ফাতেমা বেগম', 'fatema@example.com', 10000, 'নগদ', 'completed'),
('কামরুল হাসান', 'kamrul@example.com', 3000, 'ব্যাংক', 'completed');

-- Events
INSERT INTO public.events (title, description, location, event_date, is_featured, budget, collected_amount) VALUES
('রক্তদান কর্মসূচি ২০২৪', 'বার্ষিক রক্তদান কর্মসূচিতে সকলকে আমন্ত্রণ।', 'ঢাকা বিশ্ববিদ্যালয়', '2024-03-15T10:00:00Z', true, 50000, 20000);

-- Blood Donors
INSERT INTO public.blood_donors (name, blood_group, phone, location, last_donation_date, is_available) VALUES
('রহিম উদ্দিন', 'A+', '01700000001', 'ঢাকা', '2023-10-01', true),
('করিম শেখ', 'O-', '01700000002', 'চট্টগ্রাম', NULL, true);

-- Blood Requests
INSERT INTO public.blood_requests (patient_name, blood_group, required_date, location, contact, status) VALUES
('হাসান মাহমুদ', 'B+', '2024-04-01', 'ঢাকা মেডিকেল', '01700000003', 'pending');

-- Team Members
INSERT INTO public.team_members (name, role, bio, display_order) VALUES
('ইসতিয়াক আহমেদ', 'প্রতিষ্ঠাতা ও সভাপতি', 'শিশুফুল সংগঠনের প্রতিষ্ঠাতা।', 1),
('আয়েশা সিদ্দিকা', 'সাধারণ সম্পাদক', 'সংগঠনের সকল কার্যক্রম পরিচালনা করেন।', 2),
('মোহাম্মদ আলী', 'কোষাধ্যক্ষ', 'আর্থিক ব্যবস্থাপনা ও হিসাবরক্ষণ।', 3);

-- Blog Posts
INSERT INTO public.blog_posts (title, content, excerpt, is_published, is_featured) VALUES
('আমাদের নতুন উদ্যোগ', 'শিশুফুল এবার নতুন একটি উদ্যোগ নিয়ে এসেছে। আমরা প্রতিটি গ্রামে শিক্ষা কেন্দ্র স্থাপন করতে যাচ্ছি। এই কেন্দ্রগুলোতে বিনামূল্যে শিক্ষা উপকরণ ও প্রশিক্ষিত শিক্ষক থাকবেন।', 'শিশুফুল নতুন শিক্ষা কেন্দ্র স্থাপনের উদ্যোগ নিয়েছে।', true, true),
('মানবতার পথে শিশুফুল', 'গত এক বছরে শিশুফুল ৫০০টিরও বেশি পরিবারকে সহায়তা করেছে। শীতবস্ত্র বিতরণ, শিক্ষা উপকরণ প্রদান এবং স্বাস্থ্যসেবা — প্রতিটি ক্ষেত্রে আমরা কাজ করে যাচ্ছি।', 'শিশুফুলের গত বছরের প্রভাব ও কার্যক্রমের সারসংক্ষেপ।', true, false);

-- Gallery Items
INSERT INTO public.gallery_items (title, image_url, category, caption) VALUES
('শীতবস্ত্র বিতরণ', 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=600', 'ইভেন্ট', 'শীতার্ত মানুষদের মাঝে কম্বল বিতরণ'),
('শিক্ষা কার্যক্রম', 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=600', 'শিক্ষা', 'বিনামূল্যে শিক্ষা কার্যক্রম'),
('রক্তদান ক্যাম্প', 'https://images.unsplash.com/photo-1615461066841-6116e61058f4?w=600', 'স্বাস্থ্য', 'বার্ষিক রক্তদান কর্মসূচি'),
('ঈদ উপহার বিতরণ', 'https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?w=600', 'ইভেন্ট', 'ঈদের আনন্দ সবার মাঝে ছড়িয়ে দেওয়া');

-- Expenses
INSERT INTO public.expenses (title, amount, category, description, expense_date) VALUES
('অফিস ভাড়া', 15000, 'প্রশাসন', 'মাসিক অফিস ভাড়া', '2024-01-15'),
('শীতবস্ত্র ক্রয়', 80000, 'প্রকল্প', 'শীতবস্ত্র বিতরণের জন্য কম্বল ক্রয়', '2024-01-20'),
('পরিবহন খরচ', 5000, 'পরিবহন', 'ইভেন্ট পরিবহন', '2024-02-01'),
('মুদ্রণ খরচ', 3000, 'প্রশাসন', 'ব্যানার ও লিফলেট প্রিন্ট', '2024-02-10'),
('খাদ্য সামগ্রী', 25000, 'প্রকল্প', 'পুষ্টি কর্মসূচির জন্য খাদ্য', '2024-03-01');

-- Income Records
INSERT INTO public.income_records (title, amount, source, description, income_date) VALUES
('সদস্য চাঁদা', 50000, 'সদস্য', 'মাসিক সদস্য চাঁদা সংগ্রহ', '2024-01-10'),
('অনুদান - জানুয়ারি', 150000, 'অনুদান', 'জানুয়ারি মাসের মোট অনুদান', '2024-01-31'),
('ইভেন্ট স্পন্সরশিপ', 100000, 'স্পন্সর', 'রক্তদান কর্মসূচি স্পন্সরশিপ', '2024-02-15'),
('সরকারি অনুদান', 200000, 'সরকার', 'শিক্ষা প্রকল্পের জন্য সরকারি অনুদান', '2024-03-01');

-- Reports
INSERT INTO public.reports (title, report_type, year, description) VALUES
('বার্ষিক প্রতিবেদন ২০২৩', 'annual', 2023, 'শিশুফুলের ২০২৩ সালের সকল কার্যক্রমের বিস্তারিত প্রতিবেদন।'),
('আর্থিক প্রতিবেদন ২০২৩', 'financial', 2023, '২০২৩ সালের আয়-ব্যয়ের বিবরণী।');

-- ============================================
-- DONE! Full clean rebuild complete.
-- ============================================
