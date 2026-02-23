-- ============================================
-- SHISHUFUL EXAMPLE/SEED DATA
-- Run this in Supabase SQL Editor AFTER master-schema.sql and schema-update-v2.sql
-- ============================================

-- 1. ORGANIZATION
INSERT INTO public.organizations (name, description, email, phone, address, website, facebook, youtube, founded_year, mission, vision, history, logo_url, cover_image_url)
VALUES (
  'শিশুফুল',
  'শিশু ও সুবিধাবঞ্চিত মানুষের জন্য কাজ করা একটি স্বেচ্ছাসেবী সংগঠন।',
  'info@shishuful.org',
  '+8801700000000',
  'ঢাকা, বাংলাদেশ',
  'https://shishuful.org',
  'https://facebook.com/shishuful',
  'https://youtube.com/@shishuful',
  2020,
  'প্রতিটি শিশুর মুখে হাসি ফোটানো এবং তাদের উজ্জ্বল ভবিষ্যৎ নিশ্চিত করা।',
  'একটি সমতাভিত্তিক সমাজ যেখানে প্রতিটি শিশু শিক্ষা, পুষ্টি ও নিরাপত্তা পায়।',
  'শিশুফুল ২০২০ সালে একদল তরুণ স্বেচ্ছাসেবক দ্বারা প্রতিষ্ঠিত হয়। শুরু থেকেই আমরা সুবিধাবঞ্চিত শিশুদের শিক্ষা ও পুষ্টি নিশ্চিত করতে কাজ করে যাচ্ছি।',
  '',
  ''
)
ON CONFLICT DO NOTHING;

-- 2. PROJECTS
INSERT INTO public.projects (title, description, category, status, funding_target, funding_current, is_urgent, image_url) VALUES
('শীতবস্ত্র বিতরণ কর্মসূচি', 'শীতকালে সুবিধাবঞ্চিত মানুষের মাঝে শীতবস্ত্র বিতরণ। গত বছর ৫০০+ পরিবারকে শীতবস্ত্র দেওয়া হয়েছে।', 'ত্রাণ', 'active', 100000, 45000, false, ''),
('স্কুল ব্যাগ বিতরণ', 'সুবিধাবঞ্চিত শিশুদের মাঝে স্কুল ব্যাগ ও শিক্ষা উপকরণ বিতরণ।', 'শিক্ষা', 'completed', 50000, 50000, false, '');

-- 3. DONATION CAMPAIGNS
INSERT INTO public.donation_campaigns (title, description, target_amount, current_amount, is_active, image_url, end_date) VALUES
('শিশু পুষ্টি সহায়তা', 'অপুষ্টিতে ভোগা শিশুদের জন্য পুষ্টিকর খাবার সরবরাহ। প্রতিমাসে ১০০+ শিশুকে পুষ্টিকর খাবার দেওয়া হয়।', 200000, 80000, true, '', '2026-12-31');

-- 4. DONATIONS (3 example donors)
INSERT INTO public.donations (donor_name, donor_email, amount, method, status, note) VALUES
('আব্দুল করিম', 'karim@email.com', 5000, 'বিকাশ', 'completed', 'শিশু পুষ্টি ক্যাম্পেইনে'),
('ফাতেমা বেগম', 'fatema@email.com', 10000, 'নগদ', 'completed', 'সাধারণ অনুদান'),
('রহিম উদ্দিন', 'rahim@email.com', 3000, 'ব্যাংক ট্রান্সফার', 'completed', 'শীতবস্ত্র প্রকল্পে');

-- 5. EVENTS
INSERT INTO public.events (title, description, location, event_date, is_featured, budget, collected_amount) VALUES
('রক্তদান কর্মসূচি ২০২৪', 'বার্ষিক রক্তদান কর্মসূচি। সকল রক্তের গ্রুপের দাতাদের অংশগ্রহণ কাম্য।', 'ঢাকা মেডিকেল কলেজ', '2024-03-15T09:00:00', true, 50000, 20000),
('শিশু দিবস উদযাপন', 'শিশুদের জন্য আনন্দময় একটি দিন। খেলাধুলা, চিত্রাঙ্কন ও পুরস্কার বিতরণ।', 'শিশুফুল কার্যালয়', '2024-10-02T10:00:00', false, 30000, 15000);

