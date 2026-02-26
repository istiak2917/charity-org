-- =====================================================
-- চ্যাট সিস্টেম ও প্রোফাইল আপডেট SQL
-- Supabase SQL Editor এ রান করুন
-- =====================================================

-- 1. chat_messages টেবিল
CREATE TABLE IF NOT EXISTS public.chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  channel text NOT NULL DEFAULT 'general',
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  username text NOT NULL DEFAULT 'User',
  avatar_url text,
  message text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Index for fast channel queries
CREATE INDEX IF NOT EXISTS idx_chat_messages_channel ON public.chat_messages(channel, created_at);

-- Enable RLS
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- Policies
DROP POLICY IF EXISTS "Anyone can read chat messages" ON public.chat_messages;
CREATE POLICY "Anyone can read chat messages" ON public.chat_messages
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Users can insert own chat messages" ON public.chat_messages;
CREATE POLICY "Users can insert own chat messages" ON public.chat_messages
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own chat messages" ON public.chat_messages;
CREATE POLICY "Users can delete own chat messages" ON public.chat_messages
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;

-- 2. profiles টেবিলে username কলাম যোগ (যদি না থাকে)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='profiles' AND column_name='username') THEN
    ALTER TABLE public.profiles ADD COLUMN username text UNIQUE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='profiles' AND column_name='bio') THEN
    ALTER TABLE public.profiles ADD COLUMN bio text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='profiles' AND column_name='date_of_birth') THEN
    ALTER TABLE public.profiles ADD COLUMN date_of_birth date;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='profiles' AND column_name='gender') THEN
    ALTER TABLE public.profiles ADD COLUMN gender text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='profiles' AND column_name='blood_group') THEN
    ALTER TABLE public.profiles ADD COLUMN blood_group text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='profiles' AND column_name='occupation') THEN
    ALTER TABLE public.profiles ADD COLUMN occupation text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='profiles' AND column_name='social_facebook') THEN
    ALTER TABLE public.profiles ADD COLUMN social_facebook text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='profiles' AND column_name='social_linkedin') THEN
    ALTER TABLE public.profiles ADD COLUMN social_linkedin text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='profiles' AND column_name='custom_fields') THEN
    ALTER TABLE public.profiles ADD COLUMN custom_fields jsonb DEFAULT '{}';
  END IF;
END $$;
