-- ============================================
-- FIX: Insert profile + super_admin role for existing user
-- Run this in Supabase SQL Editor
-- ============================================

-- Step 1: Insert profile if missing
INSERT INTO public.profiles (id, full_name)
SELECT id, raw_user_meta_data->>'full_name'
FROM auth.users
WHERE email = 'istiakahmed.2163@gmail.com'
ON CONFLICT (id) DO NOTHING;

-- Step 2: Insert super_admin role if missing
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'super_admin'::app_role
FROM auth.users
WHERE email = 'istiakahmed.2163@gmail.com'
ON CONFLICT (user_id, role) DO NOTHING;