-- 6. BLOOD DONORS
INSERT INTO public.blood_donors (name, blood_group, phone, location, last_donation_date, is_available) VALUES
('রহিম', 'A+', '01712345678', 'ঢাকা', '2023-10-01', true),
('করিম', 'O-', '01798765432', 'চট্টগ্রাম', NULL, true),
('সালমা', 'B+', '01611223344', 'রাজশাহী', '2024-01-15', true);

-- 7. BLOOD REQUESTS
INSERT INTO public.blood_requests (patient_name, blood_group, required_date, location, contact, status) VALUES
('হাসান', 'B+', '2026-03-01', 'ঢাকা মেডিকেল', '01700112233', 'pending');

-- 8. VOLUNTEERS
INSERT INTO public.volunteers (full_name, email, phone, skills, status, hours_logged) VALUES
('তানভীর আহমেদ', 'tanvir@email.com', '01555555555', 'গ্রাফিক ডিজাইন, সোশ্যাল মিডিয়া', 'approved', 45),
('নাসরিন আক্তার', 'nasrin@email.com', '01666666666', 'ইভেন্ট ম্যানেজমেন্ট, ফটোগ্রাফি', 'pending', 0);

-- 9. BLOG POSTS
INSERT INTO public.blog_posts (title, content, excerpt, is_published, is_featured) VALUES
('আমাদের নতুন উদ্যোগ', 'শিশুফুল এই বছর একটি নতুন উদ্যোগ শুরু করতে যাচ্ছে। সুবিধাবঞ্চিত এলাকায় ভ্রাম্যমাণ লাইব্রেরি চালু করা হবে। প্রতিটি শিশু যেন বই পড়ার সুযোগ পায়, সেটাই আমাদের লক্ষ্য। এই প্রকল্পে আমরা ইতিমধ্যে ৫০০+ বই সংগ্রহ করেছি এবং আরও বই সংগ্রহ চলছে।', 'সুবিধাবঞ্চিত এলাকায় ভ্রাম্যমাণ লাইব্রেরি চালু করা হবে।', true, true),
('মানবতার পথে শিশু ফুল', 'গত এক বছরে শিশুফুল ৫০০+ শিশুর জীবনে ইতিবাচক পরিবর্তন এনেছে। শিক্ষা উপকরণ বিতরণ, পুষ্টি সহায়তা, এবং স্বাস্থ্য সেবা প্রদান করা হয়েছে। আমাদের স্বেচ্ছাসেবকদের অক্লান্ত পরিশ্রমে এই সাফল্য অর্জন সম্ভব হয়েছে। আমরা বিশ্বাস করি, প্রতিটি ছোট পদক্ষেপ বড় পরিবর্তন আনতে পারে।', 'গত এক বছরে ৫০০+ শিশুর জীবনে ইতিবাচক পরিবর্তন।', true, false);

