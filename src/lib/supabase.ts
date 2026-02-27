import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://stbxvjmuygifgueamybw.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN0Ynh2am11eWdpZmd1ZWFteWJ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE4MjU4NjcsImV4cCI6MjA4NzQwMTg2N30.Gjz5Wi5TzNI1_lWyqq9KGELkUa6cn_3FGC_NIKu50eg';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});
