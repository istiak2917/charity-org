-- ==============================
-- EXPANSION TABLES (Non-destructive)
-- Run in Supabase SQL Editor
-- ==============================

-- 1️⃣ Sponsorships
CREATE TABLE IF NOT EXISTS sponsorships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sponsor_id uuid REFERENCES profiles(id),
  beneficiary_id uuid REFERENCES beneficiaries(id),
  amount numeric DEFAULT 0,
  frequency text DEFAULT 'monthly',
  status text DEFAULT 'active',
  start_date date DEFAULT CURRENT_DATE,
  end_date date,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE sponsorships ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated read sponsorships" ON sponsorships FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated insert sponsorships" ON sponsorships FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated update sponsorships" ON sponsorships FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated delete sponsorships" ON sponsorships FOR DELETE TO authenticated USING (true);

-- 2️⃣ Grants
CREATE TABLE IF NOT EXISTS grants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  source text,
  amount numeric DEFAULT 0,
  utilized numeric DEFAULT 0,
  project_id uuid,
  status text DEFAULT 'active',
  start_date date,
  end_date date,
  description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE grants ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated read grants" ON grants FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated insert grants" ON grants FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated update grants" ON grants FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated delete grants" ON grants FOR DELETE TO authenticated USING (true);

-- Grant Utilizations
CREATE TABLE IF NOT EXISTS grant_utilizations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  grant_id uuid REFERENCES grants(id) ON DELETE CASCADE,
  amount numeric DEFAULT 0,
  purpose text,
  date date DEFAULT CURRENT_DATE,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE grant_utilizations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated read grant_utilizations" ON grant_utilizations FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated insert grant_utilizations" ON grant_utilizations FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated delete grant_utilizations" ON grant_utilizations FOR DELETE TO authenticated USING (true);

-- 3️⃣ Emergency Campaigns
CREATE TABLE IF NOT EXISTS emergency_campaigns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  target_amount numeric DEFAULT 0,
  raised_amount numeric DEFAULT 0,
  is_active boolean DEFAULT false,
  deadline timestamptz,
  redirect_url text,
  badge_text text DEFAULT 'জরুরি',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE emergency_campaigns ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read emergency_campaigns" ON emergency_campaigns FOR SELECT USING (true);
CREATE POLICY "Authenticated insert emergency_campaigns" ON emergency_campaigns FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated update emergency_campaigns" ON emergency_campaigns FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated delete emergency_campaigns" ON emergency_campaigns FOR DELETE TO authenticated USING (true);

-- 4️⃣ Cases
CREATE TABLE IF NOT EXISTS cases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id text UNIQUE,
  title text NOT NULL,
  beneficiary_id uuid,
  assigned_worker_id uuid,
  status text DEFAULT 'open',
  priority text DEFAULT 'medium',
  private_notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE cases ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated read cases" ON cases FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated insert cases" ON cases FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated update cases" ON cases FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated delete cases" ON cases FOR DELETE TO authenticated USING (true);

-- Case Logs
CREATE TABLE IF NOT EXISTS case_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id uuid REFERENCES cases(id) ON DELETE CASCADE,
  log_text text,
  logged_by uuid,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE case_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated read case_logs" ON case_logs FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated insert case_logs" ON case_logs FOR INSERT TO authenticated WITH CHECK (true);

-- 5️⃣ Volunteer Availability
CREATE TABLE IF NOT EXISTS volunteer_availability (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  volunteer_id uuid REFERENCES profiles(id),
  available_date date NOT NULL,
  time_slot text DEFAULT 'full_day',
  notes text,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE volunteer_availability ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated read volunteer_availability" ON volunteer_availability FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated insert volunteer_availability" ON volunteer_availability FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated delete volunteer_availability" ON volunteer_availability FOR DELETE TO authenticated USING (true);

-- 6️⃣ Event Attendance
CREATE TABLE IF NOT EXISTS event_attendance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid,
  user_id uuid REFERENCES profiles(id),
  token text UNIQUE DEFAULT encode(gen_random_bytes(16), 'hex'),
  checked_in boolean DEFAULT false,
  checked_in_at timestamptz,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE event_attendance ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated read event_attendance" ON event_attendance FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated insert event_attendance" ON event_attendance FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated update event_attendance" ON event_attendance FOR UPDATE TO authenticated USING (true);

-- 7️⃣ Documents
CREATE TABLE IF NOT EXISTS documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  file_url text,
  file_name text,
  category text DEFAULT 'general',
  visibility text DEFAULT 'admin',
  version integer DEFAULT 1,
  uploaded_by uuid,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated read documents" ON documents FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated insert documents" ON documents FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated update documents" ON documents FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated delete documents" ON documents FOR DELETE TO authenticated USING (true);

-- 🔟 Notification Queue (SMS-ready)
CREATE TABLE IF NOT EXISTS notification_queue (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_phone text,
  recipient_email text,
  recipient_id uuid,
  channel text DEFAULT 'sms',
  subject text,
  message text NOT NULL,
  status text DEFAULT 'pending',
  sent_at timestamptz,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE notification_queue ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated read notification_queue" ON notification_queue FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated insert notification_queue" ON notification_queue FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated update notification_queue" ON notification_queue FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated delete notification_queue" ON notification_queue FOR DELETE TO authenticated USING (true);

-- Document Storage Bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('documents', 'documents', false) ON CONFLICT DO NOTHING;
CREATE POLICY "Auth users upload docs" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'documents');
CREATE POLICY "Auth users read docs" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'documents');
