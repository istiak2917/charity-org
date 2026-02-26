-- ==========================================
-- Form Builder & Poll System Tables
-- ==========================================

-- Custom Forms
CREATE TABLE IF NOT EXISTS public.custom_forms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text,
  config jsonb DEFAULT '{}',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.custom_forms ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can read active forms" ON public.custom_forms;
CREATE POLICY "Anyone can read active forms" ON public.custom_forms FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admins can manage forms" ON public.custom_forms;
CREATE POLICY "Admins can manage forms" ON public.custom_forms FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Form Submissions
CREATE TABLE IF NOT EXISTS public.form_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  form_id uuid REFERENCES public.custom_forms(id) ON DELETE CASCADE NOT NULL,
  data jsonb NOT NULL DEFAULT '{}',
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.form_submissions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can submit forms" ON public.form_submissions;
CREATE POLICY "Anyone can submit forms" ON public.form_submissions FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Admins can read submissions" ON public.form_submissions;
CREATE POLICY "Admins can read submissions" ON public.form_submissions FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Polls
CREATE TABLE IF NOT EXISTS public.polls (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question text NOT NULL,
  description text,
  options jsonb NOT NULL DEFAULT '[]',
  is_active boolean DEFAULT true,
  allow_multiple boolean DEFAULT false,
  show_results boolean DEFAULT true,
  total_votes integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.polls ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can read polls" ON public.polls;
CREATE POLICY "Anyone can read polls" ON public.polls FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admins can manage polls" ON public.polls;
CREATE POLICY "Admins can manage polls" ON public.polls FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));
DROP POLICY IF EXISTS "Anyone can vote" ON public.polls;
CREATE POLICY "Anyone can vote" ON public.polls FOR UPDATE USING (true);

-- Poll Votes (tracking)
CREATE TABLE IF NOT EXISTS public.poll_votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  poll_id uuid REFERENCES public.polls(id) ON DELETE CASCADE NOT NULL,
  option_id text NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.poll_votes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can vote track" ON public.poll_votes;
CREATE POLICY "Anyone can vote track" ON public.poll_votes FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Admins can read votes" ON public.poll_votes;
CREATE POLICY "Admins can read votes" ON public.poll_votes FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
