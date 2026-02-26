-- =============================================
-- User Sessions & IP Tracking
-- =============================================

-- Active sessions table
CREATE TABLE IF NOT EXISTS public.user_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  user_email text,
  ip_address text,
  user_agent text,
  device_info text,
  logged_in_at timestamptz DEFAULT now(),
  last_active_at timestamptz DEFAULT now(),
  is_active boolean DEFAULT true
);

ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;

-- Users can see their own sessions
CREATE POLICY "Users can view own sessions"
ON public.user_sessions FOR SELECT TO authenticated
USING (user_id = auth.uid() OR EXISTS (
  SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('super_admin')
));

-- Users can insert their own sessions
CREATE POLICY "Users can insert own sessions"
ON public.user_sessions FOR INSERT TO authenticated
WITH CHECK (user_id = auth.uid());

-- Users can update their own sessions
CREATE POLICY "Users can update own sessions"
ON public.user_sessions FOR UPDATE TO authenticated
USING (user_id = auth.uid() OR EXISTS (
  SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('super_admin')
));

-- Super admin can delete sessions
CREATE POLICY "Super admin can delete sessions"
ON public.user_sessions FOR DELETE TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('super_admin')
));

-- Indexes
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON public.user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_active ON public.user_sessions(is_active);

-- =============================================
-- Session limits setting (stored in site_settings)
-- key: 'max_sessions_per_user', value: '1'
-- =============================================
INSERT INTO public.site_settings (setting_key, setting_value)
VALUES ('max_sessions_per_user', '"1"')
ON CONFLICT (setting_key) DO NOTHING;

-- =============================================
-- Audit Logs table (if not exists)
-- =============================================
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  user_email text,
  action text NOT NULL,
  table_name text NOT NULL,
  record_id text,
  old_value jsonb,
  new_value jsonb,
  ip_address text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read audit logs"
ON public.audit_logs FOR SELECT TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('super_admin', 'admin')
));

CREATE POLICY "Authenticated can insert audit logs"
ON public.audit_logs FOR INSERT TO authenticated
WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_table_name ON public.audit_logs(table_name);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON public.audit_logs(user_id);