-- 10. GALLERY
INSERT INTO public.gallery_items (title, image_url, category, caption) VALUES
('শীতবস্ত্র বিতরণ', 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=600', 'ত্রাণ', 'শীতকালে বস্ত্র বিতরণ কর্মসূচি'),
('শিশুদের সাথে', 'https://images.unsplash.com/photo-1509099836639-18ba4637b590?w=600', 'শিক্ষা', 'শিশুদের সাথে আনন্দময় মুহূর্ত'),
('রক্তদান ক্যাম্প', 'https://images.unsplash.com/photo-1615461066841-6116e61058f4?w=600', 'স্বাস্থ্য', 'বার্ষিক রক্তদান কর্মসূচি'),
('টিম মিটিং', 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600', 'সংগঠন', 'মাসিক পরিকল্পনা সভা');

-- 11. TEAM MEMBERS
INSERT INTO public.team_members (name, designation, bio, image_url, display_order) VALUES
('ইসতিয়াক আহমেদ', 'প্রতিষ্ঠাতা ও সভাপতি', 'শিশুফুলের প্রতিষ্ঠাতা। সমাজসেবায় নিবেদিতপ্রাণ।', '', 1),
('আয়েশা সিদ্দিকা', 'সাধারণ সম্পাদক', 'সংগঠনের দৈনন্দিন কার্যক্রম পরিচালনা করেন।', '', 2),
('মোঃ রাফি', 'কোষাধ্যক্ষ', 'আর্থিক ব্যবস্থাপনা ও হিসাবরক্ষণ দেখাশোনা করেন।', '', 3);

-- 12. INCOME RECORDS
INSERT INTO public.income_records (title, amount, source, description, income_date) VALUES
('জানুয়ারি অনুদান', 150000, 'অনুদান', 'জানুয়ারি মাসে সংগৃহীত সকল অনুদান', '2024-01-31'),
('ফেব্রুয়ারি অনুদান', 200000, 'অনুদান', 'ফেব্রুয়ারি মাসে সংগৃহীত সকল অনুদান', '2024-02-28'),
('স্পনসরশিপ', 150000, 'স্পনসর', 'ইভেন্ট স্পনসরশিপ থেকে প্রাপ্ত', '2024-03-15');

-- 13. EXPENSES
INSERT INTO public.expenses (title, amount, category, description, expense_date) VALUES
('শীতবস্ত্র ক্রয়', 80000, 'ত্রাণ', '৫০০ পিস কম্বল ক্রয়', '2024-01-10'),
('অফিস ভাড়া', 50000, 'প্রশাসন', '৩ মাসের অফিস ভাড়া', '2024-01-01'),
('ইভেন্ট খরচ', 120000, 'ইভেন্ট', 'রক্তদান কর্মসূচি আয়োজন খরচ', '2024-03-15'),
('শিক্ষা উপকরণ', 100000, 'শিক্ষা', 'স্কুল ব্যাগ ও বই ক্রয়', '2024-02-20');

-- 14. HOMEPAGE SECTIONS
INSERT INTO public.homepage_sections (section_key, title, is_visible, display_order) VALUES
('hero', 'হিরো সেকশন', true, 1),
('about', 'আমাদের সম্পর্কে', true, 2),
('projects', 'প্রকল্পসমূহ', true, 3),
('donation', 'অনুদান', true, 4),
('events', 'ইভেন্ট', true, 5),
('impact', 'প্রভাব', true, 6),
('team', 'আমাদের টিম', true, 7),
('gallery', 'গ্যালারি', true, 8),
('blog', 'ব্লগ', true, 9),
('transparency', 'স্বচ্ছতা', true, 10),
('contact', 'যোগাযোগ', true, 11)
ON CONFLICT DO NOTHING;

-- 15. FEATURE TOGGLES
INSERT INTO public.feature_toggles (feature_key, label, is_enabled) VALUES
('donations', 'অনুদান সিস্টেম', true),
('volunteers', 'স্বেচ্ছাসেবক সিস্টেম', true),
('blood_donation', 'রক্তদান সিস্টেম', true),
('blog', 'ব্লগ', true),
('gallery', 'গ্যালারি', true),
('events', 'ইভেন্ট', true),
('contact', 'যোগাযোগ ফর্ম', true),
('transparency', 'স্বচ্ছতা রিপোর্ট', true)
ON CONFLICT DO NOTHING;

-- 16. SETTINGS (Theme defaults)
INSERT INTO public.settings (key, value) VALUES
('site_title', '"শিশুফুল"'),
('hero_headline', '"প্রতিটি শিশুর মুখে হাসি"'),
('hero_subtext', '"সুবিধাবঞ্চিত শিশুদের জন্য শিক্ষা, পুষ্টি ও ভালোবাসা"'),
('primary_color', '"142 71% 45%"'),
('accent_color', '"24 95% 53%"'),
('background_tone', '"light"'),
('font_family', '"Hind Siliguri"'),
('border_radius', '"0.5rem"'),
('footer_text', '"© ২০২৪ শিশুফুল। সর্বস্বত্ব সংরক্ষিত।"'),
('social_facebook', '"https://facebook.com/shishuful"'),
('social_youtube', '"https://youtube.com/@shishuful"'),
('cta_button_text', '"অনুদান দিন"')
ON CONFLICT (key) DO NOTHING;

-- ============================================
-- DONE! All example data inserted.
-- ============================================
