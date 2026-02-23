-- ============================================
-- SHISHUFUL MASTER DATABASE SCHEMA
-- Run this entire script in Supabase SQL Editor
-- ============================================

-- 1. ROLE ENUM
CREATE TYPE public.app_role AS ENUM ('super_admin', 'admin', 'editor', 'volunteer', 'member');

-- 2. PROFILES TABLE
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

-- 3. USER ROLES TABLE
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'member',
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 4. SECURITY DEFINER FUNCTION (avoids RLS recursion)
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

-- 5. TRIGGER: Auto-create profile + assign roles on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  -- Create profile
  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name');
  
  -- Assign super_admin if email matches
  IF NEW.email = 'istiakahmed.2163@gmail.com' THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'super_admin');
  ELSE
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'member');
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 6. ORGANIZATIONS
CREATE TABLE public.organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  logo_url TEXT,
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

-- 7. PROJECTS
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

-- 8. PROJECT UPDATES
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

-- 9. DONATION CAMPAIGNS
CREATE TABLE public.donation_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  target_amount NUMERIC DEFAULT 0,
  current_amount NUMERIC DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.donation_campaigns ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view campaigns" ON public.donation_campaigns FOR SELECT USING (true);
CREATE POLICY "Admins can manage campaigns" ON public.donation_campaigns FOR ALL USING (public.is_admin(auth.uid()));

-- 10. DONATIONS
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

-- 11. VOLUNTEERS
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

-- 12. BLOOD DONORS
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

-- 13. EVENTS
CREATE TABLE public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  location TEXT,
  event_date TIMESTAMPTZ,
  image_url TEXT,
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view events" ON public.events FOR SELECT USING (true);
CREATE POLICY "Admins can manage events" ON public.events FOR ALL USING (public.is_admin(auth.uid()));

-- 14. EVENT ATTENDEES
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

-- 15. BLOG CATEGORIES
CREATE TABLE public.blog_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE
);
ALTER TABLE public.blog_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view categories" ON public.blog_categories FOR SELECT USING (true);
CREATE POLICY "Admins can manage categories" ON public.blog_categories FOR ALL USING (public.is_admin(auth.uid()));

-- 16. BLOG POSTS
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

-- 17. GALLERY ITEMS
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

-- 18. TEAM MEMBERS
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

-- 19. CONTACT MESSAGES
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

-- 20. DOCUMENTS
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

-- 21. SETTINGS
CREATE TABLE public.settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  value JSONB,
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view settings" ON public.settings FOR SELECT USING (true);
CREATE POLICY "Admins can manage settings" ON public.settings FOR ALL USING (public.is_admin(auth.uid()));

-- 22. FEATURE TOGGLES
CREATE TABLE public.feature_toggles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  feature TEXT UNIQUE NOT NULL,
  enabled BOOLEAN DEFAULT true,
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.feature_toggles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view feature toggles" ON public.feature_toggles FOR SELECT USING (true);
CREATE POLICY "Admins can manage feature toggles" ON public.feature_toggles FOR ALL USING (public.is_admin(auth.uid()));

-- 23. HOMEPAGE SECTIONS
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

-- 24. ACTIVITY LOGS
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

-- 25. NOTIFICATIONS
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

-- ============================================
-- DEFAULT DATA
-- ============================================

-- Default organization
INSERT INTO public.organizations (name, description, email, phone, founded_year) VALUES
('শিশুফুল', 'প্রতিটি শিশুর মুখে হাসি আমাদের অঙ্গীকার। শিশুফুল একটি মানবিক সংগঠন।', 'info@shishuful.org', '+880-1700-000000', 2010);

-- Default feature toggles
INSERT INTO public.feature_toggles (feature, enabled) VALUES
('projects', true),
('donations', true),
('blood_donation', true),
('events', true),
('blog', true),
('gallery', true),
('transparency', true),
('volunteer', true),
('documents', true);

-- Default homepage sections
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

-- Default settings
INSERT INTO public.settings (key, value) VALUES
('site_title', '"শিশুফুল"'),
('hero_headline', '"প্রতিটি শিশুর মুখে হাসি আমাদের অঙ্গীকার"'),
('hero_subtext', '"আমরা একসাথে গড়ি মানবতার সুন্দর ভবিষ্যৎ।"'),
('primary_color', '"330 80% 55%"'),
('accent_color', '"340 70% 60%"'),
('footer_text', '"© ২০২৪ শিশুফুল। সর্বস্বত্ব সংরক্ষিত।"'),
('social_facebook', '"https://facebook.com/shishuful"'),
('social_youtube', '"https://youtube.com/shishuful"');

-- Default blog categories
INSERT INTO public.blog_categories (name, slug) VALUES
('সাধারণ', 'general'),
('ইভেন্ট', 'events'),
('প্রকল্প', 'projects'),
('শিক্ষা', 'education');

-- ============================================
-- IMPORTANT: Go to Supabase Dashboard > Authentication > Settings
-- and DISABLE "Confirm email" to allow auto-approved signups
-- ============================================
