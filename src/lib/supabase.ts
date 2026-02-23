import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://stbxvjmuygifgueamybw.supabase.co';
const supabaseAnonKey = 'sb_publishable_uSKHCXKDMtHzgOJo8oLisg_xk36BWik';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
